// ─────────────────────────────────────────────
// xp.js — Système XP, niveaux, toast, streak
// ─────────────────────────────────────────────

const LEVELS = [
  { level: 1,  name: 'Débutante',    xp: 0    },
  { level: 2,  name: 'En route',     xp: 100  },
  { level: 3,  name: 'En mouvement', xp: 250  },
  { level: 4,  name: 'Déterminée',   xp: 500  },
  { level: 5,  name: 'Momentum',     xp: 900  },
  { level: 6,  name: 'Slay queen',   xp: 1500 },
  { level: 7,  name: 'Self-made',    xp: 2200 },
  { level: 8,  name: 'Unstoppable',  xp: 3000 },
  { level: 9,  name: 'Iconic',       xp: 4000 },
  { level: 10, name: '★ LEGEND ★',  xp: 5500 },
];

// Retourne les infos de niveau pour un total d'XP donné
function getLevelInfo(totalXP) {
  let current = LEVELS[0], next = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].xp) {
      current = LEVELS[i];
      next    = LEVELS[i + 1] || null;
      break;
    }
  }
  const xpInLevel = totalXP - current.xp;
  const xpNeeded  = next ? next.xp - current.xp : 9999;
  const pct       = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
  return { current, next, xpInLevel, xpNeeded, pct };
}

// Récupère le total XP depuis Notion
async function getTotalXP() {
  const rows = await queryDB({ property: 'Type', select: { equals: 'xp_state' } });
  return rows[0] ? gNumber(rows[0], 'Montant') : 0;
}

// Ajoute de l'XP + log dans Notion
async function addXP(amount, reason, category = 'autre') {
  try {
    // 1. Mise à jour compteur global
    const xpRows   = await queryDB({ property: 'Type', select: { equals: 'xp_state' } });
    const currentXP = xpRows[0] ? gNumber(xpRows[0], 'Montant') : 0;
    const newXP     = currentXP + amount;

    if (xpRows[0]) {
      await updateRow(xpRows[0].id, { 'Montant': nNumber(newXP) });
    } else {
      await createRow({ 'Titre': nTitle('XP Total'), 'Type': nSelect('xp_state'), 'Montant': nNumber(newXP) });
    }

    // 2. Log de l'action (1 ligne = 1 action dans Notion)
    await createRow({
      'Titre':     nTitle(reason),
      'Type':      nSelect('xp_log'),
      'Categorie': nSelect(category),
      'XP':        nNumber(amount),
      'Date':      nDate(new Date().toISOString()),
    });

    // 3. XP par catégorie
    const catRows = await queryDB({ and: [
      { property: 'Type',      select: { equals: 'cat_xp'  } },
      { property: 'Categorie', select: { equals: category  } },
    ]});
    if (catRows[0]) {
      await updateRow(catRows[0].id, { 'Montant': nNumber(gNumber(catRows[0], 'Montant') + amount) });
    } else {
      await createRow({ 'Titre': nTitle(`XP ${category}`), 'Type': nSelect('cat_xp'), 'Categorie': nSelect(category), 'Montant': nNumber(amount) });
    }

    // 4. Level up check + toast
    const before = getLevelInfo(currentXP), after = getLevelInfo(newXP);
    if (after.current.level > before.current.level) {
      showToast(`🎉 LEVEL UP ! Niveau ${after.current.level} — ${after.current.name}`);
    } else {
      showToast(`+${amount} XP — ${reason}`);
    }

    await refreshXPUI();
    updateStreak();
  } catch(e) {
    console.error('addXP:', e);
    showToast('⚠️ Erreur Notion — vérifie ta connexion');
  }
}

// Met à jour tous les éléments XP dans le DOM
async function refreshXPUI() {
  const totalXP = await getTotalXP();
  const info    = getLevelInfo(totalXP);

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setStyle = (id, prop, val) => { const el = document.getElementById(id); if (el) el.style[prop] = val; };

  setStyle('xp-bar-fill',   'width',    info.pct + '%');
  set('xp-level-label', `LVL ${info.current.level} — ${info.current.name.toUpperCase()}`);
  set('xp-numbers',     `${info.xpInLevel} / ${info.xpNeeded} XP`);
  set('dash-xp',        totalXP);
  set('dash-level',     `Niveau ${info.current.level} — ${info.current.name}`);
  set('prog-level',     info.current.level);
  set('prog-level-name', info.current.name);
  set('prog-xp-needed', info.next ? (info.xpNeeded - info.xpInLevel) : '—');
}

// Toast de notification
function showToast(msg) {
  const t = document.getElementById('xp-toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── Streak (localStorage) ──
const LC = {
  get: (k, d) => { try { const v = localStorage.getItem('mei_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem('mei_' + k, JSON.stringify(v)); } catch {} },
};

function updateStreak() {
  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const s         = LC.get('streak', { last: null, count: 0 });

  if (s.last === today) {
    // déjà compté aujourd'hui
  } else if (s.last === yesterday) {
    s.count++; s.last = today; LC.set('streak', s);
  } else {
    s.count = 1; s.last = today; LC.set('streak', s);
  }

  const el = document.getElementById('streak-count');
  if (el) el.textContent = s.count;
}
