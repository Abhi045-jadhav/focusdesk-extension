# FocusDesk – Study Timer (Chrome Extension)

FocusDesk is a Manifest V3 Chrome extension that gives students a Pomodoro-style study timer in the Chrome toolbar. It was built with the help of generative AI (Claude) as part of **Assignment No. 10: AI Pair Programming with Generative AI**, Program Elective – V (Prompt Engineering), Department of Information Technology, Walchand Institute of Technology, Solapur.

## Problem it solves

Students lose focus while studying online. FocusDesk helps them study in timed sessions with short breaks, and keeps a small task list so they know what to work on.

## Features

- Three modes: **Focus (25 min)**, **Short break (5 min)** and **Long break (15 min)**.
- Start, pause and reset controls.
- The timer keeps running when the popup is closed.
- The toolbar icon shows the minutes remaining as a badge.
- A desktop notification appears when a session ends.
- Counts the focus sessions completed today.
- Session task list: add, tick and delete tasks, saved with `chrome.storage.local`.
- Works offline. No backend or account is needed.

## Technologies

HTML5, CSS3, vanilla JavaScript, Chrome Extension Manifest V3 (`storage`, `alarms` and `notifications` permissions only).

## Project structure

```
focusdesk-extension/
├── manifest.json   # Manifest V3 configuration and permissions
├── popup.html      # popup interface
├── popup.css       # popup styling
├── popup.js        # timer controls, task list, session counter
├── background.js   # service worker: alarms, badge and notifications
├── icons/          # icon16.png, icon48.png, icon128.png
└── README.md
```

## How to install (Developer Mode)

1. Download or clone this repository.
2. Open Google Chrome and go to `chrome://extensions/`.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked**.
5. Select the folder that contains `manifest.json`.
6. Click the puzzle-piece icon in the toolbar and pin **FocusDesk**.
7. Click the FocusDesk icon, choose a mode and press **Start**.

## How it works

- `popup.js` stores the timer's end time and state in `chrome.storage.local`, so the time stays correct after the popup is closed and reopened.
- `background.js` is a service worker that uses `chrome.alarms` to finish the session, update the badge every 30 seconds and show a notification.
- Task text is added with `textContent`, so anything typed cannot inject HTML.

## Testing

| Test | Expected result | Status |
|------|-----------------|--------|
| Click Start | Timer counts down and the button shows Pause | Pass |
| Click Pause, then Start | Timer resumes from the remaining time | Pass |
| Switch to Break or Long mode | Timer resets to 5 or 15 minutes | Pass |
| Close and reopen the popup while running | Timer shows the correct remaining time | Pass |
| Add, tick and delete tasks | List updates and is saved | Pass |
| Session ends | Notification appears and the session count increases | Pass |

## How AI was used

- **Design:** suggested the feature set, the required permissions and the popup layout.
- **Coding:** generated `manifest.json`, the popup files and the background service worker.
- **Debugging:** the timer first reset when the popup closed. It was fixed by storing an end timestamp and using `chrome.alarms`.
- **Improvement:** added the badge countdown, notification, daily session counter and safe task rendering.

All AI-generated code was tested and edited before submission.

## Future enhancements

- Custom focus and break lengths.
- A weekly statistics chart.
- Sound alert and a website blocker during focus sessions.

## Author

Abhinav Jadhav – Department of Information Technology, Walchand Institute of Technology, Solapur
