// pages/progression.js
document.addEventListener('DOMContentLoaded', () => renderProgression());

async function renderProgression() {
  try {
    const [catRows, totalXP] = await Promise.all([
      queryDB({ property: 'Type', select: { equals: 'cat_xp' } }),
      getTotalXP(),
    ]);

    // XP par catégorie
    const cats = [
      { key: 'vinted',        label: '💰 Vinted / Income' },
      { key: 'apprentissage', label: '📚 Apprentissage'   },
      { key: 'objectifs',     label: '🎯 Objectifs'       },
      { key: 'humeur',        label: '🧠 Humeur'          },
      { key: 'routine',       label: '⏰ Routine'         },
    ];

    const xpByCat = {};
    catRows.forEach(r => { xpByCat[gSelect(r, 'Categorie')] = gNumber(r, 'Montant'); });
    const maxXP = Math.max(...cats.map(c => xpByCat[c.key] || 0), 1);

    document.getElementById('cat-progress').innerHTML = cats.map(c => {
      const xp  = xpByCat[c.key] || 0;
      const pct = Math.round((xp / maxXP) * 100);
      return `
        <div class="progress-wrap">
          <div class="progress-label"><span>${c.label}</span><span>${xp} XP</span></div>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        </div>`;
    }).join('');

    // Paliers
    document.getElementById('levels-list').innerHTML = LEVELS.map(l => {
      const reached = totalXP >= l.xp;
      return `
        <div class="income-item" style="${reached ? '' : 'opacity:0.4'}">
          <div class="income-left">
            <div class="income-name">${reached ? '✓' : '○'} Niveau ${l.level} — ${l.name}</div>
            <div class="income-date">${l.xp} XP requis</div>
          </div>
          ${reached ? '<span style="font-family:var(--font-mono);font-size:10px;color:var(--grey-400)">DÉBLOQUÉ</span>' : ''}
        </div>`;
    }).join('');

  } catch(e) { showToast('⚠️ Erreur chargement progression'); }
}
