// pages/journal.js
document.addEventListener('DOMContentLoaded', () => renderJournal());

async function renderJournal() {
  const body = document.getElementById('journal-body');
  try {
    const rows = await queryDB({ property: 'Type', select: { equals: 'xp_log' } });

    if (!rows.length) {
      body.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:32px;font-family:var(--font-mono);font-size:11px;color:var(--grey-400)">Aucune action enregistrée</td></tr>`;
      return;
    }

    body.innerHTML = rows.map(r => `
      <tr>
        <td style="font-family:var(--font-mono);color:var(--grey-400)">
          ${new Date(gDate(r,'Date')).toLocaleDateString('fr-FR')}
        </td>
        <td>${gTitle(r)}</td>
        <td><span class="cat-badge">${catLabel(gSelect(r,'Categorie'))}</span></td>
        <td style="font-family:var(--font-mono);font-weight:500">+${gNumber(r,'XP')}</td>
      </tr>`).join('');

  } catch(e) {
    body.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--grey-400)">⚠️ Erreur Notion</td></tr>`;
  }
}
