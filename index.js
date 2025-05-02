const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const supabase = require("./config/db");

const registerRoutes = require("./api/register");
const loginRoutes = require("./api/login");
const createQRRoutes = require("./api/create_QR");
const getQRRoutes = require("./api/get_QR");
const checkEmailCodeRoutes = require("./api/Check_email_code");  // Import the check email code route

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());  // Enable CORS
app.use(bodyParser.json());  // Parse incoming requests with JSON payload

// Register API routes
app.use("/api/register", registerRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/create_QR", createQRRoutes);
app.use("/api/get_QR", getQRRoutes);
app.use("/api/check_email_code", checkEmailCodeRoutes);  // Add this line


// Welcome Route
app.get("/", (req, res) => {
  res.send("Welcome to the LockChat Backend API!");
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
