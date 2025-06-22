const express = require('express');
const router = express.Router();

// Controller
const { listProducts } = require('../controllers/productController');

// For now, no authentication required – products page is read-only
router.get('/', listProducts);

module.exports = router; 