// ─────────────────────────────────────────────
// notion.js — API Notion + property helpers
// ⚠️  Remplace le token si tu en recrées un
// ─────────────────────────────────────────────

const NOTION_TOKEN = 'ntn_b63853872259qxDtdSvfI1FyZ0oyjVV81NuOViwokSd9t0';
const NOTION_DB_ID = '34d17c9946d9804cbe31000c0c0eb98e';
const NOTION_API   = 'https://api.notion.com/v1';
const PROXY        = 'https://corsproxy.io/?';

// ── Requête générique ──
async function notionReq(path, method = 'GET', body = null) {
  const url  = PROXY + encodeURIComponent(NOTION_API + path);
  const opts = {
    method,
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`Notion ${res.status}`);
  return res.json();
}

// ── Query / Create / Update / Archive ──
async function queryDB(filter = null) {
  const body = { page_size: 100 };
  if (filter) body.filter = filter;
  const data = await notionReq(`/databases/${NOTION_DB_ID}/query`, 'POST', body);
  return data.results || [];
}

async function createRow(props) {
  return notionReq('/pages', 'POST', {
    parent: { database_id: NOTION_DB_ID },
    properties: props,
  });
}

async function updateRow(id, props) {
  return notionReq(`/pages/${id}`, 'PATCH', { properties: props });
}

async function archiveRow(id) {
  return notionReq(`/pages/${id}`, 'PATCH', { archived: true });
}

// ── Setters (écriture) ──
const nTitle  = v => ({ title:     [{ text: { content: String(v) } }] });
const nText   = v => ({ rich_text: [{ text: { content: String(v || '') } }] });
const nNumber = v => ({ number:  Number(v) || 0 });
const nSelect = v => ({ select:  { name: String(v) } });
const nDate   = v => ({ date:    { start: v || new Date().toISOString() } });
const nCheck  = v => ({ checkbox: !!v });

// ── Getters (lecture) ──
const gTitle  = r         => r.properties?.Titre?.title?.[0]?.plain_text || '';
const gText   = (r, k)   => r.properties?.[k]?.rich_text?.[0]?.plain_text || '';
const gNumber = (r, k)   => r.properties?.[k]?.number || 0;
const gSelect = (r, k)   => r.properties?.[k]?.select?.name || '';
const gDate   = (r, k)   => r.properties?.[k]?.date?.start || null;
const gCheck  = (r, k)   => r.properties?.[k]?.checkbox || false;
