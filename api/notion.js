// api/notion.js — Vercel Serverless Function
const https = require(‘https’);

module.exports = async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘GET, POST, PATCH, DELETE, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type, Authorization’);

if (req.method === ‘OPTIONS’) {
return res.status(200).end();
}

const NOTION_TOKEN = ‘ntn_F63853872255y18zYJIRf3T3fLxg3rBDh22AKXa4RTd8YI’;
const { path } = req.query;

if (!path) {
return res.status(400).json({ error: ‘Missing path’ });
}

const body = req.method !== ‘GET’ ? JSON.stringify(req.body) : null;

const options = {
hostname: ‘api.notion.com’,
path: `/v1/${path}`,
method: req.method,
headers: {
‘Authorization’: `Bearer ${NOTION_TOKEN}`,
‘Notion-Version’: ‘2022-06-28’,
‘Content-Type’: ‘application/json’,
…(body ? { ‘Content-Length’: Buffer.byteLength(body) } : {}),
},
};

return new Promise((resolve) => {
const notionReq = https.request(options, (notionRes) => {
let data = ‘’;
notionRes.on(‘data’, chunk => { data += chunk; });
notionRes.on(‘end’, () => {
try {
res.status(notionRes.statusCode).json(JSON.parse(data));
} catch(e) {
res.status(500).json({ error: ‘Parse error’, raw: data });
}
resolve();
});
});

notionReq.on('error', (e) => {
  res.status(500).json({ error: e.message });
  resolve();
});

if (body) notionReq.write(body);
notionReq.end();
});
};
