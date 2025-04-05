'use strict';

const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { JWT_SECRET } = require('../utils/jwtConfig');
const emailService = require('./emailService');

const prisma = new PrismaClient();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Rate limiting for password reset
const resetAttempts = new Map();
// Map to track expired tokens
const expiredTokens = new Map();

/**
 * Generate JWT token for user
 */
const generateToken = (user) => {
    console.log('Generating token for user ID:', user.id);
    
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
    console.log('Authenticating user with UTORid:', utorid);
    
    const user = await prisma.user.findUnique({
        where: { utorid }
    });

    if (!user || !user.password) {
        console.log('Authentication failed: User not found or no password set');
        throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        console.log('Authentication failed: Invalid password for UTORid:', utorid);
        throw new Error('Invalid credentials');
    }

    console.log('Authentication successful for UTORid:', utorid);
    
    // Update last login
    await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
    });
    console.log('Updated last login timestamp for user ID:', user.id);

    // Generate and return token
    return generateToken(user);
};

/**
 * Request a password reset token
 */
const requestPasswordReset = async (utorid, ipAddress) => {
    console.log('Password reset requested for UTORid:', utorid, 'from IP:', ipAddress);
    
    // Find the user first
    const user = await prisma.user.findUnique({
        where: { utorid }
    });

    if (!user) {
        console.log('Password reset failed: User not found:', utorid);
        // Let the controller handle the 404 response
        throw new Error('User not found');
    }

    // Check rate limiting
    const key = `${ipAddress}`;
    const now = Date.now();
    const lastAttempt = resetAttempts.get(key) || 0;

    if (now - lastAttempt < 60000) { // 60 seconds
        console.log('Password reset rate limited for IP:', ipAddress);
        throw new Error('Too many requests');
    }

    // Record this attempt
    resetAttempts.set(key, now);
    console.log('Reset attempt recorded for IP:', ipAddress);

    // Store old token in the expired tokens map if it exists
    if (user.resetToken) {
        console.log('Expiring previous reset token for user ID:', user.id);
        expiredTokens.set(user.resetToken, {
            userId: user.id,
            utorid: user.utorid,
            expiresAt: new Date(0) // Set to expired
        });
    }

    // Generate a reset token
    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    console.log('Generated new reset token for user ID:', user.id, 'expires at:', expiresAt);

     // Send reset email
    const reseturl = `${FRONTEND_URL}/password-reset/`;
    await emailService.sendResetEmail(user.email, reseturl, user.name, resetToken, utorid);

    // Save the reset token to the user
    await prisma.user.update({
        where: { id: user.id },
        data: {
            resetToken,
            expiresAt
        }
    });
    console.log('Reset token saved to database for user ID:', user.id);

    return { resetToken, expiresAt };
};

/**
 * Reset a user's password using a reset token
 */
const resetPassword = async (resetToken, utorid, password) => {
    console.log('Resetting password for UTORid:', utorid, 'using token');
    
    // Find the user with this reset token
    const user = await prisma.user.findFirst({
        where: {
            resetToken
        }
    });

    if (!user) {
        console.log('Password reset failed: Invalid reset token');
        throw new Error('Invalid reset token');
    }

    // Check if the token matches the utorid
    if (user.utorid.toLowerCase() !== utorid.toLowerCase()) {
        console.log('Password reset failed: Token does not match UTORid');
        throw new Error('Token does not match utorid');
    }

    // Check if the token has expired
    if (!user.expiresAt || new Date(user.expiresAt) < new Date()) {
        console.log('Password reset failed: Token has expired');
        throw new Error('Reset token has expired');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('New password hashed for user ID:', user.id);

    // Update the user's password and clear the reset token
    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetToken: null,
            expiresAt: null
        }
    });
    console.log('Password updated and reset token cleared for user ID:', user.id);

    // Remove from expired tokens if it was there
    if (expiredTokens.has(resetToken)) {
        console.log('Removing token from expired tokens map');
        expiredTokens.delete(resetToken);
    }

    return { success: true };
};

/**
 * Find a user by reset token
 */
const findUserByResetToken = async (resetToken) => {
    console.log('Looking up user by reset token');
    
    // Check active tokens in the database
    const user = await prisma.user.findFirst({
        where: {
            resetToken
        }
    });

    if (user) {
        console.log('User found with active reset token, user ID:', user.id);
    } else {
        console.log('No user found with active reset token, checking expired tokens');
    }

    // If not found in active tokens, check expired tokens
    if (!user && expiredTokens.has(resetToken)) {
        console.log('Token found in expired tokens map');
        return expiredTokens.get(resetToken);
    }

    return user;
};

/**
 * Check if a reset token is expired
 */
const isResetTokenExpired = async (resetToken) => {
    console.log('Checking if reset token is expired');
    
    // Check if token is in the expired tokens map
    if (expiredTokens.has(resetToken)) {
        console.log('Token is in expired tokens map');
        return true;
    }

    const user = await prisma.user.findFirst({
        where: {
            resetToken
        }
    });

    if (!user) {
        console.log('No user found with this reset token');
        return false; // Token not found, let controller return 404
    }

    const isExpired = !user.expiresAt || new Date(user.expiresAt) < new Date();
    console.log('Token expiration check result:', isExpired ? 'Expired' : 'Valid', 'for user ID:', user.id);
    
    return isExpired;
};

module.exports = {
    generateToken,
    authenticateUser,
    requestPasswordReset,
    resetPassword,
    findUserByResetToken,
    isResetTokenExpired
};