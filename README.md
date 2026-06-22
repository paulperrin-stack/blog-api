# blog-api

Headless blog REST API with JWT authentication, role-based access control, and separate reader and author CMS frontends.

## Live

| App | URL |
| --- | --- |
| API | https://blog-api-kbq0.onrender.com |
| Reader | https://blog-api-sigma-ten.vercel.app |
| CMS | https://blog-api-cms-three.vercel.app |

> First request to the API may take ~30s to wake from sleep (Render free tier).

## Screenshots

![Reader](./docs/screenshot-reader.png)
![CMS](./docs/screenshot-cms.png)
![API](./docs/screenshot-postman.png)

## Stack

**Backend:** Node.js · Express · PostgreSQL (Neon) · Prisma · JWT · Passport.js · bcrypt  
**Frontend:** React 19 · Vite · React Router v7 · TinyMCE (rich text editor in CMS)

## Features

- JWT authentication with role-based access control (author vs reader)
- Authors can create, update, publish/unpublish, and delete posts via the CMS
- Readers can browse published posts and leave comments
- Authors can moderate and delete comments
- Rich text editing via TinyMCE integration
- Separate frontends for public readers and authenticated authors
- RESTful API design with consistent error responses

## Structure

```
blog-api/
├── api/      # Express REST API + Prisma + PostgreSQL
├── reader/   # Public blog frontend (React)
└── cms/      # Author dashboard (React + TinyMCE)
```

## API Endpoints

### Auth

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | /auth/signup | — | Create account |
| POST | /auth/login | — | Returns JWT token |

### Posts

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | /posts | — | All published posts |
| GET | /posts/:id | — | Single post with comments |
| POST | /posts | Author | Create post |
| PUT | /posts/:id | Author | Update post |
| DELETE | /posts/:id | Author | Delete post |

### Comments

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | /posts/:id/comments | — | All comments on a post |
| POST | /posts/:id/comments | User | Add a comment |
| DELETE | /posts/:id/comments/:id | Author | Delete a comment |

## Run locally

```bash
git clone https://github.com/paulperrin-stack/blog-api
cd blog-api/api
cp .env.example .env   # add your DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

The API will be available at `http://localhost:3000`.

To run the frontends:

```bash
# Reader
cd ../reader && npm install && npm run dev

# CMS
cd ../cms && npm install && npm run dev
```

## Environment variables

See `api/.env.example` for required variables.

```
DATABASE_URL=
JWT_SECRET=
PORT=
```

## Demo credentials

A seeded author account is available for testing the CMS:

```
username: admin
password: password
```

> These are for demo purposes only.