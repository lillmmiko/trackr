// ─────────────────────────────────────────────
// pages/apprentissage.js
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => renderApprentissage());

async function renderApprentissage() {
  try {
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const rows = await queryDB({ and: [
      { property: 'Type',      select: { equals: 'task'          } },
      { property: 'Categorie', select: { equals: 'apprentissage' } },
      { property: 'Date',      date:   { on_or_after: firstOfMonth.toISOString() } },
    ]});
    const done = rows.filter(r => gCheck(r, 'Done'));
    document.getElementById('a-sessions').textContent = done.length;
    document.getElementById('a-heures').textContent   = done.length + 'h';
  } catch(e) {}

  await renderTaskList('apprentissage-tasks');
}

async function renderTaskList(containerId) {
  showLoading(containerId);
  try {
    const today = new Date().toISOString().split('T')[0];
    const rows  = await queryDB({ and: [
      { property: 'Type',      select: { equals: 'task'          } },
      { property: 'Categorie', select: { equals: 'apprentissage' } },
      { property: 'Date',      date:   { on_or_after: today      } },
      { property: 'Date',      date:   { on_or_before: today + 'T23:59:59Z' } },
    ]});
    const el = document.getElementById(containerId);
    if (!rows.length) { showEmpty(containerId, '📚', 'Aucune tâche aujourd\'hui<br>Ajoute-en une !'); return; }

    el.innerHTML = rows.map(r => {
      const title = gTitle(r), xp = gNumber(r,'XP'), done = gCheck(r,'Done');
      return `
        <div class="task-item ${done ? 'done' : ''}">
          <div class="task-check" onclick="toggleTask('${r.id}',${done},${xp},'${title.replace(/'/g,"\\'")}')">
            ${done ? '✓' : ''}
          </div>
          <div class="task-content">
            <div class="task-title">${title}</div>
            <div class="task-meta">📚 Apprentissage</div>
          </div>
          <div class="task-xp">+${xp} XP</div>
          <button class="btn btn-danger" onclick="deleteTask('${r.id}')">✕</button>
        </div>`;
    }).join('');
  } catch(e) { showEmpty(containerId, '⚠️', 'Erreur chargement Notion'); }
}

async function addTask() {
  const title = document.getElementById('task-title-input').value.trim();
  const xp    = parseInt(document.getElementById('task-xp-input').value);
  if (!title) return;
  try {
    await createRow({
      'Titre':     nTitle(title),
      'Type':      nSelect('task'),
      'Categorie': nSelect('apprentissage'),
      'XP':        nNumber(xp),
      'Done':      nCheck(false),
      'Date':      nDate(new Date().toISOString()),
    });
    document.getElementById('task-title-input').value = '';
    closeModal('modal-task');
    await renderApprentissage();
  } catch(e) { showToast('⚠️ Erreur Notion'); }
}

async function toggleTask(rowId, currentDone, xp, title) {
  try {
    await updateRow(rowId, { 'Done': nCheck(!currentDone) });
    if (!currentDone) await addXP(xp, title, 'apprentissage');
    await renderApprentissage();
  } catch(e) { showToast('⚠️ Erreur Notion'); }
}

async function deleteTask(rowId) {
  try { await archiveRow(rowId); await renderApprentissage(); }
  catch(e) { showToast('⚠️ Erreur Notion'); }
}
