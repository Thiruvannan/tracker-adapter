const https = require('https');

const TRACKERS = {
    'nyaa': 'nyaa.si',
    '1337x': '1337x.to',
    'tpb': 'thepiratebay.org',
    'limetorrents': 'limetorrents.to'
};

module.exports = async (req, res) => {
    const { tracker, path } = req.query;
    
    if (!tracker || !TRACKERS[tracker]) {
        return res.status(400).send('Invalid or missing tracker selector.');
    }

    const targetHostname = TRACKERS[tracker];
    const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const targetPath = '/' + (path || '') + queryString;

    const options = {
        hostname: targetHostname,
        port: 443,
        path: targetPath,
        method: req.method,
        headers: {
            ...req.headers,
            host: targetHostname,
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        },
        rejectUnauthorized: false
    };

    const proxyReq = https.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
    });

    req.pipe(proxyReq, { end: true });

    proxyReq.on('error', (err) => {
        res.status(500).send('Adapter connection failed: ' + err.message);
    });
};
