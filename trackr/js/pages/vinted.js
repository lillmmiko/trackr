// ─────────────────────────────────────────────
// pages/vinted.js
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => renderVinted());

async function addVente() {
  const article = document.getElementById('vente-article').value.trim();
  const achat   = parseFloat(document.getElementById('vente-achat').value) || 0;
  const prix    = parseFloat(document.getElementById('vente-prix').value)  || 0;
  const note    = document.getElementById('vente-note').value.trim();
  if (!article) return;
  try {
    await createRow({
      'Titre':     nTitle(article),
      'Type':      nSelect('vente'),
      'Categorie': nSelect('vinted'),
      'Montant':   nNumber(prix),
      'Achat':     nNumber(achat),
      'Note':      nText(note),
      'Date':      nDate(new Date().toISOString()),
    });
    ['vente-article','vente-achat','vente-prix','vente-note'].forEach(id => document.getElementById(id).value = '');
    closeModal('modal-vente');
    await addXP(15, `Vente : ${article}`, 'vinted');
    await renderVinted();
  } catch(e) { showToast('⚠️ Erreur Notion'); }
}

async function deleteVente(rowId) {
  try { await archiveRow(rowId); await renderVinted(); }
  catch(e) { showToast('⚠️ Erreur Notion'); }
}

async function renderVinted() {
  showLoading('ventes-list');
  try {
    const rows         = await queryDB({ property: 'Type', select: { equals: 'vente' } });
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthRows    = rows.filter(r => new Date(gDate(r, 'Date')) >= firstOfMonth);
    const monthProfit  = monthRows.reduce((s, r) => s + (gNumber(r,'Montant') - gNumber(r,'Achat')), 0);
    const totalProfit  = rows.reduce((s, r)       => s + (gNumber(r,'Montant') - gNumber(r,'Achat')), 0);

    document.getElementById('v-profit').textContent     = monthProfit.toFixed(2) + '€';
    document.getElementById('v-profit-sub').textContent = `${monthRows.length} vente${monthRows.length > 1 ? 's' : ''} ce mois`;
    document.getElementById('v-total').textContent      = totalProfit.toFixed(2) + '€';

    if (!rows.length) { showEmpty('ventes-list', '💰', 'Aucune vente enregistrée<br>Lance-toi !'); return; }

    document.getElementById('ventes-list').innerHTML = rows.map(r => {
      const article = gTitle(r), achat = gNumber(r,'Achat'), prix = gNumber(r,'Montant');
      const note = gText(r,'Note'), profit = prix - achat;
      const d = new Date(gDate(r,'Date'));
      return `
        <div class="income-item">
          <div class="income-left">
            <div class="income-name">${article}</div>
            <div class="income-date">${d.toLocaleDateString('fr-FR')}${note ? ' · ' + note : ''}</div>
            <div class="income-profit">Acheté ${achat}€ → Vendu ${prix}€ = <strong>+${profit.toFixed(2)}€</strong></div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
            <div class="income-amount">${prix}€</div>
            <button class="btn btn-danger" onclick="deleteVente('${r.id}')">Supprimer</button>
          </div>
        </div>`;
    }).join('');
  } catch(e) { showEmpty('ventes-list', '⚠️', 'Erreur chargement Notion'); }
}
