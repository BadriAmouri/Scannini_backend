const express = require('express');
const router = express.Router();
const axios = require('axios');

// IPQS API configuration
const IPQS_API_KEY = process.env.IPQS_API_KEY;
const IPQS_API_URL = 'https://www.ipqualityscore.com/api/json/url';

router.post('/check', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Make request to IPQS API
        const response = await axios.get(IPQS_API_URL, {
            params: {
                key: IPQS_API_KEY,
                url: url,
                strictness: 1, // 0-2, higher is stricter
                fast: true // Use fast scanning mode
            }
        });

        const data = response.data;

        // Check if the URL is safe
        const isSafe = !data.unsafe && !data.suspicious && !data.risk_score > 80;

        return res.json({
            safe: isSafe,
            risk_score: data.risk_score,
            unsafe: data.unsafe,
            suspicious: data.suspicious,
            malware: data.malware,
            phishing: data.phishing,
            spamming: data.spamming,
            adult: data.adult,
            details: {
                domain: data.domain,
                ip_address: data.ip_address,
                server: data.server,
                content_type: data.content_type,
                status_code: data.status_code,
                page_size: data.page_size,
                domain_rank: data.domain_rank,
                dns_valid: data.dns_valid,
                parking: data.parking,
                spamming: data.spamming,
                malware: data.malware,
                phishing: data.phishing,
                suspicious: data.suspicious,
                adult: data.adult,
                risk_score: data.risk_score,
                category: data.category,
                message: data.message
            }
        });

    } catch (error) {
        console.error('IPQS API Error:', error.message);
        return res.status(500).json({
            error: 'Failed to check URL safety',
            details: error.message
        });
    }
});

module.exports = router; 