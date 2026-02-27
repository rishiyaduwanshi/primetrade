# PrimeTrade — Scalable REST API with Authentication & RBAC

A full-stack application built for the **Backend Developer Intern assignment**. Features JWT authentication, role-based access control (RBAC), Task CRUD APIs with Zod validation, Swagger documentation, React frontend, and Docker deployment.

---

## 🔗 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | https://primetrade.flyo.cc |
| **Swagger API Docs** | https://primetrade.flyo.cc/api-docs |
| **GitHub Repo** | https://github.com/rishiyaduwanshi/primetrade |

> **Note:** The backend server is not directly exposed. All traffic routes through Nginx — `/api/v1/*` and `/api-docs` are proxied to the Express server; `/` serves the React frontend. Swagger's "Try it out" works fully via this proxy.

---

## Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Backend | Node.js 22, Express v5, MongoDB Atlas (Mongoose 8) |
| Auth | JWT (access + refresh tokens), bcryptjs, httpOnly cookies |
| Validation | Zod v4 — schema-based, returns `422` with field-level errors |
| Docs | Swagger UI (swagger-jsdoc + swagger-ui-express) |
| Frontend | React 19, Vite 7, Tailwind CSS v4, React Router v7 |
| Logging | Winston + Morgan (rotating file transport) |
| Rate Limiting | express-rate-limit (global + per-IP) |
| Deployment | Docker + Docker Compose + Nginx reverse proxy |

---

## Project Structure

```
prime-trade/
├── client/          # React + Vite frontend
│   └── src/
│       ├── api/     # Axios API helpers
│       ├── context/ # AuthContext
│       ├── pages/   # Login, Register, Dashboard, Admin
│       └── components/
└── server/          # Express backend
    ├── config/      # CORS, cookies, Swagger, env
    ├── db/          # MongoDB connection
    └── src/
        ├── controllers/
        ├── middlewares/  # auth, validate, error
        ├── models/
        ├── routes/
        └── utils/
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm (`npm i -g pnpm`)
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
git clone https://github.com/rishiyaduwanshi/primetrade.git
cd prime-trade

# Install server deps
cd server && pnpm install

# Install client deps
cd ../client && pnpm install
```

### 2. Configure Environment

Create `server/.env.dev` (copy from `server/.env.eg`):

```env
PORT=5050
NODE_ENV=development
APP_URL=http://localhost:5050
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRY=1d
JWT_REFRESH_SECRET=<your-refresh-secret>
JWT_REFRESH_EXPIRY=7d
ALLOWED_ORIGINS=http://localhost:5173
GLOBAL_RATE_LIMIT_MAX=1000
PER_IP_RATE_LIMIT_MAX=100
```

### 3. Run the Server

```bash
cd server
NODE_ENV=development node server.js
```

Server starts at **http://localhost:5050**

### 4. Run the Frontend

```bash
cd client
pnpm dev
```

Frontend starts at **http://localhost:5173**

---

## API Documentation

- **Local:** http://localhost:5050/api-docs
- **Live:** https://primetrade.flyo.cc/api-docs

---

## API Endpoints

### Auth  (`/api/v1/auth`)

| Method | Endpoint        | Auth  | Description              |
|--------|-----------------|-------|--------------------------|
| POST   | `/signup`       | —     | Register a new user       |
| POST   | `/login`        | —     | Login, set JWT cookies    |
| POST   | `/refresh-token`| —     | Refresh access token      |
| POST   | `/logout`       | ✓     | Clear auth cookies        |

### Tasks  (`/api/v1/tasks`)

| Method | Endpoint            | Auth  | Role  | Description               |
|--------|---------------------|-------|-------|---------------------------|
| GET    | `/`                 | ✓     | any   | List tasks (paginated, filtered) |
| POST   | `/`                 | ✓     | any   | Create task               |
| GET    | `/:id`              | ✓     | any   | Get single task           |
| PUT    | `/:id`              | ✓     | any   | Update task               |
| DELETE | `/:id`              | ✓     | any   | Delete task               |
| GET    | `/admin/stats`      | ✓     | admin | Task statistics           |

### Admin  (`/api/v1/admin`)

| Method | Endpoint              | Auth  | Role  | Description       |
|--------|-----------------------|-------|-------|-------------------|
| GET    | `/users`              | ✓     | admin | List all users    |
| PATCH  | `/users/:id/role`     | ✓     | admin | Update user role  |
| DELETE | `/users/:id`          | ✓     | admin | Delete user       |

---

## Features

- **JWT Auth** — Access token (1d) + Refresh token (7d) in httpOnly cookies; silent auto-refresh via Axios interceptor
- **RBAC** — `user` / `admin` roles; `authorize()` middleware on all admin routes
- **Zod Validation** — All request bodies validated before controllers run; returns `422` with field-level error array
- **Task CRUD** — Paginated, filterable by status/priority, owner-scoped; admins see all tasks
- **Admin Panel** — List users, toggle roles, delete users (UI + API)
- **Admin Seed** — Auto-creates admin on server start from `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars
- **Rate Limiting** — Global (1000 req/window) + per-IP (100 req/window)
- **Logging** — HTTP logs via Morgan, app logs via Winston with daily rotation
- **Swagger Docs** — Full OpenAPI 3.0 spec with cookie auth, all schemas documented

---

## Docker

```bash
# Build and start both services
docker-compose up --build
```

Server: http://localhost:5050  
Client: http://localhost:5173

---

## Default Admin Setup

Set these in your `.env` — admin is auto-created on first server start:

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=yourStrongPassword
ADMIN_NAME=Admin
```

---

## Security

- Passwords hashed with **bcrypt** (salt rounds: 10)
- JWT stored in `httpOnly`, `sameSite: strict` cookies — not accessible via JS
- Refresh token **rotation** on every use
- CORS restricted to `ALLOWED_ORIGINS`
- Rate limiting on all routes
- Zod input validation before any controller logic runs
