# Setup Guide — Day Zero

This walks you from "empty folder" to "three running scaffolds" — no application code yet, just the bones. After this, open `REBUILD_GUIDE.md` and start at the build order.

---

## What you'll have at the end

- An empty Git repo on a `rebuild` branch.
- `api/` — Express + Prisma installed, every auth dep installed, `GET /health` responds with JSON.
- `public-site/` — React + Vite, React Router installed, default Vite page loads.
- `admin-site/` — React + Vite, React Router + TinyMCE installed, default Vite page loads.
- Three `npm run dev` commands, three ports, all working.

You will **not** have any feature code. That's deliberate — the rebuild guide covers that.

---

## Prerequisites

Check each one in your terminal:

```bash
node -v     # need v22.6 or higher
npm -v      # any recent version
git --version
```

If Node is too old, install **nvm** (Node Version Manager) and run `nvm install 22 && nvm use 22`. Don't fight your system Node.

You also need a code editor. VS Code is the default; anything works.

---

## Step 0 — Initialize the repo

```bash
mkdir blog-api && cd blog-api
git init
git checkout -b rebuild
```

Working on `rebuild` from the start means you don't accidentally commit junk to `main` while scaffolding.

Create `.gitignore` at the root:

```gitignore
# dependencies
node_modules/

# environment
.env
.env.local
.env.*.local

# build output
dist/
build/

# databases
*.db
*.db-journal

# editor / OS
.DS_Store
.vscode/
.idea/

# logs
npm-debug.log*
*.log
```

This single `.gitignore` at the root covers all three apps.

Create a one-line `README.md`:

```markdown
# Blog API

Three apps: `api/` (REST API), `public-site/` (reader), `admin-site/` (author dashboard).
```

First commit:

```bash
git add .
git commit -m "chore: initial commit with gitignore and readme"
```

---

## Step 1 — API

```bash
mkdir api && cd api
npm init -y
```

Open `api/package.json` and edit two fields:

```json
{
  "name": "blog-api",
  "version": "1.0.0",
  "type": "module",
  "main": "src/server.js"
}
```

`"type": "module"` lets you use `import`/`export` instead of `require`. Modern, less typing, what every tutorial uses now.

### Install runtime dependencies

```bash
npm install express cors dotenv \
  @prisma/client \
  bcryptjs jsonwebtoken \
  passport passport-local passport-jwt \
  express-validator \
  helmet morgan express-rate-limit
```

What each one is for:

**express** — the HTTP framework. Routing, middleware, body parsing. The whole reason this app exists.

**cors** — middleware that adds the `Access-Control-Allow-*` headers. Your React frontends will run on different ports (5173, 5174) than the API (3000). Without CORS, the browser blocks the requests.

**dotenv** — reads a `.env` file into `process.env`. You need it for `JWT_SECRET`, `DATABASE_URL`, etc. (Modern Node has `--env-file` built in, but `dotenv` is what every tutorial uses; stick with the convention.)

**@prisma/client** — the runtime library your code imports to query the database. It's generated from your schema by the Prisma CLI.

**bcryptjs** — pure-JavaScript bcrypt for password hashing. There's a faster `bcrypt` package that uses a native binding, but it fails to install on some systems. `bcryptjs` always works.

**jsonwebtoken** — signs and verifies JWTs. Two functions you'll use: `jwt.sign(payload, secret, options)` and `jwt.verify(token, secret)`.

**passport** — authentication framework. By itself it doesn't do anything; you plug "strategies" into it.

**passport-local** — the strategy that verifies email + password. Used once, by your `POST /auth/login` route.

**passport-jwt** — the strategy that verifies the `Authorization: Bearer <token>` header. Used as middleware on every protected route.

**express-validator** — validation middleware. You write rules like `body('email').isEmail()`, attach them as middleware before your controller, and either the request was valid or you bail with a 400. Alternative: `zod`. Pick one and don't switch.

**helmet** — sets a bundle of security-related HTTP headers. One line in your `app.js`, real protection. Don't skip it.

**morgan** — logs every incoming request to the console. Useful in development; you'll see exactly which requests hit your server when you click around the frontend.

