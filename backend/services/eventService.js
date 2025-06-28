'use strict';

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

/**
 * Helper function to delete old event background image
 */
const deleteOldBackgroundImage = (backgroundUrl) => {
    if (!backgroundUrl) return;
    
    // Only delete files that are stored locally (start with /uploads/events/)
    if (backgroundUrl.startsWith('/uploads/events/')) {
        const filePath = path.join(__dirname, '..', backgroundUrl);
        
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('Old background image deleted:', filePath);
            }
        } catch (error) {
            console.log('Warning: Failed to delete old background image:', error.message);
        }
    }
};

/**
 * Create a new event
 */
const createEvent = async (eventData) => {
    console.log('\n===== EVENT SERVICE: CREATE EVENT =====');
    console.log('Event data:', JSON.stringify(eventData, null, 2));
    
    const { name, description, location, startTime, endTime, capacity, points, creatorId, backgroundUrl } = eventData;

    // Validate inputs
    if (!name || name.trim() === '') {
        console.log('Validation failed: Event name is required');
        throw new Error('Event name is required');
    }

    if (!description || description.trim() === '') {
        console.log('Validation failed: Event description is required');
        throw new Error('Event description is required');
    }

    if (!location || location.trim() === '') {
        console.log('Validation failed: Event location is required');
        throw new Error('Event location is required');
    }

    if (!startTime || !endTime) {
        console.log('Validation failed: Start and end times are required');
        throw new Error('Start and end times are required');
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    console.log('Parsed dates - startDate:', startDate, 'endDate:', endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.log('Validation failed: Invalid date format for start or end time');
        throw new Error('Invalid date format for start or end time');
    }

    // NEW VALIDATION: Ensure start and end times are not in the past
    const now = new Date();
    if (startDate < now) {
        console.log('Validation failed: Start time cannot be in the past');
        throw new Error('Start time cannot be in the past');
    }
    if (endDate < now) {
        console.log('Validation failed: End time cannot be in the past');
        throw new Error('End time cannot be in the past');
    }

    if (startDate >= endDate) {
        console.log('Validation failed: End time must be after start time');
        throw new Error('End time must be after start time');
    }

    if (capacity !== null && (isNaN(capacity) || capacity <= 0)) {
        console.log('Validation failed: Capacity must be a positive number or null');
        throw new Error('Capacity must be a positive number or null');
    }

    if (!points || isNaN(points) || points <= 0) {
        console.log('Validation failed: Points must be a positive number');
        throw new Error('Points must be a positive number');
    }

    if (!creatorId) {
        console.log('Validation failed: Creator ID is required');
        throw new Error('Creator ID is required');
    }

    // 验证创建者是否存在
    console.log('Verifying creator exists with ID:', creatorId);
    const creator = await prisma.user.findUnique({
        where: { id: creatorId }
    });
    
    if (!creator) {
        console.log('Validation failed: Creator not found');
        throw new Error('Creator not found');
    }
    console.log('Creator found:', creator.name);

    try {
        console.log('Creating event and adding creator as organizer');
        // Create the event
        const event = await prisma.event.create({
            data: {
                name,
                description,
                location,
                startTime: startDate,
                endTime: endDate,
                capacity: capacity === null ? null : parseInt(capacity),
                pointsRemain: parseInt(points),
                pointsAwarded: 0,
                published: false,
                backgroundUrl: backgroundUrl || null,
                organizers: {
                    connect: [{ id: creatorId }]
                }
            },
            include: {
                organizers: true
            }
        });
        
        console.log('Event created successfully:', JSON.stringify({
            id: event.id,
            name: event.name,
            organizers: event.organizers.map(org => org.id)
        }, null, 2));
        
        // 确认创建者已被添加为组织者
        const isCreatorOrganizer = event.organizers.some(org => org.id === creatorId);
        console.log('Is creator added as organizer:', isCreatorOrganizer);
        
        if (!isCreatorOrganizer) {
            console.log('Warning: Creator was not automatically added as organizer. Adding manually...');
            await prisma.event.update({
                where: { id: event.id },
                data: {
                    organizers: {
                        connect: [{ id: creatorId }]
                    }
                }
            });
            console.log('Creator manually added as organizer');
        }

        // 获取完整的事件信息，包括组织者
        const completeEvent = await prisma.event.findUnique({
            where: { id: event.id },
            include: {
                organizers: true,
                guests: true
            }
        });
        
        console.log('Complete event data:', JSON.stringify({
            id: completeEvent.id,
            name: completeEvent.name,
            organizerCount: completeEvent.organizers.length,
            guestCount: completeEvent.guests.length
        }, null, 2));
        
        console.log('===== EVENT SERVICE: CREATE EVENT COMPLETED =====\n');
        
        return {
            id: event.id,
            name: event.name,
            description: event.description,
            location: event.location,
            startTime: event.startTime.toISOString(),
            endTime: event.endTime.toISOString(),
            capacity: event.capacity,
            pointsRemain: event.pointsRemain,
            pointsAwarded: event.pointsAwarded,
            published: event.published,
            backgroundUrl: event.backgroundUrl,
            organizers: event.organizers.map(org => ({ id: org.id })),
            guests: []
        };
    } catch (error) {
        console.log('Error creating event:', error.message);
        console.log('Error stack:', error.stack);
        console.log('===== EVENT SERVICE: CREATE EVENT FAILED =====\n');
        throw error;
    }
};

/**
 * Get events with filtering
 */
const getEvents = async (filters = {}, isManager = false, page = 1, limit = 10, includeOrganizedEvents = false) => {
    try {
        const { name, location, started, ended, showFull, published, userId, organizing, attending } = filters;
        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);

        if (isNaN(parsedPage) || parsedPage < 1) {
            throw new Error('Page must be a positive integer');
        }

        if (isNaN(parsedLimit) || parsedLimit < 1) {
            throw new Error('Limit must be a positive integer');
        }

        if (started === 'true' && ended === 'true') {
            throw new Error('Cannot specify both started and ended');
        }

        // Build where clause
        let where = {};

        // Handle organizing and attending filters FIRST if present
        if (organizing === 'true' && userId) {
            where.organizers = {
                some: {
                    id: parseInt(userId)
                }
            };
            // Organizer can see unpublished events they organize
            where.published = undefined; // Override default published filter
        } else if (attending === 'true' && userId) {
            where.guests = {
                some: {
                    id: parseInt(userId)
                }
            };
            // Guests can only see published events
            where.published = true;
        } else {
            // Default: Handle published filter based on user role and request params
            if (!isManager) {
                // Regular users normally only see published events
                where.published = true;
                
                // BUT, if includeOrganizedEvents is true, also show unpublished events they organize
                if (includeOrganizedEvents && userId) {
                    where = {
                        OR: [
                            { published: true },
                            {
                                published: false,
                                organizers: {
                                    some: {
                                        id: parseInt(userId)
                                    }
                                }
                            }
                        ]
                    };
                }
            } else if (published !== undefined) {
                // Managers can filter by published status explicitly
                where.published = published === 'true';
            }
        }

        // Apply other filters on top
        if (name) {
            where = {
                ...where,
                name: {
                    contains: name
                }
            };
        }

        if (location) {
            where = {
                ...where,
                location: {
                    contains: location
                }
            };
        }

        const now = new Date();

        if (started === 'true') {
            // Events that have started
            where = {
                ...where,
                startTime: {
                    lte: now
                }
            };
        } else if (started === 'false') {
            // Events that have not started
            where = {
                ...where,
                startTime: {
                    gt: now
                }
            };
        }

        if (ended === 'true') {
            // Events that have ended
            where = {
                ...where,
                endTime: {
                    lte: now
                }
            };
        } else if (ended === 'false') {
            // Events that have not ended
            where = {
                ...where,
                endTime: {
                    gt: now
                }
            };
        }

        // Get all events matching the criteria
        const allEvents = await prisma.event.findMany({
            where,
            include: {
                guests: {
                    select: {
                        id: true
                    }
                },
                organizers: {
                    select: {
                        id: true
                    }
                },
                attendances: {
                    select: {
                        userId: true,
                        checkedInAt: true
                    }
                }
            },
            orderBy: {
                startTime: 'asc'
            }
        });

        // Filter out full events if not explicitly requested to show them
        let filteredEvents = allEvents;
        if (showFull !== 'true') {
            filteredEvents = allEvents.filter(event =>
                event.capacity === null || event.guests.length < event.capacity
            );
        }

        // Calculate pagination
        const count = filteredEvents.length;
        const startIndex = (parsedPage - 1) * parsedLimit;
        const endIndex = startIndex + parsedLimit;
        const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

        // Format events for response, including isAttending and isOrganizer flags
        const results = paginatedEvents.map(event => {
            // Create a map of user IDs to check-in status
            const attendedMap = userId ? new Map(
                event.attendances
                    .filter(a => a.userId === parseInt(userId))
                    .map(a => [a.userId, a.checkedInAt])
            ) : new Map();

            const isUserAttending = userId ? event.guests.some(guest => guest.id === parseInt(userId)) : false;
            const isUserCheckedIn = userId ? attendedMap.has(parseInt(userId)) : false;

            const formattedEvent = {
                id: event.id,
                name: event.name,
                description: event.description,
                location: event.location,
                startTime: event.startTime.toISOString(),
                endTime: event.endTime.toISOString(),
                capacity: event.capacity,
                numGuests: event.guests.length,
                published: event.published,
                backgroundUrl: event.backgroundUrl,
                isOrganizer: userId ? event.organizers.some(org => org.id === parseInt(userId)) : false,
                isAttending: isUserAttending,
                checkedIn: isUserCheckedIn
            };

            // Add manager-specific fields
            if (isManager) {
                formattedEvent.pointsRemain = event.pointsRemain;
                formattedEvent.pointsAwarded = event.pointsAwarded;
            }

            return formattedEvent;
        });

        return { count, results };
    } catch (error) {
        console.error('Error in getEvents service:', error);
        throw error;
    }
};

