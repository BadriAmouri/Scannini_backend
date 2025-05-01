// api/login.js
const cors = require("cors");
const supabase = require("../config/db");

module.exports = async (req, res) => {
  // Apply CORS in the specific route
  cors()(req, res, async () => {
    const { email, password } = req.body;

    const { data, error } = await supabase
      .from("user")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (error || !data) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ message: "Login successful" });
  });
};
