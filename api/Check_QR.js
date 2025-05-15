// Check_QR.js : Handles scanning URLs using VirusTotal and Google Safe Browsing APIs
const express = require("express");
const axios = require("axios");
const router = express.Router();

const VIRUSTOTAL_API_KEY = process.env.VirusTotal_API_KEY;
const GOOGLE_SAFE_BROWSING_API_KEY = process.env.Google_Safe_Browsing_API_KEY;

/* -------------------------------- Google Safe Browsing -------------------------------- */

// POST: Check a URL using Google Safe Browsing
router.post("/google/check", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const response = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_SAFE_BROWSING_API_KEY}`,
      {
        client: {
          clientId: "urlscanner-app",
          clientVersion: "1.0.0",
        },
        threatInfo: {
          threatTypes: [
            "MALWARE",
            "SOCIAL_ENGINEERING",
            "UNWANTED_SOFTWARE",
            "POTENTIALLY_HARMFUL_APPLICATION",
          ],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url }],
        },
      }
    );

    res.status(200).json(
      response.data.matches
        ? { unsafe: true, matches: response.data.matches }
        : { unsafe: false }
    );
  } catch (error) {
    console.error("Google Safe Browsing Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to check URL with Google Safe Browsing" });
  }
});

/* -------------------------------- VirusTotal -------------------------------- */

// Helper: Summarize VirusTotal results
function getScanSummary(data) {
  const results = data.data.attributes.results;
  let totalEngines = 0;
  let flaggedEngines = 0;

  for (const engine in results) {
    const result = results[engine].result;
    if (result !== "clean" && result !== "unrated") {
      flaggedEngines++;
    }
    totalEngines++;
  }

  return {
    totalEngines,
    flaggedEngines,
  };
}

// POST: Submit a URL to VirusTotal for scanning
router.post("/virustotal/scan", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const response = await axios.post(
      "https://www.virustotal.com/api/v3/urls",
      new URLSearchParams({ url }),
      {
        headers: {
          "x-apikey": VIRUSTOTAL_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const analysisId = response.data.data.id;
    res.json({ analysisId, originalUrl: url });
  } catch (err) {
    console.error("VirusTotal Scan Error:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// GET: Fetch VirusTotal scan result by analysis ID
router.get("/virustotal/scan/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const vtResponse = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${id}`,
      {
        headers: {
          "x-apikey": VIRUSTOTAL_API_KEY,
        },
      }
    );

    const summary = getScanSummary(vtResponse.data);
    res.status(200).json({ virustotal: summary });
  } catch (err) {
    console.error("VirusTotal Result Error:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

module.exports = router;
