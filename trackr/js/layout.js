// ─────────────────────────────────────────────
// layout.js — Injecte le header + sidebar partagés
// ─────────────────────────────────────────────

const SIDEBAR_HTML = `
<header>
  <div class="header-left">
    <div class="logo">MEI.</div>
    <div class="header-date" id="header-date"></div>
  </div>
  <div class="xp-widget">
    <div class="xp-level-label" id="xp-level-label">LVL 1 — DÉBUTANTE</div>
    <div class="xp-bar-wrap">
      <div class="xp-bar-fill" id="xp-bar-fill" style="width:0%"></div>
    </div>
    <div class="xp-numbers" id="xp-numbers">0 / 100 XP</div>
  </div>
</header>

<nav class="sidebar">
  <div class="sidebar-section-label">Navigation</div>
  <a class="nav-item" href="index.html"><span class="nav-icon">◈</span> Dashboard</a>
  <a class="nav-item" href="vinted.html"><span class="nav-icon">💰</span> Vinted / Income</a>
  <a class="nav-item" href="apprentissage.html"><span class="nav-icon">📚</span> Apprentissage</a>
  <a class="nav-item" href="objectifs.html"><span class="nav-icon">🎯</span> Objectifs</a>
  <a class="nav-item" href="humeur.html"><span class="nav-icon">🧠</span> Humeur</a>
  <a class="nav-item" href="routine.html"><span class="nav-icon">⏰</span> Routine</a>
  <div class="sidebar-divider"></div>
  <div class="sidebar-section-label">Stats</div>
  <a class="nav-item" href="progression.html"><span class="nav-icon">📈</span> Progression</a>
  <a class="nav-item" href="journal.html"><span class="nav-icon">📋</span> Journal XP</a>
  <div class="streak-badge">
    <div class="streak-title">🔥 Streak</div>
    <div class="streak-count" id="streak-count">0</div>
    <div class="streak-sub">jours consécutifs</div>
  </div>
</nav>`;

// Injecte le layout au chargement
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (app) app.insertAdjacentHTML('afterbegin', SIDEBAR_HTML);
});
