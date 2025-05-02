// testVerificationEmail.js
const sendVerificationEmail = require('./sendEmail');

// Generate a random verification code (or you can manually set one)
const verificationCode = Math.floor(100000 + Math.random() * 900000); // Random 6-digit code

// Test email address
const testEmail = 'badri.amouri@ensia.edu.dz';

// Send the email
sendVerificationEmail(testEmail, verificationCode);
