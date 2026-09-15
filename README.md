# Helpdesk & Support Ticket Management System (MERN Stack)

A complete, clean, beginner-friendly, and responsive **Helpdesk & Support Ticket Management System** built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js).

---

## 🚀 Key Features

* **Role-Based Access Control (RBAC)**:
  * **Requester**: Register/Login, submit support tickets, view own ticket status, track status history timeline, post comments, update profile.
  * **Support Agent**: Login, view assigned tickets, claim unassigned tickets from pool, update ticket status with mandatory/optional audit comment, post replies, view history.
  * **Admin**: Login, manage users (edit roles, activate/deactivate, delete), manage categories (prevent duplicate names), manage all tickets, assign agents, update status, view system-wide dashboard statistics.
* **Ticket Lifecycle Tracking**: Automatic logging to `StatusHistory` on every status transition (`Open` ➔ `In Progress` ➔ `Resolved` ➔ `Closed`).
* **Interactive Comments Thread**: Requesters, agents, and admins can collaborate and discuss ticket issues with timestamps and role badges.
* **Modern Responsive UI**: Built with pure CSS design system, responsive sidebar, stat cards, filter bars, modals, and status badges.
* **Student & Viva Friendly**: Includes database seeder with preconfigured demo accounts and realistic sample tickets.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 (Vite) | Client Single Page Application (SPA) |
| **Routing** | React Router DOM v7 | Client-side routing with role-based protected routes |
| **State Management** | Context API (`AuthContext`) | Global user session & authentication state |
| **API Client** | Axios | REST API requests with JWT Bearer interceptor |
| **Icons** | Lucide React | Clean, lightweight SVG icons |
| **Styling** | Vanilla CSS | Custom responsive design system with CSS variables |
| **Backend** | Node.js + Express.js | RESTful API server with modular controllers & routes |
| **Database** | MongoDB + Mongoose | Document modeling with relational references |
| **Authentication** | JWT + bcryptjs | Secure password hashing & signed token validation |

---

## 📂 Project Structure

```text
helpdesk project/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection with zero-config fallback
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Profile
│   │   ├── categoryController.js # Category CRUD (Admin)
│   │   ├── commentController.js  # Add/Get ticket comments
│   │   ├── statusHistoryController.js # Ticket status audit log
│   │   ├── ticketController.js   # Ticket CRUD, Status & Assign
│   │   └── userController.js     # User management (Admin)
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT & role authorization
│   │   └── errorMiddleware.js    # 404 & Centralized error handler
│   ├── models/
│   │   ├── Category.js           # Category schema
│   │   ├── Comment.js            # Ticket comments schema
│   │   ├── StatusHistory.js      # Status transition history
│   │   ├── Ticket.js             # Ticket schema
│   │   └── User.js               # User schema with bcrypt methods
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── statusHistoryRoutes.js
│   │   ├── ticketRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   ├── generateToken.js      # JWT token helper
│   │   └── seeder.js             # Database seeding script
│   ├── .env                      # Environment config
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Server entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Alert.jsx         # Success / Error message banner
│   │   │   ├── Badge.jsx         # Priority, Status, Role badges
│   │   │   ├── Layout.jsx        # App shell with Sidebar & Navbar
│   │   │   ├── Loader.jsx        # Loading spinner
│   │   │   ├── Modal.jsx         # Reusable modal dialog
│   │   │   ├── Navbar.jsx        # Top navigation
│   │   │   ├── ProtectedRoute.jsx# Role guard
│   │   │   ├── Sidebar.jsx       # Role-specific sidebar
│   │   │   └── StatCard.jsx      # Statistics metric card
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication context provider
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AgentDashboard.jsx
│   │   │   ├── AgentTickets.jsx
│   │   │   ├── AllTickets.jsx
│   │   │   ├── AssignedTickets.jsx
│   │   │   ├── CreateTicket.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ManageCategories.jsx
│   │   │   ├── ManageUsers.jsx
│   │   │   ├── MyTickets.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── RequesterDashboard.jsx
│   │   │   └── TicketDetails.jsx
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx     # Route definitions
│   │   ├── services/
│   │   │   ├── api.js            # Axios instance
│   │   │   ├── authService.js
│   │   │   ├── categoryService.js
│   │   │   ├── commentService.js
│   │   │   ├── statusHistoryService.js
│   │   │   ├── ticketService.js
│   │   │   └── userService.js
│   │   ├── App.jsx
│   │   ├── index.css             # Design system
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 👥 Demo Credentials

The database seeder (`npm run seed`) generates the following accounts:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@helpdesk.com` | `admin123` | Full administrative control, manage users, categories, and all tickets |
| **Support Agent 1** | `agent@helpdesk.com` | `agent123` | View assigned tickets, claim pool tickets, update statuses, add replies |
| **Support Agent 2** | `sarah.agent@helpdesk.com` | `agent123` | Senior agent queue |
| **Requester 1** | `user@helpdesk.com` | `user123` | Create & track personal support tickets |
| **Requester 2** | `pam@helpdesk.com` | `user123` | Create & track personal support tickets |

