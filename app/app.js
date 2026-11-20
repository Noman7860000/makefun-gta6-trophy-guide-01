// Leonida Platinum — GTA VI trophy guide & tracker.
// Everything is local: the trophy list ships in data/trophies.json, progress lives in
// localStorage, and export/import move a JSON file between browsers. No network calls.
const KEY = 'gta6-trophy-checklist-v1';
const SPOILER_KEY = 'gta6-trophy-spoilers-v1';

const grid = document.getElementById('grid');
const searchEl = document.getElementById('search');
const sortEl = document.getElementById('sort');
const spoilerEl = document.getElementById('spoiler');
const filtersEl = document.getElementById('filters');
const shownEl = document.getElementById('shownCount');
const emptyEl = document.getElementById('empty');
const modal = document.getElementById('modal');

let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
let hideSpoilers = localStorage.getItem(SPOILER_KEY) !== 'off';
spoilerEl.checked = hideSpoilers;

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));
const byName = new Map(trophies.map((t) => [t.name, t]));

const FILTERS = [
  ['all', 'All'],
  ['platinum', 'Platinum'],
  ['gold', 'Gold'],
  ['silver', 'Silver'],
  ['bronze', 'Bronze'],
  ['missable', 'Missable'],
  ['story', 'Story'],
  ['side', 'Side'],
  ['collectible', 'Collectible'],
  ['earned', 'Earned'],
  ['remaining', 'Not earned'],
];
let activeFilter = 'all';

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned].sort()));
}
function saveSpoiler() {
  localStorage.setItem(SPOILER_KEY, hideSpoilers ? 'on' : 'off');
}
function isEarned(t) {
  return earned.has(t.name);
}
function toggleEarned(t) {
  if (isEarned(t)) earned.delete(t.name);
  else earned.add(t.name);
  save();
  render();
}
function gradeLabel(g) {
  return g[0].toUpperCase() + g.slice(1);
}
function spoilerHidden(t) {
  return hideSpoilers && t.story && !isEarned(t);
}

function matchesFilter(t) {
  switch (activeFilter) {
    case 'all': return true;
    case 'earned': return isEarned(t);
    case 'remaining': return !isEarned(t);
    case 'missable': return t.missable;
    case 'story': return t.story;
    case 'side': return t.kind === 'side';
    case 'collectible': return t.kind === 'collectible';
    default: return t.grade === activeFilter;
  }
}
function matchesSearch(t) {
  const q = searchEl.value.trim().toLowerCase();
  if (!q) return true;
  return (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q);
}
const GRADE_RANK = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
function sorted(list) {
  const arr = [...list];
  if (sortEl.value === 'grade') arr.sort((a, b) => GRADE_RANK[a.grade] - GRADE_RANK[b.grade] || a.id - b.id);
  else if (sortEl.value === 'name') arr.sort((a, b) => a.name.localeCompare(b.name));
  else arr.sort((a, b) => a.id - b.id);
  return arr;
}

function renderFilters() {
  filtersEl.replaceChildren();
  for (const [value, label] of FILTERS) {
    const count = value === 'all'
      ? trophies.length
      : trophies.filter((t) => {
          const keep = activeFilter;
          activeFilter = value;
          const ok = matchesFilter(t);
          activeFilter = keep;
          return ok;
        }).length;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (value === activeFilter ? ' active' : '');
    b.textContent = `${label} (${count})`;
    b.addEventListener('click', () => { activeFilter = value; render(); });
    filtersEl.append(b);
  }
}

function renderProgress() {
  const total = trophies.length;
  const done = trophies.filter(isEarned).length;
  const pct = Math.round((done / total) * 100);
  document.getElementById('progressPct').textContent = pct + '%';
  document.getElementById('progressCount').textContent = `${done} of ${total} earned`;
  const ring = document.getElementById('ringFg');
  ring.style.strokeDashoffset = String(251.2 * (1 - done / total));
  const counts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const gTotal = trophies.filter((t) => t.grade === g).length;
    const gDone = trophies.filter((t) => t.grade === g && isEarned(t)).length;
    return `<span class="gc ${g}">${gradeLabel(g)} ${gDone}/${gTotal}</span>`;
  }).join('');
  document.getElementById('gradeCounts').innerHTML = counts;
  const phase = (kind) => {
    const list = trophies.filter((t) => t.kind === kind || (kind === 'missable' && t.missable));
    const d = list.filter(isEarned).length;
    return `${d} / ${list.length}`;
  };
  document.getElementById('roadmapStory').textContent = phase('story');
  document.getElementById('roadmapMiss').textContent = phase('missable');
  document.getElementById('roadmapSide').textContent = phase('side');
  document.getElementById('roadmapColl').textContent = phase('collectible');
}

