'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Create a new shortlink
 */
const createShortlink = async (shortlinkData, createdById, isManager = false) => {
  const { slug, targetUrl, eventId } = shortlinkData;

  // Validate slug format (alphanumeric, hyphens, underscores)
  if (!slug || !/^[a-zA-Z0-9-_]+$/.test(slug)) {
    throw new Error('Slug must contain only letters, numbers, hyphens, and underscores');
  }

  // Validate target URL
  if (!targetUrl) {
    throw new Error('Target URL is required');
  }

  try {
    new URL(targetUrl);
  } catch (error) {
    throw new Error('Invalid target URL format');
  }

  // Check if slug already exists
  const existingShortlink = await prisma.shortlink.findUnique({
    where: { slug },
    include: {
      event: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  });

  if (existingShortlink) {
    const eventInfo = existingShortlink.event 
      ? ` (used by event: ${existingShortlink.event.name})`
      : '';
    throw new Error(`Shortlink with this slug already exists${eventInfo}`);
  }

  // Validate event exists if eventId is provided
  let eventIdInt = null;
  if (eventId) {
    eventIdInt = parseInt(eventId);
    if (isNaN(eventIdInt)) {
      throw new Error('Invalid event ID');
    }
    
    const event = await prisma.event.findUnique({
      where: { id: eventIdInt },
      include: {
        organizers: true
      }
    });
    
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if user has permission to create shortlinks for this event
    if (!isManager) {
      const isOrganizer = event.organizers.some(org => org.id === createdById);
      if (!isOrganizer) {
        throw new Error('Insufficient permissions to create shortlinks for this event');
      }
    }
  }

  // Create the shortlink
  const shortlink = await prisma.shortlink.create({
    data: {
      slug,
      targetUrl,
      createdById,
      eventId: eventIdInt,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          utorid: true,
          name: true,
        }
      },
      event: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  });

  return shortlink;
};

/**
 * Update an existing shortlink
 */
const updateShortlink = async (id, shortlinkData, userId) => {
  const { slug, targetUrl, eventId } = shortlinkData;

  // Check if shortlink exists
  const existingShortlink = await prisma.shortlink.findUnique({
    where: { id },
    include: {
      createdBy: true,
      event: true
    }
  });

  if (!existingShortlink) {
    throw new Error('Shortlink not found');
  }

  // Validate slug format if provided
  if (slug && !/^[a-zA-Z0-9-_]+$/.test(slug)) {
    throw new Error('Slug must contain only letters, numbers, hyphens, and underscores');
  }

  // Validate target URL if provided
  if (targetUrl) {
    try {
      new URL(targetUrl);
    } catch (error) {
      throw new Error('Invalid target URL format');
    }
  }

  // Check if new slug conflicts with existing shortlinks (excluding current one)
  if (slug && slug !== existingShortlink.slug) {
    const conflictingShortlink = await prisma.shortlink.findUnique({
      where: { slug },
      include: {
        event: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (conflictingShortlink) {
      const eventInfo = conflictingShortlink.event 
        ? ` (used by event: ${conflictingShortlink.event.name})`
        : '';
      throw new Error(`Shortlink with this slug already exists${eventInfo}`);
    }
  }

  // Validate event exists if eventId is provided
  let eventIdInt = null;
  if (eventId) {
    eventIdInt = parseInt(eventId);
    if (isNaN(eventIdInt)) {
      throw new Error('Invalid event ID');
    }
    
    const event = await prisma.event.findUnique({
      where: { id: eventIdInt }
    });
    
    if (!event) {
      throw new Error('Event not found');
    }
  }

  // Update the shortlink
  const updateData = {};
  if (slug !== undefined) updateData.slug = slug;
  if (targetUrl !== undefined) updateData.targetUrl = targetUrl;
  if (eventId !== undefined) updateData.eventId = eventIdInt;

  const updatedShortlink = await prisma.shortlink.update({
    where: { id },
    data: updateData,
    include: {
      createdBy: {
        select: {
          id: true,
          utorid: true,
          name: true,
        }
      },
      event: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  });

  return updatedShortlink;
};

/**
 * Get all shortlinks with filtering and pagination
 */
const getShortlinks = async (filters = {}, isManager = false, userId = null) => {
  const {
    slug,
    eventId,
    createdBy,
    page = 1,
    limit = 10
  } = filters;

  const skip = (page - 1) * limit;

  const where = {};

  // Apply filters
  if (slug) {
    where.slug = {
      contains: slug,
      mode: 'insensitive'
    };
  }

  if (eventId) {
    const eventIdInt = parseInt(eventId);
    if (!isNaN(eventIdInt)) {
      where.eventId = eventIdInt;
    }
  }

  if (createdBy) {
    where.createdBy = {
      OR: [
        { utorid: { contains: createdBy, mode: 'insensitive' } },
        { name: { contains: createdBy, mode: 'insensitive' } }
      ]
    };
  }

  // If not manager, only show shortlinks created by the user or associated with events they organize
  if (!isManager && userId) {
    where.OR = [
      { createdById: userId },
      {
        event: {
          organizers: {
            some: { id: userId }
          }
        }
      }
    ];
  }

  const [shortlinks, total] = await Promise.all([
    prisma.shortlink.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            utorid: true,
            name: true,
          }
        },
        event: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    }),
    prisma.shortlink.count({ where })
  ]);

  return {
    shortlinks,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

/**
 * Get a single shortlink by ID
 */
const getShortlink = async (id) => {
  const shortlink = await prisma.shortlink.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          utorid: true,
          name: true,
        }
      },
      event: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  });

  if (!shortlink) {
    throw new Error('Shortlink not found');
  }

  return shortlink;
};

