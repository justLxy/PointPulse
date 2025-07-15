'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Create a new promotion
 */
const createPromotion = async (promotionData) => {
    console.log('\n===== PROMOTION SERVICE: CREATE PROMOTION =====');
    console.log('Promotion data:', JSON.stringify(promotionData, null, 2));
    
    const { name, description, type, startTime, endTime, minSpending, rate, points } = promotionData;

    // Validate inputs
    if (!name || name.trim() === '') {
        console.log('Validation failed: Promotion name is required');
        console.log('===== PROMOTION SERVICE: CREATE PROMOTION FAILED =====\n');
        throw new Error('Promotion name is required');
    }

    if (!description || description.trim() === '') {
        console.log('Validation failed: Promotion description is required');
        console.log('===== PROMOTION SERVICE: CREATE PROMOTION FAILED =====\n');
        throw new Error('Promotion description is required');
    }

    if (!type || !['automatic', 'one-time'].includes(type)) {
        console.log('Validation failed: Invalid promotion type:', type);
        console.log('===== PROMOTION SERVICE: CREATE PROMOTION FAILED =====\n');
        throw new Error('Promotion type must be either "automatic" or "one-time"');
    }

    if (!startTime || !endTime) {
        console.log('Validation failed: Start and end times are required');
        console.log('===== PROMOTION SERVICE: CREATE PROMOTION FAILED =====\n');
        throw new Error('Start and end times are required');
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    console.log('Parsed dates - startDate:', startDate, 'endDate:', endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.log('Validation failed: Invalid date format for start or end time');
        console.log('===== PROMOTION SERVICE: CREATE PROMOTION FAILED =====\n');
        throw new Error('Invalid date format for start or end time');
    }

    if (startDate >= endDate) {
        console.log('Validation failed: End time must be after start time');
        console.log('===== PROMOTION SERVICE: CREATE PROMOTION FAILED =====\n');
        throw new Error('End time must be after start time');
    }

    // Either rate or points must be specified
    if ((rate === undefined || rate === null) && (points === undefined || points === null)) {
        console.log('Validation failed: Either rate or points must be specified');
        console.log('===== PROMOTION SERVICE: CREATE PROMOTION FAILED =====\n');
        throw new Error('Either rate or points must be specified');
    }

    if (rate !== undefined && rate !== null && (isNaN(rate) || rate <= 0)) {
        console.log('Validation failed: Rate must be a positive number');
        console.log('===== PROMOTION SERVICE: CREATE PROMOTION FAILED =====\n');
        throw new Error('Rate must be a positive number');
    }

    if (points !== undefined && points !== null && (isNaN(points) || points < 0)) {
        console.log('Validation failed: Points must be a positive number');
        console.log('===== PROMOTION SERVICE: CREATE PROMOTION FAILED =====\n');
        throw new Error('Points must be a positive number');
    }

    try {
        console.log('Creating promotion in database');
        // Create the promotion
        const promotion = await prisma.promotion.create({
            data: {
                name,
                description,
                type,
                startTime: startDate,
                endTime: endDate,
                minSpending: minSpending === null ? null : parseFloat(minSpending),
                rate: rate === null ? null : parseFloat(rate),
                points: points === null ? null : parseInt(points)
            }
        });
        
        console.log('Promotion created successfully:', JSON.stringify({
            id: promotion.id,
            name: promotion.name,
            type: promotion.type
        }, null, 2));
        console.log('===== PROMOTION SERVICE: CREATE PROMOTION COMPLETED =====\n');

        return {
            id: promotion.id,
            name: promotion.name,
            description: promotion.description,
            type: promotion.type,
            startTime: promotion.startTime.toISOString(),
            endTime: promotion.endTime.toISOString(),
            minSpending: promotion.minSpending,
            rate: promotion.rate,
            points: promotion.points
        };
    } catch (error) {
        console.log('Error creating promotion:', error.message);
        console.log('Error stack:', error.stack);
        console.log('===== PROMOTION SERVICE: CREATE PROMOTION FAILED =====\n');
        throw error;
    }
};

/**
 * Get promotions with filtering
 */
const getPromotions = async (filters = {}, userId = null, isManager = false, page = 1, limit = 10) => {
    console.log('\n===== PROMOTION SERVICE: GET PROMOTIONS =====');
    console.log('Filters:', JSON.stringify(filters, null, 2));
    console.log('User ID:', userId);
    console.log('Is Manager:', isManager);
    console.log('Page:', page);
    console.log('Limit:', limit);
    
    const { name, type, started, ended } = filters;
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    if (isNaN(parsedPage) || parsedPage < 1) {
        console.log('Invalid page parameter');
        console.log('===== PROMOTION SERVICE: GET PROMOTIONS FAILED =====\n');
        throw new Error('Page must be a positive integer');
    }

    if (isNaN(parsedLimit) || parsedLimit < 1) {
        console.log('Invalid limit parameter');
        console.log('===== PROMOTION SERVICE: GET PROMOTIONS FAILED =====\n');
        throw new Error('Limit must be a positive integer');
    }

    if (started === 'true' && ended === 'true') {
        console.log('Cannot specify both started and ended');
        console.log('===== PROMOTION SERVICE: GET PROMOTIONS FAILED =====\n');
        throw new Error('Cannot specify both started and ended');
    }

    // Build where clause
    const where = {};

    if (name) {
        where.name = {
            contains: name
        };
        console.log('Adding name filter:', name);
    }

    if (type) {
        where.type = type;
        console.log('Adding type filter:', type);
    }

    const now = new Date();
    console.log('Current time:', now);

    // Check all promotions in database for debugging
    console.log('Checking all promotions in database for debugging:');
    const allPromotions = await prisma.promotion.findMany();
    console.log('Total promotions in database:', allPromotions.length);
    for (const promo of allPromotions) {
        console.log('Promotion:', JSON.stringify({
            id: promo.id,
            name: promo.name,
            type: promo.type,
            startTime: promo.startTime,
            endTime: promo.endTime
        }, null, 2));
        console.log('Start time comparison:', promo.startTime <= now ? 'Started' : 'Not started');
        console.log('End time comparison:', promo.endTime >= now ? 'Not ended' : 'Ended');
    }

    // For regular users, only show active promotions they haven't used
    if (!isManager) {
        console.log('Applying filters for regular user');
        
        // Check if user is a cashier
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });
        
        const isCashier = user && user.role === 'cashier';
        console.log('User is cashier:', isCashier);
        
        // All non-manager users (including cashiers) can only see promotions that have started but not ended yet
        // Only show active promotions for all non-manager users
        where.startTime = {
            lte: now
        };
        where.endTime = {
            gte: now
        };
        console.log('Adding time filters for active promotions');
        console.log('Start time filter:', JSON.stringify(where.startTime, null, 2));
        console.log('End time filter:', JSON.stringify(where.endTime, null, 2));

        // For one-time promotions, exclude those the user has already used
        if (userId) {
            console.log('Adding filters to exclude used one-time promotions for user:', userId);
            where.OR = [
                { type: 'automatic' },
                {
                    type: 'one-time',
                    NOT: {
                        users: {
                            some: {
                                id: userId
                            }
                        }
                    }
                }
            ];
            console.log('OR filter:', JSON.stringify(where.OR, null, 2));
        }
    } else {
        console.log('Applying filters for manager');
        // Manager filters
        if (started === 'true') {
            // Promotions that have started
            where.startTime = {
                lte: now
            };
            console.log('Adding filter for promotions that have started');
        } else if (started === 'false') {
            // Promotions that have not started
            where.startTime = {
                gt: now
            };
            console.log('Adding filter for promotions that have not started');
        }

        if (ended === 'true') {
            // Promotions that have ended
            where.endTime = {
                lte: now
            };
            console.log('Adding filter for promotions that have ended');
        } else if (ended === 'false') {
            // Promotions that have not ended
            where.endTime = {
                gt: now
            };
            console.log('Adding filter for promotions that have not ended');
        }
    }

    console.log('Final where clause:', JSON.stringify(where, null, 2));

    // Calculate pagination
    const skip = (parsedPage - 1) * parsedLimit;
    console.log('Skip:', skip, 'Take:', parsedLimit);

    // Get total count
    const count = await prisma.promotion.count({ where });
    console.log('Total count:', count);

    // Get promotions
    const promotions = await prisma.promotion.findMany({
        where,
        skip,
        take: parsedLimit,
        orderBy: {
            startTime: 'asc'
        }
    });
    console.log('Retrieved promotions count:', promotions.length);
    
    if (promotions.length > 0) {
        console.log('First promotion:', JSON.stringify({
            id: promotions[0].id,
            name: promotions[0].name,
            type: promotions[0].type,
            startTime: promotions[0].startTime,
            endTime: promotions[0].endTime
        }, null, 2));
    }

    // Format promotions for response
    const results = promotions.map(promo => {
        const formatted = {
            id: promo.id,
            name: promo.name,
            description: promo.description,
            type: promo.type,
            minSpending: promo.minSpending,
            rate: promo.rate,
            points: promo.points,
        };

        // Include endTime for regular users
        if (!isManager) {
            formatted.endTime = promo.endTime.toISOString();
        } else {
            // Include start and end times for managers
            formatted.startTime = promo.startTime.toISOString();
            formatted.endTime = promo.endTime.toISOString();
        }

        return formatted;
    });

    console.log('Formatted results count:', results.length);
    console.log('===== PROMOTION SERVICE: GET PROMOTIONS COMPLETED =====\n');
    return { count, results };
};

