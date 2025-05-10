const supabase = require('../config/db');
const axios = require('axios');

const VIRUSTOTAL_API_KEY = process.env.VirusTotal_API_KEY;
const SECURITY_THRESHOLD = 2; // Number of engines that need to flag the URL to consider it unsafe

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
    isUnsafe: flaggedEngines >= SECURITY_THRESHOLD
  };
}

module.exports = async (req, res) => {
  const { email, link } = req.body;

  if (!link) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // First, submit URL to VirusTotal for scanning
    const scanResponse = await axios.post(
      "https://www.virustotal.com/api/v3/urls",
      new URLSearchParams({ url: link }),
      {
        headers: {
          "x-apikey": VIRUSTOTAL_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const analysisId = scanResponse.data.data.id;

    // Wait for a short time to allow the scan to complete
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Get the scan results
    const resultResponse = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
      {
        headers: {
          "x-apikey": VIRUSTOTAL_API_KEY,
        },
      }
    );

    const summary = getScanSummary(resultResponse.data);

    // If the URL is unsafe, reject the QR code creation
    if (summary.isUnsafe) {
      return res.status(400).json({
        error: "URL is potentially unsafe",
        details: {
          flaggedEngines: summary.flaggedEngines,
          totalEngines: summary.totalEngines,
          threshold: SECURITY_THRESHOLD
        }
      });
    }

    // If URL is safe, create the QR code
    const { data, error } = await supabase
      .from('QR_link')
      .insert([{ 
        email, 
        link,
        security_check: {
          flaggedEngines: summary.flaggedEngines,
          totalEngines: summary.totalEngines,
          scanDate: new Date().toISOString()
        }
      }]);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ 
      message: 'QR link created', 
      data,
      security: {
        flaggedEngines: summary.flaggedEngines,
        totalEngines: summary.totalEngines,
        isSafe: true
      }
    });

  } catch (error) {
    console.error("Error in QR creation:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Failed to create QR code",
      details: error.response?.data || error.message
    });
  }
};
