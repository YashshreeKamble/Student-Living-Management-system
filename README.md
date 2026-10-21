# Arbor House PG — Student Living Management System (MERN Stack)

A modern, responsive full-stack **MERN** (MongoDB, Express, React, Node.js) web application for student housing operations, room bookings, resident directories, financial overviews, and property administration.

> **Note on Design**: The application preserves 100% of the original visual design, colors, typography (`Space Grotesk`, `DM Sans`), layout, responsiveness, and micro-interactions.

---

## 1. Technology Stack

- **Frontend**: React 18, Vite, React Router v6, Lucide React icons.
- **Styling**: Vanilla CSS with design token variables (`--ink`, `--coral`, `--teal`, `--cream`, etc.) — zero third-party CSS frameworks.
- **Backend**: Node.js & Express.js REST API with modular controllers, routes, and middleware.
- **Database**: MongoDB with Mongoose ODM (includes schemas for Users, Rooms, Payments, Notices, and Sessions).
- **Authentication**: Bcrypt password hashing + HttpOnly cookie sessions with role-based access control (`student` and `admin`).

---

## 2. Project Structure

```
Student-Living-Management-system/
├── client/                     # React Frontend (Vite)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Authentication state & hooks
│   │   ├── pages/
│   │   │   ├── Home/
│   │   │   │   └── HomePage.jsx           # Landing page + Auth modal
│   │   │   ├── Student/
│   │   │   │   └── StudentDashboard.jsx   # Student workspace & directory views
│   │   │   └── Admin/
│   │   │       └── AdminDashboard.jsx     # Admin management & account settings
│   │   ├── services/
│   │   │   └── api.js          # Centralized API fetch wrapper
│   │   ├── styles/
│   │   │   ├── styles.css      # Shared dashboard styles
│   │   │   ├── home.css        # Landing page styles
│   │   │   └── admin.css       # Admin dashboard styles
│   │   ├── App.jsx             # React Router routing & ProtectedRoute
│   │   ├── index.css           # Global reset
│   │   └── main.jsx            # React root mount
│   ├── index.html
│   ├── package.json
│   └── vite.config.js          # Dev server (port 3000) & /api proxy to port 5000
├── server/                     # Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # Mongoose connection & dev fallback
│   │   ├── controllers/
│   │   │   ├── authController.js   # Login, registration, me, logout
│   │   │   └── adminController.js  # Dashboard stats, approvals, notices
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js   # requireAuth & requireAdmin
│   │   │   └── errorHandler.js     # Centralized error handler
│   │   ├── models/
│   │   │   ├── User.js         # Student/Admin profiles & credentials
│   │   │   ├── Notice.js       # Announcements & audience
│   │   │   ├── Room.js         # Room inventory & vacancy
│   │   │   ├── Payment.js      # Fee collection records
│   │   │   └── Session.js      # Active login sessions (TTL indexed)
│   │   ├── routes/
│   │   │   ├── authRoutes.js   # /api/auth routes
│   │   │   └── adminRoutes.js  # /api/admin routes
│   │   └── utils/
│   │       └── seed.js         # Initial database seeder
│   ├── .env.example            # Environment variable template
│   ├── .env                    # Local environment config
│   ├── app.js                  # Express app & middleware configuration
│   ├── server.js               # HTTP server entry point
│   └── package.json
├── MIGRATION_PLAN.md           # Migration audit, mapping & roadmap
├── README.md                   # Full documentation (this file)
└── package.json                # Root scripts
```

---

## 3. Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **MongoDB**: (Optional for local development)
  - You can connect to a local MongoDB instance (`mongodb://localhost:27017/arbor_house`).
  - Or connect to a cloud MongoDB Atlas database.
  - *If no external MongoDB instance is running, the server automatically starts an in-memory MongoDB instance for local testing.*

---

## 4. Setup and Installation

### Step 1: Install all dependencies

Install root, client, and server dependencies:

```powershell
# Root dependencies
npm install

# Client dependencies
cd client
npm install
cd ..

# Server dependencies
cd server
npm install
cd ..
```

### Step 2: Environment Variables

In the `server/` directory, verify or copy `.env.example` to `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/arbor_house
SEED_PASSWORD=admin123
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

---

## 5. Running the Application

### Development Mode (Both Frontend & Backend concurrently)

From the project root:

```powershell
npm run dev
```

Or run frontend and backend in separate terminals:

```powershell
# Terminal 1: Start Express Backend (Port 5000)
npm run dev:server