/**
 * Get a single event
 */
const getEvent = async (eventId, userId = null, isManager = false, isOrganizer = false, includeAsOrganizer = false) => {
    const event = await prisma.event.findUnique({
        where: { id: parseInt(eventId) },
        include: {
            organizers: {
                select: {
                    id: true,
                    utorid: true,
                    name: true
                }
            },
            guests: isManager || isOrganizer ? {
                select: {
                    id: true,
                    utorid: true,
                    name: true,
                    avatarUrl: true
                }
            } : {
                select: {
                    id: true
                }
            },
            attendances: {
                select: {
                    userId: true,
                    checkedInAt: true
                }
            }
        }
    });

    if (!event) {
        throw new Error('Event not found');
    }

    // If not a manager, and not an organizer, and not specifically requesting as an organizer,
    // only allow viewing published events
    if (!isManager && !isOrganizer && !includeAsOrganizer && !event.published) {
        throw new Error('Event not found');
    }

    // Format event for response
    const formattedEvent = {
        id: event.id,
        name: event.name,
        description: event.description,
        location: event.location,
        startTime: event.startTime.toISOString(),
        endTime: event.endTime.toISOString(),
        capacity: event.capacity,
        backgroundUrl: event.backgroundUrl,
        organizers: event.organizers,
        published: event.published, // 添加published状态
        isOrganizer: isOrganizer,
        isAttending: userId ? event.guests.some(g => g.id === parseInt(userId)) : false
    };

    // Add different fields based on user role
    if (isManager || isOrganizer) {
        formattedEvent.pointsRemain = event.pointsRemain;
        formattedEvent.pointsAwarded = event.pointsAwarded;
        const attendedMap = new Map();
        event.attendances.forEach(a => attendedMap.set(a.userId, a.checkedInAt));
        formattedEvent.guests = event.guests.map(g => ({
            ...g,
            checkedIn: attendedMap.has(g.id),
            checkedInAt: attendedMap.get(g.id) || null
        }));
    } else {
        formattedEvent.numGuests = event.guests.length;
    }

    return formattedEvent;
};

