'use strict';

const promotionService = require('../services/promotionService');
const { checkRole } = require('../middlewares/authMiddleware');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Create a new promotion (manager or higher role required)
 */
const createPromotion = async (req, res) => {
    console.log('\n\n===== CREATE PROMOTION REQUEST START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Auth user:', JSON.stringify(req.auth, null, 2));
    
    try {
        // Check for empty payload
        if (!req.body || Object.keys(req.body).length === 0) {
            console.log('No promotion data provided');
            console.log('===== CREATE PROMOTION REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'No promotion data provided' });
        }

        // Validate required fields
        const requiredFields = ['name', 'description', 'type', 'startTime', 'endTime'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                console.log(`Required field missing: ${field}`);
                console.log('===== CREATE PROMOTION REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: `${field} is required` });
            }
        }

        // Validate promotion type
        if (!['automatic', 'one-time'].includes(req.body.type)) {
            console.log('Invalid promotion type:', req.body.type);
            console.log('===== CREATE PROMOTION REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Type must be either "automatic" or "one-time"' });
        }

        // Validate either rate or points is provided
        if ((req.body.rate === undefined || req.body.rate === null) &&
            (req.body.points === undefined || req.body.points === null)) {
            console.log('Neither rate nor points provided');
            console.log('===== CREATE PROMOTION REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Either rate or points must be specified' });
        }

        const promotionData = {
            name: req.body.name,
            description: req.body.description,
            type: req.body.type,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            minSpending: req.body.minSpending,
            rate: req.body.rate,
            points: req.body.points
        };
        
        console.log('Promotion data prepared:', JSON.stringify(promotionData, null, 2));

        try {
            console.log('Calling promotionService.createPromotion');
            const promotion = await promotionService.createPromotion(promotionData);
            console.log('Promotion created successfully:', JSON.stringify(promotion, null, 2));
            console.log('===== CREATE PROMOTION REQUEST END (201) =====\n\n');
            return res.status(201).json(promotion);
        } catch (error) {
            console.log('Error creating promotion:', error.message);
            console.log('Error stack:', error.stack);
            
            if (error.message.includes('required') || 
                error.message.includes('must be') || 
                error.message.includes('cannot be')) {
                console.log('===== CREATE PROMOTION REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: error.message });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error creating promotion:', error);
        console.log('Error stack:', error.stack);
        console.log('===== CREATE PROMOTION REQUEST END (500) =====\n\n');
        res.status(500).json({ error: 'Failed to create promotion' });
    }
};

/**
 * Get all promotions with filtering (all roles)
 */
const getPromotions = async (req, res) => {
    console.log('\n\n===== GET PROMOTIONS REQUEST START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Query parameters:', JSON.stringify(req.query, null, 2));
    console.log('Auth user:', JSON.stringify(req.auth, null, 2));
    
    try {
        const filters = {
            name: req.query.name,
            type: req.query.type
        };
        
        console.log('Initial filters:', JSON.stringify(filters, null, 2));

        // 验证分页参数
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        console.log('Pagination: page =', page, ', limit =', limit);

        if (isNaN(page) || page <= 0) {
            console.log('Invalid page parameter:', page);
            console.log('===== GET PROMOTIONS REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Page number must be a positive integer' });
        }

        if (isNaN(limit) || limit <= 0) {
            console.log('Invalid limit parameter:', limit);
            console.log('===== GET PROMOTIONS REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Limit must be a positive integer' });
        }

        // 检查用户角色
        const isManager = checkRole(req.auth, 'manager');
        const isCashier = checkRole(req.auth, 'cashier');
        const isRegular = checkRole(req.auth, 'regular');
        console.log('User roles - isManager:', isManager, ', isCashier:', isCashier, ', isRegular:', isRegular);

        // Add manager-specific filters
        if (isManager) {
            filters.started = req.query.started;
            filters.ended = req.query.ended;
            console.log('Added manager-specific filters - started:', req.query.started, ', ended:', req.query.ended);

            // Check if both started and ended are specified
            if (filters.started === 'true' && filters.ended === 'true') {
                console.log('Conflicting parameters: both started and ended are true');
                console.log('===== GET PROMOTIONS REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Cannot specify both started and ended' });
            }
        }

        try {
            console.log('Calling promotionService.getPromotions with filters:', JSON.stringify(filters, null, 2));
            console.log('User ID:', req.auth.id);
            console.log('Is Manager:', isManager);
            console.log('Page:', page);
            console.log('Limit:', limit);
            
            const result = await promotionService.getPromotions(
                filters,
                req.auth.id,
                isManager,
                page,
                limit
            );
            
            console.log('Promotions retrieved successfully. Count:', result.count);
            if (result.results && result.results.length > 0) {
                console.log('First promotion in results:', JSON.stringify(result.results[0], null, 2));
            } else {
                console.log('No promotions found in results');
            }
            console.log('===== GET PROMOTIONS REQUEST END (200) =====\n\n');
            return res.status(200).json(result);
        } catch (error) {
            console.log('Error getting promotions:', error.message);
            console.log('Error stack:', error.stack);
            
            if (error.message.includes('Page must be') || error.message.includes('Limit must be')) {
                console.log('===== GET PROMOTIONS REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: error.message });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error getting promotions:', error);
        console.log('Error stack:', error.stack);
        console.log('===== GET PROMOTIONS REQUEST END (500) =====\n\n');
        res.status(500).json({ error: 'Failed to retrieve promotions' });
    }
};

