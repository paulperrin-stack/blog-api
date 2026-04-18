const api = '';
const TOKEN_KEY = 'blog_admin_jwt';

const $ = (sel) => document.querySelector(sel);

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

function authHeaders() {
  const t = getToken();
  const h = { 'Content-Type': 'application/json' };
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

function showLogin() {
  $('#login-panel').classList.remove('hidden');
  $('#dash-panel').classList.add('hidden');
}

function showDash() {
  $('#login-panel').classList.add('hidden');
  $('#dash-panel').classList.remove('hidden');
}

function setDashStatus(msg) {
  $('#dash-status').textContent = msg || '';
}

async function loadPosts() {
  setDashStatus('Loading…');
  const res = await fetch(`${api}/posts/all`, { headers: authHeaders() });
  if (res.status === 401) {
    setToken(null);
    showLogin();
    $('#login-error').textContent = 'Session expired.';
    return;
  }
  if (res.status === 403) {
    setDashStatus('This account is not an author (isAuthor).');
    $('#posts-body').innerHTML =
      '<tr><td colspan="3">Set isAuthor in the database or use the seed author.</td></tr>';
    return;
  }
  if (!res.ok) {
    setDashStatus(`Error ${res.status}`);
    return;
  }
  const posts = await res.json();
  const tbody = $('#posts-body');
  tbody.innerHTML = '';
  if (!posts.length) {
    tbody.innerHTML = '<tr><td colspan="3">No posts yet.</td></tr>';
    setDashStatus('');
    return;
  }
  for (const p of posts) {
    const tr = document.createElement('tr');
    const pub = p.published ? '<span class="badge on">Published</span>' : '<span class="badge off">Draft</span>';
    const label = p.published ? 'Unpublish' : 'Publish';
    tr.innerHTML = `<td>${escapeHtml(p.title)}</td><td>${pub}</td><td><button type="button" data-toggle>${label}</button></td>`;
    tr.querySelector('[data-toggle]').addEventListener('click', () =>
      togglePublished(p.id, !p.published)
    );
    tbody.appendChild(tr);
  }
  setDashStatus('');
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s ?? '';
  return d.innerHTML;
}

async function togglePublished(id, published) {
  setDashStatus('Saving…');
  const res = await fetch(`${api}/posts/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ published }),
  });
  if (!res.ok) {
    setDashStatus(`Update failed (${res.status})`);
    return;
  }
  await loadPosts();
}

$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('#login-error').textContent = '';
  const fd = new FormData(e.target);
  try {
    const res = await fetch(`${api}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: fd.get('email'), password: fd.get('password') }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      $('#login-error').textContent = err.error || 'Login failed';
      return;
    }
    const data = await res.json();
    setToken(data.token);
    showDash();
    await loadPosts();
  } catch {
    $('#login-error').textContent = 'Network error';
  }
});

$('#logout-btn').addEventListener('click', () => {
  setToken(null);
  showLogin();
});

$('#new-post-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  setDashStatus('Creating…');
  const fd = new FormData(e.target);
  const res = await fetch(`${api}/posts`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ title: fd.get('title'), content: fd.get('content') }),
  });
  if (res.status === 401) {
    setToken(null);
    showLogin();
    return;
  }
  if (!res.ok) {
    setDashStatus(`Create failed (${res.status})`);
    return;
  }
  e.target.reset();
  await loadPosts();
});

if (window.location.protocol === 'file:') {
  document.body.insertAdjacentHTML(
    'afterbegin',
    '<p class="card">Open <strong>http://localhost:3000/admin/</strong> with the server running.</p>'
  );
} else if (getToken()) {
  showDash();
  loadPosts();
} else {
  showLogin();
}