/**
 * Update an event
 */
const updateEvent = async (eventId, updateData, isManager = false) => {
    console.log('\n===== EVENT SERVICE: UPDATE EVENT =====');
    console.log('Event ID:', eventId);
    console.log('Update data:', JSON.stringify(updateData, null, 2));
    console.log('Is manager:', isManager);

    const {
        name,
        description,
        location,
        startTime,
        endTime,
        capacity,
        points,
        published,
        backgroundUrl
    } = updateData;

    // Get the current event
    console.log('Fetching current event data');
    const event = await prisma.event.findUnique({
        where: { id: parseInt(eventId) },
        include: {
            guests: {
                select: {
                    id: true
                }
            }
        }
    });

    if (!event) {
        console.log('Event not found');
        console.log('===== EVENT SERVICE: UPDATE EVENT FAILED =====\n');
        throw new Error('Event not found');
    }

    console.log('Current event data:', JSON.stringify({
        id: event.id,
        name: event.name,
        startTime: event.startTime,
        endTime: event.endTime,
        capacity: event.capacity,
        pointsRemain: event.pointsRemain,
        pointsAwarded: event.pointsAwarded,
        published: event.published,
        guestCount: event.guests.length
    }, null, 2));

    const now = new Date();
    console.log('Current time:', now);

    // Validate updates based on current event status
    if (event.startTime <= now) {
        // Event has already started, restrict some updates
        console.log('Event has already started, checking restricted updates');
        if (name !== undefined || description !== undefined || location !== undefined ||
            startTime !== undefined || capacity !== undefined) {
            console.log('Attempting to update restricted fields after event has started');
            console.log('===== EVENT SERVICE: UPDATE EVENT FAILED =====\n');
            throw new Error('Cannot update name, description, location, startTime, or capacity after event has started');
        }
    }

    if (event.endTime <= now) {
        // Event has already ended, restrict endTime update
        console.log('Event has already ended, checking endTime update');
        if (endTime !== undefined) {
            console.log('Attempting to update endTime after event has ended');
            console.log('===== EVENT SERVICE: UPDATE EVENT FAILED =====\n');
            throw new Error('Cannot update endTime after event has ended');
        }
    }

    // Prepare update data
    const updateObj = {};
    console.log('Preparing update object');

    if (name !== undefined) {
        console.log('Validating name:', name);
        if (name !== null && (name === '' || name.trim() === '')) {
            console.log('Event name cannot be empty');
            console.log('===== EVENT SERVICE: UPDATE EVENT FAILED =====\n');
            throw new Error('Event name cannot be empty');
        }
        if (name !== null) {
            updateObj.name = name;
            console.log('Name validated and added to update object');
        } else {
            console.log('Name is null, skipping this field in update');
        }
    }

    if (description !== undefined) {
        console.log('Validating description');
        if (description !== null && (description === '' || description.trim() === '')) {
            console.log('Event description cannot be empty');
            console.log('===== EVENT SERVICE: UPDATE EVENT FAILED =====\n');
            throw new Error('Event description cannot be empty');
        }
        if (description !== null) {
            updateObj.description = description;
            console.log('Description validated and added to update object');
        } else {
            console.log('Description is null, skipping this field in update');
        }
    }

    if (location !== undefined) {
        console.log('Validating location:', location);
        if (location !== null && (location === '' || location.trim() === '')) {
            console.log('Event location cannot be empty');
            console.log('===== EVENT SERVICE: UPDATE EVENT FAILED =====\n');
            throw new Error('Event location cannot be empty');
        }
        if (location !== null) {
            updateObj.location = location;
            console.log('Location validated and added to update object');
        } else {
            console.log('Location is null, skipping this field in update');
        }
    }

    if (startTime !== undefined) {
        console.log('Validating startTime:', startTime);
        if (startTime === null) {
            console.log('StartTime is null, skipping date validation');
            updateObj.startTime = null;
        } else {
            const startDate = new Date(startTime);

            if (isNaN(startDate.getTime())) {
                console.log('Invalid date format for start time');
                console.log('===== EVENT SERVICE: UPDATE EVENT FAILED =====\n');
                throw new Error('Invalid date format for start time');
            }

            // 检查开始时间是否早于当前时间
            if (startDate < now) {
                console.log('Start time cannot be in the past. Current time:', now, 'Start time:', startDate);
                console.log('===== EVENT SERVICE: UPDATE EVENT FAILED =====\n');
                throw new Error('Start time cannot be in the past');
            }

            updateObj.startTime = startDate;
            console.log('StartTime validated and added to update object:', startDate);
        }
    }

    if (endTime !== undefined) {
        console.log('Validating endTime:', endTime);
        if (endTime === null) {
            console.log('EndTime is null, skipping date validation');
            updateObj.endTime = null;
        } else {
            const endDate = new Date(endTime);

            if (isNaN(endDate.getTime())) {
                console.log('Invalid date format for end time');
                console.log('===== EVENT SERVICE: UPDATE EVENT FAILED =====\n');
                throw new Error('Invalid date format for end time');
            }

            // 检查结束时间是否早于当前时间
            if (endDate < now) {
                console.log('End time cannot be in the past. Current time:', now, 'End time:', endDate);
                console.log('===== EVENT SERVICE: UPDATE EVENT FAILED =====\n');
                throw new Error('End time cannot be in the past');
            }

            // 只有当startTime和endTime都不为null时才进行比较
            if (startTime !== undefined && startTime !== null) {
                const effectiveStartTime = new Date(startTime);
                console.log('Effective start time for comparison:', effectiveStartTime);

                if (endDate <= effectiveStartTime) {
                    console.log('End time must be after start time');
                    console.log('===== EVENT SERVICE: UPDATE EVENT FAILED =====\n');
                    throw new Error('End time must be after start time');
                }
            } else if (event.startTime && endDate <= event.startTime) {
                // 只有当event.startTime不为null时才进行比较
                console.log('End time must be after current start time');
                console.log('===== EVENT SERVICE: UPDATE EVENT FAILED =====\n');
                throw new Error('End time must be after start time');
            }

            updateObj.endTime = endDate;
            console.log('EndTime validated and added to update object:', endDate);
        }
    }

    if (capacity !== undefined) {
        console.log('Validating capacity:', capacity);
        if (capacity !== null && (isNaN(capacity) || capacity <= 0)) {
            console.log('Capacity must be a positive number or null');
            console.log('===== EVENT SERVICE: UPDATE EVENT FAILED =====\n');
            throw new Error('Capacity must be a positive number or null');
        }

        // Check if new capacity is less than current guests count
        console.log('Current guest count:', event.guests.length);
        if (capacity !== null && capacity < event.guests.length) {
            console.log('New capacity cannot be less than the current number of guests');
            console.log('===== EVENT SERVICE: UPDATE EVENT FAILED =====\n');
            throw new Error('New capacity cannot be less than the current number of guests');
        }

        updateObj.capacity = capacity === null ? null : parseInt(capacity);
        console.log('Capacity validated and added to update object:', updateObj.capacity);
    }

    if (backgroundUrl !== undefined) {
        console.log('Validating backgroundUrl:', backgroundUrl);
        
        // Delete old background image if we're uploading a new one or clearing the background
        if (event.backgroundUrl && (backgroundUrl !== event.backgroundUrl)) {
            console.log('Deleting old background image:', event.backgroundUrl);
            deleteOldBackgroundImage(event.backgroundUrl);
        }
        
        updateObj.backgroundUrl = backgroundUrl || null;
        console.log('BackgroundUrl added to update object:', updateObj.backgroundUrl);
    }

    // Manager-only updates
    if (isManager) {
        if (points !== undefined) {
            console.log('Validating points (manager only):', points);
            // 只有当points不为null时才进行数值验证
            if (points !== null) {
                if (isNaN(points) || parseInt(points) < 0) {
                    console.log('Points cannot be negative');
                    console.log('===== EVENT SERVICE: UPDATE EVENT FAILED =====\n');
                    throw new Error('Points cannot be negative');
                }

                const pointsValue = parseInt(points);
                console.log('Points already awarded:', event.pointsAwarded);
                if (pointsValue < event.pointsAwarded) {
                    console.log('Points cannot be less than already awarded points');
                    console.log('===== EVENT SERVICE: UPDATE EVENT FAILED =====\n');
                    throw new Error('Points cannot be less than already awarded points');
                }

                updateObj.pointsRemain = pointsValue - event.pointsAwarded;
                console.log('Points validated and added to update object. New pointsRemain:', updateObj.pointsRemain);
            } else {
                console.log('Points is null, setting pointsRemain to null');
                updateObj.pointsRemain = null;
            }
        }

        if (published !== undefined) {
            console.log('Setting published status (manager only):', published);
            updateObj.published = published === true;
            console.log('Published status added to update object:', updateObj.published);
        }
    }

    console.log('Final update object:', JSON.stringify(updateObj, null, 2));
    
    if (Object.keys(updateObj).length === 0) {
        console.log('No valid fields to update');
        console.log('===== EVENT SERVICE: UPDATE EVENT FAILED =====\n');
        throw new Error('No valid fields to update');
    }

    try {
        console.log('Updating event in database');
        // Update the event
        const updatedEvent = await prisma.event.update({
            where: { id: parseInt(eventId) },
            data: updateObj
        });

        console.log('Event updated successfully:', JSON.stringify({
            id: updatedEvent.id,
            name: updatedEvent.name,
            location: updatedEvent.location
        }, null, 2));

        // Return only the updated fields (plus id, name, location)
        const result = {
            id: updatedEvent.id,
            name: updatedEvent.name,
            location: updatedEvent.location
        };

        // 只返回实际更新的字段（即在updateObj中存在的字段）
        if ('description' in updateObj) result.description = updatedEvent.description;
        if ('startTime' in updateObj) {
            result.startTime = updatedEvent.startTime ? updatedEvent.startTime.toISOString() : null;
        }
        if ('endTime' in updateObj) {
            result.endTime = updatedEvent.endTime ? updatedEvent.endTime.toISOString() : null;
        }
        if ('capacity' in updateObj) result.capacity = updatedEvent.capacity;
        if ('pointsRemain' in updateObj) result.pointsRemain = updatedEvent.pointsRemain;
        if ('published' in updateObj) result.published = updatedEvent.published;
        if ('backgroundUrl' in updateObj) result.backgroundUrl = updatedEvent.backgroundUrl;

        console.log('Returning updated fields:', JSON.stringify(result, null, 2));
        console.log('===== EVENT SERVICE: UPDATE EVENT COMPLETED =====\n');
        return result;
    } catch (error) {
        console.log('Error updating event in database:', error.message);
        console.log('Error stack:', error.stack);
        console.log('===== EVENT SERVICE: UPDATE EVENT FAILED =====\n');
        throw error;
    }
};