/**
 * Get promotion info
 */
const getPromotion = async (req, res) => {
    console.log('\n\n===== GET PROMOTION REQUEST START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Params:', JSON.stringify(req.params, null, 2));
    console.log('Auth user:', JSON.stringify(req.auth, null, 2));
    
    try {
        const promotionId = parseInt(req.params.promotionId);
        console.log('Parsed promotion ID:', promotionId);
        
        if (isNaN(promotionId) || promotionId <= 0) {
            console.log('Invalid promotion ID');
            console.log('===== GET PROMOTION REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Invalid promotion ID' });
        }

        const isManager = checkRole(req.auth, 'manager');
        console.log('User is manager:', isManager);

        try {
            console.log('Calling promotionService.getPromotion');
            const promotion = await promotionService.getPromotion(
                promotionId,
                req.auth.id,
                isManager
            );
            
            console.log('Promotion retrieved successfully:', JSON.stringify({
                id: promotion.id,
                name: promotion.name,
                type: promotion.type
            }, null, 2));
            console.log('===== GET PROMOTION REQUEST END (200) =====\n\n');
            return res.status(200).json(promotion);
        } catch (error) {
            console.log('Error getting promotion:', error.message);
            console.log('Error stack:', error.stack);
            
            if (error.message === 'Promotion not found') {
                console.log('===== GET PROMOTION REQUEST END (404) =====\n\n');
                return res.status(404).json({ error: 'Promotion not found' });
            }
            if (error.message === 'Promotion not active') {
                console.log('===== GET PROMOTION REQUEST END (404) =====\n\n');
                return res.status(404).json({ error: 'Promotion not found' });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error getting promotion:', error);
        console.log('Error stack:', error.stack);
        console.log('===== GET PROMOTION REQUEST END (500) =====\n\n');
        res.status(500).json({ error: 'Failed to retrieve promotion' });
    }
};

/**
 * Update a promotion (manager or higher role required)
 */
const updatePromotion = async (req, res) => {
    console.log('\n\n===== UPDATE PROMOTION REQUEST START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Params:', JSON.stringify(req.params, null, 2));
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Auth user:', JSON.stringify(req.auth, null, 2));
    
    try {
        const promotionId = parseInt(req.params.promotionId);
        console.log('Parsed promotion ID:', promotionId);
        
        if (isNaN(promotionId) || promotionId <= 0) {
            console.log('Invalid promotion ID');
            console.log('===== UPDATE PROMOTION REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Invalid promotion ID' });
        }

        // Empty payload check
        if (!req.body || Object.keys(req.body).length === 0) {
            console.log('No fields provided for update');
            console.log('===== UPDATE PROMOTION REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'No fields provided for update' });
        }

        // 先检查促销是否存在
        console.log('Checking if promotion exists');
        const promotion = await prisma.promotion.findUnique({
            where: { id: promotionId }
        });

        if (!promotion) {
            console.log('Promotion not found');
            console.log('===== UPDATE PROMOTION REQUEST END (404) =====\n\n');
            return res.status(404).json({ error: 'Promotion not found' });
        }
        
        console.log('Promotion found:', JSON.stringify({
            id: promotion.id,
            name: promotion.name,
            type: promotion.type,
            startTime: promotion.startTime,
            endTime: promotion.endTime
        }, null, 2));

        // 检查促销是否已开始或结束
        const now = new Date();
        console.log('Current time:', now);
        console.log('Promotion start time:', promotion.startTime);
        console.log('Has promotion started?', promotion.startTime <= now);
        
        if (promotion.startTime <= now) {
            console.log('Promotion has already started, cannot update');
            console.log('===== UPDATE PROMOTION REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Cannot update a promotion that has already started' });
        }

        const updateData = {};
        // Only include fields that are provided
        if (req.body.name !== undefined) {
            updateData.name = req.body.name;
            console.log('Adding name to update data:', req.body.name);
        }
        if (req.body.description !== undefined) {
            updateData.description = req.body.description;
            console.log('Adding description to update data');
        }
        if (req.body.type !== undefined) {
            updateData.type = req.body.type;
            console.log('Adding type to update data:', req.body.type);
        }
        if (req.body.startTime !== undefined) {
            updateData.startTime = req.body.startTime;
            console.log('Adding startTime to update data:', req.body.startTime);
        }
        if (req.body.endTime !== undefined) {
            updateData.endTime = req.body.endTime;
            console.log('Adding endTime to update data:', req.body.endTime);
        }
        if (req.body.minSpending !== undefined) {
            updateData.minSpending = req.body.minSpending;
            console.log('Adding minSpending to update data:', req.body.minSpending);
        }
        if (req.body.rate !== undefined) {
            updateData.rate = req.body.rate;
            console.log('Adding rate to update data:', req.body.rate);
        }
        if (req.body.points !== undefined) {
            updateData.points = req.body.points;
            console.log('Adding points to update data:', req.body.points);
        }
        
        console.log('Final update data:', JSON.stringify(updateData, null, 2));

        try {
            console.log('Calling promotionService.updatePromotion');
            const updatedPromotion = await promotionService.updatePromotion(promotionId, updateData);
            console.log('Promotion updated successfully:', JSON.stringify(updatedPromotion, null, 2));
            console.log('===== UPDATE PROMOTION REQUEST END (200) =====\n\n');
            return res.status(200).json(updatedPromotion);
        } catch (error) {
            console.log('Error updating promotion:', error.message);
            console.log('Error stack:', error.stack);
            
            if (error.message === 'Promotion not found') {
                console.log('===== UPDATE PROMOTION REQUEST END (404) =====\n\n');
                return res.status(404).json({ error: 'Promotion not found' });
            }
            if (error.message.includes('Cannot update') || 
                error.message.includes('must be') || 
                error.message.includes('cannot be')) {
                console.log('===== UPDATE PROMOTION REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: error.message });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error updating promotion:', error);
        console.log('Error stack:', error.stack);
        console.log('===== UPDATE PROMOTION REQUEST END (500) =====\n\n');
        res.status(500).json({ error: 'Failed to update promotion' });
    }
};

/**
 * Delete a promotion (manager or higher role required)
 */
const deletePromotion = async (req, res) => {
    console.log('\n\n===== DELETE PROMOTION REQUEST START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Params:', JSON.stringify(req.params, null, 2));
    console.log('Auth user:', JSON.stringify(req.auth, null, 2));
    
    try {
        const promotionId = parseInt(req.params.promotionId);
        console.log('Parsed promotion ID:', promotionId);
        
        if (isNaN(promotionId) || promotionId <= 0) {
            console.log('Invalid promotion ID');
            console.log('===== DELETE PROMOTION REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Invalid promotion ID' });
        }

        // 先检查促销是否存在
        console.log('Checking if promotion exists');
        const promotion = await prisma.promotion.findUnique({
            where: { id: promotionId }
        });

        if (!promotion) {
            console.log('Promotion not found');
            console.log('===== DELETE PROMOTION REQUEST END (404) =====\n\n');
            return res.status(404).json({ error: 'Promotion not found' });
        }
        
        console.log('Promotion found:', JSON.stringify({
            id: promotion.id,
            name: promotion.name,
            type: promotion.type,
            startTime: promotion.startTime,
            endTime: promotion.endTime
        }, null, 2));

        // 检查促销是否已开始
        const now = new Date();
        console.log('Current time:', now);
        console.log('Promotion start time:', promotion.startTime);
        console.log('Has promotion started?', promotion.startTime <= now);
        
        if (promotion.startTime <= now) {
            console.log('Promotion has already started, cannot delete');
            console.log('===== DELETE PROMOTION REQUEST END (403) =====\n\n');
            return res.status(403).json({ error: 'Cannot delete a promotion that has already started' });
        }

        try {
            console.log('Calling promotionService.deletePromotion');
            await promotionService.deletePromotion(promotionId);
            console.log('Promotion deleted successfully');
            console.log('===== DELETE PROMOTION REQUEST END (204) =====\n\n');
            return res.status(204).send();
        } catch (error) {
            console.log('Error deleting promotion:', error.message);
            console.log('Error stack:', error.stack);
            
            if (error.message === 'Promotion not found') {
                console.log('===== DELETE PROMOTION REQUEST END (404) =====\n\n');
                return res.status(404).json({ error: 'Promotion not found' });
            }
            if (error.message === 'Cannot delete a promotion that has already started') {
                console.log('===== DELETE PROMOTION REQUEST END (403) =====\n\n');
                return res.status(403).json({ error: 'Cannot delete a promotion that has already started' });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error deleting promotion:', error);
        console.log('Error stack:', error.stack);
        console.log('===== DELETE PROMOTION REQUEST END (500) =====\n\n');
        res.status(500).json({ error: 'Failed to delete promotion' });
    }
};

module.exports = {
    createPromotion,
    getPromotions,
    getPromotion,
    updatePromotion,
    deletePromotion
};