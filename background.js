// Service worker: keeps the timer alive when the popup is closed.
const MODES = { focus: 25, short: 5, long: 15 };

async function setBadge(endTime) {
  if (!endTime) { chrome.action.setBadgeText({ text: '' }); return; }
  const mins = Math.max(0, Math.ceil((endTime - Date.now()) / 60000));
  chrome.action.setBadgeText({ text: String(mins) });
  chrome.action.setBadgeBackgroundColor({ color: '#0f766e' });
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'start') {
    chrome.alarms.create('done', { when: msg.endTime });
    chrome.alarms.create('tick', { periodInMinutes: 0.5 });
    setBadge(msg.endTime);
  } else if (msg.type === 'stop') {
    chrome.alarms.clear('done'); chrome.alarms.clear('tick'); setBadge(null);
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  const { state } = await chrome.storage.local.get('state');
  if (!state || !state.endTime) return;
  if (alarm.name === 'tick') return setBadge(state.endTime);
  if (alarm.name === 'done') {
    const wasFocus = state.mode === 'focus';
    const today = new Date().toDateString();
    const stats = (await chrome.storage.local.get('stats')).stats || {};
    if (wasFocus) { stats[today] = (stats[today] || 0) + 1; await chrome.storage.local.set({ stats }); }
    await chrome.storage.local.set({ state: { mode: state.mode, endTime: null, remaining: MODES[state.mode] * 60 } });
    chrome.alarms.clear('tick'); setBadge(null);
    chrome.notifications.create({
      type: 'basic', iconUrl: 'icons/icon128.png',
      title: wasFocus ? 'Focus session complete' : 'Break is over',
      message: wasFocus ? 'Nice work. Take a short break.' : 'Ready for the next focus session?'
    });
  }
});
