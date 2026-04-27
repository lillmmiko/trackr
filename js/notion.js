const NOTION_DB_ID = ‘34d17c9946d9804cbe31000c0c0eb98e’;


async function notionReq(path, method = ‘GET’, body = null) {
const url  = `/api/notion?path=${encodeURIComponent(path)}`;
const opts = {
method,
headers: { ‘Content-Type’: ‘application/json’ },
};
if (body) opts.body = JSON.stringify(body);
const res = await fetch(url, opts);
if (!res.ok) throw new Error(`Notion ${res.status}`);
return res.json();
}


async function queryDB(filter = null) {
const body = { page_size: 100 };
if (filter) body.filter = filter;
const data = await notionReq(`databases/${NOTION_DB_ID}/query`, ‘POST’, body);
return data.results || [];
}

async function createRow(props) {
return notionReq(‘pages’, ‘POST’, {
parent: { database_id: NOTION_DB_ID },
properties: props,
});
}

async function updateRow(id, props) {
return notionReq(`pages/${id}`, ‘PATCH’, { properties: props });
}

async function archiveRow(id) {
return notionReq(`pages/${id}`, ‘PATCH’, { archived: true });
}


const nTitle  = v => ({ title:     [{ text: { content: String(v) } }] });
const nText   = v => ({ rich_text: [{ text: { content: String(v || ‘’) } }] });
const nNumber = v => ({ number:  Number(v) || 0 });
const nSelect = v => ({ select:  { name: String(v) } });
const nDate   = v => ({ date:    { start: v || new Date().toISOString() } });
const nCheck  = v => ({ checkbox: !!v });


const gTitle  = r       => r.properties?.Titre?.title?.[0]?.plain_text || ‘’;
const gText   = (r, k) => r.properties?.[k]?.rich_text?.[0]?.plain_text || ‘’;
const gNumber = (r, k) => r.properties?.[k]?.number || 0;
const gSelect = (r, k) => r.properties?.[k]?.select?.name || ‘’;
const gDate   = (r, k) => r.properties?.[k]?.date?.start || null;
const gCheck  = (r, k) => r.properties?.[k]?.checkbox || false;
