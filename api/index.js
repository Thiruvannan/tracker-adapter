const https = require('https');

const TRACKERS = {
    'nyaa': { host: 'nyaa.si', path: '' },
    '1337x': { host: '1337x.to', path: '' }
};

module.exports = async (req, res) => {
    // 1. Determine which tracker to use
    const trackerKey = req.url.includes('/nyaa/') ? 'nyaa' : '1337x';
    const target = TRACKERS[trackerKey];

    // 2. Translate Sonarr's "/api?t=caps" request to the actual Nyaa path
    // If it's a caps request, we send it to the root
    let targetPath = req.url.replace('/' + trackerKey + '/', '/');
    if (targetPath === '/api' || targetPath === '/') targetPath = '/';

    const options = {
        hostname: target.host,
        port: 443,
        path: targetPath,
        method: req.method,
        headers: {
            ...req.headers,
            'host': target.host,
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        },
        rejectUnauthorized: false
    };

    const proxyReq = https.request(options, (proxyRes) => {
        // If it's the "caps" check, inject a fake valid XML to fool Sonarr
        if (req.url.includes('t=caps')) {
            res.writeHead(200, { 'Content-Type': 'application/xml' });
            res.end('<?xml version="1.0" encoding="UTF-8"?><caps><server/><searching><search available="yes"/><tv-search available="yes"/></searching></caps>');
            return;
        }
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
    });

    req.pipe(proxyReq, { end: true });
};