/**
 * Delete an event
 */
const deleteEvent = async (eventId) => {
    console.log('\n===== EVENT SERVICE: DELETE EVENT =====');
    console.log('Event ID:', eventId);
    
    // 查找事件
    console.log('Fetching event data');
    const event = await prisma.event.findUnique({
        where: { id: parseInt(eventId) }
    });

    if (!event) {
        console.log('Event not found');
        console.log('===== EVENT SERVICE: DELETE EVENT FAILED =====\n');
        throw new Error('Event not found');
    }
    
    console.log('Event found:', JSON.stringify({
        id: event.id,
        name: event.name,
        published: event.published
    }, null, 2));

    // 检查事件是否已发布
    if (event.published) {
        console.log('Event is published, cannot delete');
        console.log('===== EVENT SERVICE: DELETE EVENT FAILED =====\n');
        throw new Error('Cannot delete a published event');
    }

    try {
        console.log('Deleting event from database');
        
        // Delete background image if it exists
        if (event.backgroundUrl) {
            console.log('Deleting background image:', event.backgroundUrl);
            deleteOldBackgroundImage(event.backgroundUrl);
        }
        
        await prisma.event.delete({
            where: { id: parseInt(eventId) }
        });
        
        console.log('Event deleted successfully');
        console.log('===== EVENT SERVICE: DELETE EVENT COMPLETED =====\n');
        return { success: true };
    } catch (error) {
        console.log('Error deleting event:', error.message);
        console.log('Error stack:', error.stack);
        console.log('===== EVENT SERVICE: DELETE EVENT FAILED =====\n');
        throw error;
    }
};

