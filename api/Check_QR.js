// Check_QR.js : Handles scanning URLs using VirusTotal and IPQS APIs
const express = require("express");
const axios = require("axios");
const router = express.Router();

// Environment variables
const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;
const IPQS_API_KEY = process.env.IPQS_API_KEY;

// URL validation helper
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}

/* -------------------------------- IPQS -------------------------------- */

router.post("/ipqs/check", async (req, res) => {
  const { url } = req.body;

  // Input validation
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  try {
    const response = await axios.get(
      `https://www.ipqualityscore.com/api/json/url/${IPQS_API_KEY}/${encodeURIComponent(url)}`
    );

    res.status(200).json({
      safe: !response.data.unsafe,
      details: {
        malware: response.data.malware,
        phishing: response.data.phishing,
        suspicious: response.data.suspicious,
        adult: response.data.adult
      }
    });
  } catch (error) {
    console.error("IPQS Error:", error.response?.data || error.message);
    res.status(500).json({ 
      safe: false,
      details: {
        message: error.response?.data?.message || "Failed to check URL with IPQS"
      }
    });
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

  // Input validation
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: "Invalid URL format" });
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

  if (!id) {
    return res.status(400).json({ error: "Analysis ID is required" });
  }

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

/* -------------------------------- Combined Check -------------------------------- */

router.post("/combined/check", async (req, res) => {
  const { url } = req.body;

  // Input validation
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  try {
    // 1. First check with IPQS
    const ipqsResponse = await axios.get(
      `https://www.ipqualityscore.com/api/json/url/${IPQS_API_KEY}/${encodeURIComponent(url)}`
    );

    const ipqsResult = {
      safe: !ipqsResponse.data.unsafe,
      details: {
        malware: ipqsResponse.data.malware,
        phishing: ipqsResponse.data.phishing,
        suspicious: ipqsResponse.data.suspicious,
        adult: ipqsResponse.data.adult
      }
    };

    // 2. Then check with VirusTotal
    const vtScanResponse = await axios.post(
      "https://www.virustotal.com/api/v3/urls",
      new URLSearchParams({ url }),
      {
        headers: {
          "x-apikey": VIRUSTOTAL_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const analysisId = vtScanResponse.data.data.id;

    // Wait for VirusTotal analysis to complete
    let vtResult = null;
    let attempts = 0;
    const maxAttempts = 5; // Maximum number of attempts
    const waitTime = 5000; // Wait 5 seconds between attempts

    while (attempts < maxAttempts) {
      try {
        const vtResultResponse = await axios.get(
          `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
          {
            headers: {
              "x-apikey": VIRUSTOTAL_API_KEY,
            },
          }
        );

        // Check if analysis is complete
        if (vtResultResponse.data.data.attributes.status === "completed") {
          vtResult = getScanSummary(vtResultResponse.data);
          break;
        }

        // If not complete, wait and try again
        await new Promise(resolve => setTimeout(resolve, waitTime));
        attempts++;
      } catch (error) {
        console.error("Error fetching VirusTotal results:", error);
        break;
      }
    }

    // If we couldn't get VirusTotal results after all attempts
    if (!vtResult) {
      vtResult = {
        totalEngines: 0,
        flaggedEngines: 0,
        error: "VirusTotal analysis timed out"
      };
    }

    // 3. Combine results
    const combinedResult = {
      url: url,
      ipqs: ipqsResult,
      virustotal: vtResult,
      isSafe: ipqsResult.safe && vtResult.flaggedEngines === 0
    };

    res.status(200).json(combinedResult);
  } catch (error) {
    console.error("Combined Check Error:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Failed to perform combined check",
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;