**express-rate-limit** — limits how many requests an IP can make per window. Apply it to `/auth/login` and `/auth/register` so someone can't brute-force passwords.

### Install dev dependencies

```bash
npm install -D prisma nodemon
```

**prisma** — the command-line tool. Runs migrations, generates `@prisma/client`, opens Prisma Studio (a web UI to browse your DB).

**nodemon** — auto-restarts the Node process when a file changes. (Modern Node has `node --watch` that does the same thing — feel free to use that and drop nodemon if you want one less dep.)

### Add scripts to `api/package.json`

```json
"scripts": {
  "dev": "nodemon src/server.js",
  "start": "node src/server.js",
  "db:migrate": "prisma migrate dev",
  "db:generate": "prisma generate",
  "db:seed": "node prisma/seed.js",
  "db:studio": "prisma studio"
}
```

You'll use `npm run dev` constantly. The others come up at specific moments (creating migrations, seeding the DB).

### Initialize Prisma

```bash
npx prisma init --datasource-provider sqlite
```

This creates `prisma/schema.prisma` and a `.env` file. SQLite is perfect for local development — no separate database to install. When you deploy, you'll switch the provider to `postgresql` and update the connection string.

Edit `api/.env`:

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="paste-a-real-32-byte-hex-here"
PORT=3000
```

Generate a real JWT secret (do not ship the placeholder):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output into `JWT_SECRET`.

### Create the folder structure

```bash
mkdir -p src/{config,controllers,services,middleware,routes,validators,utils}
touch src/server.js src/app.js
```

What each folder is for (you'll fill them in during the rebuild):

- `config/` — Passport setup, Prisma client export, env loader.
- `controllers/` — read `req`, call a service, write `res`. Thin.
- `services/` — actual business logic and Prisma calls. Where the work happens.
- `middleware/` — `requireAuth`, `requireAuthor`, error handler.
- `routes/` — wires routes to middleware and controllers. No logic.
- `validators/` — express-validator rule chains.
- `utils/` — small helpers (custom error classes, etc.).

### Verify the API starts

Write the smallest possible `src/server.js` and `src/app.js` to prove the scaffold works. This is *not* your real code — just a smoke test.

`src/app.js`:

```js
import express from 'express';

const app = express();
app.use(express.json());
app.get('/health', (req, res) => res.json({ ok: true }));

export default app;
```

`src/server.js`:

```js
import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
```

Run it:

```bash
npm run dev
```

Open `http://localhost:3000/health` in a browser. You should see `{"ok":true}`. Stop it with Ctrl+C.

### Commit

```bash
cd ..
git add api .gitignore
git commit -m "chore(api): scaffold express api with prisma and auth dependencies"
```

---

## Step 2 — Public site

```bash
npm create vite@latest public-site -- --template react
cd public-site
npm install
```

`npm create vite@latest` runs the Vite scaffolder, which asks (or in our case, is told via `--template react`) what kind of project to make. The `--` is npm syntax for "everything after this goes to the underlying command, not to npm".

When this finishes you have a working React + Vite app. Try `npm run dev` and visit `http://localhost:5173` to see the default page.

### Install additional dependencies

```bash
npm install react-router-dom dompurify
```

**react-router-dom** — client-side routing. `<BrowserRouter>`, `<Routes>`, `<Route>`, `<Link>`, `useNavigate`, `useParams` — the five things you'll use. Read their tutorial; it's short.

**dompurify** — sanitizes HTML before you render it. The admin will write posts in TinyMCE, which produces HTML. This site will render that HTML with `dangerouslySetInnerHTML`. If you ever forget to sanitize, you have an XSS hole. Always pipe TinyMCE output through DOMPurify before rendering.

### Add an env file

Create `public-site/.env`:

```
VITE_API_URL=http://localhost:3000
```

The `VITE_` prefix is mandatory. Vite refuses to expose env vars to the browser unless they start with `VITE_`. (This is a feature — it stops you from accidentally leaking a server secret into your bundle.)

In your code you'll read it as `import.meta.env.VITE_API_URL`.

### Verify

```bash
npm run dev
```

Default page loads at `http://localhost:5173`. Stop it.

### Commit