/**
 * Add an organizer to an event
 */
const addOrganizer = async (eventId, utorid) => {
    // 先检查用户是否存在
    const user = await prisma.user.findUnique({
        where: { utorid },
        select: {
            id: true,
            utorid: true,
            name: true
        }
    });

    if (!user) {
        throw new Error('User not found');
    }

    const event = await prisma.event.findUnique({
        where: { id: parseInt(eventId) },
        include: {
            guests: {
                where: {
                    id: user.id
                }
            },
            organizers: {
                where: {
                    id: user.id
                }
            }
        }
    });

    if (!event) {
        throw new Error('Event not found');
    }

    if (event.endTime <= new Date()) {
        throw new Error('Event has ended');
    }

    // 检查用户是否已经是组织者
    if (event.organizers.length > 0) {
        throw new Error('User is already an organizer');
    }

    // 检查用户是否已经是嘉宾
    if (event.guests.length > 0) {
        throw new Error('User is already a guest');
    }

    // 添加组织者
    await prisma.event.update({
        where: { id: parseInt(eventId) },
        data: {
            organizers: {
                connect: {
                    id: user.id
                }
            }
        }
    });

    // 获取更新后的组织者列表
    const updatedEvent = await prisma.event.findUnique({
        where: { id: parseInt(eventId) },
        include: {
            organizers: {
                select: {
                    id: true,
                    utorid: true,
                    name: true
                }
            }
        }
    });

    return {
        id: updatedEvent.id,
        name: updatedEvent.name,
        location: updatedEvent.location,
        organizers: updatedEvent.organizers
    };
};

