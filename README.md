# Boardwork — Task Management & Collaboration Board (Frontend)

A React frontend for the existing Task Management & Collaboration Board backend.
Built to consume that backend's REST API exactly as implemented — no duplicate
routes, models, or auth logic were created. This document also records the
backend inspection this frontend is based on.

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
  boards for users)
- Kanban-style board view (Todo / In Progress / Done) with filtering and
  pagination
- Create/edit/delete tasks with backend-enforced, UI-mirrored permissions
- Admin user management (list, delete)
- Admin board management (list, create, edit, member add/remove, delete)
- AI Task Assistant integrated into task creation (advisory only)
- Loading, error, and empty states throughout

## 3. Tech Stack

React 18 · React Router v6 · Axios · React Context API · Tailwind CSS · Vite

## 4. Backend API Mapping (source of truth used by this frontend)

The backend was inspected directly (`controllers/`, `routes/`, `models/`,
`middleware/`) before writing any frontend code. All responses follow
`{ success, data }` on success and `{ success, message, errors }` on failure.

| Frontend Feature | Endpoint | Method | Request Body / Params | Response (`data.*`) | Required Role |
|---|---|---|---|---|---|
| Register | `/api/auth/register` | POST | `{ name, email, password }` | `{ user, token }` | Public |
| Login | `/api/auth/login` | POST | `{ email, password }` | `{ user, token }` | Public |
| Session restore | `/api/auth/me` | GET | — (Bearer token) | `{ user }` | Any authenticated |
| List users | `/api/users` | GET | — | `{ users: [{_id,name,email,role,createdAt}] }` | Admin |
| Get user | `/api/users/:id` | GET | — | `{ user }` | Admin |
| Delete user | `/api/users/:id` | DELETE | — | `{ message }` | Admin |
| Create board | `/api/boards` | POST | `{ title, description, members: [] }` | `{ board }` (owner set server-side) | Admin |
| List boards | `/api/boards` | GET | — | `{ boards }` (already scoped: admin = all, user = own memberships) | Any authenticated |
| Get board | `/api/boards/:id` | GET | — | `{ board }` (populated members) | Admin, or member |
| Update board | `/api/boards/:id` | PUT | `{ title?, description?, members? }` | `{ board }` | Admin |
| Delete board | `/api/boards/:id` | DELETE | — | `{ message }` (cascades to tasks) | Admin |
| Add board member | `/api/boards/:id/members` | POST | `{ userId }` | `{ board }` | Admin |
| Remove board member | `/api/boards/:id/members/:userId` | DELETE | — | `{ board }` | Admin |
| Create task | `/api/boards/:id/tasks` | POST | `{ title, description?, status?, priority?, dueDate?, assignedTo }` | `{ task }` (populated) | Admin, or board member |
| List board tasks | `/api/boards/:id/tasks` | GET | query: `status, priority, assignedTo, page, limit` | `{ tasks, page, limit, totalPages, totalCount }` | Admin, or board member |
| Get task | `/api/tasks/:id` | GET | — | `{ task }` | Admin, or board member |
| Update task | `/api/tasks/:id` | PUT | Admin: any field. User: `{ status }` only, and only if they're the assignee | `{ task }` | Admin, or task assignee (status only) |
| Delete task | `/api/tasks/:id` | DELETE | — | `{ message }` | Admin |
| Admin all-tasks list | `/api/admin/tasks` | GET | query: `status, priority, assignedTo, board, page, limit, sortBy, order` | `{ tasks, page, limit, totalPages, totalCount }` | Admin (endpoint available; no dedicated page built for it per the requested page list) |
| AI Task Assistant | `/api/ai/task-assistant` | POST | `{ title, description? }` | `{ suggestedDescription, suggestedPriority, subtasks }` — flat, not nested further | Any authenticated |

Key backend behaviors this frontend relies on and mirrors in the UI (but does
not re-implement authorization for — the backend is the actual gate):

- `createdBy` and board `owner` are always set server-side; the frontend never
  sends them.
- Regular users creating a task may only assign to themselves or another
  member of that same board; the backend rejects anything else with `403`.
  The assignee dropdown is populated only with the current board's members
  for non-admins.
- Admins may assign a task to **any** registered user, so the create-task
  modal loads the full `/api/users` list when the current user is an admin.
- Regular users updating a task may send **only** `{ status }`, and only if
  they are that task's `assignedTo`. The UI disables all other fields for
  non-admins and never sends them in the request body.
- Board membership changes go through the dedicated add/remove member
  endpoints, not just the bulk `PUT /api/boards/:id`, so the Edit Board page
  diffs the selected members and calls `addMember` / `removeMember` per
  change.
- Task/member counts not present on the `board` object (e.g. task count per
  board) are derived by calling the real `/api/boards/:id/tasks` endpoint
  with `limit=1` and reading `totalCount` — never fabricated client-side.

## 5. Final Frontend Folder Structure

```
frontend/
  public/
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
    App.jsx
    main.jsx
    index.css
  index.html
  tailwind.config.js
  postcss.config.js
  vite.config.js
  package.json
  .env.example
  README.md
```

## 6. Pages Created

`Login`, `Register`, `Dashboard`, `BoardView` (Kanban board with filters,
pagination, create/detail modals), `AdminUsers`, `AdminBoards`, `CreateBoard`,
`EditBoard`, `NotFound`.

## 7. Components Created

`Navbar`, `Sidebar`, `Layout`, `ProtectedRoute`, `AdminRoute`, `BoardCard`,
`TaskCard`, `TaskColumn`, `TaskDetailModal`, `CreateTaskModal`, `BoardForm`,
`FilterBar`, `UserTable`, `LoadingSpinner`, `ErrorMessage`, `EmptyState`,
`ConfirmDialog`, `Pagination`.

