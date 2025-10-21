const apiBase = '';
const params = new URLSearchParams(window.location.search);
const token = params.get('token');
const form = document.getElementById('reset-form');
const msg = document.getElementById('msg');

if (!token) {
  msg.textContent = 'Lien invalide.';
} else {
  // validate token
  fetch(`${apiBase}/api/auth/validate-reset?token=${encodeURIComponent(token)}`).then(async (r)=>{
    if (!r.ok) msg.textContent = 'Lien expiré ou invalide.';
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const res = await fetch(`${apiBase}/api/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password: data.password }) });
  msg.textContent = res.ok ? 'Mot de passe mis à jour.' : 'Erreur';
});