/**
 * Remove an organizer from an event
 */
const removeOrganizer = async (eventId, userId) => {
    const event = await prisma.event.findUnique({
        where: { id: parseInt(eventId) },
        include: {
            organizers: {
                where: {
                    id: parseInt(userId)
                }
            }
        }
    });

    if (!event) {
        throw new Error('Event not found');
    }

    if (event.organizers.length === 0) {
        throw new Error('User is not an organizer for this event');
    }

    // Remove the organizer
    await prisma.event.update({
        where: { id: parseInt(eventId) },
        data: {
            organizers: {
                disconnect: {
                    id: parseInt(userId)
                }
            }
        }
    });

    return { success: true };
};

/**
 * Add a guest to an event
 */
const addGuest = async (eventId, utorid, isManager = false, isOrganizer = false) => {
    try {
        // 先查找用户
        const user = await prisma.user.findUnique({
            where: { utorid },
            select: {
                id: true,
                utorid: true,
                name: true
            }
        });

        if (!user) {
            throw new Error('User not found');
        }

        const event = await prisma.event.findUnique({
            where: {
                id: parseInt(eventId)
            },
            include: {
                guests: true,
                organizers: {
                    where: {
                        id: user.id
                    }
                }
            }
        });

        if (!event) {
            throw new Error('Event not found');
        }

        // If not a manager or organizer, check if event is published
        if (!isManager && !isOrganizer && !event.published) {
            throw new Error('Event not found');
        }

        if (event.endTime <= new Date()) {
            throw new Error('Event has already ended');
        }

        // Check if event is full
        if (event.capacity !== null && event.guests.length >= event.capacity) {
            throw new Error('Event is full');
        }

        // Check if user is already an organizer
        if (event.organizers.length > 0) {
            throw new Error('User is already an organizer');
        }

        // Check if user is already a guest
        const isGuest = event.guests.some(g => g.id === user.id);

        if (isGuest) {
            throw new Error('User is already a guest');
        }

        // Add the guest
        await prisma.event.update({
            where: { id: parseInt(eventId) },
            data: {
                guests: {
                    connect: {
                        id: user.id
                    }
                }
            }
        });

        return {
            id: event.id,
            name: event.name,
            location: event.location,
            guestAdded: {
                id: user.id,
                utorid: user.utorid,
                name: user.name
            },
            numGuests: event.guests.length + 1
        };
    } catch (error) {
        console.error('Error in addGuest service:', error);
        throw error;
    }
};

/**
 * Add current user as a guest
 */
