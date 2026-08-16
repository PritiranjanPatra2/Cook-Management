# 🍳 Cook Daily Routine & Attendance Tracker (MERN)

A complete, production-ready, and intuitive **Cook Routine & Attendance Tracker** designed for household cook management. Tracks daily 2-shift attendance, leave day equivalents, "no work / no floor" conditions, meal preparation records, food analytics, and monthly executive summaries.

---

## 🌟 Key Features

* 🔐 **Secure 4-Digit Passcode Gate**: Clean full-screen passcode screen with on-screen numeric keypad & keyboard support. Uses bcrypt password hashing stored in MongoDB. (Initial default passcode: `7894`).
* 📊 **Smart Shift & Leave Logic**:
  * Exactly **2 shifts per day**: Morning & Evening.
  * **1 shift = 0.5 day equivalent**, **2 shifts = 1.0 day equivalent**.
  * **Leave ≠ No Work**: Clear mathematical separation between cook absences and household non-cooking days.
  * **Not Recorded Awareness**: Missing records are treated as awaiting entry, never automatically marked as leave.
* 📅 **Configurable Tracking Start Date**: Starts calculations from configured date (e.g. 16 August 2026 = 16 days = 32 shifts for the initial month). Subsequent months dynamically calculate the entire calendar month.
* 🍲 **Dynamic Food & Recipe Library**: Select foods using clickable chips with live search. Click `+ Add New Dish` to add a new recipe directly into MongoDB and have it immediately available for all future shifts.
* ⚡ **Lightning Fast Daily Entry**: Fill both morning and evening shifts, dishes, leave reasons, and notes in under 30 seconds.
* 📈 **Visual Analytics & Donut / Bar Charts**:
  * Recharts Donut chart displaying Attendance Percentage.
  * Recharts Bar chart showing meal preparation frequencies.
  * Gold & Silver highlight cards for Most Prepared and 2nd Most Prepared recipes.
* 🗓️ **Interactive Calendar**: Full month view with dual morning/evening status dots (🟢 Present, 🔴 Leave, 🟠 No Work, 🟣 Late, ⚪ Not Recorded) and instant click-to-edit modal.
* 📑 **Monthly Reports & Export**: Full executive summary with 1-click CSV export and printer-friendly view.
* ⚙️ **Customizable Settings**: Edit cook name, tracking start date, shift labels, custom reasons, and update passcode.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite, Lucide React Icons, Recharts
* **Backend**: Node.js, Express.js, Mongoose, Bcryptjs, CORS, Morgan
* **Database**: MongoDB

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (running locally on port 27017 or a MongoDB Atlas URI)

### 2. Install Dependencies
Run the root install script to install server and client dependencies:

```bash
# Install root, server, and client dependencies
npm run install:all
```

### 3. Seed Database
Initialize default dishes (`Rice`, `Dal`, `Soyabin Curry`, `Aloo Bhaja`, `Roti`, `Paneer Curry`, `Chicken Curry`), settings (`7894` hashed passcode), and sample August 2026 shift records:

```bash
npm run seed
```

### 4. Run Development Servers
Start both backend (Express on port 5000) and frontend (Vite on port 5173) concurrently:

```bash
npm run dev
```

Open your browser at [http://localhost:5173](http://localhost:5173) and enter passcode: **`7894`**.

---

## 📁 Directory Structure

```
Cook-Routine/
├── package.json               # Root orchestrator
├── README.md
│
├── server/
│   ├── package.json
│   ├── .env.example
│   ├── .env
│   ├── server.js              # Express app entry point
│   ├── seed.js                # Database seeder
│   ├── config/db.js           # Mongoose connection
│   ├── models/
│   │   ├── Shift.js           # Shift schema & compound index
│   │   ├── Dish.js            # Dish schema
│   │   └── Settings.js        # Passcode & system config
│   ├── controllers/
│   │   ├── shiftController.js
│   │   ├── dishController.js
│   │   ├── reportController.js
│   │   └── settingsController.js
│   ├── routes/
│   │   ├── shiftRoutes.js
│   │   ├── dishRoutes.js
│   │   ├── reportRoutes.js
│   │   └── settingsRoutes.js
│   └── utils/
│       └── calculations.js    # Business logic & shift math
│
└── client/
    ├── package.json
    ├── vite.config.js         # API proxy configured to :5000
    ├── index.html
    └── src/
        ├── App.jsx            # Main app & route controller
        ├── main.jsx
        ├── index.css          # Design system & styles
        ├── components/
        │   ├── Sidebar.jsx
        │   ├── Header.jsx
        │   ├── StatCard.jsx
        │   ├── ShiftCard.jsx
        │   ├── FoodSelector.jsx
        │   ├── StatusBadge.jsx
        │   ├── DateFilter.jsx
        │   ├── QuickEntryCard.jsx
        │   ├── AttendanceChart.jsx
        │   ├── FoodChart.jsx
        │   ├── EditShiftModal.jsx
        │   ├── Toast.jsx
        │   └── LoadingSpinner.jsx
        ├── pages/
        │   ├── Passcode.jsx
        │   ├── Dashboard.jsx
        │   ├── DailyEntry.jsx
        │   ├── Attendance.jsx
        │   ├── FoodMeals.jsx
        │   ├── CalendarPage.jsx
        │   ├── Reports.jsx
        │   ├── FoodAnalysis.jsx
        │   └── Settings.jsx
        ├── services/
        │   ├── api.js
        │   ├── shiftService.js
        │   ├── dishService.js
        │   ├── reportService.js
        │   └── settingsService.js
        └── utils/
            ├── dateUtils.js
            ├── calculations.js
            └── constants.js
```

---

## 📡 REST API Summary

### Passcode & Settings
- `POST /api/settings/verify-passcode` — Verify 4-digit passcode with bcrypt
- `POST /api/settings/change-passcode` — Update passcode with current code verification
- `GET  /api/settings` — Get tracking config and cook profile
- `PUT  /api/settings` — Update cook name, tracking start date, custom reasons

### Shift Operations
- `GET    /api/shifts` — Query shifts by `date`, `month` & `year`, or date range
- `POST   /api/shifts` — Upsert shift by date and shift type
- `POST   /api/shifts/batch` — Batch save Morning & Evening shifts for a date
- `GET    /api/shifts/:id` — Get single shift with populated food list
- `PUT    /api/shifts/:id` — Update shift status, foods, reasons, or notes
- `DELETE /api/shifts/:id` — Delete shift record

### Dish Library
- `GET    /api/dishes` — List dishes (with optional `activeOnly=true` and search)
- `POST   /api/dishes` — Add new dish
- `PUT    /api/dishes/:id` — Edit dish name or category
- `PATCH  /api/dishes/:id/toggle` — Enable / disable dish
- `DELETE /api/dishes/:id` — Soft-deactivate if referenced in past shifts, or hard delete if unused

### Reports & Analytics
- `GET /api/reports/month?month=8&year=2026` — Complete monthly summary & leave analysis
- `GET /api/reports/day?date=2026-08-16` — Day breakdown
- `GET /api/reports/week?startDate=2026-08-10` — 7-day breakdown
- `GET /api/reports/food-analysis?period=month&month=8&year=2026` — Dish preparation counts & ranking

---

## 🔒 Security Note
Passcodes are never stored in plaintext. They are encrypted using `bcryptjs` with salt rounds on the backend. No user accounts or complex session bloat.
