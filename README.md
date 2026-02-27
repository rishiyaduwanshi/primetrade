# PrimeTrade — Scalable REST API with Authentication & RBAC

A full-stack application built as a Backend Developer Intern assignment. Features JWT authentication, role-based access control (RBAC), task CRUD APIs, Swagger documentation, and a React frontend.

---

## Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Backend  | Node.js, Express v5, MongoDB (Mongoose), Zod    |
| Auth     | JWT (access + refresh tokens), bcryptjs, httpOnly cookies |
| Docs     | Swagger (swagger-jsdoc + swagger-ui-express)    |
| Frontend | React 19, Vite 7, Tailwind CSS v4, React Router v7 |
| Logging  | Winston + Morgan                                |
| Rate Limiting | express-rate-limit                         |

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

Swagger UI available at: **http://localhost:5050/api-docs**

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

- **JWT Auth**: Access token (1d) + Refresh token (7d) stored in httpOnly cookies with auto-rotation
- **RBAC**: `user` and `admin` roles; `authorize()` middleware guards admin routes
- **Zod Validation**: All request bodies validated with Zod schemas; returns `422` with field-level errors
- **Task CRUD**: Pagination, filtering by status/priority, owner-scoped queries
- **Admin Panel**: User listing, role toggling, user deletion (frontend + API)
- **Rate Limiting**: Global + per-IP limits via `express-rate-limit`
- **Logging**: HTTP logs (Morgan + Winston) with rotating file transport
- **Swagger Docs**: Full OpenAPI spec at `/api-docs`

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

Register a user, then update their role via MongoDB or the API:

```bash
# Via API (requires an existing admin token)
PATCH /api/v1/admin/users/:id/role
{ "role": "admin" }
```
