# Boardwork — Task Management & Collaboration Board (Frontend)

A React frontend for the Task Management & Collaboration Board backend. Talks to
that backend's REST API exclusively — no duplicate routes, models, or auth logic
exist on this side.

## Live URLs

| | URL |
|---|---|
| **App** | `https://rush1203taskmanagement.netlify.app` |
| **Backend API it talks to** | `https://task-management-and-collaboration-board.onrender.com/api` |

> The backend is hosted on Render's free tier, which spins down after
> inactivity — the very first login/register after a period of no traffic can
> take up to ~30 seconds while it wakes back up.

## Demo Admin Login

```
admin_username = admin@admin.com
admin_password = admin123
```

Use these to log in on the live app and explore admin features (user
management, board management, assigning tasks to any user, etc.).

## 1. Project Description

Boardwork lets Admins manage users, boards, and tasks, while regular Users work
within the boards they belong to — creating tasks, filtering them, and updating
the status of tasks assigned to them. An AI Task Assistant (backed by the
existing Groq-powered backend endpoint) offers optional suggestions when
creating a task.

## 2. Features

- JWT auth (register / login / logout / session restoration on refresh)
- Role-aware routing and navigation (Admin vs User)
- Dashboard scoped automatically by the backend (all boards for admins, own
  boards for users), with real derived stats (board count, task count,
  tasks assigned to you)
- Kanban-style board view (Todo / In Progress / Done), responsive — stacks
  full-width on mobile, side-by-side columns on larger screens
- Filtering and pagination on task lists
- Create/edit/delete tasks with backend-enforced, UI-mirrored permissions
- Admin user management (list, delete)
- Admin board management (list, create, edit, member add/remove, delete)
- AI Task Assistant integrated into task creation (advisory only)
- Loading, error, and empty states throughout

## 3. Tech Stack

React 18 · React Router v6 · Axios · React Context API · Tailwind CSS · Vite

Hosted on **Netlify**.

## 4. Local Setup Steps

```bash
# 1. Clone/extract and install dependencies
cd frontend
npm install

# 2. Copy the example env file and point it at a running backend
cp .env.example .env
# edit .env: VITE_API_URL=http://localhost:5000/api  (for local backend)
# or:        VITE_API_URL=https://task-management-and-collaboration-board.onrender.com/api

# 3. Start the dev server
npm run dev
```

Open `http://localhost:5173`. If running against the local backend, make sure
its `CLIENT_URL` env var is set to `http://localhost:5173` (for CORS).

### Production build

```bash
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```

## 5. Environment Variables

Only frontend-safe values — no secrets belong here:

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | **Yes** | Backend API base URL, **must include the `/api` prefix** (e.g. `https://task-management-and-collaboration-board.onrender.com/api`) |

Copy `.env.example` to `.env` and set it. Never put `GROQ_API_KEY`,
`JWT_SECRET`, or `MONGO_URI` here — those belong only in the backend.

> **Common mistake:** forgetting the `/api` suffix, which causes every
> request to 404 (e.g. hitting `/auth/login` instead of `/api/auth/login`).
> Also remember Vite bakes this value into the build at build time — changing
> it in your hosting dashboard requires a fresh rebuild to take effect.

## 6. Backend API Mapping

All responses follow `{ success, data }` on success and
`{ success, message, errors }` on failure.

| Frontend Feature | Endpoint | Method | Request Body / Params | Response (`data.*`) | Required Role |
|---|---|---|---|---|---|
| Register | `/api/auth/register` | POST | `{ name, email, password }` | `{ user, token }` | Public |
| Login | `/api/auth/login` | POST | `{ email, password }` | `{ user, token }` | Public |
| Session restore | `/api/auth/me` | GET | — (Bearer token) | `{ user }` | Any authenticated |
| List users | `/api/users` | GET | — | `{ users }` | Admin |
| Get user | `/api/users/:id` | GET | — | `{ user }` | Admin |
| Delete user | `/api/users/:id` | DELETE | — | `{ message }` | Admin |
| Create board | `/api/boards` | POST | `{ title, description, members: [] }` | `{ board }` | Admin |
| List boards | `/api/boards` | GET | — | `{ boards }` (already scoped by backend) | Any authenticated |
| Get board | `/api/boards/:id` | GET | — | `{ board }` | Admin, or member |
| Update board | `/api/boards/:id` | PUT | `{ title?, description?, members? }` | `{ board }` | Admin |
| Delete board | `/api/boards/:id` | DELETE | — | `{ message }` | Admin |
| Add board member | `/api/boards/:id/members` | POST | `{ userId }` | `{ board }` | Admin |
| Remove board member | `/api/boards/:id/members/:userId` | DELETE | — | `{ board }` | Admin |
| Create task | `/api/boards/:id/tasks` | POST | `{ title, description?, status?, priority?, dueDate?, assignedTo }` | `{ task }` | Admin, or board member |
| List board tasks | `/api/boards/:id/tasks` | GET | query: `status, priority, assignedTo, page, limit` | `{ tasks, page, limit, totalPages, totalCount }` | Admin, or board member |
| Get task | `/api/tasks/:id` | GET | — | `{ task }` | Admin, or board member |
| Update task | `/api/tasks/:id` | PUT | Admin: any field. User: `{ status }` only, own tasks only | `{ task }` | Admin, or task assignee |
| Delete task | `/api/tasks/:id` | DELETE | — | `{ message }` | Admin |
| AI Task Assistant | `/api/ai/task-assistant` | POST | `{ title, description? }` | `{ suggestedDescription, suggestedPriority, subtasks }` | Any authenticated |

