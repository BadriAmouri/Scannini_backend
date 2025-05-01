// api/login.js
const supabase = require("../config/db");

module.exports = async (req, res) => {
  if (req.method === "POST") {
    const { email, password } = req.body;

    const { data, error } = await supabase
      .from("user")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (error || !data) return res.status(401).json({ error: "Invalid credentials" });
    return res.json({ message: "Login successful" });
  }
  return res.status(405).json({ error: "Method Not Allowed" });
};