/**
 * Get a single promotion
 */
const getPromotion = async (promotionId, userId = null, isManager = false) => {
    try {
        const parsedId = parseInt(promotionId);
        if (isNaN(parsedId) || parsedId <= 0) {
            throw new Error('Invalid promotion ID');
        }
        
        const promotion = await prisma.promotion.findUnique({
            where: { id: parsedId },
        });

        if (!promotion) {
            throw new Error('Promotion not found');
        }

        // If not a manager, only allow viewing active promotions
        if (!isManager) {
            const now = new Date();

            if (promotion.startTime > now || promotion.endTime < now) {
                throw new Error('Promotion not active');
            }
        }

        // Format promotion for response
        const formatted = {
            id: promotion.id,
            name: promotion.name,
            description: promotion.description,
            type: promotion.type,
            minSpending: promotion.minSpending,
            rate: promotion.rate,
            points: promotion.points
        };

        // Include different fields based on role
        if (!isManager) {
            formatted.endTime = promotion.endTime.toISOString();
        } else {
            formatted.startTime = promotion.startTime.toISOString();
            formatted.endTime = promotion.endTime.toISOString();
        }

        return formatted;
    } catch (error) {
        console.error('Error in getPromotion service:', error);
        throw error;
    }
};

/**
 * Update a promotion
 */