## 8. Authentication Flow

1. `AuthContext` holds `user`, `token`, `loading`, `isAuthenticated`.
2. On app startup, if a token exists in `localStorage`, the app calls
   `GET /api/auth/me` to verify it's still valid and to restore `user` — it
   never trusts a cached user object without re-checking against the backend.
3. `login()` calls `POST /api/auth/login`, stores the returned JWT, and sets
   `user` from the response.
4. `register()` calls `POST /api/auth/register` and does **not** log the user
   in automatically — the UI redirects to `/login` per the required flow.
5. Every Axios request automatically attaches `Authorization: Bearer <token>`
   via a request interceptor.
6. A response interceptor detects any `401` and clears the session, which
   causes `ProtectedRoute` to redirect to `/login`.
7. `logout()` clears the token and clears `user`.

## 9. Role-Based Access Flow

- `ProtectedRoute` gates all authenticated pages; unauthenticated visitors are
  redirected to `/login`.
- `AdminRoute` (nested inside `ProtectedRoute`) checks `user.role === 'admin'`
  — the literal role value the backend actually returns — and redirects
  non-admins to `/dashboard` rather than `/login`, since they are
  authenticated, just not authorized for that page.
- The Navbar only renders **Users** / **Boards** admin links when the current
  user is an admin.
- Inside `BoardView`, `TaskDetailModal` disables every field except `status`
  for non-admins, and only enables even that if the current user is the
  task's assignee — matching the backend's actual enforcement, which remains
  the real authority (the frontend restriction is for UX only, per the
  brief).

## 10. AI Integration Flow

1. Inside `CreateTaskModal`, an "AI Assistant" panel accepts a title and
   optional description.
2. On "Get AI suggestions", the frontend calls `POST /api/ai/task-assistant`
   with `{ title, description }`.
3. While the request is in flight, the button shows "Generating
   suggestions…".
4. On success, the panel displays the suggested description, priority, and
   subtasks exactly as returned (no assumed field names beyond what the
   backend documents: `suggestedDescription`, `suggestedPriority`, `subtasks`).
5. "Use description" / "Use priority" / "Use all suggestions" populate the
   task form fields — subtasks are appended as a bulleted list inside the
   description field, since the Task model has no dedicated subtasks field.
6. The task is only created when the user explicitly clicks "Create task" —
   the AI step never submits anything on its own.
7. On failure (network error, rate limit, backend/AI error), the panel shows
   "Unable to generate AI suggestions. Please try again." and the rest of the
   task creation form remains fully usable.

## 11. Environment Variables

Only frontend-safe values — no secrets:

```
VITE_API_URL=http://localhost:5000/api
```

Copy `.env.example` to `.env` and adjust for your backend's actual address.
Never put `GROQ_API_KEY`, `JWT_SECRET`, or `MONGO_URI` here — those belong
only in the backend's environment.

## 12. Installation & Running Locally

```bash
cd frontend
npm install
cp .env.example .env     # point VITE_API_URL at your running backend
npm run dev               # http://localhost:5173
```

Make sure the backend's `CLIENT_URL` environment variable is set to this
frontend's origin (e.g. `http://localhost:5173`) so CORS allows the requests.

### Production build

```bash
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```

### Deployment

Deploy `dist/` to any static host (Netlify, Vercel, Render static site,
Cloudflare Pages, etc.). Set `VITE_API_URL` in that platform's environment
variable settings to the deployed backend's public URL (including the `/api`
prefix), and make sure the backend's `CLIENT_URL` points back at this
frontend's deployed origin.

## 13. How to Test the Integration

With the backend running (and an admin created via its `npm run seed:admin`):

1. **Auth:** Register a new user → redirected to `/login` → log in → land on
   `/dashboard` → refresh the page → session is restored without re-login →
   log out → redirected to `/login`.
2. **User flow:** Log in as a regular user → see only boards you're a member
   of → open a board → filter tasks by status/priority/assignee → create a
   task assigned to yourself or a board member → open a task assigned to
   someone else and confirm only "Close" is available, no editable fields →
   open a task assigned to you and confirm only Status is editable.
3. **Admin flow:** Log in as admin → `/admin/users` to view/delete users →
   `/admin/boards` to view all boards → create a board, picking members →
   edit a board's members (add/remove) → open a board and create a task
   assigning any registered user → edit any task's full field set → delete a
   task.
4. **AI Assistant:** Open "New task" → expand "AI Assistant" → enter a title
   → "Get AI suggestions" → apply description/priority/all → confirm the task
   is not created until you click "Create task" separately.

## 14. Backend Integration Notes

No backend code was modified. No genuine backend bugs were found that blocked
any required frontend functionality — the actual API surface, response
shapes, and permission rules (as implemented in the backend's controllers)
were adopted as-is, including a few points worth flagging explicitly since
they differ subtly from a naive reading of a typical task-board API:

- The AI endpoint's response fields are **flat** under `data`
  (`data.suggestedDescription`, not `data.suggestions.suggestedDescription`).
- Task list endpoints return pagination metadata as sibling fields
  (`tasks, page, limit, totalPages, totalCount`), not nested under a
  `pagination` object.
- Board objects don't carry a task count — this frontend fetches it
  separately via the real tasks endpoint rather than inventing one.
- Board membership updates are split across two mechanisms in the backend
  (`PUT /api/boards/:id` for title/description, dedicated member endpoints
  for membership) — the Edit Board page uses both accordingly.
#   t a s k - m a n a g e m e n t - a n d - c o l l a b o r a t i o n - b o a r d - f r o n t e n d  
 