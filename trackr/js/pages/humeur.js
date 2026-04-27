// pages/humeur.js
const MOOD_EMOJIS = { 1:'😩', 2:'😔', 3:'😐', 4:'🙂', 5:'✨' };
const MOOD_NAMES  = { 1:'Crash', 2:'Pas top', 3:'Moyen', 4:'Bien', 5:'On slay' };
let selectedMood  = null;

document.addEventListener('DOMContentLoaded', () => renderHumeur());

function selectMood(score, btn) {
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedMood = score;
}

async function saveMood() {
  if (!selectedMood) { showToast('Sélectionne une humeur !'); return; }
  const note = document.getElementById('mood-note').value.trim();
  try {
    await createRow({
      'Titre':     nTitle(`Humeur : ${MOOD_NAMES[selectedMood]}`),
      'Type':      nSelect('mood'),
      'Categorie': nSelect('humeur'),
      'XP':        nNumber(selectedMood),
      'Note':      nText(note),
      'Date':      nDate(new Date().toISOString()),
    });
    document.getElementById('mood-note').value = '';
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    selectedMood = null;
    await addXP(5, 'Check-in humeur', 'humeur');
    await renderHumeur();
  } catch(e) { showToast('⚠️ Erreur Notion'); }
}

async function renderHumeur() {
  showLoading('mood-history');
  try {
    const rows = await queryDB({ property: 'Type', select: { equals: 'mood' } });
    const el   = document.getElementById('mood-history');
    if (!rows.length) { showEmpty('mood-history', '🧠', 'Pas encore de check-ins'); return; }
    el.innerHTML = rows.slice(0, 10).map(r => {
      const score = gNumber(r,'XP'), note = gText(r,'Note'), date = gDate(r,'Date');
      return `
        <div class="income-item">
          <div class="income-left">
            <div class="income-name">${MOOD_EMOJIS[score] || '😐'} ${MOOD_NAMES[score] || '—'}</div>
            <div class="income-date">
              ${new Date(date).toLocaleDateString('fr-FR')} à ${new Date(date).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
            </div>
            ${note ? `<div class="income-profit">${note}</div>` : ''}
          </div>
        </div>`;
    }).join('');
  } catch(e) { showEmpty('mood-history', '⚠️', 'Erreur chargement Notion'); }
}
