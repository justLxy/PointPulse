const axios = require('axios');

// Load Square token from environment
const SQUARE_TOKEN = process.env.SQUARE_TOKEN || 'EAAAEM9aFmC361o_5CTEzbmu4jNfNYNl9U4TXVtxtCmUvDdbpFaJCinv8N6EHgd2';
const SQUARE_VERSION = '2025-05-21';
const SQUARE_CATALOG_URL = 'https://connect.squareupsandbox.com/v2/catalog/list';
const SQUARE_INVENTORY_URL = 'https://connect.squareupsandbox.com/v2/inventory/counts/batch-retrieve';

/**
 * GET /products
 * Proxy request to Square Catalog List API and return raw objects.
 * This avoids CORS issues on the frontend by letting the backend make the request.
 */
exports.listProducts = async (req, res, next) => {
  try {
    // 1) Retrieve catalog
    const catalogRes = await axios.get(SQUARE_CATALOG_URL, {
      headers: {
        Authorization: `Bearer ${SQUARE_TOKEN}`,
        'Square-Version': SQUARE_VERSION,
        'Content-Type': 'application/json'
      },
      params: {
        types: 'ITEM,CATEGORY,IMAGE'
      }
    });

    const objects = catalogRes.data.objects || [];

    // Collect variation IDs to check inventory
    const variationIds = [];
    objects.forEach((obj) => {
      if (obj.type === 'ITEM' && obj.item_data?.variations?.length) {
        obj.item_data.variations.forEach((v) => variationIds.push(v.id));
      }
    });

    let countsData = { counts: [] };

    if (variationIds.length) {
      try {
        const invRes = await axios.post(
          SQUARE_INVENTORY_URL,
          { catalog_object_ids: variationIds },
          {
            headers: {
              Authorization: `Bearer ${SQUARE_TOKEN}`,
              'Square-Version': SQUARE_VERSION,
              'Content-Type': 'application/json',
            },
          }
        );
        countsData = invRes.data;
      } catch (invErr) {
        console.error('Square inventory fetch failed:', invErr?.response?.data || invErr.message);
      }
    }

    return res.status(200).json({ objects, counts: countsData.counts });
  } catch (error) {
    console.error('Square catalog fetch failed:', error?.response?.data || error.message);
    return next(error);
  }
}; 