const supabase = require("../config/db");

module.exports = async (req, res) => {
  if (req.method === "POST") {
    const { email, code } = req.body;

    // Check if the user exists and if the code matches
    const { data, error } = await supabase
      .from("user")
      .select("verification_code")
      .eq("email", email)
      .single(); // Fetch a single user by email

    if (error || !data) {
      return res.status(404).json({ error: "User not found" });
    }

    // Log the data for debugging
    console.log("The data is: ", data);

    // Compare the verification code as strings
    if (data.verification_code !== code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    // If the code matches, return success
    return res.json({ message: "Verification code is correct" });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
};
