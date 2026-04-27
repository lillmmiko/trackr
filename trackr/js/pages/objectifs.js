// pages/objectifs.js
document.addEventListener('DOMContentLoaded', () => renderObjectifs());

async function addObjectif() {
  const title    = document.getElementById('obj-title').value.trim();
  const desc     = document.getElementById('obj-desc').value.trim();
  const deadline = document.getElementById('obj-deadline').value;
  const cat      = document.getElementById('obj-cat').value;
  if (!title) return;
  try {
    await createRow({
      'Titre':     nTitle(title),
      'Type':      nSelect('objectif'),
      'Categorie': nSelect(cat),
      'Note':      nText(desc),
      'Done':      nCheck(false),
      'Date':      deadline ? nDate(deadline) : nDate(new Date().toISOString()),
    });
    ['obj-title','obj-desc','obj-deadline'].forEach(id => document.getElementById(id).value = '');
    closeModal('modal-obj');
    await addXP(10, `Objectif posé : ${title}`, 'objectifs');
    await renderObjectifs();
  } catch(e) { showToast('⚠️ Erreur Notion'); }
}

async function toggleObjectif(rowId, currentDone, title) {
  try {
    await updateRow(rowId, { 'Done': nCheck(!currentDone) });
    if (!currentDone) await addXP(50, `Objectif atteint : ${title}`, 'objectifs');
    await renderObjectifs();
  } catch(e) { showToast('⚠️ Erreur Notion'); }
}

async function deleteObjectif(rowId) {
  try { await archiveRow(rowId); await renderObjectifs(); }
  catch(e) { showToast('⚠️ Erreur Notion'); }
}

async function renderObjectifs() {
  showLoading('objectifs-list');
  try {
    const rows = await queryDB({ property: 'Type', select: { equals: 'objectif' } });
    const el   = document.getElementById('objectifs-list');
    if (!rows.length) { showEmpty('objectifs-list', '🎯', 'Aucun objectif posé<br>Définis ta vision !'); return; }
    el.innerHTML = rows.map(r => {
      const title    = gTitle(r), cat = gSelect(r,'Categorie'), desc = gText(r,'Note');
      const done     = gCheck(r,'Done'), deadline = gDate(r,'Date');
      const daysLeft = deadline ? Math.ceil((new Date(deadline) - new Date()) / 86400000) : null;
      return `
        <div class="obj-card" style="${done ? 'opacity:0.5' : ''}">
          <div class="obj-header">
            <div>
              <div class="obj-title" style="${done ? 'text-decoration:line-through' : ''}">${title}</div>
              <div class="obj-deadline">
                ${deadline ? `Deadline : ${new Date(deadline).toLocaleDateString('fr-FR')} ${daysLeft !== null && daysLeft >= 0 ? `(${daysLeft}j restants)` : '(passée)'}` : 'Pas de deadline'}
              </div>
            </div>
            <span class="cat-badge">${catLabel(cat)}</span>
          </div>
          ${desc ? `<div class="obj-desc">${desc}</div>` : ''}
          <div style="display:flex;gap:8px;margin-top:12px">
            <button class="btn btn-ghost" style="font-size:11px;padding:6px 14px" onclick="toggleObjectif('${r.id}',${done},'${title.replace(/'/g,"\\'")}')">
              ${done ? 'Réouvrir' : '✓ Marquer atteint (+50 XP)'}
            </button>
            <button class="btn btn-danger" onclick="deleteObjectif('${r.id}')">Supprimer</button>
          </div>
        </div>`;
    }).join('');
  } catch(e) { showEmpty('objectifs-list', '⚠️', 'Erreur chargement Notion'); }
}
