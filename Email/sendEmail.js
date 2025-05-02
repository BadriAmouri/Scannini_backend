const nodemailer = require('nodemailer');
require('dotenv').config();

const sendVerificationEmail = async (to, code) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'badriamouri2016@gmail.com',
        pass: 'mxmx zygx gszw slaf',
      },
    });

    const mailOptions = {
      from: `"Scannini Support" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Verify Your Scannini Account',
      text: `Your verification code is: ${code}`,
      html: `<h3>Your verification code is:</h3><p><b>${code}</b></p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${to}`);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
  }
};

module.exports = sendVerificationEmail;
