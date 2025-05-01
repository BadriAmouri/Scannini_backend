const express = require("express");
const bodyParser = require("body-parser");
const supabase = require("./config/db");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Register
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase
    .from("user")
    .insert([{ email, password }]);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "User registered", data });
});

// Login
app.post("/login", async (req, res) => {
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

// Create QR
app.post("/create_QR", async (req, res) => {
  const { email, link } = req.body;

  const { data, error } = await supabase
    .from("QR_link")
    .insert([{ email, link }]);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "QR link created", data });
});

// Get QR
app.post("/get_QR", async (req, res) => {
  const { link } = req.body;

  const { data, error } = await supabase
    .from("QR_link")
    .select("*")
    .eq("link", link);

  if (error) return res.status(400).json({ error: error.message });

  if (data.length > 0) {
    res.json({ status: "safe", message: "This is a safe link", data });
  } else {
    res.json({ status: "harmful", message: "This link is harmful or unknown" });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
