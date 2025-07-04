const nodemailer = require('nodemailer');

/**
 * Email Service for PointPulse Account Activation and Password Reset
 * 
 * This module contains functions to send activation and password reset emails
 * for the PointPulse application. It utilizes `nodemailer` to send emails via
 * Gmail's SMTP service. The module supports two primary email functionalities:
 * 
 * **Important Notes**:
 * - Hardcoding sensitive information (e.g., Gmail credentials) is not recommended for production. 
 *   It's better to use environment variables for storing credentials securely.
 * - The email account being used here is a demo account. 
 * 
 * Dependencies:
 * - nodemailer: https://www.npmjs.com/package/nodemailer
 * - reference: https://mailtrap.io/blog/nodemailer-gmail/
 */

// Create a transporter object
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'spammail04042025@gmail.com',
      pass: 'mnbb yiwj fntq ftqt',
    }
  });

const sendActivationEmail = async (to, activationUrl, userName, activationToken, utorid) => {
  const mailOptions = {
    from: '"PointPulse" <spammail04042025@gmail.com>',
    to,
    subject: 'Activate Your PointPulse Account',
    html: `
      <p>Hi ${userName},</p>
      <p>You've been added to PointPulse. Please click the link below to activate your account:</p>
      <a href="${activationUrl}">${activationUrl}</a>
      <p>Your utorid is ${utorid}</p>
      <p>Your activation token is ${activationToken}</p>
      <p>This link will expire in 7 days.</p>
    `,
  };

  // Send the email
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
        console.log('Error:', error);
        } else {
        console.log('Email sent:', info.response);
        }
    });

//   await transporter.sendMail(mailOptions);
};

const sendResetEmail = async (to, reseturl, userName, activationToken, utorid) => {
    const mailOptions = {
      from: '"PointPulse" <spammail04042025@gmail.com>',
      to,
      subject: 'Reset Your PointPulse Account Password',
      html: `
        <p>Hi ${userName},</p>
        <p>Please click the link below to reset your password. Ignore this message if you did not send this request.</p>
        <a href="${reseturl}">${reseturl}</a>
        <p>Your activation token is ${activationToken}</p>
        <p>This link will expire in 7 days.</p>
      `,
    };
  
    // Send the email
      transporter.sendMail(mailOptions, function(error, info){
          if (error) {
          console.log('Error:', error);
          } else {
          console.log('Email sent:', info.response);
          }
      });
  
  //   await transporter.sendMail(mailOptions);
  };

const sendOTPEmail = async (to, otp, userName) => {
    const mailOptions = {
      from: '"PointPulse" <spammail04042025@gmail.com>',
      to,
      subject: 'Your PointPulse Login Verification Code',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2193b0; margin: 0;">PointPulse</h1>
          </div>
          
          <h2 style="color: #333; margin-bottom: 20px;">Login Verification Code</h2>
          
          <p>Hi ${userName},</p>
          
          <p>Please use the verification code below to log in to your PointPulse account:</p>
          
          <div style="background: #f8f9fa; border: 2px solid #2193b0; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <h1 style="color: #2193b0; font-size: 36px; margin: 0; letter-spacing: 8px; font-family: monospace;">${otp}</h1>
          </div>
          
          <p><strong>This code will expire in 10 minutes.</strong></p>
          
          <p>If you didn't request this code, please ignore this email. Your account remains secure.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #666; font-size: 14px;">
            This is an automated message from PointPulse. Please do not reply to this email.
          </p>
        </div>
      `,
    };
  
    // Send the email
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
        console.log('Error sending OTP email:', error);
        } else {
        console.log('OTP email sent:', info.response);
        }
    });
};

module.exports = {
  sendActivationEmail,
  sendResetEmail,
  sendOTPEmail,
};
