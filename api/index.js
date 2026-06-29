const https = require('https');

module.exports = async (req, res) => {
    // 1. Handshake
    if (req.url.includes('t=caps')) {
        res.writeHead(200, { 'Content-Type': 'application/xml' });
        return res.end('<?xml version="1.0" encoding="UTF-8"?><caps><server/><searching><search available="yes"/><tv-search available="yes"/></searching></caps>');
    }

    // 2. Map Sonarr request to Nyaa RSS feed
    // Nyaa RSS: https://nyaa.si/?page=rss&q=Query
    const url = new URL(req.url, 'https://nyaa.si');
    const query = url.searchParams.get('q');
    const targetPath = query ? `/?page=rss&q=${encodeURIComponent(query)}` : '/?page=rss';

    const options = {
        hostname: 'nyaa.si',
        port: 443,
        path: targetPath,
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0' },
        rejectUnauthorized: false
    };

    const proxyReq = https.request(options, (proxyRes) => {
        res.writeHead(200, { 'Content-Type': 'application/rss+xml' });
        proxyRes.pipe(res);
    });

    proxyReq.end();
};
