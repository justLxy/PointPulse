'use strict';

const authService = require('../services/authService');
const { validatePassword } = require('../utils/validators');

/**
 * Authenticate a user and generate a JWT token
 */
const login = async (req, res) => {
    console.log('\n\n===== LOGIN REQUEST START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    
    try {
        console.log('===== LOGIN DEBUG =====');
        console.log('Request body UTORid:', req.body.utorid || 'Not provided');
        console.log('Password provided:', req.body.password ? 'Yes' : 'No');
        
        const { utorid, password } = req.body;

        if (!utorid || !password) {
            console.log('Missing credentials');
            console.log('===== LOGIN REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'UTORid and password are required' });
        }

        const { token, expiresAt } = await authService.authenticateUser(utorid, password);
        console.log('Login successful for UTORid:', utorid);
        console.log('Token generated, expires at:', expiresAt);
        console.log('===== LOGIN REQUEST END (200) =====\n\n');
        
        res.status(200).json({ token, expiresAt });
    } catch (error) {
        console.log('Authentication failed:', error.message);
        console.log('===== LOGIN REQUEST END (401) =====\n\n');
        res.status(401).json({ error: 'Invalid credentials' });
    }
};

/**
 * Request a password reset token
 */
const requestReset = async (req, res) => {
    console.log('\n\n===== PASSWORD RESET REQUEST START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('IP Address:', req.ip);
    
    try {
        console.log('===== PASSWORD RESET DEBUG =====');
        console.log('Request body UTORid:', req.body.utorid || 'Not provided');
        
        const { utorid } = req.body;

        if (!utorid) {
            console.log('Missing UTORid');
            console.log('===== PASSWORD RESET REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'UTORid is required' });
        }

        const ipAddress = req.ip;

        try {
            const result = await authService.requestPasswordReset(utorid, ipAddress);
            console.log('Password reset token generated for UTORid:', utorid);
            console.log('Token expires at:', result.expiresAt);
            console.log('===== PASSWORD RESET REQUEST END (202) =====\n\n');
            
            // Return the reset token and expiration (in a real app, this would be sent via email)
            return res.status(202).json(result);
        } catch (error) {
            if (error.message === 'Too many requests') {
                console.log('Too many reset requests from IP:', ipAddress);
                console.log('===== PASSWORD RESET REQUEST END (429) =====\n\n');
                return res.status(429).json({ error: 'Too many requests. Please try again later.' });
            }
            if (error.message === 'User not found') {
                console.log('User not found:', utorid);
                console.log('===== PASSWORD RESET REQUEST END (404) =====\n\n');
                return res.status(404).json({ error: 'User not found' });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error in requestReset:', error);
        console.log('===== PASSWORD RESET REQUEST END (500) =====\n\n');
        res.status(500).json({ error: 'Failed to request password reset' });
    }
};

/**
 * Reset a user's password using a reset token
 */
const resetPassword = async (req, res) => {
    console.log('\n\n===== PASSWORD RESET COMPLETION START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    
    try {
        console.log('===== PASSWORD RESET COMPLETION DEBUG =====');
        console.log('Reset token:', req.params.resetToken);
        console.log('Request body UTORid:', req.body.utorid || 'Not provided');
        console.log('Password provided:', req.body.password ? 'Yes' : 'No');
        
        const { resetToken } = req.params;
        const { utorid, password } = req.body;

        if (!utorid || !password) {
            console.log('Missing required fields');
            console.log('===== PASSWORD RESET COMPLETION END (400) =====\n\n');
            return res.status(400).json({ error: 'UTORid and password are required' });
        }

        // Validate password
        if (!validatePassword(password)) {
            console.log('Password validation failed');
            console.log('===== PASSWORD RESET COMPLETION END (400) =====\n\n');
            return res.status(400).json({
                error: 'Password must be 8-20 characters with at least one uppercase letter, one lowercase letter, one number, and one special character'
            });
        }

        // First check if the token exists
        const user = await authService.findUserByResetToken(resetToken);
        if (!user) {
            console.log('Invalid reset token');
            console.log('===== PASSWORD RESET COMPLETION END (404) =====\n\n');
            return res.status(404).json({ error: 'Invalid reset token' });
        }

        // Then check if the token has expired
        const isExpired = await authService.isResetTokenExpired(resetToken);
        if (isExpired) {
            console.log('Reset token expired');
            console.log('===== PASSWORD RESET COMPLETION END (410) =====\n\n');
            return res.status(410).json({ error: 'Reset token has expired' });
        }

        // Now check if the token matches the utorid
        if (user.utorid.toLowerCase() !== utorid.toLowerCase()) {
            console.log('Token does not match utorid');
            console.log('===== PASSWORD RESET COMPLETION END (401) =====\n\n');
            return res.status(401).json({ error: 'Token does not match utorid' });
        }

        // If we get here, we can reset the password
        await authService.resetPassword(resetToken, utorid, password);
        console.log('Password reset successful for UTORid:', utorid);
        console.log('===== PASSWORD RESET COMPLETION END (200) =====\n\n');
        return res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        console.log('===== PASSWORD RESET COMPLETION END (500) =====\n\n');
        res.status(500).json({ error: 'Failed to reset password' });
    }
};

// Email-based login request: send OTP
const requestEmailLogin = async (req, res) => {
    console.log('\n\n===== EMAIL LOGIN REQUEST START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        await authService.requestEmailLogin(email);

        console.log('OTP sent to email:', email);
        return res.status(202).json({ message: 'Check your U of T email to complete login!' });
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({ error: 'No account found for this email' });
        }
        console.error('Error in email login request:', error);
        return res.status(500).json({ error: 'Failed to process email login request' });
    }
};

// Email-based login verification: verify OTP, return JWT
const verifyEmailLogin = async (req, res) => {
    console.log('\n\n===== EMAIL LOGIN VERIFY START =====');
    console.log('Time:', new Date().toISOString());

    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ error: 'Email and code are required' });
        }

        try {
            const { token, expiresAt } = await authService.verifyEmailLogin(email, code);
            console.log('Email login verified for:', email);
            return res.status(200).json({ token, expiresAt });
        } catch (err) {
            if (err.message === 'Invalid or expired code' || err.message === 'Code expired') {
                return res.status(410).json({ error: 'Invalid or expired login code' });
            }
            throw err;
        }
    } catch (error) {
        console.error('Error in email login verify:', error);
        return res.status(500).json({ error: 'Failed to verify login code' });
    }
};

module.exports = {
    login,
    requestReset,
    resetPassword,
    requestEmailLogin,
    verifyEmailLogin,
};