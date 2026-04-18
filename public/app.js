const api = '';
const TOKEN_KEY = 'blog_jwt';

const $ = (sel) => document.querySelector(sel);

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(json = true) {
  const h = {};
  if (json) h['Content-Type'] = 'application/json';
  const t = getToken();
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

function updateAuthUi() {
  const loggedIn = !!getToken();
  $('#logout-btn').classList.toggle('hidden', !loggedIn);
  $('#login-form').classList.toggle('hidden', loggedIn);
  $('#register-form').classList.toggle('hidden', loggedIn);
  $('#comment-form-wrap').classList.toggle('hidden', !loggedIn);
  $('#comment-login-hint').classList.toggle('hidden', loggedIn);
}

function setStatus(msg) {
  $('#status').textContent = msg || '';
}

function renderListMessage(html) {
  $('#post-list').innerHTML = `<li class="callout">${html}</li>`;
}

function showList() {
  $('#list-view').classList.remove('hidden');
  $('#list-view').hidden = false;
  $('#detail-view').classList.add('hidden');
  $('#detail-view').hidden = true;
}

function showDetail() {
  $('#list-view').classList.add('hidden');
  $('#list-view').hidden = true;
  $('#detail-view').classList.remove('hidden');
  $('#detail-view').hidden = false;
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

let currentPostId = null;

async function loadList() {
  setStatus('Loading…');
  $('#post-list').innerHTML = '';

  if (window.location.protocol === 'file:') {
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<p class="banner">Serve this app from the API (<code>http://localhost:3000</code>), not as a local file.</p>'
    );
    setStatus('');
    return;
  }

  try {
    const res = await fetch(`${api}/posts`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    const posts = payload.data ?? [];

    if (posts.length === 0) {
      renderListMessage(
        '<p><strong>No published posts.</strong></p><p>Authors can add posts from <a href="/admin/">/admin/</a> or run <code>npm run db:seed</code>.</p>'
      );
      setStatus('');
      return;
    }

    const ul = $('#post-list');
    for (const post of posts) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      const title = document.createElement('span');
      title.textContent = post.title;
      const excerpt = document.createElement('span');
      excerpt.className = 'excerpt';
      const preview = (post.content || '').slice(0, 120);
      excerpt.textContent = preview + (post.content?.length > 120 ? '…' : '');
      btn.append(title, excerpt);
      btn.addEventListener('click', () => openPost(post.id));
      li.appendChild(btn);
      ul.appendChild(li);
    }
    setStatus('');
  } catch (e) {
    console.error(e);
    setStatus('');
    renderListMessage(
      `<p><strong>Could not load posts.</strong> (${String(e.message)})</p>`
    );
  }
}

async function openPost(id) {
  currentPostId = id;
  setStatus('Loading…');
  showDetail();

  try {
    const res = await fetch(`${api}/posts/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const post = await res.json();

    $('#detail-title').textContent = post.title;
    $('#detail-meta').textContent = `${post.author?.username ?? 'Author'} · ${formatDate(post.createdAt)}`;
    $('#detail-body').textContent = post.content ?? '';

    const commentsUl = $('#detail-comments');
    commentsUl.innerHTML = '';
    const list = post.comments ?? [];
    if (list.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No comments yet.';
      commentsUl.appendChild(li);
    } else {
      for (const c of list) {
        const li = document.createElement('li');
        const who = document.createElement('div');
        who.className = 'who';
        who.textContent = `${c.author?.username ?? 'User'} · ${formatDate(c.createdAt)}`;
        const text = document.createElement('div');
        text.textContent = c.text ?? '';
        li.append(who, text);
        commentsUl.appendChild(li);
      }
    }
    updateAuthUi();
    setStatus('');
  } catch (e) {
    console.error(e);
    setStatus('Could not load this post.');
  }
}

$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('#auth-status').textContent = '';
  const fd = new FormData(e.target);
  try {
    const res = await fetch(`${api}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: fd.get('email'), password: fd.get('password') }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      $('#auth-status').textContent = data.error || 'Login failed';
      return;
    }
    setToken(data.token);
    updateAuthUi();
    $('#auth-status').textContent = 'Logged in.';
    if (currentPostId) openPost(currentPostId);
  } catch (err) {
    $('#auth-status').textContent = 'Network error';
  }
});

$('#register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('#auth-status').textContent = '';
  const fd = new FormData(e.target);
  try {
    const res = await fetch(`${api}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: fd.get('username'),
        email: fd.get('email'),
        password: fd.get('password'),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      $('#auth-status').textContent = data.error || 'Register failed';
      return;
    }
    $('#auth-status').textContent = 'Registered — now log in.';
  } catch {
    $('#auth-status').textContent = 'Network error';
  }
});

$('#logout-btn').addEventListener('click', () => {
  setToken(null);
  updateAuthUi();
  $('#auth-status').textContent = 'Logged out.';
});

$('#comment-submit').addEventListener('click', async () => {
  if (!currentPostId || !getToken()) return;
  const text = $('#comment-text').value.trim();
  if (!text) return;
  const res = await fetch(`${api}/posts/${currentPostId}/comments`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    setStatus('Could not post comment.');
    return;
  }
  $('#comment-text').value = '';
  await openPost(currentPostId);
});

$('#back-btn').addEventListener('click', () => {
  showList();
  setStatus('');
  currentPostId = null;
});

$('#home-link').addEventListener('click', (e) => {
  e.preventDefault();
  showList();
  loadList();
});

updateAuthUi();
showList();
loadList();