const addCurrentUserAsGuest = async (eventId, userId) => {
    console.log('\n===== EVENT SERVICE: ADD CURRENT USER AS GUEST =====');
    console.log('Event ID:', eventId);
    console.log('User ID:', userId);
    
    // 查找用户
    console.log('Finding user with ID:', userId);
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            utorid: true,
            name: true
        }
    });

    if (!user) {
        console.log('User not found');
        console.log('===== EVENT SERVICE: ADD CURRENT USER AS GUEST FAILED =====\n');
        throw new Error('User not found');
    }
    console.log('User found:', JSON.stringify({
        id: user.id,
        utorid: user.utorid,
        name: user.name
    }, null, 2));

    // First check if the user is an organizer
    console.log('Checking if user is an organizer for event:', eventId);
    const event = await prisma.event.findUnique({
        where: {
            id: parseInt(eventId)
        },
        include: {
            organizers: {
                where: {
                    id: userId
                }
            }
        }
    });

    if (!event) {
        console.log('Event not found');
        console.log('===== EVENT SERVICE: ADD CURRENT USER AS GUEST FAILED =====\n');
        throw new Error('Event not found');
    }
    console.log('Event found:', JSON.stringify({
        id: event.id,
        name: event.name,
        startTime: event.startTime,
        endTime: event.endTime,
        published: event.published
    }, null, 2));

    if (event.organizers.length > 0) {
        console.log('User is already registered as an organizer');
        console.log('===== EVENT SERVICE: ADD CURRENT USER AS GUEST FAILED =====\n');
        throw new Error('User is already registered as an organizer');
    }
    console.log('User is not an organizer for this event');

    // 检查事件是否已结束
    const now = new Date();
    console.log('Current time:', now);
    console.log('Event end time:', event.endTime);
    console.log('Has event ended?', event.endTime <= now);
    
    if (event.endTime <= now) {
        console.log('Event has already ended');
        console.log('===== EVENT SERVICE: ADD CURRENT USER AS GUEST FAILED =====\n');
        throw new Error('Event has already ended');
    }
    console.log('Event has not ended');

    // 移除对事件是否已开始的检查，允许用户加入尚未开始的活动
    console.log('Event start time:', event.startTime);
    console.log('Has event started?', event.startTime <= now);
    console.log('Allowing registration regardless of start time');

    console.log('Calling addGuest function with eventId:', eventId, 'utorid:', user.utorid);
    try {
        const result = await addGuest(eventId, user.utorid, false, false);
        console.log('User successfully added as guest:', JSON.stringify(result, null, 2));
        console.log('===== EVENT SERVICE: ADD CURRENT USER AS GUEST COMPLETED =====\n');
        return result;
    } catch (error) {
        console.log('Error adding user as guest:', error.message);
        console.log('Error stack:', error.stack);
        console.log('===== EVENT SERVICE: ADD CURRENT USER AS GUEST FAILED =====\n');
        throw error;
    }
};

/**
 * Remove a guest from an event
 */
const removeGuest = async (eventId, userId) => {
    const event = await prisma.event.findUnique({
        where: { id: parseInt(eventId) },
        include: {
            guests: {
                where: {
                    id: parseInt(userId)
                }
            }
        }
    });

    if (!event) {
        throw new Error('Event not found');
    }

    if (event.guests.length === 0) {
        throw new Error('User is not a guest for this event');
    }

    if (event.endTime <= new Date()) {
        throw new Error('Event has already ended');
    }

    // Remove the guest
    await prisma.event.update({
        where: { id: parseInt(eventId) },
        data: {
            guests: {
                disconnect: {
                    id: parseInt(userId)
                }
            }
        }
    });

    return { success: true };
};

/**
 * Remove current user as a guest
 */
const removeCurrentUserAsGuest = async (eventId, userId) => {
    console.log('\n===== EVENT SERVICE: REMOVE CURRENT USER AS GUEST =====');
    console.log('Event ID:', eventId);
    console.log('User ID:', userId);
    
    // 查找事件和用户关系
    console.log('Finding event and checking if user is a guest');
    const event = await prisma.event.findUnique({
        where: {
            id: parseInt(eventId)
        },
        include: {
            guests: {
                where: { id: userId }
            }
        }
    });

    if (!event) {
        console.log('Event not found');
        console.log('===== EVENT SERVICE: REMOVE CURRENT USER AS GUEST FAILED =====\n');
        throw new Error('Event not found');
    }
    console.log('Event found:', JSON.stringify({
        id: event.id,
        name: event.name,
        startTime: event.startTime,
        endTime: event.endTime
    }, null, 2));

    // Check if user is a guest
    console.log('Guest count for this user:', event.guests.length);
    if (event.guests.length === 0) {
        console.log('User is not a guest for this event');
        console.log('===== EVENT SERVICE: REMOVE CURRENT USER AS GUEST FAILED =====\n');
        throw new Error('User is not a guest for this event');
    }
    console.log('User is confirmed as a guest');

    // 检查事件是否已结束
    const now = new Date();
    console.log('Current time:', now);
    console.log('Event end time:', event.endTime);
    console.log('Has event ended?', event.endTime <= now);
    
    if (event.endTime <= now) {
        console.log('Event has already ended');
        console.log('===== EVENT SERVICE: REMOVE CURRENT USER AS GUEST FAILED =====\n');
        throw new Error('Event has already ended');
    }
    console.log('Event has not ended');

    // Remove the guest
    console.log('Removing user from event guests');
    try {
        await prisma.event.update({
            where: { id: parseInt(eventId) },
            data: {
                guests: {
                    disconnect: {
                        id: userId
                    }
                }
            }
        });
        
        console.log('User successfully removed as guest');
        console.log('===== EVENT SERVICE: REMOVE CURRENT USER AS GUEST COMPLETED =====\n');
        return { success: true };
    } catch (error) {
        console.log('Error removing user as guest:', error.message);
        console.log('Error stack:', error.stack);
        console.log('===== EVENT SERVICE: REMOVE CURRENT USER AS GUEST FAILED =====\n');
        throw error;
    }
};

