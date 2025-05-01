// api/get_QR.js
const supabase = require("../config/db");

module.exports = async (req, res) => {
  if (req.method === "POST") {
    const { link } = req.body;

    const { data, error } = await supabase
      .from("QR_link")
      .select("*")
      .eq("link", link);

    if (error) return res.status(400).json({ error: error.message });

    if (data.length > 0) {
      return res.json({ status: "safe", message: "This is a safe link", data });
    } else {
      return res.json({ status: "harmful", message: "This link is harmful or unknown" });
    }
  }
  return res.status(405).json({ error: "Method Not Allowed" });
};
