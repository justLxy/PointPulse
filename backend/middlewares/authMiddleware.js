'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Check if a user has the required role or higher
 */
const checkRole = (auth, requiredRole) => {
    if (!auth) return false;

    const roleHierarchy = {
        'regular': 1,
        'cashier': 2,
        'manager': 3,
        'superuser': 4
    };

    // 转换为小写进行比较，确保不区分大小写
    const userRole = auth.role ? auth.role.toLowerCase() : '';
    const requiredRoleLower = requiredRole.toLowerCase();

    const userRoleLevel = roleHierarchy[userRole] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRoleLower] || 0;

    return userRoleLevel >= requiredRoleLevel;
};

/**
 * Middleware to require a specific role
 */
const requireRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.auth) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!checkRole(req.auth, requiredRole)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
};

/**
 * Check if user is an organizer for this event
 */
const isEventOrganizer = async (req, res, next) => {
    if (!req.auth) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const { prisma } = req;
    const userId = req.auth.id;
    const eventId = parseInt(req.params.eventId);

    if (isNaN(eventId)) {
        return res.status(400).json({ error: 'Invalid event ID' });
    }

    try {
        const event = await prisma.event.findFirst({
            where: {
                id: eventId,
                organizers: {
                    some: {
                        id: userId
                    }
                }
            }
        });

        req.isOrganizer = !!event;

        // If user is a manager or superuser, or is an organizer, allow the action
        if (checkRole(req.auth, 'manager') || req.isOrganizer) {
            return next();
        }

        // If the event route requires organizer and the user is not an organizer, deny access
        return res.status(403).json({ error: 'Unauthorized - you must be an organizer or manager for this event' });
    } catch (error) {
        console.error('Error checking organizer status:', error);
        next(error);
    }
};

/**
 * Check if user is verified
 */
const requireVerified = (req, res, next) => {
    if (!req.auth) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    // 实际检查用户是否已验证
    prisma.user.findUnique({
        where: { id: req.auth.id },
        select: { verified: true }
    }).then(user => {
        if (!user || !user.verified) {
            return res.status(403).json({ error: 'Account not verified' });
        }
        next();
    }).catch(error => {
        console.error('Error checking verification status:', error);
        next(error);
    });
};

module.exports = {
    checkRole,
    requireRole,
    requireVerified,
    isEventOrganizer
};