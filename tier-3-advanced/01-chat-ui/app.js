// app.js — Phase 1 scaffold: DOM refs and sidebar toggle wired up
// You will fill this in phase by phase

// ── DOM REFS ──────────────────────────────────────────────────

// Layout
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarClose = document.getElementById('sidebar-close');

// Sidebar content
const newChatBtn = document.getElementById('new-chat-btn');
const convList = document.getElementById('conv-list');

// Chat area
const messagesWrap = document.getElementById('messages-wrap');
const messagesEl = document.getElementById('messages');
const welcomeState = document.getElementById('welcome-state');
const topbarTitle = document.getElementById('topbar-title');
const clearChatBtn = document.getElementById('clear-chat-btn');

// Input bar
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const charCount = document.getElementById('char-count');

// ── SIDEBAR TOGGLE (Phase 1 — already works) ──────────────────
function openSidebar() {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('visible');
  sidebarOverlay.style.display = 'block';
  sidebarToggle.setAttribute('aria-expanded', 'true');
}

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('visible');
  setTimeout(() => { sidebarOverlay.style.display = 'none'; }, 220);
  sidebarToggle.setAttribute('aria-expanded', 'false');
}

sidebarToggle.addEventListener('click', openSidebar);
sidebarClose.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

// Close sidebar on ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && sidebar.classList.contains('open')) closeSidebar();
});

// ── SUGGESTION CHIPS (Phase 1) ────────────────────────────────
document.querySelectorAll('.suggestion-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    messageInput.value = chip.textContent.trim().replace(/^.{2}\s/, ''); // strip emoji
    messageInput.dispatchEvent(new Event('input'));
    messageInput.focus();
  });
});

// ── TEXTAREA AUTO-RESIZE + CHAR COUNT (Phase 2) ───────────────
messageInput.addEventListener('input', () => {
  // Auto-resize
  messageInput.style.height = 'auto';
  messageInput.style.height = messageInput.scrollHeight + 'px';

  // Enable/disable send button
  const hasContent = messageInput.value.trim().length > 0;
  sendBtn.disabled = !hasContent;

  // Character count (show only when > 3500)
  const len = messageInput.value.length;
  const max = 4000;
  if (len > 3500) {
    charCount.textContent = `${len}/${max}`;
    charCount.className = 'input-bar__char-count ' + (len >= max ? 'at-limit' : 'near-limit');
  } else {
    charCount.textContent = '';
    charCount.className = 'input-bar__char-count';
  }
});

// ── YOUR JS STARTS HERE ───────────────────────────────────────
// Phase 2: sendMessage(), renderMessage(), typing indicator
// Phase 3: callGemini() with real API
// Phase 4: multi-conversation state + localStorage
// Phase 5: markdown rendering, copy button, polish