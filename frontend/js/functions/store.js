/* ------------------------------------------------------------------
   store.js — in-memory chat state for the session.
   Keeps a list of chats; each chat holds its messages.
------------------------------------------------------------------ */

let chats = [];
let activeId = null;
let seq = 0;

const uid = () => `c${Date.now().toString(36)}${(seq++).toString(36)}`;

/** Seed a few example conversations so the sidebar isn't empty. */
export function seed() {
  chats = [
    { id: uid(), title: "Ideas for a birthday gift", messages: [] },
    { id: uid(), title: "Explain quantum computing", messages: [] },
    { id: uid(), title: "Healthy 15-minute dinners", messages: [] },
  ];
}

export function getChats() { return chats; }
export function getActive() { return chats.find((c) => c.id === activeId) || null; }
export function getActiveId() { return activeId; }
export function setActive(id) { activeId = id; }

export function createChat() {
  const chat = { id: uid(), title: "New chat", messages: [] };
  chats.unshift(chat);
  activeId = chat.id;
  return chat;
}

export function deleteChat(id) {
  chats = chats.filter((c) => c.id !== id);
  if (activeId === id) activeId = null;
}

export function addMessage(chatId, role, text) {
  const chat = chats.find((c) => c.id === chatId);
  if (!chat) return;
  chat.messages.push({ role, text });
}

export function renameIfFirst(chatId, title) {
  const chat = chats.find((c) => c.id === chatId);
  if (chat && (chat.title === "New chat" || !chat.title)) chat.title = title;
}

export function search(query) {
  const q = query.trim().toLowerCase();
  if (!q) return chats;
  return chats.filter((c) => c.title.toLowerCase().includes(q));
}
