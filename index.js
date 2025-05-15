// index.js : Sets up the Express server and imports the necessary routes for handling requests.

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Import database and routes
const supabase = require("./config/db");
const registerRoutes = require("./api/register");
const loginRoutes = require("./api/login");
const createQRRoutes = require("./api/create_QR");
const getQRRoutes = require("./api/get_QR");
const checkEmailCodeRoutes = require("./api/Check_email_code");
const scanRoutes = require("./api/Check_QR"); // This file contains all scan-related routes

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Mount API routes
app.use("/api/register", registerRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/create_QR", createQRRoutes);
app.use("/api/get_QR", getQRRoutes);
app.use("/api/check_email_code", checkEmailCodeRoutes);
app.use("/api/scan", scanRoutes); // This will handle all scan-related routes

// Welcome route
app.get("/", (req, res) => {
  res.send("👋 Welcome to the Scannini Backend API!");
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
