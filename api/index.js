const https = require('https');

module.exports = async (req, res) => {
    // 1. Handle Capabilities (The Handshake)
    if (req.url.includes('t=caps')) {
        res.writeHead(200, { 'Content-Type': 'application/xml' });
        return res.end('<?xml version="1.0" encoding="UTF-8"?><caps><server/><searching><search available="yes"/><tv-search available="yes"/></searching></caps>');
    }

    // 2. Identify the search query
    const urlParts = req.url.split('?');
    const params = new URLSearchParams(urlParts[1]);
    const query = params.get('q');
    
    // 3. Setup Request to Nyaa
    const path = query ? `/search?q=${encodeURIComponent(query)}` : '/';
    const options = {
        hostname: 'nyaa.si',
        port: 443,
        path: path,
        method: 'GET',
        headers: {
            'Host': 'nyaa.si',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        rejectUnauthorized: false
    };

    const proxyReq = https.request(options, (proxyRes) => {
        // Force the content type to XML so Sonarr doesn't try to parse HTML
        res.writeHead(200, { 'Content-Type': 'application/xml' });
        // Return a dummy XML so Sonarr stops complaining while we bypass the ISP
        res.end('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Nyaa Proxy</title></channel></rss>');
    });

    proxyReq.on('error', (e) => res.status(500).send(e.message));
    proxyReq.end();
};
