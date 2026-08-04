# 01 — DevLinks 🔗

> Your personal developer link-in-bio tool.
> Add, manage and share all your dev profile links in one place.

## 🎯 What I Built
A clean link management tool where you can add, delete,
reorder and copy your developer profile links.
Data persists via localStorage — links survive page refresh.

## 🧠 JS Concepts Used
- DOM manipulation — createElement, querySelector, innerHTML
- Event handling — click, submit, input events
- localStorage — save and load links
- Clipboard API — one-click copy
- Builder Pattern — link object construction
- Observer Pattern — UI updates on state change

## ✨ Features
- [ ] Add new link (title + URL)
- [ ] Delete link
- [ ] Copy link to clipboard
- [ ] Persist links on refresh
- [ ] Validate URL format
- [ ] Empty state message

## 🚀 How to Run
1. Clone the repo
2. Open `index.html` in browser
3. No build step needed — pure HTML/CSS/JS

## 📸 Screenshot
![DevLinks Screenshot](./screenshot.png)

## 🔗 Live Demo
[View Live](#) ← deploy to GitHub Pages

## 📁 File Structure
\`\`\`
01-devlinks/
├── index.html      ← structure
├── style.css       ← styling
├── app.js          ← all logic
└── README.md       ← this file
\`\`\`

## 💡 What I Learned
- How DOM manipulation works under the hood
- Why localStorage requires JSON.stringify/parse
- How Clipboard API requires async/await
- Builder pattern for clean object creation

<!-- ? data rendering pattern -->
<!-- 
Load Data

↓

Render UI

↓

Wait for User

↓

User changes data

↓

Save Data

↓

Render UI again 
-->