# Terminal 2: Start Vite React Frontend (Port 3000)
npm run dev:client
```

Open your browser to [http://localhost:3000](http://localhost:3000).

---

## 6. Default Credentials

The server automatically seeds an initial administrator account on startup:

- **Role**: Admin
- **Email**: `demo@admin.in`
- **Password**: `admin123` (or the value set in `SEED_PASSWORD`)

### Student Registration Workflow:
1. New students click **"Student login"** on the home page, then click **"New student? Create an account"**.
2. Fill in Full Name, Email, and Password (min 8 chars).
3. The account is created with status **Pending**.
4. The Admin logs in at [http://localhost:3000](http://localhost:3000) (or directly navigates to `/admin`), goes to the **Student directory**, and clicks **"Approve"**.
5. The Admin enters the allocated **Room number** (e.g. `A-204`) and **Bed number** (e.g. `Bed 1`).
6. The student can now sign in and access the personalized student portal at `/student`!

---

## 7. Available REST API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new student account (status: pending) |
| `POST` | `/api/auth/login` | Public | Sign in as student or admin (sets HttpOnly cookie) |
| `GET` | `/api/auth/me` | Public / Auth | Check current authentication status & user profile |
| `POST` | `/api/auth/logout` | Auth | Destroy active session and clear cookie |

### Admin Operations (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Admin only | Fetch summary stats, room vacancy, payments, notices, and students |
| `PATCH` | `/api/admin/students/:id/approve` | Admin only | Approve student registration and assign room and bed |
| `PATCH` | `/api/admin/account` | Admin only | Update admin name, email, or password |
| `POST` | `/api/admin/notices` | Admin only | Broadcast a new notice to all residents |

### System
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Backend health check & timestamp |

---

## 8. Traditional Hostel & PG Management Registers (`/api/registers`)

Digitized paper registers, ledgers, vouchers, and notice boards for traditional Indian hostel and PG operations.

### 1. Digital Student Admission Register (`/api/registers/admissions`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/registers/admissions` | Authenticated | Query admission records with search, room, and document verification filters (Students only see their own admission slip) |
| `POST` | `/api/registers/admissions` | Admin only | Direct admission with full particulars: guardian details, college, course, emergency contact, ID proofs |
| `PATCH` | `/api/registers/admissions/:id` | Admin only | Verify documents, assign/change room and bed, update academic details |

### 2. Rent & Payment Ledger (`/api/registers/ledger`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/registers/ledger` | Authenticated | Query accounting ledger by month, mode, or status with financial summaries (Students only see their own ledger) |
| `POST` | `/api/registers/ledger` | Admin only | Record fee payment with strict Cash vs Bank separation (`isCash: true` desk vouchers cannot be auto bank verified) |
| `GET` | `/api/registers/ledger/:id/receipt` | Authenticated | Generate traditional print-friendly payment receipt with hostel letterhead and signature blocks |

### 3. Visitor & Outpass Register (`/api/registers/visitors`, `/api/registers/outpasses`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/registers/visitors` | Authenticated | Query gate visitor log (Students only see visitors logged for them) |
| `POST` | `/api/registers/visitors` | Authenticated | Log visitor entry at main gate with ID proof verification |
| `PATCH` | `/api/registers/visitors/:id/exit` | Authenticated | Mark visitor departure from hostel premises |
| `GET` | `/api/registers/outpasses` | Authenticated | List student outing requests with automatic overdue calculation |
| `POST` | `/api/registers/outpasses` | Authenticated | Apply for student outpass (late night departure or weekend leave) |
| `PATCH` | `/api/registers/outpasses/:id/status`| Admin only | Warden approval, rejection with reason, or return marking |

### 4. Mess & Meal Register (`/api/registers/mess`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/registers/mess/menu` | Authenticated | View 7-day rotating weekly menu (Breakfast, Lunch, Snacks, Dinner, Specials) |
| `PUT` | `/api/registers/mess/menu/:dayOfWeek`| Admin only | Update menu timetable for a specific day |
| `GET` | `/api/registers/mess/attendance` | Authenticated | Query daily meal attendance counts and dietary preferences |
| `POST` | `/api/registers/mess/attendance`| Admin only | Mark student attendance for breakfast, lunch, or dinner |

### 5. Complaint & Maintenance Register (`/api/registers/complaints`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/registers/complaints` | Authenticated | Search complaints by category, priority, or status |
| `POST` | `/api/registers/complaints` | Authenticated | Log new maintenance ticket (Water, Electricity, Cleaning, Furniture, Internet, Mess, Other) |
| `PATCH` | `/api/registers/complaints/:id` | Admin only | Assign maintenance staff, update status, and record resolution details |

### 6. Digital Notice Board (`/api/registers/notices`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/registers/notices` | Authenticated | Fetch active announcements categorized by Hostel, Mess, Maintenance, Rules, Emergency |
| `POST` | `/api/registers/notices` | Admin only | Publish circular with target audience, expiry date, and priority flag |
| `PATCH` | `/api/registers/notices/:id/archive` | Admin only | Archive circular (preserves historical record without deletion) |

### 7. Traditional Register & Report Printing
- **Receipts**: Official fee receipt layout with GST/hostel details, breakdown, and signature lines (*Resident*, *Cashier*, *Warden*).
- **Admission Slip**: Official student admission verification slip.
- **Ledger Statement**: Print-ready statement with audit balances.
- **CSV Exports**: One-click sanitized CSV exports for admissions, ledger, visitors, outpasses, and complaints.
- **Signatures**: Embedded manual signature lines (*Prepared by Caretaker*, *Verified by Hostel Warden*, *Approved by Proprietor*).

---

## 9. Automated Testing

Run the full end-to-end integration test suite verifying all 7 traditional registers and role-based isolation:

```powershell
node server/test_traditional_registers.js
```

All 8 test suites validate:
1. Admin authentication & session security
2. Student admission register CRUD & document verification
3. Rent & payment ledger with strictly non-verified physical cash entries
4. Visitor & outpass register with warden approval and overdue calculation
5. Mess & meal register with 7-day weekly menu timetable and attendance
6. Complaint register with category, priority, and staff assignment
7. Digital notice board with non-destructive archiving
8. Student isolation (zero data leakage across students) and role-based permission enforcement

---

## 10. Building for Production

To create an optimized production build of the React frontend:

```powershell
npm run build:client
```

The production bundle will be built to `client/dist`. The Express backend automatically serves the `client/dist` bundle when running in production mode (`NODE_ENV=production node server/server.js`).

