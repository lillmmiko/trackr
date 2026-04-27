// ─────────────────────────────────────────────
// pages/dashboard.js
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  renderCheckin();
  await Promise.all([
    renderTaskList('dashboard-tasks'),
    updateDashStats(),
    renderWeekHeatmap(),
  ]);
});

// ── Checkin ──
function renderCheckin() {
  const today    = new Date().toDateString();
  const checkins = LC.get('checkins', {});
  const done     = !!checkins[today];
  const el       = document.getElementById('checkin-block');
  const timeStr  = done ? new Date(checkins[today]).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : null;

  el.innerHTML = `
    <div class="checkin-wrap ${done ? 'done' : ''}">
      <div class="checkin-pulse"></div>
      <div class="checkin-info">
        <div class="checkin-title">${done ? '✓ Tu étais là aujourd\'hui' : 'Tu es là ?'}</div>
        <div class="checkin-sub">${done ? `Check-in à ${timeStr} · +20 XP gagné` : 'Clique pour marquer ta présence du jour'}</div>
      </div>
      ${done
        ? `<button class="btn-checkin done">Présente ✓</button>`
        : `<button class="btn-checkin" onclick="doCheckin()">J'étais là ✦</button>`}
    </div>`;
}

async function doCheckin() {
  const today    = new Date().toDateString();
  const checkins = LC.get('checkins', {});
  if (checkins[today]) return;
  checkins[today] = new Date().toISOString();
  LC.set('checkins', checkins);
  renderCheckin();
  await addXP(20, 'Check-in quotidien', 'routine');
}

// ── Stats cards ──
async function updateDashStats() {
  const today = new Date().toISOString().split('T')[0];

  const [taskRows, venteRows] = await Promise.all([
    queryDB({ and: [
      { property: 'Type', select: { equals: 'task' } },
      { property: 'Date', date: { on_or_after: today } },
      { property: 'Date', date: { on_or_before: today + 'T23:59:59Z' } },
    ]}),
    queryDB({ and: [
      { property: 'Type', select: { equals: 'vente' } },
      { property: 'Date', date: { on_or_after: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString() } },
    ]}),
  ]);

  const done   = taskRows.filter(r => gCheck(r, 'Done')).length;
  const profit = venteRows.reduce((s, r) => s + (gNumber(r, 'Montant') - gNumber(r, 'Achat')), 0);

  document.getElementById('dash-tasks').textContent   = `${done}/${taskRows.length}`;
  document.getElementById('dash-revenus').textContent = profit.toFixed(0) + '€';
}

// ── Heatmap 7 jours ──
async function renderWeekHeatmap() {
  const rows  = await queryDB({ property: 'Type', select: { equals: 'xp_log' } });
  const el    = document.getElementById('week-heatmap');
  const days  = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const today = new Date();

  el.innerHTML = Array.from({ length: 7 }, (_, i) => {
    const d  = new Date(today); d.setDate(today.getDate() - (6 - i));
    const ds = d.toISOString().split('T')[0];
    const hasData = rows.some(r => (gDate(r, 'Date') || '').startsWith(ds));
    const isToday = ds === today.toISOString().split('T')[0];
    const cls = isToday ? 'today' : hasData ? 'has-data' : '';
    return `<div class="week-day ${cls}">${days[(d.getDay() + 6) % 7]}</div>`;
  }).join('');
}

// ── Task list ──
async function renderTaskList(containerId, filterCat = null) {
  showLoading(containerId);
  try {
    const today   = new Date().toISOString().split('T')[0];
    const filters = [
      { property: 'Type', select: { equals: 'task' } },
      { property: 'Date', date: { on_or_after: today } },
      { property: 'Date', date: { on_or_before: today + 'T23:59:59Z' } },
    ];
    if (filterCat) filters.push({ property: 'Categorie', select: { equals: filterCat } });

    const rows = await queryDB({ and: filters });
    const el   = document.getElementById(containerId);

    if (!rows.length) { showEmpty(containerId, '◈', 'Aucune tâche aujourd\'hui<br>Ajoute-en une !'); return; }

    el.innerHTML = rows.map(r => {
      const title = gTitle(r), cat = gSelect(r, 'Categorie'), xp = gNumber(r, 'XP'), done = gCheck(r, 'Done');
      return `
        <div class="task-item ${done ? 'done' : ''}">
          <div class="task-check" onclick="toggleTask('${r.id}',${done},${xp},'${title.replace(/'/g,"\\'")}','${cat}')">
            ${done ? '✓' : ''}
          </div>
          <div class="task-content">
            <div class="task-title">${title}</div>
            <div class="task-meta">${catLabel(cat)}</div>
          </div>
          <div class="task-xp">+${xp} XP</div>
          <button class="btn btn-danger" onclick="deleteTask('${r.id}')">✕</button>
        </div>`;
    }).join('');
  } catch(e) { showEmpty(containerId, '⚠️', 'Erreur chargement — vérifie Notion'); }
}

async function addTask() {
  const title = document.getElementById('task-title-input').value.trim();
  const cat   = document.getElementById('task-cat-input').value;
  const xp    = parseInt(document.getElementById('task-xp-input').value);
  if (!title) return;
  try {
    await createRow({
      'Titre':     nTitle(title),
      'Type':      nSelect('task'),
      'Categorie': nSelect(cat),
      'XP':        nNumber(xp),
      'Done':      nCheck(false),
      'Date':      nDate(new Date().toISOString()),
    });
    document.getElementById('task-title-input').value = '';
    closeModal('modal-task');
    await renderTaskList('dashboard-tasks');
    await updateDashStats();
  } catch(e) { showToast('⚠️ Erreur Notion'); }
}

async function toggleTask(rowId, currentDone, xp, title, cat) {
  try {
    await updateRow(rowId, { 'Done': nCheck(!currentDone) });
    if (!currentDone) await addXP(xp, title, cat);
    await renderTaskList('dashboard-tasks');
    await updateDashStats();
  } catch(e) { showToast('⚠️ Erreur Notion'); }
}

async function deleteTask(rowId) {
  try {
    await archiveRow(rowId);
    await renderTaskList('dashboard-tasks');
    await updateDashStats();
  } catch(e) { showToast('⚠️ Erreur Notion'); }
}
