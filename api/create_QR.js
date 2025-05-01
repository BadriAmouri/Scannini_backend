const supabase = require('../config/db');

module.exports = async (req, res) => {
  const { email, link } = req.body;

  const { data, error } = await supabase
    .from('QR_link')
    .insert([{ email, link }]);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: 'QR link created', data });
};
