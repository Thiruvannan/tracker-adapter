const https = require('https');

const TRACKERS = {
    'nyaa': 'nyaa.si',
    '1337x': '1337x.to'
};

module.exports = async (req, res) => {
    // 1. Identify tracker
    const parts = req.url.split('/');
    const trackerKey = parts[1]; // e.g., 'nyaa'
    const host = TRACKERS[trackerKey];

    if (!host) return res.status(404).send('Tracker not found');

    // 2. Build the path correctly: 
    // We want everything AFTER /nyaa, starting with the /
    const path = req.url.substring(trackerKey.length + 1);

    // 3. Fake capabilities (t=caps)
    if (req.url.includes('t=caps')) {
        res.writeHead(200, { 'Content-Type': 'application/xml' });
        return res.end('<?xml version="1.0" encoding="UTF-8"?><caps><server/><searching><search available="yes"/><tv-search available="yes"/><movie-search available="yes"/></searching></caps>');
    }

    const options = {
        hostname: host,
        port: 443,
        path: path,
        method: req.method,
        headers: {
            ...req.headers,
            'host': host, // Critical: must match the target hostname
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        },
        rejectUnauthorized: false
    };

    const proxyReq = https.request(options, (proxyRes) => {
        // Forward headers and status, but remove Cloudflare-specific headers that might cause loop errors
        const responseHeaders = { ...proxyRes.headers };
        delete responseHeaders['transfer-encoding'];
        
        res.writeHead(proxyRes.statusCode, responseHeaders);
        proxyRes.pipe(res, { end: true });
    });

    req.pipe(proxyReq, { end: true });
};
