const nodemailer = require('nodemailer');

/**
 * Email Service for PointPulse Authentication
 * 
 * This module provides email functionality for the PointPulse application.
 * It supports multiple email service providers and includes templates for
 * various email types.
 * 
 * Supported providers:
 * - Gmail SMTP (development/testing)
 * - SendGrid (production recommended)
 * - Mailgun (alternative)
 * - Amazon SES (enterprise)
 */

// Email service configuration
const EMAIL_CONFIG = {
  service: process.env.EMAIL_SERVICE || 'gmail', // 'gmail', 'sendgrid', 'mailgun', 'ses'
  from: process.env.EMAIL_FROM || '"PointPulse" <spammail04042025@gmail.com>',
  
  // Gmail configuration
  gmail: {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'spammail04042025@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'mnbb yiwj fntq ftqt',
    }
  },
  
  // SendGrid configuration
  sendgrid: {
    service: 'SendGrid',
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY,
    }
  },
  
  // Mailgun configuration
  mailgun: {
    host: 'smtp.mailgun.org',
    port: 587,
    auth: {
      user: process.env.MAILGUN_USERNAME,
      pass: process.env.MAILGUN_PASSWORD,
    }
  },
  
  // Amazon SES configuration
  ses: {
    host: process.env.SES_HOST || 'email-smtp.us-east-1.amazonaws.com',
    port: 587,
    auth: {
      user: process.env.SES_ACCESS_KEY,
      pass: process.env.SES_SECRET_KEY,
    }
  }
};

// Create transporter based on configuration
const createTransporter = () => {
  const serviceType = EMAIL_CONFIG.service.toLowerCase();
  
  switch (serviceType) {
    case 'sendgrid':
      return nodemailer.createTransport(EMAIL_CONFIG.sendgrid);
    case 'mailgun':
      return nodemailer.createTransport(EMAIL_CONFIG.mailgun);
    case 'ses':
      return nodemailer.createTransport(EMAIL_CONFIG.ses);
    case 'gmail':
    default:
      return nodemailer.createTransport(EMAIL_CONFIG.gmail);
  }
};

const transporter = createTransporter();

/**
 * Send login verification email with OTP
 */
const sendLoginEmail = async (to, otp, userName) => {
  console.log('sendLoginEmail called with:', { to, otp, userName });
  
  // Ensure otp is a string
  const otpString = String(otp || '000000');
  console.log('OTP as string:', otpString);
  
  const mailOptions = {
    from: EMAIL_CONFIG.from,
    to,
    subject: `Your PointPulse Login Code: ${otpString}`,
    text: `
PointPulse - University of Toronto

Hi ${userName || 'User'},

Someone requested to log into your PointPulse account. Use the verification code below to complete your login:

VERIFICATION CODE: ${otpString}

⚠️ Important: This code will expire in 15 minutes for security reasons.

If you didn't request this login, please ignore this email. Your account remains secure.

This is an automated message from PointPulse. Please do not reply to this email.
© 2024 PointPulse - University of Toronto
    `,
    html: `
      <html>
        <body>
          <h1>PointPulse</h1>
          <p>University of Toronto</p>
          
          <h2>Hi ${userName || 'User'},</h2>
          
          <p>Someone requested to log into your PointPulse account. Use the verification code below to complete your login:</p>
          
          <div style="background-color: #3498db; color: white; padding: 20px; text-align: center; margin: 20px 0;">
            <h3>VERIFICATION CODE</h3>
            <h1>${otpString}</h1>
          </div>
          
          <p><strong>Important:</strong> This code will expire in 15 minutes for security reasons.</p>
          
          <p>If you didn't request this login, please ignore this email. Your account remains secure.</p>
          
          <hr>
          
          <p><small>This is an automated message from PointPulse. Please do not reply to this email.</small></p>
          <p><small>© 2024 PointPulse - University of Toronto</small></p>
        </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Login email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending login email:', error);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send account activation email
 */
const sendActivationEmail = async (to, activationUrl, userName, activationToken, utorid) => {
  const mailOptions = {
    from: EMAIL_CONFIG.from,
    to,
    subject: 'Activate Your PointPulse Account',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3498db; margin: 0; font-size: 28px; font-weight: 700;">PointPulse</h1>
            <p style="color: #6c757d; margin: 5px 0 0 0; font-size: 14px;">University of Toronto</p>
          </div>
          
          <h2 style="color: #2c3e50; margin-bottom: 20px; font-size: 22px;">Welcome ${userName}!</h2>
          
          <p style="color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            You've been added to PointPulse. Please click the button below to activate your account:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${activationUrl}" style="background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Activate Account
            </a>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="color: #495057; margin: 0 0 10px 0; font-size: 14px;"><strong>Your UTORid:</strong> ${utorid}</p>
            <p style="color: #495057; margin: 0 0 10px 0; font-size: 14px;"><strong>Activation Token:</strong> ${activationToken}</p>
          </div>
          
          <p style="color: #856404; font-size: 14px; background-color: #fff3cd; padding: 10px; border-radius: 4px; border-left: 4px solid #ffc107;">
            <strong>⚠️ This link will expire in 7 days.</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
          
          <div style="text-align: center;">
            <p style="color: #6c757d; font-size: 12px; margin: 0;">
              This is an automated message from PointPulse. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Activation email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending activation email:', error);
    throw new Error('Failed to send activation email');
  }
};

/**
 * Send password reset email
 */
const sendResetEmail = async (to, resetUrl, userName, activationToken, utorid) => {
  const mailOptions = {
    from: EMAIL_CONFIG.from,
    to,
    subject: 'Reset Your PointPulse Password',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3498db; margin: 0; font-size: 28px; font-weight: 700;">PointPulse</h1>
            <p style="color: #6c757d; margin: 5px 0 0 0; font-size: 14px;">University of Toronto</p>
          </div>
          
          <h2 style="color: #2c3e50; margin-bottom: 20px; font-size: 22px;">Hi ${userName},</h2>
          
          <p style="color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Someone requested to reset your PointPulse account password. Click the button below to reset your password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="color: #495057; margin: 0; font-size: 14px;"><strong>Reset Token:</strong> ${activationToken}</p>
          </div>
          
          <p style="color: #856404; font-size: 14px; background-color: #fff3cd; padding: 10px; border-radius: 4px; border-left: 4px solid #ffc107;">
            <strong>⚠️ This link will expire in 7 days.</strong>
          </p>
          
          <p style="color: #6c757d; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
            If you didn't request this password reset, please ignore this email. Your account remains secure.
          </p>
          
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
          
          <div style="text-align: center;">
            <p style="color: #6c757d; font-size: 12px; margin: 0;">
              This is an automated message from PointPulse. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Reset email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending reset email:', error);
    throw new Error('Failed to send reset email');
  }
};

module.exports = {
  sendActivationEmail,
  sendResetEmail,
  sendLoginEmail,
};
