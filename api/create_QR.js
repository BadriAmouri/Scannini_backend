// api/create_QR.js
const supabase = require("../config/db");

module.exports = async (req, res) => {
  if (req.method === "POST") {
    const { email, link } = req.body;

    const { data, error } = await supabase
      .from("QR_link")
      .insert([{ email, link }]);

    if (error) return res.status(400).json({ error: error.message });
    return res.json({ message: "QR link created", data });
  }
  return res.status(405).json({ error: "Method Not Allowed" });
};
