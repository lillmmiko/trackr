// pages/routine.js
const DEFAULT_HABITS = [
  { id: 'h1', name: 'Boire 1.5L eau',          icon: '💧', xp: 5  },
  { id: 'h2', name: 'Lire 20 min',              icon: '📖', xp: 5  },
  { id: 'h3', name: 'Pas de réseaux avant 10h', icon: '📵', xp: 10 },
  { id: 'h4', name: 'Code / apprentissage',      icon: '💻', xp: 10 },
];

function getHabits()         { return LC.get('habits', DEFAULT_HABITS); }
function setHabits(habits)   { LC.set('habits', habits); }

document.addEventListener('DOMContentLoaded', () => renderRoutine());

function addHabit() {
  const name = document.getElementById('habit-name').value.trim();
  const icon = document.getElementById('habit-icon').value.trim() || '✦';
  const xp   = parseInt(document.getElementById('habit-xp').value);
  if (!name) return;
  const habits = getHabits();
  habits.push({ id: 'h' + Date.now(), name, icon, xp });
  setHabits(habits);
  document.getElementById('habit-name').value = '';
  document.getElementById('habit-icon').value = '';
  closeModal('modal-habit');
  renderRoutine();
}

function deleteHabit(id) {
  setHabits(getHabits().filter(h => h.id !== id));
  renderRoutine();
}

async function toggleHabit(id) {
  const today   = new Date().toDateString();
  const done    = LC.get('habits_done', {});
  if (!done[today]) done[today] = {};
  const habit   = getHabits().find(h => h.id === id);
  if (!habit) return;

  if (done[today][id]) {
    // décoche
    delete done[today][id];
    LC.set('habits_done', done);
    renderRoutine();
  } else {
    // coche + XP
    done[today][id] = true;
    LC.set('habits_done', done);
    renderRoutine();
    await addXP(habit.xp, `Habitude : ${habit.name}`, 'routine');
  }
}

function renderRoutine() {
  const habits = getHabits();
  const today  = new Date().toDateString();
  const done   = LC.get('habits_done', {})[today] || {};

  // Grille du jour
  document.getElementById('routine-grid').innerHTML = habits.map(h => `
    <div class="routine-item ${done[h.id] ? 'checked' : ''}" onclick="toggleHabit('${h.id}')">
      <div class="routine-icon">${h.icon}</div>
      <div class="routine-label">${h.name}</div>
      <div class="routine-xp">+${h.xp} XP</div>
    </div>`).join('');

  // Liste de gestion
  document.getElementById('habits-manage').innerHTML = habits.length
    ? habits.map(h => `
        <div class="income-item">
          <div class="income-left">
            <div class="income-name">${h.icon} ${h.name}</div>
            <div class="income-date">+${h.xp} XP par jour</div>
          </div>
          <button class="btn btn-danger" onclick="deleteHabit('${h.id}')">Supprimer</button>
        </div>`).join('')
    : `<div class="empty-state"><div class="empty-icon">⏰</div>Aucune habitude créée</div>`;
}