const updatePromotion = async (promotionId, updateData) => {
    console.log('\n===== PROMOTION SERVICE: UPDATE PROMOTION =====');
    console.log('Promotion ID:', promotionId);
    console.log('Update data:', JSON.stringify(updateData, null, 2));
    
    const {
        name,
        description,
        type,
        startTime,
        endTime,
        minSpending,
        rate,
        points
    } = updateData;

    const parsedId = parseInt(promotionId);
    if (isNaN(parsedId) || parsedId <= 0) {
        console.log('Invalid promotion ID');
        console.log('===== PROMOTION SERVICE: UPDATE PROMOTION FAILED =====\n');
        throw new Error('Invalid promotion ID');
    }

    // Get the current promotion
    console.log('Fetching current promotion data');
    const promotion = await prisma.promotion.findUnique({
        where: { id: parsedId }
    });

    if (!promotion) {
        console.log('Promotion not found');
        console.log('===== PROMOTION SERVICE: UPDATE PROMOTION FAILED =====\n');
        throw new Error('Promotion not found');
    }
    console.log('Current promotion:', JSON.stringify({
        id: promotion.id,
        name: promotion.name,
        type: promotion.type,
        startTime: promotion.startTime,
        endTime: promotion.endTime
    }, null, 2));

    const now = new Date();
    console.log('Current time:', now);
    console.log('Promotion start time:', promotion.startTime);
    console.log('Has promotion started?', promotion.startTime <= now);

    // Validate updates based on current promotion status
    if (promotion.startTime <= now) {
        // Promotion has already started, restrict all updates except endTime
        if (name !== undefined || description !== undefined || type !== undefined ||
            startTime !== undefined || minSpending !== undefined || rate !== undefined ||
            points !== undefined) {
            console.log('Cannot update a promotion that has already started');
            console.log('===== PROMOTION SERVICE: UPDATE PROMOTION FAILED =====\n');
            throw new Error('Cannot update a promotion that has already started');
        }
    }

    if (promotion.endTime <= now) {
        // Promotion has already ended, restrict all updates
        console.log('Cannot update a promotion that has already ended');
        console.log('===== PROMOTION SERVICE: UPDATE PROMOTION FAILED =====\n');
        throw new Error('Cannot update a promotion that has already ended');
    }

    // Prepare update data
    const updateObj = {};

    if (name !== undefined) {
        // If name is null, skip updating
        if (name === null) {
            console.log('Skipping name update as it is null');
        } else if (!name || name.trim() === '') {
            console.log('Promotion name cannot be empty');
            console.log('===== PROMOTION SERVICE: UPDATE PROMOTION FAILED =====\n');
            throw new Error('Promotion name cannot be empty');
        } else {
            updateObj.name = name;
            console.log('Adding name to update object:', name);
        }
    }

    if (description !== undefined) {
        // If description is null, skip updating
        if (description === null) {
            console.log('Skipping description update as it is null');
        } else if (!description || description.trim() === '') {
            console.log('Promotion description cannot be empty');
            console.log('===== PROMOTION SERVICE: UPDATE PROMOTION FAILED =====\n');
            throw new Error('Promotion description cannot be empty');
        } else {
            updateObj.description = description;
            console.log('Adding description to update object');
        }
    }

    if (type !== undefined) {
        // If type is null, skip updating
        if (type === null) {
            console.log('Skipping type update as it is null');
        } else if (!['automatic', 'one-time'].includes(type)) {
            console.log('Invalid promotion type:', type);
            console.log('===== PROMOTION SERVICE: UPDATE PROMOTION FAILED =====\n');
            throw new Error('Promotion type must be either "automatic" or "one-time"');
        } else {
            updateObj.type = type;
            console.log('Adding type to update object:', type);
        }
    }

    if (startTime !== undefined) {
        // If startTime is null, skip updating
        if (startTime === null) {
            console.log('Skipping startTime update as it is null');
        } else {
            const startDate = new Date(startTime);

            if (isNaN(startDate.getTime())) {
                console.log('Invalid date format for start time');
                console.log('===== PROMOTION SERVICE: UPDATE PROMOTION FAILED =====\n');
                throw new Error('Invalid date format for start time');
            }

            updateObj.startTime = startDate;
            console.log('Adding startTime to update object:', startDate);
        }
    }

    if (endTime !== undefined) {
        // If endTime is null, skip updating
        if (endTime === null) {
            console.log('Skipping endTime update as it is null');
        } else {
            const endDate = new Date(endTime);

            if (isNaN(endDate.getTime())) {
                console.log('Invalid date format for end time');
                console.log('===== PROMOTION SERVICE: UPDATE PROMOTION FAILED =====\n');
                throw new Error('Invalid date format for end time');
            }

            const effectiveStartTime = startTime ? new Date(startTime) : promotion.startTime;

            if (endDate <= effectiveStartTime) {
                console.log('End time must be after start time');
                console.log('===== PROMOTION SERVICE: UPDATE PROMOTION FAILED =====\n');
                throw new Error('End time must be after start time');
            }

            updateObj.endTime = endDate;
            console.log('Adding endTime to update object:', endDate);
        }
    }

    if (minSpending !== undefined) {
        if (minSpending !== null && (isNaN(minSpending) || parseFloat(minSpending) < 0)) {
            console.log('Invalid minSpending value:', minSpending);
            console.log('===== PROMOTION SERVICE: UPDATE PROMOTION FAILED =====\n');
            throw new Error('Minimum spending must be a non-negative number or null');
        }

        updateObj.minSpending = minSpending === null ? null : parseFloat(minSpending);
        console.log('Adding minSpending to update object:', updateObj.minSpending);
    }

    if (rate !== undefined) {
        if (rate !== null && (isNaN(rate) || parseFloat(rate) <= 0)) {
            console.log('Invalid rate value:', rate);
            console.log('===== PROMOTION SERVICE: UPDATE PROMOTION FAILED =====\n');
            throw new Error('Rate must be a positive number or null');
        }

        updateObj.rate = rate === null ? null : parseFloat(rate);
        console.log('Adding rate to update object:', updateObj.rate);
    }

    if (points !== undefined) {
        if (points !== null && (isNaN(points) || parseInt(points) <= 0)) {
            console.log('Invalid points value:', points);
            console.log('===== PROMOTION SERVICE: UPDATE PROMOTION FAILED =====\n');
            throw new Error('Points must be a positive number or null');
        }

        updateObj.points = points === null ? null : parseInt(points);
        console.log('Adding points to update object:', updateObj.points);
    }

    // Check if there are any fields to update
    if (Object.keys(updateObj).length === 0) {
        console.log('No valid fields to update');
        console.log('===== PROMOTION SERVICE: UPDATE PROMOTION SKIPPED =====\n');
        
        // Return current promotion information
        return {
            id: promotion.id,
            name: promotion.name,
            type: promotion.type,
            description: promotion.description,
            startTime: promotion.startTime.toISOString(),
            endTime: promotion.endTime.toISOString(),
            minSpending: promotion.minSpending,
            rate: promotion.rate,
            points: promotion.points
        };
    }

    // Update the promotion
    console.log('Updating promotion with:', JSON.stringify(updateObj, null, 2));
    const updatedPromotion = await prisma.promotion.update({
        where: { id: parsedId },
        data: updateObj
    });
    console.log('Promotion updated successfully');

    // Return only the updated fields (plus id, name, type)
    const result = {
        id: updatedPromotion.id,
        name: updatedPromotion.name,
        type: updatedPromotion.type
    };

    if (description !== undefined && description !== null) result.description = updatedPromotion.description;
    if (startTime !== undefined && startTime !== null) result.startTime = updatedPromotion.startTime.toISOString();
    if (endTime !== undefined && endTime !== null) result.endTime = updatedPromotion.endTime.toISOString();
    if (minSpending !== undefined) result.minSpending = updatedPromotion.minSpending;
    if (rate !== undefined) result.rate = updatedPromotion.rate;
    if (points !== undefined) result.points = updatedPromotion.points;

    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('===== PROMOTION SERVICE: UPDATE PROMOTION COMPLETED =====\n');
    return result;
};

