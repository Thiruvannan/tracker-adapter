const https = require('https');

module.exports = async (req, res) => {
    // 1. Handshake
    if (req.url.includes('t=caps')) {
        res.writeHead(200, { 'Content-Type': 'application/xml' });
        return res.end('<?xml version="1.0" encoding="UTF-8"?><caps><server/><searching><search available="yes"/><tv-search available="yes"/></searching></caps>');
    }

    // 2. Setup Stealth Options
    const host = req.url.includes('1337x') ? '1337x.to' : 'nyaa.si';
    const path = req.url.substring(req.url.indexOf('/', 1));

    const options = {
        hostname: host,
        port: 443,
        path: path,
        method: 'GET',
        headers: {
            'Host': host,
            'Referer': `https://${host}/`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
        },
        rejectUnauthorized: false
    };

    const proxyReq = https.request(options, (proxyRes) => {
        // If the tracker returns 403, we know it's a bot-block
        if (proxyRes.statusCode === 403) {
            return res.status(403).send('Tracker blocked the bot-like request.');
        }
        res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/rss+xml' });
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (e) => res.status(500).send(e.message));
    proxyReq.end();
};