## 7. Folder Structure

```
frontend/
  public/
    _redirects              # Netlify SPA routing rule
  src/
    components/
      AdminRoute.jsx
      BoardCard.jsx
      BoardForm.jsx
      ConfirmDialog.jsx
      CreateTaskModal.jsx
      EmptyState.jsx
      ErrorMessage.jsx
      FilterBar.jsx
      Layout.jsx
      LoadingSpinner.jsx
      Navbar.jsx
      Pagination.jsx
      ProtectedRoute.jsx
      Sidebar.jsx
      TaskCard.jsx
      TaskColumn.jsx
      TaskDetailModal.jsx
      UserTable.jsx
    pages/
      AdminBoards.jsx
      AdminUsers.jsx
      BoardView.jsx
      CreateBoard.jsx
      Dashboard.jsx
      EditBoard.jsx
      Login.jsx
      NotFound.jsx
      Register.jsx
    context/
      AuthContext.jsx
    services/
      api.js
      authService.js
      userService.js
      boardService.js
      taskService.js
      aiService.js
    utils/
      roles.js
      taskMeta.js
      boardTab.js
    App.jsx
    main.jsx
    index.css
  index.html
  netlify.toml               # Netlify build config as code
  tailwind.config.js
  postcss.config.js
  vite.config.js
  package.json
  .env.example
  README.md
```

## 8. Pages & Components

**Pages:** `Login`, `Register`, `Dashboard`, `BoardView`, `AdminUsers`,
`AdminBoards`, `CreateBoard`, `EditBoard`, `NotFound`.

**Components:** `Navbar`, `Sidebar`, `Layout`, `ProtectedRoute`, `AdminRoute`,
`BoardCard`, `TaskCard`, `TaskColumn`, `TaskDetailModal`, `CreateTaskModal`,
`BoardForm`, `FilterBar`, `UserTable`, `LoadingSpinner`, `ErrorMessage`,
`EmptyState`, `ConfirmDialog`, `Pagination`.

## 9. Authentication Flow

1. `AuthContext` holds `user`, `token`, `loading`, `isAuthenticated`.
2. On app startup, if a token exists in `localStorage`, the app calls
   `GET /api/auth/me` to verify it's still valid and restore `user`.
3. `login()` calls `POST /api/auth/login`, stores the JWT, sets `user`.
4. `register()` calls `POST /api/auth/register` and does **not** log the user
   in automatically — redirects to `/login` instead.
5. Every Axios request auto-attaches `Authorization: Bearer <token>` via a
   request interceptor.
6. A response interceptor detects any `401` and clears the session, so
   `ProtectedRoute` redirects to `/login`.
7. `logout()` clears the token and clears `user`.

## 10. Role-Based Access Flow

- `ProtectedRoute` gates all authenticated pages; unauthenticated visitors →
  `/login`.
- `AdminRoute` (nested inside `ProtectedRoute`) checks `user.role === 'admin'`
  and redirects non-admins to `/dashboard` (they're authenticated, just not
  authorized).
- The Navbar only shows admin links to admins.
- `TaskDetailModal` disables every field except `status` for non-admins, and
  only enables even that if the current user is the task's assignee — for UX
  only; the backend remains the real authority.

## 11. AI Integration Flow

1. `CreateTaskModal` has an "AI Assistant" panel accepting title + optional
   description.
2. "Get AI suggestions" calls `POST /api/ai/task-assistant`.
3. Displays `suggestedDescription`, `suggestedPriority`, `subtasks` exactly
   as returned.
4. "Use description" / "Use priority" / "Use all suggestions" populate the
   task form — nothing is ever auto-created; the user still clicks "Create task."
5. On failure, shows "Unable to generate AI suggestions. Please try again."
   and the rest of the form remains usable.

## 12. Deployment (Netlify)

This repo includes `netlify.toml` and `public/_redirects`, so Netlify
auto-detects the build command, publish directory, and SPA routing:

1. Push `frontend/` to a Git repo.
2. Netlify → **Add new site → Import an existing project** → connect the repo.
3. If it's a monorepo (backend + frontend together), set **Base directory** to
   `frontend` in Build settings.
4. Add the one environment variable: `VITE_API_URL` (see section 5).
5. Deploy. After any later change to `VITE_API_URL`, trigger **Clear cache
   and deploy site** — a plain redeploy can reuse a stale build.


- Board membership updates use two mechanisms: `PUT /api/boards/:id` for
  title/description, and dedicated add/remove member endpoints for
  membership changes — the Edit Board page uses both accordingly.
