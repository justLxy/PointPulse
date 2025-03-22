'use strict';

const eventService = require('../services/eventService');
const { checkRole } = require('../middlewares/authMiddleware');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Create a new event (manager or higher role required)
 */
const createEvent = async (req, res) => {
    console.log('\n\n===== CREATE EVENT REQUEST START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Auth user:', JSON.stringify(req.auth, null, 2));
    
    try {
        // Check for empty payload
        if (!req.body || Object.keys(req.body).length === 0) {
            console.log('No event data provided');
            console.log('===== CREATE EVENT REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'No event data provided' });
        }

        // Check required fields
        const requiredFields = ['name', 'description', 'location', 'startTime', 'endTime', 'points'];
        for (const field of requiredFields) {
            if (req.body[field] === undefined) {
                console.log(`Required field missing: ${field}`);
                console.log('===== CREATE EVENT REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: `${field} is required` });
            }
        }

        const eventData = {
            name: req.body.name,
            description: req.body.description,
            location: req.body.location,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            capacity: req.body.capacity,
            points: req.body.points,
            creatorId: req.auth.id
        };
        
        console.log('Event data prepared:', JSON.stringify(eventData, null, 2));

        try {
            console.log('Calling eventService.createEvent');
            const event = await eventService.createEvent(eventData);
            console.log('Event created successfully:', JSON.stringify(event, null, 2));
            console.log('===== CREATE EVENT REQUEST END (201) =====\n\n');
            return res.status(201).json(event);
        } catch (error) {
            console.log('Error creating event:', error.message);
            console.log('Error stack:', error.stack);
            console.log('===== CREATE EVENT REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: error.message });
        }
    } catch (error) {
        console.error('Error creating event:', error);
        console.log('Error stack:', error.stack);
        console.log('===== CREATE EVENT REQUEST END (500) =====\n\n');
        res.status(500).json({ error: 'Failed to create event' });
    }
};

/**
 * Get events with filtering
 */
const getEvents = async (req, res) => {
    console.log('\n\n===== GET EVENTS REQUEST START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Query parameters:', JSON.stringify(req.query, null, 2));
    console.log('Auth user:', JSON.stringify(req.auth, null, 2));
    
    try {
        // Validate pagination parameters
        if (req.query.limit && (isNaN(parseInt(req.query.limit)) || parseInt(req.query.limit) <= 0)) {
            console.log('Invalid limit parameter:', req.query.limit);
            console.log('===== GET EVENTS REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Limit must be a positive integer' });
        }

        if (req.query.page && (isNaN(parseInt(req.query.page)) || parseInt(req.query.page) <= 0)) {
            console.log('Invalid page parameter:', req.query.page);
            console.log('===== GET EVENTS REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Page must be a positive integer' });
        }

        const filters = {
            name: req.query.name,
            location: req.query.location,
            started: req.query.started,
            ended: req.query.ended,
            showFull: req.query.showFull === 'true' ? 'true' : undefined
        };
        
        console.log('Initial filters:', JSON.stringify(filters, null, 2));

        // Add manager-specific filters
        const isManager = checkRole(req.auth, 'manager');
        console.log('User is manager:', isManager);
        
        if (isManager) {
            filters.published = req.query.published;
            console.log('Added manager-specific filter - published:', req.query.published);
        }

        // Check for conflicting parameters
        if (filters.started === 'true' && filters.ended === 'true') {
            console.log('Conflicting parameters: both started and ended are true');
            console.log('===== GET EVENTS REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Cannot specify both started and ended' });
        }
        
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        console.log('Pagination: page =', page, ', limit =', limit);

        try {
            console.log('Calling eventService.getEvents with filters:', JSON.stringify(filters, null, 2));
            const result = await eventService.getEvents(
                filters,
                isManager,
                page,
                limit
            );
            
            console.log('Events retrieved successfully. Count:', result.count);
            console.log('===== GET EVENTS REQUEST END (200) =====\n\n');
            return res.status(200).json(result);
        } catch (error) {
            console.log('Error getting events:', error.message);
            console.log('Error stack:', error.stack);
            
            if (error.message === 'Cannot specify both started and ended' || 
                error.message === 'Page must be a positive integer' || 
                error.message === 'Limit must be a positive integer') {
                console.log('===== GET EVENTS REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: error.message });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error getting events:', error);
        console.log('Error stack:', error.stack);
        console.log('===== GET EVENTS REQUEST END (500) =====\n\n');
        return res.status(500).json({ error: 'Failed to retrieve events' });
    }
};

/**
 * Get a specific event
 */
const getEvent = async (req, res) => {
    console.log('\n\n===== GET EVENT REQUEST START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Params:', JSON.stringify(req.params, null, 2));
    console.log('Auth user:', JSON.stringify(req.auth, null, 2));
    
    try {
        const eventId = parseInt(req.params.eventId);
        console.log('Parsed event ID:', eventId);
        
        if (isNaN(eventId) || eventId <= 0) {
            console.log('Invalid event ID');
            console.log('===== GET EVENT REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Invalid event ID' });
        }
        
        const userId = req.auth.id;
        const isManager = checkRole(req.auth, 'manager');
        console.log('User ID:', userId);
        console.log('Is manager:', isManager);

        // Check if the event exists
        console.log('Checking if event exists');
        const event = await prisma.event.findUnique({
            where: {
                id: eventId
            },
            include: {
                organizers: true
            }
        });

        if (!event) {
            console.log('Event not found');
            console.log('===== GET EVENT REQUEST END (404) =====\n\n');
            return res.status(404).json({ error: 'Event not found' });
        }
        
        console.log('Event found:', JSON.stringify({
            id: event.id,
            name: event.name,
            published: event.published,
            organizerCount: event.organizers.length
        }, null, 2));

        // 如果不是管理员，且事件未发布，且用户不是组织者，则返回404
        if (!isManager && !event.published) {
            const isOrganizer = event.organizers.some(org => org.id === userId);
            console.log('Event is not published, checking if user is organizer:', isOrganizer);
            
            if (!isOrganizer) {
                console.log('User is not authorized to view unpublished event');
                console.log('===== GET EVENT REQUEST END (404) =====\n\n');
                return res.status(404).json({ error: 'Event not found' });
            }
        }

        // Check if user is an organizer
        const isOrganizer = event.organizers.some(org => org.id === userId);
        console.log('Is user an organizer:', isOrganizer);

        try {
            console.log('Calling eventService.getEvent');
            const eventDetails = await eventService.getEvent(
                eventId,
                isManager,
                isOrganizer
            );

            console.log('Event details retrieved successfully');
            console.log('===== GET EVENT REQUEST END (200) =====\n\n');
            return res.status(200).json(eventDetails);
        } catch (error) {
            console.log('Error getting event details:', error.message);
            console.log('Error stack:', error.stack);
            
            if (error.message === 'Event not found') {
                console.log('===== GET EVENT REQUEST END (404) =====\n\n');
                return res.status(404).json({ error: 'Event not found' });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error getting event:', error);
        console.log('Error stack:', error.stack);
        console.log('===== GET EVENT REQUEST END (500) =====\n\n');
        res.status(500).json({ error: 'Failed to retrieve event' });
    }
};

/**
 * Update an event
 */
const updateEvent = async (req, res) => {
    console.log('\n\n===== UPDATE EVENT REQUEST START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Params:', JSON.stringify(req.params, null, 2));
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Auth user:', JSON.stringify(req.auth, null, 2));
    
    try {
        const eventId = parseInt(req.params.eventId);
        console.log('Parsed event ID:', eventId);
        
        if (isNaN(eventId) || eventId <= 0) {
            console.log('Invalid event ID');
            console.log('===== UPDATE EVENT REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Invalid event ID' });
        }
        
        const userId = req.auth.id;
        console.log('User ID:', userId);

        // Empty payload check
        if (!req.body || Object.keys(req.body).length === 0) {
            console.log('No fields provided for update');
            console.log('===== UPDATE EVENT REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'No fields provided for update' });
        }

        // 先检查事件是否存在
        console.log('Checking if event exists');
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                organizers: true,
                guests: {
                    select: { id: true }
                }
            }
        });

        if (!event) {
            console.log('Event not found');
            console.log('===== UPDATE EVENT REQUEST END (404) =====\n\n');
            return res.status(404).json({ error: 'Event not found' });
        }
        
        console.log('Event found:', JSON.stringify({
            id: event.id,
            name: event.name,
            published: event.published,
            organizerCount: event.organizers.length,
            guestCount: event.guests.length
        }, null, 2));

        // 检查事件是否已结束
        const now = new Date();
        console.log('Current time:', now);
        console.log('Event end time:', event.endTime);
        console.log('Has event ended?', event.endTime <= now);
        
        if (event.endTime <= now) {
            // 如果事件已结束，不允许更新任何字段
            console.log('Event has ended, cannot update');
            console.log('===== UPDATE EVENT REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Cannot update an event that has ended' });
        }

        // Check permissions based on role
        const isManager = checkRole(req.auth, 'manager');
        const isOrganizer = event.organizers.some(org => org.id === userId);
        console.log('Is user a manager?', isManager);
        console.log('Is user an organizer?', isOrganizer);

        if (!isManager && !isOrganizer) {
            console.log('User is not authorized to update this event');
            console.log('===== UPDATE EVENT REQUEST END (403) =====\n\n');
            return res.status(403).json({ error: 'Unauthorized to update this event' });
        }

        // 检查是否尝试更新需要管理员权限的字段
        if (!isManager && (req.body.points !== undefined || req.body.published !== undefined)) {
            console.log('Non-manager attempting to update restricted fields (points or published)');
            console.log('===== UPDATE EVENT REQUEST END (403) =====\n\n');
            return res.status(403).json({ error: 'Unauthorized to update points or publishing status' });
        }

        // 检查容量更新是否有效
        if (req.body.capacity !== undefined && req.body.capacity !== null) {
            const capacity = parseInt(req.body.capacity);
            console.log('New capacity:', capacity);
            console.log('Current guest count:', event.guests.length);
            
            if (isNaN(capacity) || capacity < 0) {
                console.log('Invalid capacity value');
                console.log('===== UPDATE EVENT REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Capacity must be a non-negative number or null' });
            }
            
            if (capacity < event.guests.length) {
                console.log('New capacity is less than current guest count');
                console.log('===== UPDATE EVENT REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Cannot reduce capacity below current guest count' });
            }
        }

        // 检查points更新是否有效
        if (isManager && req.body.points !== undefined) {
            // 只有当points不为null时才进行数值验证
            if (req.body.points !== null) {
                const points = parseInt(req.body.points);
                console.log('New points:', points);
                console.log('Points already awarded:', event.pointsAwarded);
                
                if (isNaN(points) || points < 0) {
                    console.log('Invalid points value');
                    console.log('===== UPDATE EVENT REQUEST END (400) =====\n\n');
                    return res.status(400).json({ error: 'Points must be a non-negative number' });
                }
                
                if (points < event.pointsAwarded) {
                    console.log('New points is less than already awarded points');
                    console.log('===== UPDATE EVENT REQUEST END (400) =====\n\n');
                    return res.status(400).json({ error: 'Points cannot be less than already awarded points' });
                }
            } else {
                console.log('Points is null, skipping numeric validation');
            }
        }

        const updateData = {};
        // Only include fields that are provided
        if (req.body.name !== undefined) {
            // 只有当name不为null且为空字符串时才报错
            if (req.body.name !== null && (req.body.name === '' || req.body.name.trim() === '')) {
                console.log('Event name cannot be empty');
                console.log('===== UPDATE EVENT REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Event name cannot be empty' });
            }
            // 只有当name不为null时才添加到更新数据
            if (req.body.name !== null) {
                updateData.name = req.body.name;
                console.log('Adding name to update data:', req.body.name);
            } else {
                console.log('Name is null, skipping this field in update');
            }
        }
        if (req.body.description !== undefined) {
            // 只有当description不为null且为空字符串时才报错
            if (req.body.description !== null && (req.body.description === '' || req.body.description.trim() === '')) {
                console.log('Event description cannot be empty');
                console.log('===== UPDATE EVENT REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Event description cannot be empty' });
            }
            // 只有当description不为null时才添加到更新数据
            if (req.body.description !== null) {
                updateData.description = req.body.description;
                console.log('Adding description to update data');
            } else {
                console.log('Description is null, skipping this field in update');
            }
        }
        if (req.body.location !== undefined) {
            // 只有当location不为null且为空字符串时才报错
            if (req.body.location !== null && (req.body.location === '' || req.body.location.trim() === '')) {
                console.log('Event location cannot be empty');
                console.log('===== UPDATE EVENT REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Event location cannot be empty' });
            }
            // 只有当location不为null时才添加到更新数据
            if (req.body.location !== null) {
                updateData.location = req.body.location;
                console.log('Adding location to update data:', req.body.location);
            } else {
                console.log('Location is null, skipping this field in update');
            }
        }
        if (req.body.startTime !== undefined) {
            if (req.body.startTime !== null) {
                updateData.startTime = req.body.startTime;
                console.log('Adding startTime to update data:', req.body.startTime);
            } else {
                console.log('StartTime is null, skipping this field in update');
            }
        }
        if (req.body.endTime !== undefined) {
            if (req.body.endTime !== null) {
                updateData.endTime = req.body.endTime;
                console.log('Adding endTime to update data:', req.body.endTime);
            } else {
                console.log('EndTime is null, skipping this field in update');
            }
        }
        if (req.body.capacity !== undefined) {
            if (req.body.capacity !== null) {
                updateData.capacity = req.body.capacity;
                console.log('Adding capacity to update data:', req.body.capacity);
            } else {
                console.log('Capacity is null, skipping this field in update');
            }
        }

        // Add manager-specific fields
        if (isManager) {
            if (req.body.points !== undefined) {
                if (req.body.points !== null) {
                    updateData.points = parseInt(req.body.points);
                    console.log('Adding points to update data:', updateData.points);
                } else {
                    console.log('Points is null, skipping this field in update');
                }
            }
            
            if (req.body.published !== undefined) {
                if (req.body.published !== null) {
                    if (typeof req.body.published === 'string') {
                        updateData.published = req.body.published.toLowerCase() === 'true';
                    } else {
                        updateData.published = !!req.body.published;
                    }
                    console.log('Adding published to update data:', updateData.published);
                } else {
                    console.log('Published is null, skipping this field in update');
                }
            }
        }

        console.log('Final update data:', JSON.stringify(updateData, null, 2));

        try {
            console.log('Calling eventService.updateEvent');
            const updatedEvent = await eventService.updateEvent(eventId, updateData, isManager);
            console.log('Event updated successfully:', JSON.stringify(updatedEvent, null, 2));
            console.log('===== UPDATE EVENT REQUEST END (200) =====\n\n');
            return res.status(200).json(updatedEvent);
        } catch (error) {
            console.log('Error updating event:', error.message);
            console.log('Error stack:', error.stack);
            
            if (error.message === 'Event not found') {
                console.log('===== UPDATE EVENT REQUEST END (404) =====\n\n');
                return res.status(404).json({ error: 'Event not found' });
            }
            if (error.message === 'Event has ended') {
                console.log('===== UPDATE EVENT REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Cannot update an event that has ended' });
            }
            if (error.message === 'Cannot reduce capacity below current guest count') {
                console.log('===== UPDATE EVENT REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Cannot reduce capacity below current guest count' });
            }
            if (error.message === 'Event is published') {
                console.log('===== UPDATE EVENT REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Cannot update a published event' });
            }
            if (error.message === 'Points cannot be less than already awarded points') {
                console.log('===== UPDATE EVENT REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Points cannot be less than already awarded points' });
            }
            if (error.message === 'Start time cannot be in the past') {
                console.log('===== UPDATE EVENT REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Start time cannot be in the past' });
            }
            if (error.message === 'End time cannot be in the past') {
                console.log('===== UPDATE EVENT REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'End time cannot be in the past' });
            }
            
            console.log('===== UPDATE EVENT REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: error.message });
        }
    } catch (error) {
        console.error('Error updating event:', error);
        console.log('Error stack:', error.stack);
        console.log('===== UPDATE EVENT REQUEST END (500) =====\n\n');
        res.status(500).json({ error: 'Failed to update event' });
    }
};

