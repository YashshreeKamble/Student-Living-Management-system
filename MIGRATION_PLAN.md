# MIGRATION PLAN: Student Living Management System (Arbor House PG)
## Conversion from Static HTML/CSS/JS to MERN Stack

---

## 1. Executive Summary & Audit Findings

### 1.1 Existing Pages & UI Architecture
| Page | File | Purpose | Route in React | Key Components |
|---|---|---|---|---|
| **Landing / Home** | `home.html` | Public marketing site, property highlights, amenities, room plans, location, and login/register modal | `/` | Navigation, Hero, Amenities, Rooms, Location, Footer, AuthModal |
| **Student Portal** | `index.html` + `app.js` | Authenticated student portal with sidebar navigation, overview metrics, personal room info, meals, notices, dynamic views | `/student` (or `/dashboard`) | Sidebar, Topbar, Overview/Dashboard, ViewDirectory (Residents, Rooms, Payments, Laundry, Mess, Complaints, Visitors, Notices, Services, Settings), AddResidentModal, Toast |
| **Admin Portal** | `admin.html` + `admin.js` | Administrator dashboard for student approval, bed allocation, room inventory, notice broadcast, account settings | `/admin` | AdminTopbar, StatsSummary, RoomInventoryTable, NoticeFeed, StudentDirectoryTable (with Approve action), PaymentTable, AccountSettingsView, SendNoticeModal/Prompt, Toast |

### 1.2 Stylesheet & Visual Assets Inventory
- **Global Stylesheet**: `styles.css` (325 lines formatted, ~12.6KB)
  - Color Tokens:
    - `--ink: #19343c`
    - `--deep: #12313a`
    - `--muted: #75848a` / `#708287`
    - `--line: #e6eceb` / `#dfe9e6`
    - `--canvas: #f6f8f7`
    - `--cream: #f7f6f1`
    - `--white: #fff`
    - `--coral: #f26f52`
    - `--coral-dark: #d9583d`
    - `--teal: #1c9b8b`
    - `--pale-teal: #e4f4f0`
    - `--yellow: #f3bc50`
    - `--blue: #6f9edc`
  - Typography: Google Fonts `DM Sans` (400, 500, 600, 700) and `Space Grotesk` (500, 600, 700).
  - Icons: Lucide icons (`lucide@latest` -> `lucide-react`).
  - Remote Images:
    - Hero: `https://images.unsplash.com/photo-1555854877-bab0e564b8d5`
    - Private Room: `https://images.unsplash.com/photo-1505693416388-ac5ce068fe85`
    - Shared Room: `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267`
    - Location: `https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83`
- **Embedded Page Styles**:
  - `home.html` contains scoped styles for `.site-nav`, `.hero`, `.amenities`, `.rooms`, `.location`, `.footer`, `.modal`.
  - `index.html` contains scoped styles for `.student-logout`, `.quick-actions`, `.toast`.
  - `app.js` injects runtime styles for `.student-welcome`, `.admin-welcome`, `.student-grid`, etc.
  - `admin.html` contains scoped styles for `.admin-page`, `.admin-topbar`, `.account-dashboard`, `.student-directory`, etc.
- **Rule**: All CSS classes, IDs, media queries, and responsive rules will be preserved identically in CSS files within `client/src/styles/` without adding Tailwind, Bootstrap, or other conflicting UI libraries.

### 1.3 JavaScript & Interactivity Audit
- **`home.html` inline JS**:
  - Auth modal toggle (Student vs Admin, Login vs Register modes).
  - Form validation and submission to `/api/auth/login` and `/api/auth/register`.
  - Redirection based on role (`/admin.html` or `/index.html`).
- **`app.js`**:
  - View switching (Overview, Residents, Rooms & beds, Payments, Laundry, Mess & menu, Complaints, Visitors, Notice board, Student services, Settings).
  - Live search filtering across activity items, residents, tasks.
  - Priority task completion checkmarks toggle.
  - Quick action buttons with toast feedback.
  - Resident creation modal dialog.
  - Fetching `/api/auth/me` to hydrate active user name, avatar initials, room, and bed allocation.
  - Logout call to `/api/auth/logout`.
- **`admin.js`**:
  - Admin dashboard data loading from `/api/admin/dashboard`.
  - Student approval and bed allocation modal/prompts via `PATCH /api/admin/students/:id/approve`.
  - Notice creation via `POST /api/admin/notices`.
  - Admin account settings updates via `PATCH /api/admin/account`.
  - Admin session verification via `/api/auth/me`.
  - Logout via `/api/auth/logout`.

### 1.4 Existing Data Persistence & Backend Audit
- Current backend: Express + `node:sqlite` (in-memory/file SQLite at `arbor-house.sqlite`).
- SQLite Tables:
  - `users` (id, name, email, password_hash, role, room, bed, status, created_at)
  - `sessions` (token, user_id, expires_at)
  - `notices` (id, title, message, audience, created_at)
