'use strict';

require('dotenv').config();

// Test environment fallback secret (only for testing)
const TEST_JWT_SECRET = "test_jwt_secret_for_testing_only_minimum_32_chars_abcdefghijklmnopqrstuvwxyz";

// JWT secret from environment variable
let JWT_SECRET = process.env.JWT_SECRET;

// In test environment, use fallback if no JWT_SECRET is provided
if (process.env.NODE_ENV === 'test' && !JWT_SECRET) {
    JWT_SECRET = TEST_JWT_SECRET;
    console.warn('WARNING: Using test JWT secret. This should only happen in test environment.');
}

// Validate that JWT_SECRET is configured (for non-test environments)
if (!JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET environment variable is not configured');
    console.error('Please set JWT_SECRET in your environment variables or .env file');
    console.error('For production: Generate a secure secret using:');
    console.error('node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    process.exit(1);
}

// Validate JWT_SECRET length for security (except in test environment with fallback)
if (JWT_SECRET.length < 32) {
    console.error('FATAL ERROR: JWT_SECRET must be at least 32 characters long for security');
    console.error('Generate a secure secret using:');
    console.error('node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    process.exit(1);
}

// Warn if using test secret in non-test environment
if (JWT_SECRET === TEST_JWT_SECRET && process.env.NODE_ENV !== 'test') {
    console.error('FATAL ERROR: Test JWT secret detected in non-test environment!');
    console.error('This is a security risk. Please set a proper JWT_SECRET environment variable.');
    process.exit(1);
}

module.exports = { JWT_SECRET };