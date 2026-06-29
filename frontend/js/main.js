/* ==================================================================
   main.js — wires the UI together using document events.
   Pure JS modules. No frameworks, no libraries.
   ================================================================== */

import { getReply, makeTitle } from "./functions/responses.js";
import { ICONS } from "./functions/icons.js";
import * as store from "./functions/store.js";

/* ---------- element lookup ---------- */
const $ = (sel) => document.querySelector(sel);

const app          = $("#app");
const sidebar      = $("#sidebar");
const view         = $("#view");
const welcome      = $("#welcome");
const thread       = $("#thread");
const chatList     = $("#chatList");
const chatsEmpty   = $("#chatsEmpty");
const searchInput  = $("#searchInput");
const composerForm = $("#composerForm");
const composerInput= $("#composerInput");
const sendBtn      = $("#sendBtn");
const topbarTitle  = $("#topbarTitle");
const accountMenu  = $("#accountMenu");
const themeLabel   = $("#themeLabel");
const toast        = $("#toast");

const USER_AVATAR = "assets/images/user-avatar.png";
const BOT_AVATAR  = "assets/images/lumi-logo.png";

/* ---------- helpers ---------- */
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  requestAnimationFrame(() => toast.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => (toast.hidden = true), 300);
  }, 2200);
}

function autoGrow() {
  composerInput.style.height = "auto";
  composerInput.style.height = Math.min(composerInput.scrollHeight, 180) + "px";
}

function scrollToBottom() {
  view.scrollTop = view.scrollHeight;
}

/* ---------- rendering: sidebar ---------- */
function renderChats(filter = "") {
  const list = store.search(filter);
  chatList.innerHTML = "";
  chatsEmpty.hidden = list.length > 0;

  for (const chat of list) {
    const li = document.createElement("li");
    li.className = "chat-item" + (chat.id === store.getActiveId() ? " active" : "");
    li.dataset.id = chat.id;
    li.innerHTML = `
      <span class="chat-item__dot" aria-hidden="true"></span>
      <span class="chat-item__title">${escapeHTML(chat.title)}</span>
      <button class="chat-item__del" data-del="${chat.id}" aria-label="Delete chat">${ICONS.trash}</button>
    `;
    chatList.appendChild(li);
  }
}

/* ---------- rendering: messages ---------- */
function showThread(show) {
  welcome.hidden = show;
  thread.hidden = !show;
}

function appendMessage(role, text) {
  const isUser = role === "user";
  const msg = document.createElement("div");
  msg.className = `msg ${isUser ? "user" : "bot"}`;
  msg.innerHTML = `
    <div class="msg__avatar"><img src="${isUser ? USER_AVATAR : BOT_AVATAR}" alt="${isUser ? "You" : "Lumi"}" /></div>
    <div class="msg__col">
      <span class="msg__name">${isUser ? "You" : "Lumi"}</span>
      <div class="msg__bubble">${escapeHTML(text)}</div>
    </div>`;
  thread.appendChild(msg);
  scrollToBottom();
  return msg;
}

function appendTyping() {
  const msg = document.createElement("div");
  msg.className = "msg bot";
  msg.dataset.typing = "1";
  msg.innerHTML = `
    <div class="msg__avatar"><img src="${BOT_AVATAR}" alt="Lumi" /></div>
    <div class="msg__col">
      <span class="msg__name">Lumi</span>
      <div class="msg__bubble"><span class="typing"><span></span><span></span><span></span></span></div>
    </div>`;
  thread.appendChild(msg);
  scrollToBottom();
  return msg;
}

function renderActiveThread() {
  const chat = store.getActive();
  thread.innerHTML = "";
  if (!chat || chat.messages.length === 0) {
    showThread(false);
    topbarTitle.textContent = "Lumi";
    return;
  }
  showThread(true);
  topbarTitle.textContent = chat.title;
  for (const m of chat.messages) appendMessage(m.role, m.text);
}

