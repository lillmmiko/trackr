// ─────────────────────────────────────────────
// shared.js — Utilitaires partagés (modals, DOM, labels)
// ─────────────────────────────────────────────

function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

function showLoading(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<div style="padding:24px;text-align:center;font-family:var(--font-mono);font-size:11px;color:var(--grey-400)">Chargement…</div>`;
}

function showEmpty(id, icon, msg) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<div class="empty-state"><div class="empty-icon">${icon}</div>${msg}</div>`;
}

function catLabel(cat) {
  return {
    vinted:        '💰 Vinted',
    apprentissage: '📚 Apprentissage',
    objectifs:     '🎯 Objectifs',
    routine:       '⏰ Routine',
    humeur:        '🧠 Humeur',
    autre:         '◈ Autre',
  }[cat] || cat;
}

// Ferme les modals en cliquant en dehors
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(o => {
    o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
  });

  // Date dans le header
  const now     = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const headerDate = document.getElementById('header-date');
  if (headerDate) headerDate.textContent = dateStr;
  const dashSub = document.getElementById('dashboard-date-sub');
  if (dashSub) dashSub.textContent = dateStr.toUpperCase();

  // Lien actif dans la sidebar
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(link => {
    if (link.getAttribute('href') === page) link.classList.add('active');
  });

  // Init XP + streak
  updateStreak();
  refreshXPUI();
});
