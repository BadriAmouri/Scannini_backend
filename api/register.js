const supabase = require("../config/db");
const sendVerificationEmail = require("../Email/sendEmail");  // Import the sendVerificationEmail function

module.exports = async (req, res) => {
  if (req.method === "POST") {
    const { email, password } = req.body;

    // Generate a verification code (you can use any method to generate a unique code)
    const verificationCode = Math.floor(100000 + Math.random() * 900000);  // 6-digit code

    // Insert the user into the database with the verification code
    const { data, error } = await supabase
      .from("user")
      .insert([{ email, password, verification_code: verificationCode }]);

    if (error) return res.status(400).json({ error: error.message });

    // Send the verification email to the user
    try {
      await sendVerificationEmail(email, verificationCode);  // Send email with the code
    } catch (emailError) {
      return res.status(500).json({ error: 'Failed to send verification email', details: emailError.message });
    }

    return res.json({ message: "User registered. Please check your email for verification.", data });
  }
  
  return res.status(405).json({ error: "Method Not Allowed" });
};