> *Tip: On the Login page, click any of the "⚡ Quick Demo Credentials" buttons to auto-fill the login form instantly.*

---

## ⚙️ Installation & Setup Instructions

### 1. Prerequisites
* **Node.js** (v18 or higher recommended)
* **MongoDB** (Local instance, MongoDB Atlas URI, or automatic in-memory fallback)

---

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Seed the database with default users, categories, tickets, and history
npm run seed

# Start the backend server
npm start
```
*The backend API will run on `http://localhost:5000`.*

---

### 3. Frontend Setup

```bash
# In a new terminal window, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite React development server
npm run dev
```
*The frontend application will open on `http://localhost:3000`.*

---

## 📡 REST API Reference

### 🔐 Authentication (`/api/auth`)
* `POST /api/auth/register` - Register a new requester
* `POST /api/auth/login` - Authenticate user and receive JWT token
* `GET /api/auth/profile` - Get logged-in user profile (`Bearer <token>`)
* `PUT /api/auth/profile` - Update user name, email, or password

### 🎫 Tickets (`/api/tickets`)
* `POST /api/tickets` - Create a new support ticket
* `GET /api/tickets` - Get tickets (scoped by role: requester sees own, agent sees assigned/pool, admin sees all)
* `GET /api/tickets/stats/dashboard` - Get role-specific dashboard metrics
* `GET /api/tickets/:id` - Get single ticket by ID
* `PUT /api/tickets/:id` - Update ticket details (owner or admin)
* `PATCH /api/tickets/:id/status` - Change ticket status (`Open`, `In Progress`, `Resolved`, `Closed`) & record status history
* `PATCH /api/tickets/:id/assign` - Assign ticket to support agent (Admin/Agent)
* `DELETE /api/tickets/:id` - Delete ticket and all associated comments/history (Admin)

### 🏷️ Categories (`/api/categories`)
* `GET /api/categories` - List all categories
* `GET /api/categories/:id` - Get single category
* `POST /api/categories` - Create new category (Admin)
* `PUT /api/categories/:id` - Update category (Admin)
* `DELETE /api/categories/:id` - Delete category (Admin)

### 💬 Comments & History
* `POST /api/tickets/:ticketId/comments` - Add a reply/note to a ticket
* `GET /api/tickets/:ticketId/comments` - Get all comments for a ticket
* `GET /api/tickets/:ticketId/history` - Get audit history of status transitions

### 👥 Users (`/api/users`)
* `GET /api/users` - List all users with optional role search (Admin)
* `GET /api/users/:id` - Get user details (Admin)
* `PUT /api/users/:id` - Update user role, active status, or details (Admin)
* `DELETE /api/users/:id` - Delete user account (Admin)

---

## 📝 Sample API Request & Response

### Ticket Creation (`POST /api/tickets`)
**Request Header:**
```text
Authorization: Bearer <jwt_token>
Content-Type: application/json
```
**Request Body:**
```json
{
  "title": "Cannot connect to office VPN from home",
  "description": "Getting error 800 during handshake when connecting to branch network.",
  "category": "65e0123456789abcdef01234",
  "priority": "Urgent"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "Ticket created successfully",
  "data": {
    "_id": "65e0987654321fedcba98765",
    "title": "Cannot connect to office VPN from home",
    "description": "Getting error 800 during handshake when connecting to branch network.",
    "category": {
      "_id": "65e0123456789abcdef01234",
      "name": "Network"
    },
    "priority": "Urgent",
    "status": "Open",
    "createdBy": {
      "_id": "65e011111111111111111111",
      "name": "Michael Scott",
      "email": "user@helpdesk.com",
      "role": "requester"
    },
    "assignedTo": null,
    "createdAt": "2026-08-24T06:00:00.000Z",
    "updatedAt": "2026-08-24T06:00:00.000Z"
  }
}
```

---

## 🎓 University Viva / Project Defense Questions

1. **How is security handled for passwords and API requests?**
   * Passwords are never stored in plain text. They are salted and hashed using `bcryptjs` with a cost factor of 10 in a Mongoose pre-save hook.
   * API endpoints use JWT (JSON Web Tokens) sent in the `Authorization: Bearer <token>` header, verified via the `protect` middleware.

2. **How does Role-Based Access Control (RBAC) work?**
   * The `authorize(...roles)` middleware checks the role in `req.user.role`. If the user's role is not authorized, the API returns a `403 Forbidden` response.
   * On the frontend, `ProtectedRoute` checks the user's role and redirects unauthorized navigation attempts to their respective dashboard.

3. **How does the system ensure an audit trail for ticket statuses?**
   * Whenever a status update is executed (`PATCH /api/tickets/:id/status`), a document is created in the `StatusHistory` collection storing `oldStatus`, `newStatus`, `changedBy`, `comment`, and `createdAt`. This allows full traceability.

4. **How are duplicate categories prevented?**
   * The Category schema enforces a unique index on `name`. In addition, `categoryController.js` performs case-insensitive regex checks before saving.

---

## 📄 License
This project is open-source and created for educational and practical ticketing workflows.
