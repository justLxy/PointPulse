const nodemailer = require('nodemailer');

/**
 * Email Service for PointPulse Account Activation and Password Reset
 * 
 * This module contains functions to send activation and password reset emails
 * for the PointPulse application. It utilizes `nodemailer` to send emails via
 * Gmail's SMTP service. The module supports two primary email functionalities:
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
    subject: 'Activate your PointPulse account',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Activate PointPulse Account</title>
        <!--[if mso]>
        <noscript>
          <xml>
            <o:OfficeDocumentSettings>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </noscript>
        <![endif]-->
      </head>
      <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 20px;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
                
                <!-- Header -->
                <div style="padding: 48px 40px 32px; border-bottom: 1px solid #e6ebf1;">
                  <table role="presentation" style="width: 100%;">
                    <tr>
                      <td>
                        <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a202c; letter-spacing: -0.025em;">PointPulse</h1>
                      </td>
                      <td style="text-align: right;">
                        <span style="color: #718096; font-size: 14px;">University of Toronto</span>
                      </td>
                    </tr>
                  </table>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px;">
                  <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #1a202c;">Welcome to PointPulse</h2>
                  
                  <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.5;">
                    Hello ${userName},
                  </p>
                  
                  <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.5;">
                    Your PointPulse account has been created. To get started and secure your account, please activate it by clicking the button below.
                  </p>
                  
                  <!-- Account Details -->
                  <div style="background-color: #f7fafc; border-radius: 6px; padding: 20px; margin: 24px 0;">
                    <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #2d3748;">Account Information</h3>
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0; color: #718096; font-size: 14px; width: 120px;">Username:</td>
                        <td style="padding: 8px 0; color: #2d3748; font-size: 14px; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;">${utorid}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #718096; font-size: 14px;">Email:</td>
                        <td style="padding: 8px 0; color: #2d3748; font-size: 14px;">${to}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <!-- Activation Button -->
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${activationUrl}" style="display: inline-block; background-color: #3182ce; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: 500; line-height: 1.5;">
                      Activate Account
                    </a>
                  </div>
                  
                  <p style="margin: 24px 0; color: #718096; font-size: 14px; text-align: center;">
                    This activation link will expire in 7 days
                  </p>
                  
                  <!-- Alternative Method -->
                  <div style="background-color: #edf2f7; border-radius: 6px; padding: 16px; margin: 24px 0;">
                    <h4 style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #2d3748;">Can't click the button?</h4>
                    <p style="margin: 0 0 12px; color: #4a5568; font-size: 14px; line-height: 1.4;">
                      Copy and paste this URL into your web browser:
                    </p>
                    <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px; word-break: break-all;">
                      <span style="color: #2d3748; font-size: 13px; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;">
                        ${activationUrl}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Security Notice -->
                  <div style="background-color: #fef5e7; border: 1px solid #f6ad55; border-radius: 6px; padding: 16px; margin: 24px 0;">
                    <p style="margin: 0; color: #744210; font-size: 14px; line-height: 1.4;">
                      <strong>Security reminder:</strong> This email contains sensitive account information. Do not forward or share this activation link with others.
                    </p>
                  </div>
                  
                  <p style="margin: 24px 0 0; color: #718096; font-size: 14px; line-height: 1.5;">
                    If you didn't create this account, please ignore this email. The account will be automatically deleted after 7 days if not activated.
                  </p>
                </div>
                
                <!-- Footer -->
                <div style="padding: 24px 40px; background-color: #f7fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0; color: #a0aec0; font-size: 12px; line-height: 1.4;">
                    This message was sent from a notification-only email address that cannot accept incoming email. Please do not reply to this message.
                  </p>
                  <p style="margin: 8px 0 0; color: #a0aec0; font-size: 12px;">
                    © ${new Date().getFullYear()} PointPulse, University of Toronto. All rights reserved.
                  </p>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
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
      subject: 'Reset your PointPulse password',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset PointPulse Password</title>
          <!--[if mso]>
          <noscript>
            <xml>
              <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
            </xml>
          </noscript>
          <![endif]-->
        </head>
        <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
                  
                  <!-- Header -->
                  <div style="padding: 48px 40px 32px; border-bottom: 1px solid #e6ebf1;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td>
                          <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a202c; letter-spacing: -0.025em;">PointPulse</h1>
                        </td>
                        <td style="text-align: right;">
                          <span style="color: #718096; font-size: 14px;">University of Toronto</span>
                        </td>
                      </tr>
                    </table>
                  </div>
                  
                  <!-- Content -->
                  <div style="padding: 40px;">
                    <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #1a202c;">Reset your password</h2>
                    
                    <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.5;">
                      Hello ${userName},
                    </p>
                    
                    <p style="margin: 0 0 32px; color: #4a5568; font-size: 16px; line-height: 1.5;">
                      We received a request to reset the password for your PointPulse account. If you made this request, click the button below to reset your password.
                    </p>
                    
                    <!-- Reset Button -->
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="${reseturl}" style="display: inline-block; background-color: #e53e3e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: 500; line-height: 1.5;">
                        Reset Password
                      </a>
                    </div>
                    
                    <p style="margin: 32px 0 24px; color: #718096; font-size: 14px; text-align: center;">
                      This password reset link will expire in 1 hour
                    </p>
                    
                    <!-- Alternative Method -->
                    <div style="background-color: #edf2f7; border-radius: 6px; padding: 16px; margin: 24px 0;">
                      <h4 style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #2d3748;">Can't click the button?</h4>
                      <p style="margin: 0 0 12px; color: #4a5568; font-size: 14px; line-height: 1.4;">
                        Copy and paste this URL into your web browser:
                      </p>
                      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px; word-break: break-all;">
                        <span style="color: #2d3748; font-size: 13px; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;">
                          ${reseturl}
                        </span>
                      </div>
                      
                      <h4 style="margin: 16px 0 8px; font-size: 14px; font-weight: 600; color: #2d3748;">Reset Token</h4>
                      <p style="margin: 0 0 8px; color: #4a5568; font-size: 14px; line-height: 1.4;">
                        If needed, you can use this reset token:
                      </p>
                      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px;">
                        <span style="color: #2d3748; font-size: 13px; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;">
                          ${activationToken}
                        </span>
                      </div>
                    </div>
                    
                    <!-- Security Notice -->
                    <div style="background-color: #fed7d7; border: 1px solid #fc8181; border-radius: 6px; padding: 16px; margin: 24px 0;">
                      <p style="margin: 0; color: #742a2a; font-size: 14px; line-height: 1.4;">
                        <strong>Security notice:</strong> If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                      </p>
                    </div>
                    
                    <p style="margin: 24px 0 0; color: #718096; font-size: 14px; line-height: 1.5;">
                      For security reasons, this request was received from your account. If you didn't make this request, someone may have entered your email address by mistake.
                    </p>
                  </div>
                  
                  <!-- Footer -->
                  <div style="padding: 24px 40px; background-color: #f7fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; color: #a0aec0; font-size: 12px; line-height: 1.4;">
                      This message was sent from a notification-only email address that cannot accept incoming email. Please do not reply to this message.
                    </p>
                    <p style="margin: 8px 0 0; color: #a0aec0; font-size: 12px;">
                      © ${new Date().getFullYear()} PointPulse, University of Toronto. All rights reserved.
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          </table>
        </body>
        </html>
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

// Send a one-time login code to user email
const sendLoginCodeEmail = async (to, userName, otpCode) => {
  const mailOptions = {
    from: '"PointPulse" <spammail04042025@gmail.com>',
    to,
    subject: 'Your PointPulse verification code',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PointPulse Verification</title>
        <!--[if mso]>
        <noscript>
          <xml>
            <o:OfficeDocumentSettings>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </noscript>
        <![endif]-->
      </head>
      <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 20px;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
                
                <!-- Header -->
                <div style="padding: 48px 40px 32px; border-bottom: 1px solid #e6ebf1;">
                  <table role="presentation" style="width: 100%;">
                    <tr>
                      <td>
                        <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a202c; letter-spacing: -0.025em;">PointPulse</h1>
                      </td>
                      <td style="text-align: right;">
                        <span style="color: #718096; font-size: 14px;">University of Toronto</span>
                      </td>
                    </tr>
                  </table>
          </div>
          
                <!-- Content -->
                <div style="padding: 40px;">
                  <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #1a202c;">Verify your identity</h2>
                  
                  <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.5;">
                    Hello ${userName},
                  </p>
                  
                  <p style="margin: 0 0 32px; color: #4a5568; font-size: 16px; line-height: 1.5;">
                    We received a request to sign in to your PointPulse account. Enter the following verification code when prompted:
                  </p>
                  
                  <!-- Verification Code -->
                  <div style="text-align: center; margin: 32px 0;">
                    <div style="display: inline-block; background-color: #f7fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 24px 32px;">
                      <div style="font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace; font-size: 32px; font-weight: 600; color: #2d3748; letter-spacing: 8px; line-height: 1;">
                        ${otpCode}
                      </div>
                    </div>
          </div>
          
                  <p style="margin: 32px 0 24px; color: #718096; font-size: 14px; text-align: center;">
                    This code will expire in 10 minutes
                  </p>
                  
                  <!-- Security Notice -->
                  <div style="background-color: #fffbf0; border: 1px solid #f6e05e; border-radius: 6px; padding: 16px; margin: 24px 0;">
                    <p style="margin: 0; color: #744210; font-size: 14px; line-height: 1.4;">
                      <strong>Security notice:</strong> Never share this verification code with anyone. PointPulse staff will never ask for your verification code.
                    </p>
                  </div>
                  
                  <p style="margin: 24px 0 0; color: #718096; font-size: 14px; line-height: 1.5;">
                    If you didn't request this verification code, you can safely ignore this email. Someone may have typed your email address by mistake.
                  </p>
                </div>
                
                <!-- Footer -->
                <div style="padding: 24px 40px; background-color: #f7fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0; color: #a0aec0; font-size: 12px; line-height: 1.4;">
                    This message was sent from a notification-only email address that cannot accept incoming email. Please do not reply to this message.
                  </p>
                  <p style="margin: 8px 0 0; color: #a0aec0; font-size: 12px;">
                    © ${new Date().getFullYear()} PointPulse, University of Toronto. All rights reserved.
          </p>
        </div>
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
  };

  // Send the email
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log('Error sending login code email:', error);
    } else {
      console.log('Login code email sent:', info.response);
    }
  });
};

module.exports = {
  sendActivationEmail,
  sendResetEmail,
  sendLoginCodeEmail,
};