/* ---------- conversation flow ---------- */
function sendMessage(text) {
  const content = text.trim();
  if (!content) return;

  // ensure there is an active chat
  let chat = store.getActive();
  if (!chat) {
    chat = store.createChat();
    renderChats(searchInput.value);
  }

  // user message
  store.addMessage(chat.id, "user", content);
  store.renameIfFirst(chat.id, makeTitle(content));
  showThread(true);
  topbarTitle.textContent = store.getActive().title;
  appendMessage("user", content);
  renderChats(searchInput.value);

  // reset composer
  composerInput.value = "";
  autoGrow();
  toggleSend();

  // bot "thinking" then reply
  const typingEl = appendTyping();
  const delay = 650 + Math.random() * 700;
  setTimeout(() => {
    const reply = getReply(content);
    typingEl.remove();
    store.addMessage(chat.id, "bot", reply);
    appendMessage("bot", reply);
  }, delay);
}

function toggleSend() {
  sendBtn.disabled = composerInput.value.trim().length === 0;
}

/* ---------- sidebar / layout ---------- */
const isMobile = () => window.matchMedia("(max-width: 820px)").matches;

function toggleSidebar() {
  if (isMobile()) {
    app.classList.toggle("sidebar-open");
  } else {
    app.classList.toggle("collapsed");
  }
}
function closeMobileSidebar() { app.classList.remove("sidebar-open"); }

/* ---------- theme ---------- */
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeLabel.textContent = theme === "dark" ? "Switch to light" : "Switch to dark";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#0e1116" : "#faf7f2");
}
function toggleTheme() {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  setTheme(next);
}

/* ==================================================================
   EVENT WIRING — everything goes through document-level events.
   ================================================================== */

// Centralised click handler (event delegation on the whole document).
document.addEventListener("click", (e) => {
  const target = e.target;

  // sidebar collapse / mobile menu
  if (target.closest("#sidebarToggle") || target.closest("#menuBtn")) {
    toggleSidebar();
    return;
  }
  if (target.closest("#scrim")) { closeMobileSidebar(); return; }

  // new chat
  if (target.closest("#newChatBtn")) {
    store.createChat();
    renderChats(searchInput.value);
    renderActiveThread();
    composerInput.focus();
    if (isMobile()) closeMobileSidebar();
    return;
  }

  // theme toggles (topbar + account menu)
  if (target.closest("#themeBtn") || target.closest('[data-action="theme"]')) {
    toggleTheme();
    accountMenu.hidden = true;
    return;
  }

  // suggestion cards
  const suggestion = target.closest(".suggestion");
  if (suggestion) { sendMessage(suggestion.dataset.prompt); return; }

  // delete a chat
  const del = target.closest("[data-del]");
  if (del) {
    e.stopPropagation();
    const id = del.dataset.del;
    const wasActive = id === store.getActiveId();
    store.deleteChat(id);
    renderChats(searchInput.value);
    if (wasActive) renderActiveThread();
    showToast("Chat deleted");
    return;
  }

  // select a chat
  const item = target.closest(".chat-item");
  if (item) {
    store.setActive(item.dataset.id);
    renderChats(searchInput.value);
    renderActiveThread();
    if (isMobile()) closeMobileSidebar();
    return;
  }

  // account menu open/close
  if (target.closest("#accountBtn")) {
    accountMenu.hidden = !accountMenu.hidden;
    return;
  }
  if (!target.closest("#accountMenu")) accountMenu.hidden = true;

  // account menu actions
  const action = target.closest("[data-action]")?.dataset.action;
  if (action === "settings") showToast("Settings aren't wired up in this demo ✨");
  if (action === "signout")  showToast("See you soon! 👋");
});

// Submit composer
composerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage(composerInput.value);
});

// Composer typing: auto-grow + enable send + Enter to send
composerInput.addEventListener("input", () => { autoGrow(); toggleSend(); });
composerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage(composerInput.value);
  }
});

// Live search
searchInput.addEventListener("input", () => renderChats(searchInput.value));

// Escape closes menus / mobile sidebar
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    accountMenu.hidden = true;
    closeMobileSidebar();
  }
});

// Reset transient mobile state on resize
window.addEventListener("resize", () => {
  if (!isMobile()) app.classList.remove("sidebar-open");
});

/* ---------- boot ---------- */
function init() {
  setTheme("dark");
  store.seed();
  renderChats();
  renderActiveThread();
  toggleSend();
  composerInput.focus();
}

document.addEventListener("DOMContentLoaded", init);
