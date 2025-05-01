// api/register.js
const supabase = require("../config/db");

module.exports = async (req, res) => {
  if (req.method === "POST") {
    const { email, password } = req.body;

    const { data, error } = await supabase
      .from("user")
      .insert([{ email, password }]);

    if (error) return res.status(400).json({ error: error.message });
    return res.json({ message: "User registered", data });
  }
  return res.status(405).json({ error: "Method Not Allowed" });
};

// send him an email with a link to verify his account ( or a code to verify his account)