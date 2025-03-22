'use strict';

const authService = require('../services/authService');
const { validatePassword } = require('../utils/validators');

/**
 * Authenticate a user and generate a JWT token
 */
const login = async (req, res) => {
    try {
        const { utorid, password } = req.body;

        if (!utorid || !password) {
            return res.status(400).json({ error: 'UTORid and password are required' });
        }

        const { token, expiresAt } = await authService.authenticateUser(utorid, password);

        res.status(200).json({ token, expiresAt });
    } catch (error) {
        res.status(401).json({ error: 'Invalid credentials' });
    }
};

/**
 * Request a password reset token
 */
const requestReset = async (req, res) => {
    try {
        const { utorid } = req.body;

        if (!utorid) {
            return res.status(400).json({ error: 'UTORid is required' });
        }

        const ipAddress = req.ip;

        try {
            const result = await authService.requestPasswordReset(utorid, ipAddress);

            // Return the reset token and expiration (in a real app, this would be sent via email)
            return res.status(202).json(result);
        } catch (error) {
            if (error.message === 'Too many requests') {
                return res.status(429).json({ error: 'Too many requests. Please try again later.' });
            }
            if (error.message === 'User not found') {
                return res.status(404).json({ error: 'User not found' });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error in requestReset:', error);
        res.status(500).json({ error: 'Failed to request password reset' });
    }
};

/**
 * Reset a user's password using a reset token
 */
const resetPassword = async (req, res) => {
    try {
        const { resetToken } = req.params;
        const { utorid, password } = req.body;

        if (!utorid || !password) {
            return res.status(400).json({ error: 'UTORid and password are required' });
        }

        // Validate password
        if (!validatePassword(password)) {
            return res.status(400).json({
                error: 'Password must be 8-20 characters with at least one uppercase letter, one lowercase letter, one number, and one special character'
            });
        }

        // First check if the token exists
        const user = await authService.findUserByResetToken(resetToken);
        if (!user) {
            return res.status(404).json({ error: 'Invalid reset token' });
        }

        // Then check if the token has expired
        const isExpired = await authService.isResetTokenExpired(resetToken);
        if (isExpired) {
            return res.status(410).json({ error: 'Reset token has expired' });
        }

        // Now check if the token matches the utorid
        if (user.utorid !== utorid) {
            return res.status(401).json({ error: 'Token does not match utorid' });
        }

        // If we get here, we can reset the password
        await authService.resetPassword(resetToken, utorid, password);
        return res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
};

module.exports = {
    login,
    requestReset,
    resetPassword
};