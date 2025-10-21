const apiBase = '';
let authToken = null;
const views = {
  chat: document.getElementById('view-chat'),
  emails: document.getElementById('view-emails'),
  strategies: document.getElementById('view-strategies'),
  plan: document.getElementById('view-plan'),
  stats: document.getElementById('view-stats'),
  settings: document.getElementById('view-settings')
};

// Router
const navButtons = document.querySelectorAll('.sidebar [data-route]');
navButtons.forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.route)));
function showView(key) {
  Object.values(views).forEach(v => v.classList.remove('active'));
  views[key].classList.add('active');
  persistCurrentModule();
  restoreModule(key);
}

// Theme switcher with premium gating
const themeSelect = document.getElementById('theme');
const premiumThemes = new Set(['light-green','light-purple']);
function applyTheme(theme) { document.documentElement.setAttribute('data-theme', theme); }
const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme); themeSelect.value = savedTheme;

themeSelect.addEventListener('change', () => {
  const t = themeSelect.value;
  if (premiumThemes.has(t) && !window.__isPremium) {
    alert('Thème réservé aux comptes Premium.');
    themeSelect.value = savedTheme;
    return;
  }
  localStorage.setItem('theme', t);
  applyTheme(t);
});

// Auth minimal state
const authStatus = document.getElementById('auth-status');
function setAuth(user) {
  window.__user = user;
  window.__isPremium = !!user?.is_premium;
  authStatus.textContent = user ? `${user.email} ${user.is_premium ? '• Premium' : ''}` : 'Non connecté';
  authToken = user?.token || null;
}
setAuth(null);

// Chat Typewriter
const chat = document.getElementById('chat');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const speedSelect = document.getElementById('typewriter-speed');

function getSpeedMs() {
  const v = speedSelect.value;
  if (v === 'fast') return 10;
  if (v === 'slow') return 40;
  return 20; // normal
}

function appendBubble(text, role) {
  const div = document.createElement('div');
  div.className = `bubble ${role}`;
  div.textContent = '';
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}

async function typewriter(el, text) {
  el.textContent = '';
  const speed = getSpeedMs();
  for (let i = 0; i < text.length; i++) {
    el.textContent += text[i];
    if (i % 3 === 0) await new Promise(r => setTimeout(r, speed));
  }
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const prompt = chatInput.value.trim();
  if (!prompt) return;
  chatInput.value = '';
  const userBubble = appendBubble(prompt, 'user');
  const aiBubble = appendBubble('…', 'ai');

  // Simulated response for now
  const fake = `Réponse IA à: ${prompt}`;
  await typewriter(aiBubble, fake);

  // Save to local history
  pushHistory('chat', { prompt, response: fake });
});

// Persistence per module
function keyFor(module) { return `mm:${module}`; }
function currentModule() {
  if (views.chat.classList.contains('active')) return 'chat';
  if (views.emails.classList.contains('active')) return 'emails';
  if (views.strategies.classList.contains('active')) return 'strategies';
  if (views.plan.classList.contains('active')) return 'plan';
  if (views.stats.classList.contains('active')) return 'stats';
  return 'settings';
}

function persistCurrentModule() {
  const mod = currentModule();
  if (mod === 'chat') {
    // chat is evented only
  } else {
    const editor = document.getElementById(`${mod}-editor`);
    if (editor) localStorage.setItem(keyFor(mod), JSON.stringify({ content: editor.value, t: Date.now() }));
  }
}

function restoreModule(mod) {
  if (mod === 'chat') return;
  const editor = document.getElementById(`${mod}-editor`);
  if (!editor) return;
  const raw = localStorage.getItem(keyFor(mod));
  if (raw) {
    try { editor.value = JSON.parse(raw).content || ''; } catch {}
  }
}

['emails','strategies','plan'].forEach(mod => {
  const editor = document.getElementById(`${mod}-editor`);
  editor?.addEventListener('input', () => persistCurrentModule());
  restoreModule(mod);
});

// Premium-only sync
async function pushHistory(module, content) {
  try {
    if (!window.__isPremium) return;
    await fetch(`${apiBase}/api/histories`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
      body: JSON.stringify({ module, content })
    });
  } catch {}
}

// Settings actions
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(loginForm));
  const res = await fetch(`${apiBase}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (res.ok) setAuth(await res.json()); else alert('Login échoué');
});

document.getElementById('btn-register').addEventListener('click', async () => {
  const email = prompt('Email?');
  const password = prompt('Mot de passe?');
  if (!email || !password) return;
  const res = await fetch(`${apiBase}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  if (res.ok) alert('Compte créé'); else alert('Erreur création compte');
});

document.getElementById('btn-reset').addEventListener('click', async () => {
  const email = prompt('Email du compte?');
  if (!email) return;
  await fetch(`${apiBase}/api/auth/request-password-reset`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
  alert('Si le compte existe, un email a été envoyé.');
});

document.getElementById('btn-upgrade').addEventListener('click', async () => {
  const res = await fetch(`${apiBase}/create-checkout-session`, { method: 'POST', headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} });
  const { url } = await res.json();
  if (url) window.location.href = url; else alert('Erreur paiement');
});