/**
 * Delete a promotion
 */
const deletePromotion = async (promotionId) => {
    console.log('\n===== PROMOTION SERVICE: DELETE PROMOTION =====');
    console.log('Promotion ID:', promotionId);
    
    const parsedId = parseInt(promotionId);
    if (isNaN(parsedId) || parsedId <= 0) {
        console.log('Validation failed: Invalid promotion ID');
        console.log('===== PROMOTION SERVICE: DELETE PROMOTION FAILED =====\n');
        throw new Error('Invalid promotion ID');
    }
    
    // Find the promotion
    console.log('Fetching promotion data');
    const promotion = await prisma.promotion.findUnique({
        where: { id: parsedId }
    });

    if (!promotion) {
        console.log('Promotion not found');
        console.log('===== PROMOTION SERVICE: DELETE PROMOTION FAILED =====\n');
        throw new Error('Promotion not found');
    }
    
    console.log('Promotion found:', JSON.stringify({
        id: promotion.id,
        name: promotion.name,
        type: promotion.type,
        startTime: promotion.startTime,
        endTime: promotion.endTime
    }, null, 2));

    const now = new Date();
    console.log('Current time:', now);
    console.log('Promotion start time:', promotion.startTime);
    console.log('Has promotion started?', promotion.startTime <= now);
    
    if (promotion.startTime <= now) {
        console.log('Promotion has already started, cannot delete');
        console.log('===== PROMOTION SERVICE: DELETE PROMOTION FAILED =====\n');
        throw new Error('Cannot delete a promotion that has already started');
    }

    try {
        console.log('Deleting promotion from database');
        await prisma.promotion.delete({
            where: { id: parsedId }
        });
        
        console.log('Promotion deleted successfully');
        console.log('===== PROMOTION SERVICE: DELETE PROMOTION COMPLETED =====\n');
        return { success: true };
    } catch (error) {
        console.log('Error deleting promotion:', error.message);
        console.log('Error stack:', error.stack);
        console.log('===== PROMOTION SERVICE: DELETE PROMOTION FAILED =====\n');
        throw error;
    }
};

module.exports = {
    createPromotion,
    getPromotions,
    getPromotion,
    updatePromotion,
    deletePromotion
};