```bash
cd ..
git add public-site
git commit -m "chore: scaffold public-site with vite, react-router, and dompurify"
```

---

## Step 3 — Admin site

Same shape as public-site, plus the editor.

```bash
npm create vite@latest admin-site -- --template react
cd admin-site
npm install
npm install react-router-dom dompurify @tinymce/tinymce-react
```

**@tinymce/tinymce-react** — the TinyMCE editor wrapped as a React component. By default it loads the editor's JS from TinyMCE's CDN, which is why you need an API key.

### Get a TinyMCE API key

1. Go to `https://www.tiny.cloud/`.
2. Sign up (free).
3. Copy the API key from your dashboard.

The free tier allows tens of thousands of editor loads per month. You will not hit the limit on a learning project.

### Add an env file

Create `admin-site/.env`:

```
VITE_API_URL=http://localhost:3000
VITE_TINYMCE_API_KEY=paste-your-key-here
```

### Vite port note

If both frontends are running, the second one will get port 5174 automatically. You can pin them in each `vite.config.js` if you want stable ports:

```js
// admin-site/vite.config.js
export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
});
```

### Verify

```bash
npm run dev
```

Default page loads. Stop it.

### Commit

```bash
cd ..
git add admin-site
git commit -m "chore: scaffold admin-site with vite, react-router, and tinymce"
```

---

## Final layout

```
blog-api/
├── api/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── validators/
│   │   ├── utils/
│   │   ├── app.js          (smoke-test version, will be rewritten)
│   │   └── server.js
│   ├── .env                (gitignored)
│   ├── package.json
│   └── package-lock.json
├── public-site/
│   ├── src/
│   ├── index.html
│   ├── vite.config.js
│   ├── .env                (gitignored)
│   └── package.json
├── admin-site/
│   ├── src/
│   ├── index.html
│   ├── vite.config.js
│   ├── .env                (gitignored)
│   └── package.json
├── .gitignore
├── README.md
└── REBUILD_GUIDE.md        (your reference)
```

Three independent `package.json` files, three independent `node_modules/`. They're not workspaces; they're just three folders that happen to share a Git repo.

---

## Running all three at once

In three separate terminal tabs:

```bash
# Terminal 1
cd api && npm run dev

# Terminal 2
cd public-site && npm run dev

# Terminal 3
cd admin-site && npm run dev
```

You'll have:

- `http://localhost:3000` — API
- `http://localhost:5173` — public site
- `http://localhost:5174` — admin site (if pinned)

If three terminals annoys you, install `concurrently` at the root and add a script. But honestly, three tabs is fine and you'll see each app's output separately, which helps when something breaks.

---

## Common gotchas

**"Cannot use import statement outside a module"** — you forgot `"type": "module"` in `api/package.json`.

**`process.env.JWT_SECRET` is undefined** — you forgot to import `'dotenv/config'` at the very top of `server.js`. It must run before anything reads env vars.

**CORS error in the browser console** — your API's CORS config doesn't include the frontend's origin. In `app.js`, configure cors with `{ origin: 'http://localhost:5173' }` (or read it from env). Wildcard `*` works for simple GET requests but breaks once you send `Authorization` headers.

**"Vite env var is undefined"** — you forgot the `VITE_` prefix, or you're reading it as `process.env.X` instead of `import.meta.env.X`.

**Prisma "no migration" error** — you edited `schema.prisma` but didn't run `npm run db:migrate -- --name describe_change`. Migrations are explicit; Prisma won't auto-apply schema edits.

**Port already in use** — something is already on 3000 or 5173. Kill it (`lsof -i :3000` then `kill <PID>`) or change the port in `.env` / `vite.config.js`.

**TinyMCE shows "This domain is not registered"** — the API key is wrong, missing, or for a different domain. Free keys work on `localhost` automatically; check the spelling in `.env`.

---

## What's next

Push the rebuild branch to GitHub:

```bash
git remote add origin <your-repo-url>
git push -u origin rebuild
```

Then open `REBUILD_GUIDE.md` and start at **§8 — Recommended build order, Step 1**. The scaffold is done; the actual project starts there.

Take your time. This is meant to be slow.