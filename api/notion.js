// api/notion.js — Vercel Serverless Function
// Fait le pont entre le front et l’API Notion sans problème de CORS

export default async function handler(req, res) {
// Autorise les requêtes depuis ton site
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘GET, POST, PATCH, DELETE, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type, Authorization’);

// Réponse aux preflight OPTIONS
if (req.method === ‘OPTIONS’) {
return res.status(200).end();
}

const NOTION_TOKEN = ‘ntn_F63853872255y18zYJIRf3T3fLxg3rBDh22AKXa4RTd8YI’;
const { path } = req.query;

if (!path) {
return res.status(400).json({ error: ‘Missing path’ });
}

try {
const notionRes = await fetch(`https://api.notion.com/v1/${path}`, {
method: req.method,
headers: {
‘Authorization’: `Bearer ${NOTION_TOKEN}`,
‘Notion-Version’: ‘2022-06-28’,
‘Content-Type’: ‘application/json’,
},
body: req.method !== ‘GET’ ? JSON.stringify(req.body) : undefined,
});

const data = await notionRes.json();
return res.status(notionRes.status).json(data);

} catch (e) {
return res.status(500).json({ error: e.message });
}
}
