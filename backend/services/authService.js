'use strict';

const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { JWT_SECRET } = require('../utils/jwtConfig');

const prisma = new PrismaClient();

// Rate limiting for password reset
const resetAttempts = new Map();
// Map to track expired tokens
const expiredTokens = new Map();

/**
 * Generate JWT token for user
 */
const generateToken = (user) => {
    const expiresIn = '24h';
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const payload = {
        id: user.id,
        utorid: user.utorid,
        role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn });

    return { token, expiresAt };
};

/**
 * Authenticate user with utorid and password
 */
const authenticateUser = async (utorid, password) => {
    const user = await prisma.user.findUnique({
        where: { utorid }
    });

    if (!user || !user.password) {
        throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
    });

    // Generate and return token
    return generateToken(user);
};

/**
 * Request a password reset token
 */
const requestPasswordReset = async (utorid, ipAddress) => {
    // Find the user first
    const user = await prisma.user.findUnique({
        where: { utorid }
    });

    if (!user) {
        // Let the controller handle the 404 response
        throw new Error('User not found');
    }

    // Check rate limiting
    const key = `${ipAddress}`;
    const now = Date.now();
    const lastAttempt = resetAttempts.get(key) || 0;

    if (now - lastAttempt < 60000) { // 60 seconds
        throw new Error('Too many requests');
    }

    // Record this attempt
    resetAttempts.set(key, now);

    // Store old token in the expired tokens map if it exists
    if (user.resetToken) {
        expiredTokens.set(user.resetToken, {
            userId: user.id,
            utorid: user.utorid,
            expiresAt: new Date(0) // Set to expired
        });
    }

    // Generate a reset token
    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save the reset token to the user
    await prisma.user.update({
        where: { id: user.id },
        data: {
            resetToken,
            expiresAt
        }
    });

    return { resetToken, expiresAt };
};

/**
 * Reset a user's password using a reset token
 */
const resetPassword = async (resetToken, utorid, password) => {
    // Find the user with this reset token
    const user = await prisma.user.findFirst({
        where: {
            resetToken
        }
    });

    if (!user) {
        throw new Error('Invalid reset token');
    }

    // Check if the token matches the utorid
    if (user.utorid !== utorid) {
        throw new Error('Token does not match utorid');
    }

    // Check if the token has expired
    if (!user.expiresAt || new Date(user.expiresAt) < new Date()) {
        throw new Error('Reset token has expired');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password and clear the reset token
    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetToken: null,
            expiresAt: null
        }
    });

    // Remove from expired tokens if it was there
    expiredTokens.delete(resetToken);

    return { success: true };
};

/**
 * Find a user by reset token
 */
const findUserByResetToken = async (resetToken) => {
    // Check active tokens in the database
    const user = await prisma.user.findFirst({
        where: {
            resetToken
        }
    });

    // If not found in active tokens, check expired tokens
    if (!user && expiredTokens.has(resetToken)) {
        return expiredTokens.get(resetToken);
    }

    return user;
};

/**
 * Check if a reset token is expired
 */
const isResetTokenExpired = async (resetToken) => {
    // Check if token is in the expired tokens map
    if (expiredTokens.has(resetToken)) {
        return true;
    }

    const user = await prisma.user.findFirst({
        where: {
            resetToken
        }
    });

    if (!user) {
        return false; // Token not found, let controller return 404
    }

    return !user.expiresAt || new Date(user.expiresAt) < new Date();
};

module.exports = {
    generateToken,
    authenticateUser,
    requestPasswordReset,
    resetPassword,
    findUserByResetToken,
    isResetTokenExpired
};