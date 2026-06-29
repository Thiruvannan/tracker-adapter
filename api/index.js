const https = require('https');

module.exports = async (req, res) => {
    if (req.url.includes('t=caps')) {
        res.writeHead(200, { 'Content-Type': 'application/xml' });
        return res.end('<?xml version="1.0" encoding="UTF-8"?><caps><server/><searching><search available="yes"/><tv-search available="yes"/></searching></caps>');
    }

    const url = new URL(req.url, 'https://dummy.com');
    const query = url.searchParams.get('q');
    const targetPath = query ? `/search/${encodeURIComponent(query)}/1/` : '/';
    const host = req.url.includes('1337x') ? '1337x.to' : 'nyaa.si';

    const options = {
        hostname: host,
        port: 443,
        path: targetPath,
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0' },
        rejectUnauthorized: false
    };

    const proxyReq = https.request(options, (proxyRes) => {
        // IMPORTANT: We now pipe the real data instead of sending dummy XML
        res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/rss+xml' });
        proxyRes.pipe(res); 
    });

    proxyReq.on('error', (e) => res.status(500).send(e.message));
    proxyReq.end();
};