/**
 * Delete an event
 */
const deleteEvent = async (req, res) => {
    console.log('\n\n===== DELETE EVENT REQUEST START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Params:', JSON.stringify(req.params, null, 2));
    console.log('Auth user:', JSON.stringify(req.auth, null, 2));
    
    try {
        const eventId = parseInt(req.params.eventId);
        console.log('Parsed event ID:', eventId);
        
        if (isNaN(eventId) || eventId <= 0) {
            console.log('Invalid event ID');
            console.log('===== DELETE EVENT REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Invalid event ID' });
        }

        // 先检查事件是否存在及其状态
        console.log('Checking if event exists');
        const event = await prisma.event.findUnique({
            where: { id: eventId }
        });

        if (!event) {
            console.log('Event not found');
            console.log('===== DELETE EVENT REQUEST END (404) =====\n\n');
            return res.status(404).json({ error: 'Event not found' });
        }
        
        console.log('Event found:', JSON.stringify({
            id: event.id,
            name: event.name,
            published: event.published
        }, null, 2));

        // 检查事件是否已发布
        if (event.published) {
            console.log('Event is published, cannot delete');
            console.log('===== DELETE EVENT REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Cannot delete a published event' });
        }

        try {
            console.log('Calling eventService.deleteEvent');
            await eventService.deleteEvent(eventId);
            console.log('Event deleted successfully');
            console.log('===== DELETE EVENT REQUEST END (204) =====\n\n');
            return res.status(204).send();
        } catch (error) {
            console.log('Error deleting event:', error.message);
            console.log('Error stack:', error.stack);
            
            if (error.message === 'Event not found') {
                console.log('===== DELETE EVENT REQUEST END (404) =====\n\n');
                return res.status(404).json({ error: 'Event not found' });
            } else if (error.message === 'Cannot delete a published event') {
                console.log('===== DELETE EVENT REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: error.message });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        console.log('Error stack:', error.stack);
        console.log('===== DELETE EVENT REQUEST END (500) =====\n\n');
        res.status(500).json({ error: 'Failed to delete event' });
    }
};

/**
 * Add an organizer to an event (manager or higher role required)
 */
const addOrganizer = async (req, res) => {
    try {
        // Check for empty payload
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'No data provided' });
        }

        const eventId = parseInt(req.params.eventId);
        
        if (isNaN(eventId) || eventId <= 0) {
            return res.status(400).json({ error: 'Invalid event ID' });
        }
        
        const { utorid } = req.body;

        if (!utorid) {
            return res.status(400).json({ error: 'UTORid is required' });
        }

        // 先检查用户是否存在
        const user = await prisma.user.findUnique({
            where: { utorid }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // 先检查事件是否存在及其状态
        const event = await prisma.event.findUnique({
            where: { id: eventId }
        });

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // 检查事件是否已结束
        if (event.endTime <= new Date()) {
            return res.status(410).json({ error: 'Event has ended' });
        }

        try {
            const result = await eventService.addOrganizer(eventId, utorid);
            return res.status(201).json(result);
        } catch (error) {
            if (error.message === 'Event not found') {
                return res.status(404).json({ error: 'Event not found' });
            }
            if (error.message === 'User not found') {
                return res.status(404).json({ error: 'User not found' });
            }
            if (error.message === 'User is already a guest') {
                return res.status(400).json({ error: 'User is already a guest and cannot be an organizer' });
            }
            if (error.message === 'User is already an organizer') {
                return res.status(400).json({ error: 'User is already an organizer' });
            }
            if (error.message === 'Event has ended') {
                return res.status(410).json({ error: 'Event has ended' });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error adding organizer:', error);
        res.status(500).json({ error: 'Failed to add organizer' });
    }
};

/**
 * Remove an organizer from an event
 */
const removeOrganizer = async (req, res) => {
    try {
        const eventId = parseInt(req.params.eventId);
        const userId = parseInt(req.params.userId);
        
        if (isNaN(eventId) || eventId <= 0) {
            return res.status(400).json({ error: 'Invalid event ID' });
        }
        
        if (isNaN(userId) || userId <= 0) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        try {
            await eventService.removeOrganizer(eventId, userId);
            return res.status(204).send();
        } catch (error) {
            if (error.message === 'Event not found' || error.message === 'User is not an organizer for this event') {
                return res.status(404).json({ error: error.message });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error removing organizer:', error);
        res.status(500).json({ error: 'Failed to remove organizer' });
    }
};

/**
 * Add a guest to an event (manager or organizer)
 */
const addGuest = async (req, res) => {
    try {
        // Check for empty payload
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'No data provided' });
        }

        const eventId = parseInt(req.params.eventId);
        
        if (isNaN(eventId) || eventId <= 0) {
            return res.status(400).json({ error: 'Invalid event ID' });
        }
        
        const { utorid } = req.body;
        const userId = req.auth.id;

        if (!utorid) {
            return res.status(400).json({ error: 'UTORid is required' });
        }

        // 先检查用户是否存在
        const user = await prisma.user.findUnique({
            where: { utorid }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // 先检查事件是否存在及其状态
        const event = await prisma.event.findUnique({
            where: { id: eventId }
        });

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // 检查事件是否已结束
        if (event.endTime <= new Date()) {
            return res.status(410).json({ error: 'Event has ended' });
        }

        // 检查事件是否已满
        if (event.capacity !== null) {
            const guestsCount = await prisma.event.findUnique({
                where: { id: eventId },
                include: { _count: { select: { guests: true } } }
            });
            
            if (guestsCount && guestsCount._count.guests >= event.capacity) {
                return res.status(410).json({ error: 'Event is full' });
            }
        }

        // Check if user is a manager or an organizer
        const isManager = checkRole(req.auth, 'manager');

        if (!isManager) {
            // Check if user is an organizer
            const isOrganizer = await prisma.event.findFirst({
                where: {
                    id: eventId,
                    organizers: {
                        some: {
                            id: userId
                        }
                    }
                }
            });

            if (!isOrganizer) {
                return res.status(403).json({ error: 'Unauthorized to add guests' });
            }
        }

        try {
            const result = await eventService.addGuest(eventId, utorid, isManager, true);
            return res.status(201).json(result);
        } catch (error) {
            if (error.message === 'Event not found') {
                return res.status(404).json({ error: 'Event not found' });
            }
            if (error.message === 'User not found') {
                return res.status(404).json({ error: 'User not found' });
            }
            if (error.message === 'User is already a guest') {
                return res.status(400).json({ error: 'User is already a guest' });
            }
            if (error.message === 'User is already an organizer') {
                return res.status(400).json({ error: 'User is an organizer and cannot be a guest' });
            }
            if (error.message === 'Event is full') {
                return res.status(410).json({ error: 'Event is full' });
            }
            if (error.message === 'Event has ended' || error.message === 'Event has already ended') {
                return res.status(410).json({ error: 'Event has ended' });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error adding guest:', error);
        res.status(500).json({ error: 'Failed to add guest' });
    }
};

/**
 * Remove a guest from an event (manager only)
 */
const removeGuest = async (req, res) => {
    try {
        const eventId = parseInt(req.params.eventId);
        const userId = parseInt(req.params.userId);
        
        if (isNaN(eventId) || eventId <= 0) {
            return res.status(400).json({ error: 'Invalid event ID' });
        }
        
        if (isNaN(userId) || userId <= 0) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // 先检查事件是否存在及其状态
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                guests: {
                    where: { id: userId }
                }
            }
        });

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // 检查事件是否已结束
        if (event.endTime <= new Date()) {
            return res.status(410).json({ error: 'Event has already ended' });
        }

        // 检查用户是否是嘉宾
        if (event.guests.length === 0) {
            return res.status(404).json({ error: 'User is not a guest for this event' });
        }

        // Verify that the requester has at least a manager role
        if (!checkRole(req.auth, 'manager')) {
            return res.status(403).json({ error: 'Unauthorized to remove guests' });
        }

        try {
            await eventService.removeGuest(eventId, userId);
            return res.status(204).send();
        } catch (error) {
            if (error.message === 'Event not found' || error.message === 'User is not a guest for this event') {
                return res.status(404).json({ error: error.message });
            } else if (error.message === 'Event has already ended') {
                return res.status(410).json({ error: error.message });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error removing guest:', error);
        res.status(500).json({ error: 'Failed to remove guest' });
    }
};

/**
 * Add current user as a guest
 */
const addCurrentUserAsGuest = async (req, res) => {
    console.log('\n\n===== ADD CURRENT USER AS GUEST REQUEST START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Params:', JSON.stringify(req.params, null, 2));
    console.log('Auth user:', JSON.stringify(req.auth, null, 2));
    
    try {
        const eventId = parseInt(req.params.eventId);
        console.log('Parsed event ID:', eventId);
        
        if (isNaN(eventId) || eventId <= 0) {
            console.log('Invalid event ID');
            console.log('===== ADD CURRENT USER AS GUEST REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Invalid event ID' });
        }
        
        const userId = req.auth.id;
        console.log('User ID:', userId);

        // 先检查事件是否存在及其状态
        console.log('Checking if event exists and its status');
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                guests: {
                    where: { id: userId }
                },
                organizers: {
                    where: { id: userId }
                }
            }
        });

        if (!event) {
            console.log('Event not found');
            console.log('===== ADD CURRENT USER AS GUEST REQUEST END (404) =====\n\n');
            return res.status(404).json({ error: 'Event not found' });
        }
        
        console.log('Event found:', JSON.stringify({
            id: event.id,
            name: event.name,
            published: event.published,
            startTime: event.startTime,
            endTime: event.endTime
        }, null, 2));

        // 检查事件是否已发布
        if (!event.published) {
            console.log('Event is not published');
            console.log('===== ADD CURRENT USER AS GUEST REQUEST END (404) =====\n\n');
            return res.status(404).json({ error: 'Event not found' });
        }
        console.log('Event is published');

        // 检查事件是否已结束
        const now = new Date();
        console.log('Current time:', now);
        console.log('Event end time:', event.endTime);
        console.log('Has event ended?', event.endTime <= now);
        
        if (event.endTime <= now) {
            console.log('Event has already ended');
            console.log('===== ADD CURRENT USER AS GUEST REQUEST END (410) =====\n\n');
            return res.status(410).json({ error: 'Event has already ended' });
        }

        // 记录事件开始时间信息，但不再阻止用户加入尚未开始的活动
        console.log('Event start time:', event.startTime);
        console.log('Has event started?', event.startTime <= now);
        console.log('Allowing registration regardless of start time');

        // 检查用户是否已经是嘉宾
        console.log('Checking if user is already a guest');
        console.log('Guest count for this user:', event.guests.length);
        
        if (event.guests.length > 0) {
            console.log('User is already registered as a guest');
            console.log('===== ADD CURRENT USER AS GUEST REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'User is already registered as a guest' });
        }

        // 检查用户是否已经是组织者
        console.log('Checking if user is already an organizer');
        console.log('Organizer count for this user:', event.organizers.length);
        
        if (event.organizers.length > 0) {
            console.log('User is already registered as an organizer');
            console.log('===== ADD CURRENT USER AS GUEST REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'User is already registered as an organizer' });
        }

        // 检查事件是否已满
        console.log('Checking if event is full');
        if (event.capacity !== null) {
            console.log('Event has capacity limit:', event.capacity);
            const guestsCount = await prisma.event.findUnique({
                where: { id: eventId },
                include: { _count: { select: { guests: true } } }
            });
            
            console.log('Current guest count:', guestsCount?._count.guests);
            
            if (guestsCount && guestsCount._count.guests >= event.capacity) {
                console.log('Event is full');
                console.log('===== ADD CURRENT USER AS GUEST REQUEST END (410) =====\n\n');
                return res.status(410).json({ error: 'Event is full' });
            }
            console.log('Event has space available');
        } else {
            console.log('Event has no capacity limit');
        }

        try {
            console.log('Calling eventService.addCurrentUserAsGuest');
            const result = await eventService.addCurrentUserAsGuest(eventId, userId);
            console.log('User successfully added as guest:', JSON.stringify(result, null, 2));
            console.log('===== ADD CURRENT USER AS GUEST REQUEST END (201) =====\n\n');
            return res.status(201).json(result);
        } catch (error) {
            console.log('Error adding current user as guest:', error.message);
            console.log('Error stack:', error.stack);
            
            if (error.message === 'Event not found') {
                console.log('===== ADD CURRENT USER AS GUEST REQUEST END (404) =====\n\n');
                return res.status(404).json({ error: 'Event not found' });
            }
            if (error.message === 'User is already registered as a guest') {
                console.log('===== ADD CURRENT USER AS GUEST REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'User is already registered as a guest' });
            }
            if (error.message === 'User is already registered as an organizer') {
                console.log('===== ADD CURRENT USER AS GUEST REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'User is already registered as an organizer' });
            }
            if (error.message === 'Event is full') {
                console.log('===== ADD CURRENT USER AS GUEST REQUEST END (410) =====\n\n');
                return res.status(410).json({ error: 'Event is full' });
            }
            if (error.message === 'Event has already ended') {
                console.log('===== ADD CURRENT USER AS GUEST REQUEST END (410) =====\n\n');
                return res.status(410).json({ error: 'Event has already ended' });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error adding current user as guest:', error);
        console.log('Error stack:', error.stack);
        console.log('===== ADD CURRENT USER AS GUEST REQUEST END (500) =====\n\n');
        res.status(500).json({ error: 'Failed to add as guest' });
    }
};

/**
 * Remove current user as a guest
 */
const removeCurrentUserAsGuest = async (req, res) => {
    console.log('\n\n===== REMOVE CURRENT USER AS GUEST REQUEST START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Params:', JSON.stringify(req.params, null, 2));
    console.log('Auth user:', JSON.stringify(req.auth, null, 2));
    
    try {
        const eventId = parseInt(req.params.eventId);
        console.log('Parsed event ID:', eventId);
        
        if (isNaN(eventId) || eventId <= 0) {
            console.log('Invalid event ID');
            console.log('===== REMOVE CURRENT USER AS GUEST REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Invalid event ID' });
        }
        
        const userId = req.auth.id;
        console.log('User ID:', userId);

        // 先检查事件是否存在及其状态
        console.log('Checking if event exists and its status');
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                guests: {
                    where: { id: userId }
                }
            }
        });

        if (!event) {
            console.log('Event not found');
            console.log('===== REMOVE CURRENT USER AS GUEST REQUEST END (404) =====\n\n');
            return res.status(404).json({ error: 'Event not found' });
        }
        
        console.log('Event found:', JSON.stringify({
            id: event.id,
            name: event.name,
            endTime: event.endTime
        }, null, 2));

        // 检查事件是否已结束
        const now = new Date();
        console.log('Current time:', now);
        console.log('Event end time:', event.endTime);
        console.log('Has event ended?', event.endTime <= now);
        
        if (event.endTime <= now) {
            console.log('Event has already ended');
            console.log('===== REMOVE CURRENT USER AS GUEST REQUEST END (410) =====\n\n');
            return res.status(410).json({ error: 'Event has already ended' });
        }

        // 检查用户是否是嘉宾
        console.log('Checking if user is a guest');
        console.log('Guest count for this user:', event.guests.length);
        
        if (event.guests.length === 0) {
            console.log('User is not a guest for this event');
            console.log('===== REMOVE CURRENT USER AS GUEST REQUEST END (404) =====\n\n');
            return res.status(404).json({ error: 'User is not a guest for this event' });
        }
        console.log('User is confirmed as a guest');

        try {
            console.log('Calling eventService.removeCurrentUserAsGuest');
            await eventService.removeCurrentUserAsGuest(eventId, userId);
            console.log('User successfully removed as guest');
            console.log('===== REMOVE CURRENT USER AS GUEST REQUEST END (204) =====\n\n');
            return res.status(204).send();
        } catch (error) {
            console.log('Error removing current user as guest:', error.message);
            console.log('Error stack:', error.stack);
            
            if (error.message === 'Event not found' || error.message === 'User is not a guest for this event') {
                console.log('===== REMOVE CURRENT USER AS GUEST REQUEST END (404) =====\n\n');
                return res.status(404).json({ error: error.message });
            }
            if (error.message === 'Event has already ended') {
                console.log('===== REMOVE CURRENT USER AS GUEST REQUEST END (410) =====\n\n');
                return res.status(410).json({ error: error.message });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error removing current user as guest:', error);
        console.log('Error stack:', error.stack);
        console.log('===== REMOVE CURRENT USER AS GUEST REQUEST END (500) =====\n\n');
        res.status(500).json({ error: 'Failed to remove as guest' });
    }
};

/**
 * Create an event transaction (award points)
 */
const createEventTransaction = async (req, res) => {
    try {
        const eventId = parseInt(req.params.eventId);
        
        if (isNaN(eventId) || eventId <= 0) {
            return res.status(400).json({ error: 'Invalid event ID' });
        }
        
        const userId = req.auth.id;

        // Check for empty payload
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'No data provided' });
        }

        const { type, utorid, amount, remark } = req.body;

        if (type !== 'event') {
            return res.status(400).json({ error: 'Transaction type must be "event"' });
        }

        if (!amount || isNaN(parseInt(amount)) || parseInt(amount) <= 0) {
            return res.status(400).json({ error: 'Amount must be a positive number' });
        }

        // 先检查事件是否存在
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                organizers: {
                    where: { id: userId }
                }
            }
        });

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check if user is an organizer for this event or a manager
        const isManager = checkRole(req.auth, 'manager');
        const isOrganizer = event.organizers.length > 0;

        if (!isManager && !isOrganizer) {
            return res.status(403).json({ error: 'Unauthorized to create event transactions' });
        }

        // 检查是否有足够的积分
        const parsedAmount = parseInt(amount);
        if (utorid) {
            // 单个用户奖励
            if (parsedAmount > event.pointsRemain) {
                return res.status(400).json({ error: 'Not enough points remaining for this event' });
            }
        } else {
            // 所有嘉宾奖励
            const guestsCount = await prisma.event.findUnique({
                where: { id: eventId },
                include: { _count: { select: { guests: true } } }
            });
            
            if (!guestsCount || guestsCount._count.guests === 0) {
                return res.status(400).json({ error: 'No guests to award points to' });
            }
            
            const totalPointsNeeded = parsedAmount * guestsCount._count.guests;
            if (totalPointsNeeded > event.pointsRemain) {
                return res.status(400).json({ error: 'Not enough points remaining to award to all guests' });
            }
        }

        try {
            const result = await eventService.createEventTransaction(
                eventId,
                { 
                    type, 
                    utorid, 
                    amount: parsedAmount, 
                    remark 
                },
                userId
            );

            return res.status(201).json(result);
        } catch (error) {
            if (error.message === 'Event not found' || error.message === 'User not found') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === 'User is not a guest for this event' ||
                error.message === 'Not enough points remaining for this event' ||
                error.message === 'No guests to award points to' ||
                error.message === 'Not enough points remaining to award to all guests') {
                return res.status(400).json({ error: error.message });
            }
            if (error.message === 'Not authorized to create event transactions') {
                return res.status(403).json({ error: error.message });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error creating event transaction:', error);
        res.status(500).json({ error: 'Failed to create event transaction' });
    }
};

module.exports = {
    createEvent,
    getEvents,
    getEvent,
    updateEvent,
    deleteEvent,
    addOrganizer,
    removeOrganizer,
    addGuest,
    removeGuest,
    addCurrentUserAsGuest,
    removeCurrentUserAsGuest,
    createEventTransaction
};