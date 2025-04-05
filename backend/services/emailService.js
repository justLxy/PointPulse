const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   service: 'gmail', // Or your SMTP service
//   auth: {
//     user: 'spammail04042025@gmail.com', // Not good practice, just for the sake of the lab
//     pass: 'Test!234',
//   },
// });

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
      <p>You’ve been added to PointPulse. Please click the link below to activate your account:</p>
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

module.exports = {
  sendActivationEmail,
  sendResetEmail,
};
