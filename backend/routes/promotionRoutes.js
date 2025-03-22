'use strict';

const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { requireRole } = require('../middlewares/authMiddleware');

// Create a new promotion (manager or higher)
router.post('/', requireRole('manager'), promotionController.createPromotion);

// Get promotions with filtering
router.get('/', requireRole('regular'), promotionController.getPromotions);

// Get a specific promotion
router.get('/:promotionId', requireRole('regular'), promotionController.getPromotion);

// Update a promotion (manager or higher)
router.patch('/:promotionId', requireRole('manager'), promotionController.updatePromotion);

// Delete a promotion (manager or higher)
router.delete('/:promotionId', requireRole('manager'), promotionController.deletePromotion);

module.exports = router;