- Missing Persistence in SQLite:
  - Rooms, payments, complaints, visitors, and meal menus are currently rendered from static datasets or mock arrays in `server.js` and `app.js`.
  - In MERN migration, MongoDB schemas will support:
    1. `User` (name, email, passwordHash, role ['student', 'admin'], room, bed, status ['pending', 'approved'], createdAt)
    2. `Notice` (title, message, audience, createdAt)
    3. `Room` (roomNumber, capacity, occupied, beds, vacancy, type, rent)
    4. `Payment` (studentId, studentName, amount, date, status ['Received', 'Pending', 'Overdue'])
    5. `Complaint` (title, studentName, room, priority, status, createdAt)
    6. `Session` or JWT tokens for stateless secure auth.

---

## 2. Target Architecture

```
Student-Living-Management-system/
├── client/                     # React Frontend (Vite)
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── assets/             # Images & static assets
│   │   ├── components/         # Reusable UI (Sidebar, Topbar, Modals, StatCards, Toast)
│   │   ├── context/            # AuthContext (user, login, logout, checkAuth)
│   │   ├── pages/
│   │   │   ├── Home/           # Landing page (home.html)
│   │   │   ├── Student/        # Student portal (index.html + dynamic views)
│   │   │   └── Admin/          # Admin dashboard (admin.html + account settings)
│   │   ├── services/           # api.js (Axios / Fetch centralized client)
│   │   ├── styles/             # styles.css, home.css, student.css, admin.css
│   │   ├── App.jsx             # React Router routing (/ , /student, /admin)
│   │   └── main.jsx            # React root mount
│   ├── package.json
│   └── vite.config.js
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── config/             # db.js (Mongoose connection)
│   │   ├── controllers/        # authController, adminController, studentController
│   │   ├── middleware/         # authMiddleware, errorHandler, validation
│   │   ├── models/             # User, Notice, Room, Payment, Complaint
│   │   ├── routes/             # authRoutes, adminRoutes, studentRoutes
│   │   └── utils/              # seedDatabase, tokenUtils
│   ├── .env.example
│   ├── app.js                  # Express app setup, CORS, JSON, routes
│   ├── server.js               # Server entry point
│   └── package.json
├── MIGRATION_PLAN.md           # This document
├── README.md                   # Full documentation with run instructions
└── package.json                # Root package.json with concurrently scripts
```

---

## 3. Phased Execution Roadmap

### Phase 1: Audit & Backup (Completed)
- [x] Inspect all repository files and identify dependencies, assets, and functionality.
- [x] Create git feature branch `feature/mern-migration`.
- [x] Document audit and create `MIGRATION_PLAN.md`.

### Phase 2: Frontend Migration to React (Vite)
- [ ] Initialize Vite + React in `client/`.
- [ ] Install `lucide-react` and `react-router-dom`.
- [ ] Port all stylesheets into `client/src/styles/` ensuring zero CSS regressions.
- [ ] Create `Home` page component with the exact markup, hero, features, and auth modal.
- [ ] Create `StudentDashboard` component with sidebar, workspace view switcher, task lists, and modals.
- [ ] Create `AdminDashboard` component with inventory, student directory, approval dialogs, and account settings.
- [ ] Verify visual fidelity, responsive breakpoints, and animations page-by-page.

### Phase 3: Express Backend Application
- [ ] Initialize Express backend in `server/`.
- [ ] Configure environment variables (`PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`).
- [ ] Configure CORS with credentials support.
- [ ] Set up route controllers and centralized error handling middleware.

### Phase 4: MongoDB & Mongoose Integration
- [ ] Connect Mongoose with graceful fallback for local development.
- [ ] Define Mongoose models: `User`, `Notice`, `Room`, `Payment`, `Complaint`.
- [ ] Implement database seeder for default admin (`demo@admin.in`) and initial PG data.

### Phase 5 & 6: Authentication, Authorization & API Wiring
- [ ] Implement secure password hashing with `bcryptjs`.
- [ ] Implement JWT / session cookies for authentication.
- [ ] Wire student registration and login with approval verification.
- [ ] Wire admin endpoints: dashboard stats, student approval & bed assignment, notice creation, admin profile update.
- [ ] Connect client components to real backend APIs with error handling and toasts.

### Phase 7: Testing & Verification
- [ ] Test public landing page rendering and responsive design.
- [ ] Test student registration (status starts as `pending`).
- [ ] Test admin approval and bed allocation workflow.
- [ ] Test approved student login and personalized dashboard rendering.
- [ ] Test notice posting and broadcast feed.
- [ ] Test admin account details & password update.
- [ ] Check console logs and network tabs for clean execution.

### Phase 8: Project Configuration & Root Documentation
- [ ] Create root `package.json` with convenience scripts (`npm run dev`, `npm run dev:client`, `npm run dev:server`).
- [ ] Update `README.md` with full setup instructions, API documentation, and environment variables.
- [ ] Review final deliverables against acceptance criteria.
