const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: Number(process.env.MAIL_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Mail transporter error:', error);
  } else {
    console.log('Mail transporter ready:', success);
  }
});

async function sendVerificationMail(to, code) {
  try {
    const mailOptions = {
      from: process.env.MAIL_FROM || '"VoteByte" <no-reply@votebyte.local>',
      to,
      subject: 'VoteByte — Email verification code',
      text: `Your verification code is ${code}. It expires in 5 minutes.`,
      html: `<p>Your verification code is <strong>${code}</strong>. It expires in 5 minutes.</p>`,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.response);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = { sendVerificationMail };