/**
 * Create an event transaction (award points)
 */
const createEventTransaction = async (eventId, data, creatorId) => {
    const { type, utorid, amount } = data;

    if (type !== 'event') {
        throw new Error('Transaction type must be "event"');
    }

    if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error('Amount must be a positive number');
    }

    // Find the event
    const event = await prisma.event.findUnique({
        where: { id: parseInt(eventId) },
        include: {
            guests: true,
            organizers: true
        }
    });

    if (!event) {
        throw new Error('Event not found');
    }

    // Check if creator is an organizer or a manager/superuser
    const creator = await prisma.user.findUnique({
        where: { id: creatorId },
        select: {
            id: true,
            utorid: true,
            role: true
        }
    });

    if (!creator) {
        throw new Error('Creator not found');
    }

    const isEventOrganizer = event.organizers.some(org => org.id === creatorId);
    const isManagerOrHigher = ['manager', 'superuser'].includes(creator.role);

    if (!isEventOrganizer && !isManagerOrHigher) {
        throw new Error('Not authorized to create event transactions');
    }

    // Check if there are enough points remaining
    if (amount > event.pointsRemain) {
        throw new Error('Not enough points remaining for this event');
    }

    // If a specific user is specified, award points to that user
    if (utorid) {
        // Find the user
        const user = await prisma.user.findUnique({
            where: { utorid },
            select: {
                id: true,
                utorid: true
            }
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Check if user is a guest
        const isGuest = event.guests.some(g => g.id === user.id);

        if (!isGuest) {
            throw new Error('User is not a guest for this event');
        }

        // Create the transaction
        return prisma.$transaction(async (tx) => {
            // Create the transaction
            const transaction = await tx.transaction.create({
                data: {
                    type,
                    amount,
                    remark: data.remark || '',
                    userId: user.id,
                    createdBy: creatorId,
                    eventId: parseInt(eventId),
                    relatedId: parseInt(eventId)
                }
            });

            // Update the event's remaining points
            await tx.event.update({
                where: {id: parseInt(eventId)},
                data: {
                    pointsRemain: {
                        decrement: amount
                    },
                    pointsAwarded: {
                        increment: amount
                    }
                }
            });

            // Update the user's points
            await tx.user.update({
                where: {id: user.id},
                data: {
                    points: {
                        increment: amount
                    }
                }
            });

            return {
                id: transaction.id,
                recipient: user.utorid,
                awarded: amount,
                type: transaction.type,
                relatedId: eventId,
                remark: transaction.remark,
                createdBy: creator.utorid
            };
        });
    } else {
        // Award points to all guests
        const guests = event.guests;

        if (guests.length === 0) {
            throw new Error('No guests to award points to');
        }

        // Calculate total points needed
        const totalPointsNeeded = amount * guests.length;

        if (totalPointsNeeded > event.pointsRemain) {
            throw new Error('Not enough points remaining to award to all guests');
        }

        // Create transactions for all guests
        return prisma.$transaction(async (tx) => {
            // Create a transaction for each guest
            const transactions = [];
            for (const guest of guests) {
                const transaction = await tx.transaction.create({
                    data: {
                        type,
                        amount,
                        remark: data.remark || '',
                        userId: guest.id,
                        createdBy: creatorId,
                        eventId: parseInt(eventId),
                        relatedId: parseInt(eventId)
                    }
                });
                transactions.push(transaction);

                // Update the user's points
                await tx.user.update({
                    where: {id: guest.id},
                    data: {
                        points: {
                            increment: amount
                        }
                    }
                });
            }

            // Update the event's remaining points
            await tx.event.update({
                where: {id: parseInt(eventId)},
                data: {
                    pointsRemain: {
                        decrement: totalPointsNeeded
                    },
                    pointsAwarded: {
                        increment: totalPointsNeeded
                    }
                }
            });

            return transactions.map(transaction => ({
                id: transaction.id,
                recipient: guests.find(g => g.id === transaction.userId)?.utorid,
                awarded: amount,
                type: transaction.type,
                relatedId: eventId,
                remark: transaction.remark,
                createdBy: creator.utorid
            }));
        });
    }
};

/**
 * Remove all guests from an event
 */
const removeAllGuests = async (eventId) => {
    const event = await prisma.event.findUnique({
        where: { id: parseInt(eventId) },
        include: {
            guests: true
        }
    });

    if (!event) {
        throw new Error('Event not found');
    }

    if (event.endTime <= new Date()) {
        throw new Error('Event has already ended');
    }

    // Remove all guests
    await prisma.event.update({
        where: { id: parseInt(eventId) },
        data: {
            guests: {
                set: [] // This removes all connections
            }
        }
    });

    return { success: true };
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
    removeAllGuests,
    addCurrentUserAsGuest,
    removeCurrentUserAsGuest,
    createEventTransaction
};