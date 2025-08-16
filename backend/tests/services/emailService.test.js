// Mock nodemailer before importing the service
const mockSendMail = jest.fn();
const mockTransporter = {
    sendMail: mockSendMail
};

jest.mock('nodemailer', () => ({
    createTransport: jest.fn(() => mockTransporter)
}));

const nodemailer = require('nodemailer');
const emailService = require('../../services/emailService');

describe('emailService', () => {
    describe('Module Initialization', () => {
        test('should create nodemailer transporter with correct configuration', () => {
            // The mock was called when the module was imported
            expect(nodemailer.createTransport).toHaveBeenCalled();
        });

        test('should export all email functions', () => {
            expect(emailService).toBeDefined();
            expect(typeof emailService.sendActivationEmail).toBe('function');
            expect(typeof emailService.sendResetEmail).toBe('function');
            expect(typeof emailService.sendLoginCodeEmail).toBe('function');
        });
    });

    describe('sendActivationEmail', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        const testParams = {
            to: 'test@mail.utoronto.ca',
            activationUrl: 'https://pointpulse.com/activate?token=abc123',
            userName: 'Test User',
            activationToken: 'abc123',
            utorid: 'testuser'
        };

        test('should send activation email with correct parameters', async () => {
            mockSendMail.mockImplementation((options, callback) => {
                callback(null, { response: 'Email sent successfully' });
            });

            await emailService.sendActivationEmail(
                testParams.to,
                testParams.activationUrl,
                testParams.userName,
                testParams.activationToken,
                testParams.utorid
            );

            expect(mockSendMail).toHaveBeenCalledTimes(1);
            const callArgs = mockSendMail.mock.calls[0][0];
            
            expect(callArgs.from).toBe('"PointPulse" <spammail04042025@gmail.com>');
            expect(callArgs.to).toBe(testParams.to);
            expect(callArgs.subject).toBe('Activate your PointPulse account');
            expect(callArgs.html).toContain(testParams.userName);
            expect(callArgs.html).toContain(testParams.activationUrl);
            expect(callArgs.html).toContain(testParams.utorid);
        });

        test('should include activation URL in email content', async () => {
            mockSendMail.mockImplementation((options, callback) => {
                callback(null, { response: 'Email sent successfully' });
            });

            await emailService.sendActivationEmail(
                testParams.to,
                testParams.activationUrl,
                testParams.userName,
                testParams.activationToken,
                testParams.utorid
            );

            const callArgs = mockSendMail.mock.calls[0][0];
            expect(callArgs.html).toContain('href="' + testParams.activationUrl + '"');
            expect(callArgs.html).toContain(testParams.activationUrl);
        });

        test('should include user information in email template', async () => {
            mockSendMail.mockImplementation((options, callback) => {
                callback(null, { response: 'Email sent successfully' });
            });

            await emailService.sendActivationEmail(
                testParams.to,
                testParams.activationUrl,
                testParams.userName,
                testParams.activationToken,
                testParams.utorid
            );

            const callArgs = mockSendMail.mock.calls[0][0];
            expect(callArgs.html).toContain(`Hello ${testParams.userName}`);
            expect(callArgs.html).toContain(testParams.utorid);
            expect(callArgs.html).toContain(testParams.to);
        });

        test('should handle email sending success', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            
            mockSendMail.mockImplementation((options, callback) => {
                callback(null, { response: 'Email sent successfully' });
            });

            await emailService.sendActivationEmail(
                testParams.to,
                testParams.activationUrl,
                testParams.userName,
                testParams.activationToken,
                testParams.utorid
            );

            expect(consoleSpy).toHaveBeenCalledWith('Email sent:', 'Email sent successfully');
            consoleSpy.mockRestore();
        });

        test('should handle email sending error', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const testError = new Error('SMTP connection failed');
            
            mockSendMail.mockImplementation((options, callback) => {
                callback(testError, null);
            });

            await emailService.sendActivationEmail(
                testParams.to,
                testParams.activationUrl,
                testParams.userName,
                testParams.activationToken,
                testParams.utorid
            );

            expect(consoleSpy).toHaveBeenCalledWith('Error:', testError);
            consoleSpy.mockRestore();
        });

        test('should include current year in footer', async () => {
            mockSendMail.mockImplementation((options, callback) => {
                callback(null, { response: 'Email sent successfully' });
            });

            await emailService.sendActivationEmail(
                testParams.to,
                testParams.activationUrl,
                testParams.userName,
                testParams.activationToken,
                testParams.utorid
            );

            const callArgs = mockSendMail.mock.calls[0][0];
            const currentYear = new Date().getFullYear();
            expect(callArgs.html).toContain(`© ${currentYear} PointPulse`);
        });
    });

    describe('sendResetEmail', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        
        const testParams = {
            to: 'test@mail.utoronto.ca',
            reseturl: 'https://pointpulse.com/reset?token=xyz789',
            userName: 'Test User',
            activationToken: 'xyz789',
            utorid: 'testuser'
        };

        test('should send reset email with correct parameters', async () => {
            mockSendMail.mockImplementation((options, callback) => {
                callback(null, { response: 'Email sent successfully' });
            });

            await emailService.sendResetEmail(
                testParams.to,
                testParams.reseturl,
                testParams.userName,
                testParams.activationToken,
                testParams.utorid
            );

            expect(mockSendMail).toHaveBeenCalledTimes(1);
            const callArgs = mockSendMail.mock.calls[0][0];
            
            expect(callArgs.from).toBe('"PointPulse" <spammail04042025@gmail.com>');
            expect(callArgs.to).toBe(testParams.to);
            expect(callArgs.subject).toBe('Reset your PointPulse password');
            expect(callArgs.html).toContain(testParams.userName);
            expect(callArgs.html).toContain(testParams.reseturl);
        });

        test('should include reset URL and token in email content', async () => {
            mockSendMail.mockImplementation((options, callback) => {
                callback(null, { response: 'Email sent successfully' });
            });

            await emailService.sendResetEmail(
                testParams.to,
                testParams.reseturl,
                testParams.userName,
                testParams.activationToken,
                testParams.utorid
            );

            const callArgs = mockSendMail.mock.calls[0][0];
            expect(callArgs.html).toContain('href="' + testParams.reseturl + '"');
            expect(callArgs.html).toContain(testParams.reseturl);
            expect(callArgs.html).toContain(testParams.activationToken);
        });

        test('should handle reset email sending success', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            
            mockSendMail.mockImplementation((options, callback) => {
                callback(null, { response: 'Reset email sent successfully' });
            });

            await emailService.sendResetEmail(
                testParams.to,
                testParams.reseturl,
                testParams.userName,
                testParams.activationToken,
                testParams.utorid
            );

            expect(consoleSpy).toHaveBeenCalledWith('Email sent:', 'Reset email sent successfully');
            consoleSpy.mockRestore();
        });

        test('should handle reset email sending error', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const testError = new Error('Network error');
            
            mockSendMail.mockImplementation((options, callback) => {
                callback(testError, null);
            });

            await emailService.sendResetEmail(
                testParams.to,
                testParams.reseturl,
                testParams.userName,
                testParams.activationToken,
                testParams.utorid
            );

            expect(consoleSpy).toHaveBeenCalledWith('Error:', testError);
            consoleSpy.mockRestore();
        });

        test('should include security notice in reset email', async () => {
            mockSendMail.mockImplementation((options, callback) => {
                callback(null, { response: 'Email sent successfully' });
            });

            await emailService.sendResetEmail(
                testParams.to,
                testParams.reseturl,
                testParams.userName,
                testParams.activationToken,
                testParams.utorid
            );

            const callArgs = mockSendMail.mock.calls[0][0];
            expect(callArgs.html).toContain('Security notice');
            expect(callArgs.html).toContain('didn\'t request a password reset');
        });
    });

    describe('sendLoginCodeEmail', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        
        const testParams = {
            to: 'test@mail.utoronto.ca',
            userName: 'Test User',
            otpCode: '123456'
        };

        test('should send login code email with correct parameters', async () => {
            mockSendMail.mockImplementation((options, callback) => {
                callback(null, { response: 'Email sent successfully' });
            });

            await emailService.sendLoginCodeEmail(
                testParams.to,
                testParams.userName,
                testParams.otpCode
            );

            expect(mockSendMail).toHaveBeenCalledTimes(1);
            const callArgs = mockSendMail.mock.calls[0][0];
            
            expect(callArgs.from).toBe('"PointPulse" <spammail04042025@gmail.com>');
            expect(callArgs.to).toBe(testParams.to);
            expect(callArgs.subject).toBe('Your PointPulse verification code');
            expect(callArgs.html).toContain(testParams.userName);
            expect(callArgs.html).toContain(testParams.otpCode);
        });

        test('should include OTP code prominently in email', async () => {
            mockSendMail.mockImplementation((options, callback) => {
                callback(null, { response: 'Email sent successfully' });
            });

            await emailService.sendLoginCodeEmail(
                testParams.to,
                testParams.userName,
                testParams.otpCode
            );

            const callArgs = mockSendMail.mock.calls[0][0];
            expect(callArgs.html).toContain(testParams.otpCode);
            expect(callArgs.html).toContain('font-size: 32px'); // Large font for OTP
        });

        test('should handle login code email sending success', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            
            mockSendMail.mockImplementation((options, callback) => {
                callback(null, { response: 'Login code email sent successfully' });
            });

            await emailService.sendLoginCodeEmail(
                testParams.to,
                testParams.userName,
                testParams.otpCode
            );

            expect(consoleSpy).toHaveBeenCalledWith('Login code email sent:', 'Login code email sent successfully');
            consoleSpy.mockRestore();
        });

        test('should handle login code email sending error', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const testError = new Error('Authentication failed');
            
            mockSendMail.mockImplementation((options, callback) => {
                callback(testError, null);
            });

            await emailService.sendLoginCodeEmail(
                testParams.to,
                testParams.userName,
                testParams.otpCode
            );

            expect(consoleSpy).toHaveBeenCalledWith('Error sending login code email:', testError);
            consoleSpy.mockRestore();
        });

        test('should include security warning for OTP code', async () => {
            mockSendMail.mockImplementation((options, callback) => {
                callback(null, { response: 'Email sent successfully' });
            });

            await emailService.sendLoginCodeEmail(
                testParams.to,
                testParams.userName,
                testParams.otpCode
            );

            const callArgs = mockSendMail.mock.calls[0][0];
            expect(callArgs.html).toContain('Never share this verification code');
            expect(callArgs.html).toContain('10 minutes');
        });
    });

    describe('Email Template Common Elements', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        
        test('all emails should include PointPulse branding', async () => {
            mockSendMail.mockImplementation((options, callback) => {
                callback(null, { response: 'Email sent successfully' });
            });

            // Test activation email
            await emailService.sendActivationEmail('test@example.com', 'url', 'User', 'token', 'utorid');
            expect(mockSendMail.mock.calls[0][0].html).toContain('PointPulse');

            // Test reset email
            await emailService.sendResetEmail('test@example.com', 'url', 'User', 'token', 'utorid');
            expect(mockSendMail.mock.calls[1][0].html).toContain('PointPulse');

            // Test login code email
            await emailService.sendLoginCodeEmail('test@example.com', 'User', '123456');
            expect(mockSendMail.mock.calls[2][0].html).toContain('PointPulse');
        });

        test('all emails should include University of Toronto branding', async () => {
            mockSendMail.mockImplementation((options, callback) => {
                callback(null, { response: 'Email sent successfully' });
            });

            // Test activation email
            await emailService.sendActivationEmail('test@example.com', 'url', 'User', 'token', 'utorid');
            expect(mockSendMail.mock.calls[0][0].html).toContain('University of Toronto');

            // Test reset email
            await emailService.sendResetEmail('test@example.com', 'url', 'User', 'token', 'utorid');
            expect(mockSendMail.mock.calls[1][0].html).toContain('University of Toronto');

            // Test login code email
            await emailService.sendLoginCodeEmail('test@example.com', 'User', '123456');
            expect(mockSendMail.mock.calls[2][0].html).toContain('University of Toronto');
        });

        test('all emails should have proper HTML structure', async () => {
            mockSendMail.mockImplementation((options, callback) => {
                callback(null, { response: 'Email sent successfully' });
            });

            const emails = [
                () => emailService.sendActivationEmail('test@example.com', 'url', 'User', 'token', 'utorid'),
                () => emailService.sendResetEmail('test@example.com', 'url', 'User', 'token', 'utorid'),
                () => emailService.sendLoginCodeEmail('test@example.com', 'User', '123456')
            ];

            for (let i = 0; i < emails.length; i++) {
                await emails[i]();
                const html = mockSendMail.mock.calls[i][0].html;
                expect(html).toContain('<!DOCTYPE html>');
                expect(html).toContain('<html lang="en">');
                expect(html).toContain('<head>');
                expect(html).toContain('<body style=');
                expect(html).toContain('</html>');
            }
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        
        test('should handle transporter sendMail callback errors gracefully', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            
            // Test different types of errors
            const errors = [
                new Error('Network timeout'),
                new Error('Authentication failed'),
                new Error('Invalid email address')
            ];

            for (const error of errors) {
                mockSendMail.mockImplementation((options, callback) => {
                    callback(error, null);
                });

                await emailService.sendActivationEmail('test@example.com', 'url', 'User', 'token', 'utorid');
                expect(consoleSpy).toHaveBeenCalledWith('Error:', error);
            }

            consoleSpy.mockRestore();
        });

        test('should handle successful email sending responses', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            
            const responses = [
                { response: '250 OK' },
                { response: 'Message sent successfully' },
                { messageId: '<test@gmail.com>', response: '250 2.0.0 OK' }
            ];

            for (const response of responses) {
                mockSendMail.mockImplementation((options, callback) => {
                    callback(null, response);
                });

                await emailService.sendLoginCodeEmail('test@example.com', 'User', '123456');
                expect(consoleSpy).toHaveBeenCalledWith('Login code email sent:', response.response);
            }

            consoleSpy.mockRestore();
        });
    });
});