function renderGrid() {
  grid.replaceChildren();
  const list = sorted(trophies.filter((t) => matchesFilter(t) && matchesSearch(t)));
  shownEl.textContent = `Showing ${list.length} of ${trophies.length} trophies`;
  emptyEl.hidden = list.length > 0;
  for (const t of list) {
    const hidden = spoilerHidden(t);
    const card = document.createElement('article');
    card.className = 'card' + (isEarned(t) ? ' earned' : '') + (t.missable ? ' missable' : '');
    card.tabIndex = 0;
    const grade = document.createElement('span');
    grade.className = 'grade ' + t.grade;
    grade.textContent = t.grade === 'platinum' ? '★' : gradeLabel(t.grade);
    const name = document.createElement('h3');
    name.textContent = hidden ? 'Story trophy — hidden' : t.name;
    const desc = document.createElement('p');
    desc.className = 'desc';
    desc.textContent = hidden ? 'Spoilers are hidden until you earn it. Uncheck “Hide story spoilers” to see it.' : t.description;
    const tags = document.createElement('p');
    tags.className = 'tags';
    const tagBits = [gradeLabel(t.grade)];
    if (t.missable) tagBits.push('Missable');
    if (t.story) tagBits.push('Story');
    if (t.kind === 'collectible') tagBits.push('Collectible');
    tags.textContent = tagBits.join(' · ');
    const check = document.createElement('label');
    check.className = 'check';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = isEarned(t);
    box.setAttribute('aria-label', 'Earned: ' + t.name);
    box.addEventListener('change', (e) => { e.stopPropagation(); toggleEarned(t); });
    check.append(box, document.createTextNode(isEarned(t) ? 'Earned' : 'Mark earned'));
    card.append(grade, name, desc, tags, check);
    const open = () => openModal(t);
    card.addEventListener('click', (e) => { if (e.target !== box) open(); });
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    grid.append(card);
  }
}

function render() {
  renderFilters();
  renderProgress();
  renderGrid();
}

let modalTrophy = null;
function openModal(t) {
  modalTrophy = t;
  const hidden = spoilerHidden(t);
  document.getElementById('modalGrade').textContent = gradeLabel(t.grade) + (t.missable ? ' · Missable — do before the finale' : '');
  document.getElementById('modalName').textContent = hidden ? 'Story trophy — hidden' : t.name;
  document.getElementById('modalDesc').textContent = hidden
    ? 'This is a story trophy. Its name and description are hidden to avoid spoilers — earn it first, or turn off “Hide story spoilers”.'
    : t.description;
  document.getElementById('modalMeta').textContent =
    `Kind: ${t.kind} · Grade: ${gradeLabel(t.grade)}` + (t.missable ? ' · Missable' : ' · Not missable');
  document.getElementById('modalGuide').textContent = hidden ? 'Hidden with the spoiler.' : t.guide;
  const box = document.getElementById('modalEarned');
  box.checked = isEarned(t);
  modal.hidden = false;
}
function closeModal() {
  modal.hidden = true;
  modalTrophy = null;
}
document.getElementById('modalClose').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
document.getElementById('modalEarned').addEventListener('change', () => {
  if (modalTrophy) { toggleEarned(modalTrophy); openModal(modalTrophy); }
});

searchEl.addEventListener('input', renderGrid);
sortEl.addEventListener('change', renderGrid);
spoilerEl.addEventListener('change', () => {
  hideSpoilers = spoilerEl.checked;
  saveSpoiler();
  render();
});

document.getElementById('export').addEventListener('click', () => {
  const payload = { game: 'Grand Theft Auto VI', exported: new Date().toISOString(), earned: [...earned].sort() };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('bad file');
    const valid = names.filter((n) => byName.has(n));
    earned = new Set(valid);
    save();
    render();
  } catch {
    alert('That file is not a valid trophy-progress export.');
  }
  e.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies? This cannot be undone.')) {
    earned = new Set();
    save();
    render();
  }
});

render();
