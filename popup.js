const MODES = { focus: 25, short: 5, long: 15 };
const $ = s => document.querySelector(s);
let state = { mode: 'focus', endTime: null, remaining: 1500 };
let tasks = [], tick = null;

const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
const left = () => state.endTime ? Math.max(0, Math.round((state.endTime - Date.now()) / 1000)) : state.remaining;

function render() {
  $('#time').textContent = fmt(left());
  $('#toggle').textContent = state.endTime ? 'Pause' : 'Start';
  document.querySelectorAll('.modes button').forEach(b => b.classList.toggle('on', b.dataset.mode === state.mode));
}
async function save() { await chrome.storage.local.set({ state }); }

function loop() {
  clearInterval(tick);
  tick = setInterval(async () => {
    if (state.endTime && left() <= 0) {           // finished while popup was open
      const s = (await chrome.storage.local.get('state')).state;
      if (s) state = s;
      loadStats();
    }
    render();
  }, 500);
}

$('#toggle').onclick = async () => {
  if (state.endTime) {                              // pause
    state.remaining = left(); state.endTime = null;
    chrome.runtime.sendMessage({ type: 'stop' });
  } else {                                          // start / resume
    state.endTime = Date.now() + state.remaining * 1000;
    chrome.runtime.sendMessage({ type: 'start', endTime: state.endTime });
  }
  await save(); render();
};
$('#reset').onclick = async () => {
  state = { mode: state.mode, endTime: null, remaining: MODES[state.mode] * 60 };
  chrome.runtime.sendMessage({ type: 'stop' }); await save(); render();
};
document.querySelectorAll('.modes button').forEach(b => b.onclick = async () => {
  state = { mode: b.dataset.mode, endTime: null, remaining: MODES[b.dataset.mode] * 60 };
  chrome.runtime.sendMessage({ type: 'stop' }); await save(); render();
});

async function loadStats() {
  const stats = (await chrome.storage.local.get('stats')).stats || {};
  $('#stats').textContent = 'Sessions today: ' + (stats[new Date().toDateString()] || 0);
}

// ----- tasks -----
function renderTasks() {
  const ul = $('#tasks'); ul.innerHTML = '';
  tasks.forEach((t, i) => {
    const li = document.createElement('li'); if (t.done) li.className = 'done';
    const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = t.done;
    cb.onchange = () => { tasks[i].done = cb.checked; saveTasks(); };
    const sp = document.createElement('span'); sp.textContent = t.text;   // textContent avoids HTML injection
    const del = document.createElement('button'); del.textContent = '×'; del.title = 'Delete';
    del.onclick = () => { tasks.splice(i, 1); saveTasks(); };
    li.append(cb, sp, del); ul.append(li);
  });
}
function saveTasks() { chrome.storage.local.set({ tasks }); renderTasks(); }
$('#taskForm').onsubmit = e => {
  e.preventDefault(); const v = $('#task').value.trim(); if (!v) return;
  tasks.push({ text: v, done: false }); $('#task').value = ''; saveTasks();
};

(async () => {
  const d = await chrome.storage.local.get(['state', 'tasks']);
  if (d.state) state = d.state;
  tasks = d.tasks || [];
  renderTasks(); loadStats(); render(); loop();
})();
