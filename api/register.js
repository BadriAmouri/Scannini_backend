// api/register.js
const cors = require("cors");
const supabase = require("../config/db");

module.exports = async (req, res) => {
  // Apply CORS in the specific route
  cors()(req, res, async () => {
    const { email, password } = req.body;

    const { data, error } = await supabase
      .from("user")
      .insert([{ email, password }]);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "User registered", data });
  });
};