/**
 * Get a shortlink by slug for redirection
 */
const getShortlinkBySlug = async (slug) => {
  const shortlink = await prisma.shortlink.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      targetUrl: true,
    }
  });

  if (!shortlink) {
    throw new Error('Shortlink not found');
  }

  return shortlink;
};

/**
 * Get shortlink by slug without permission checks (used for uniqueness check endpoint)
 * @param {string} slug
 * @returns {Promise<Object|null>}
 */
const getShortlinkBySlugSafe = async (slug, options = {}) => {
  return prisma.shortlink.findUnique({ where: { slug }, ...options });
};

/**
 * Delete a shortlink
 */
const deleteShortlink = async (id, userId, isManager = false) => {
  const shortlink = await prisma.shortlink.findUnique({
    where: { id },
    include: {
      event: {
        include: {
          organizers: true
        }
      }
    }
  });

  if (!shortlink) {
    throw new Error('Shortlink not found');
  }

  // Check permissions: manager can delete any, organizer can delete event shortlinks, creator can delete their own
  const canDelete = isManager || 
    shortlink.createdById === userId ||
    (shortlink.event && shortlink.event.organizers.some(org => org.id === userId));

  if (!canDelete) {
    throw new Error('Insufficient permissions to delete this shortlink');
  }

  await prisma.shortlink.delete({
    where: { id }
  });

  return { message: 'Shortlink deleted successfully' };
};

/**
 * Get shortlinks for a specific event
 */
const getEventShortlinks = async (eventId, userId, isManager = false) => {
  const eventIdInt = parseInt(eventId);
  if (isNaN(eventIdInt)) {
    throw new Error('Invalid event ID');
  }

  // Check if user has permission to view event shortlinks
  if (!isManager) {
    const event = await prisma.event.findUnique({
      where: { id: eventIdInt },
      include: {
        organizers: true
      }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    const isOrganizer = event.organizers.some(org => org.id === userId);
    if (!isOrganizer) {
      throw new Error('Insufficient permissions to view event shortlinks');
    }
  }

  const shortlinks = await prisma.shortlink.findMany({
    where: { eventId: eventIdInt },
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: {
        select: {
          id: true,
          utorid: true,
          name: true,
        }
      },
      event: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  });

  return shortlinks;
};

module.exports = {
  createShortlink,
  updateShortlink,
  getShortlinks,
  getShortlink,
  getShortlinkBySlug,
  deleteShortlink,
  getEventShortlinks,
  getShortlinkBySlugSafe,
}; 