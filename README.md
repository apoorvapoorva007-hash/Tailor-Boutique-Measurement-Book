# ✂️ TAILOR & BOUTIQUE MEASUREMENT BOOK
### A Digital Boutique & Haute Couture Tailoring Management System
*Full-Stack College Final Project*

---

## 📖 1. Project Overview

The **Tailor & Boutique Measurement Book** is a web application designed to replace paper-based tailor notebooks with a digital tailoring and boutique management system.

It centralizes:
- **Client Management & Order History**
- **Garment-Specific Dynamic Measurements** (with dual inches/cm units, custom dimensions, and 1-click order reuse)
- **Stitching Orders & 8-Stage Workflow Progression**
- **Trial Fitting & Alteration Tracking**
- **Delivery Deadlines & Overdue Alerts**
- **Business Analytics & PDF Reports / Invoices**

---

## 🛠️ 2. Technology Stack

- **Frontend**:
  - React.js 19 + Vite 8
  - React Router 7
  - Axios
  - Recharts (Interactive Area, Bar, and Donut charts)
  - Lucide React (Icons)
  - Boutique Custom Luxury UI (Cormorant Garamond + Plus Jakarta Sans)
- **Backend**:
  - Python 3.12
  - Django 6.1 + Django REST Framework 3.18
  - Django CORS Headers
  - ReportLab 5.1 (Server-side Vector PDF Generation)
- **Database**:
  - **MongoDB Atlas** (Cloud NoSQL Database)
  - MongoEngine 0.29 + PyMongo 4.20 + dnspython
  - In-Memory Fallback Engine (ensures continuous offline operation even before entering Atlas credentials)

---

## 👗 3. Key Modules & Features

### 3.1 Dynamic Measurement Management (Core Feature)
Tailored garments require distinct anatomical measurements. This system implements dynamic schemas for:
1. **Saree Blouse**: Bust, Waist/Underbust, Shoulder, Blouse length, Sleeve length, Armhole, Front neck depth, Back neck depth
2. **Chudidar**: Chest, Waist, Hip, Shoulder, Top length, Sleeve length, Pant length, Ankle, Neck depth
3. **Kurti**: Bust, Waist, Hip, Shoulder, Kurti length, Sleeve length, Armhole, Neck depth
4. **Gown**: Bust, Waist, Hip, Shoulder, Gown length, Sleeve length, Neck depth
5. **Lehenga**: Waist, Hip, Lehenga length, Waistband, Blouse measurements
6. **Salwar Suit**: Chest, Waist, Hip, Shoulder, Top length, Sleeve length, Salwar length
7. **Custom Garment**: Bespoke dynamic schema where users can name and add any fields dynamically

**Functional Highlights**:
- **Dual Unit Conversion**: Instant live toggle between **Inches (in)** and **Centimetres (cm)** with mathematical conversion (`1 in = 2.54 cm`).
- **Dynamic Custom Fields**: Add arbitrary dimensions (e.g., *Cross Back*, *Apex Point*, *Border Width*) with live step increments.
- **1-Click Measurement Reuse**: Select any past measurement profile to automatically prefill new stitching orders.
- **Client History Archive**: Full audit trail of past measurements per client.

### 3.2 Dashboard & Visual Analytics
- **8 Real-Time Metrics**: Total Customers, Total Orders, Pending Orders, Orders in Progress, Completed Orders, Upcoming Deliveries, Overdue Deliveries, and Total Revenue.
- **Interactive Recharts**:
  - Monthly Orders & Revenue Trend (Dual Area/Bar chart)
  - Order Status Distribution (Donut chart with status slices)
  - Garment Type Popularity (Bar chart)
- **Recent Orders Register**: Instant quick status updater and job card viewer.

### 3.3 Customer Management
- Add, Edit, Delete, and Search customers.
- **Smart Search**: Filter simultaneously across Customer Name, Phone Number, Customer ID, and Email.
- **Auto-Generated Unique IDs**: Formatted as `CUST-1001`, `CUST-1002`, etc.
- **Customer Dossier**: View linked measurement profiles and order history in one place.

### 3.4 Order Management & Workflow Stepper
Each order tracks:
- Unique Order ID (`ORD-2026-1001`), Customer, Garment Type, Measurements snapshot, Fabric details, Stitching instructions, Dates, and Financials.
- **8 Workflow Stages**:
  1. `Order Received`
  2. `Measurement Taken`
  3. `Stitching in Progress`
  4. `Ready for Trial`
  5. `Alteration Required`
  6. `Completed`
  7. `Delivered`
  8. `Cancelled`
- Visual progression stepper with date-stamped audit history.
- Automatic balance calculation (`Total - Advance = Balance Due`).

### 3.5 Fitting & Alteration Notes
- Record trial sessions (First Trial, Second Trial, Final Fitting, Post-Delivery).
- Record outcome (Perfect Fit, Minor Alteration, Major Alteration, Approved).
- Automatically updates parent order to `Alteration Required` when alterations are noted.
- Resolution toggle: mark alterations completed when garments are adjusted.

### 3.6 Delivery Management
- Upcoming delivery tracker (Next 7 days).
- **Overdue Highlighting**: Clear crimson alert badges for orders that missed their delivery deadline.
- Quick actions: *Mark Delivered*, *Mark Ready for Pickup*, *Reschedule Date*.

### 3.7 Reports & PDF Invoicing
- Generates downloadable, print-ready PDF Job Cards & Invoices using **ReportLab**.
- Generates comprehensive **Boutique Business Summary Reports**.
- In-browser clean print stylesheets for physical printing.

---

## 🗄️ 4. MongoDB Database Collections

| Collection Name | Document Model | Description |
|---|---|---|
| `customers` | `Customer` | Customer records, contact details, notes |
| `orders` | `Order` | Tailoring orders, fabric specs, payment & status history |
| `garment_profiles` | `GarmentProfile` | Dynamic measurement books & custom dimensions |
| `fitting_notes` | `FittingNote` | Trial session logs, alteration instructions |
| `delivery_dates` | `DeliveryDate` | Scheduled & actual delivery tracking |
| `admin_users` | `AdminUser` | Hashed admin credentials & authentication |

---

## 🚀 5. How to Run the Application

### Prerequisites
- Python 3.12 (Installed in existing `venv`)
- Node.js 26+ and npm 11+
- Git

---

### Step 5.1: Backend Configuration & Startup

1. Open a PowerShell terminal in the project root:
   ```powershell
   cd C:\Users\apoor\TailorBoutique
   ```

2. (Optional) Configure MongoDB Atlas in `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/tailor_boutique_db?retryWrites=true&w=majority
   MONGODB_DB_NAME=tailor_boutique_db
   SECRET_KEY=boutique-secret-key-college-project-2026-tailor-secure-hash
   DEBUG=True
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   ```
   > **Note**: If `MONGODB_URI` is left blank, the application automatically uses the built-in in-memory MongoDB engine, so the app runs and tests pass immediately without any configuration!

3. Run the Django development server:
   ```powershell
   .\venv\Scripts\python.exe backend\manage.py runserver 127.0.0.1:8000
   ```
   Backend will be online at: **`http://127.0.0.1:8000`**  
   API Health & Docs: **`http://127.0.0.1:8000/api/health/`**

---

### Step 5.2: Frontend Startup

1. Open a second PowerShell terminal in the project root:
   ```powershell
   cd C:\Users\apoor\TailorBoutique\frontend
   ```

2. Start the Vite React development server:
   ```powershell
   npm.cmd run dev
   ```

3. Open your browser and navigate to:
   👉 **`http://localhost:5173`**

---

## 🔐 6. Admin Authentication Credentials

The application is pre-seeded with default administrator credentials:
- **Username**: `admin`
- **Password**: `admin123`

The frontend automatically logs in with these demo credentials for instant evaluation, and provides a **Master Tailor Portal** modal to test manual authentication, session tokens, and logout.

---

## 🧪 7. Automated Tests

Run backend unit tests verifying all 9 core API endpoints:
```powershell
.\venv\Scripts\python.exe backend\manage.py test api.tests_api
```
All tests verify customer CRUD, dynamic measurement storage, order creation, balance math, PDF invoice generation, and report data.

---

## 📁 8. Project Structure

```
TailorBoutique/
├── backend/
│   ├── api/
│   │   ├── auth_helpers.py       # Token verification & decorators
│   │   ├── db.py                 # MongoDB Atlas connection manager & fallback
│   │   ├── garment_templates.py  # 7 Garment measurement schemas
│   │   ├── models.py             # MongoEngine Document models (6 collections)
│   │   ├── pdf_reports.py        # ReportLab PDF invoice & report generator
│   │   ├── seed_data.py          # Realistic boutique demonstration data
│   │   ├── tests_api.py          # Automated test suite
│   │   ├── urls.py               # REST API URL routes
│   │   └── views.py              # API viewsets & business logic
│   ├── boutique_backend/
│   │   ├── settings.py           # Django & CORS configuration
│   │   ├── urls.py               # Root URL configuration
│   │   └── wsgi.py
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DatabaseBadge.jsx # Live Atlas connection status indicator
│   │   │   ├── Header.jsx        # Top boutique bar
│   │   │   ├── LoginModal.jsx    # Master tailor authentication dialog
│   │   │   └── Sidebar.jsx       # 10-Item navigation sidebar
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # 8 KPI stats + Recharts analytics
│   │   │   ├── Customers.jsx     # Client directory, search & dossier
│   │   │   ├── Measurements.jsx  # Dynamic Measurement Book (Core Feature)
│   │   │   ├── NewOrder.jsx      # Multi-step order booking & measurement reuse
│   │   │   ├── Orders.jsx        # Order management & filters
│   │   │   ├── OrderDetailModal.jsx # Workflow stepper & Job card
│   │   │   ├── FittingNotes.jsx  # Trial sessions & alteration notes
│   │   │   ├── DeliveryManagement.jsx # Delivery tracking & overdue alerts
│   │   │   ├── Reports.jsx       # Executive statements & PDF exports
│   │   │   └── Settings.jsx      # Atlas config & seed reset
│   │   ├── services/
│   │   │   └── api.js            # Axios client with bearer auth
│   │   ├── App.jsx               # React Router layout
│   │   ├── index.css             # Boutique luxury styling tokens
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── venv/                         # Python 3.12 Virtual Environment
├── .gitignore
└── README.md
```

---

## 🏆 9. Academic Project Deliverables Checklist

- [x] Complete React.js + Vite Frontend with Recharts & Lucide Icons
- [x] Python 3.12 + Django + Django REST Framework Backend
- [x] MongoDB Atlas NoSQL Database integration via MongoEngine & PyMongo
- [x] Dynamic Measurement Management for all 7 garments (Blouse, Chudidar, Kurti, Gown, Lehenga, Salwar Suit, Custom)
- [x] Inches & Centimetres dual unit support with live toggle
- [x] Dynamic custom measurement fields
- [x] Measurement reuse for new orders
- [x] 8-Stage Order Status Workflow with audit timeline
- [x] Fitting Notes & Alteration management
- [x] Delivery tracking with overdue alerts
- [x] ReportLab server-side PDF generation & browser printing
- [x] Professional Boutique Luxury UI design (Cream, Blush Pink, Muted Brown, Beige)
- [x] 10-Item Sidebar Navigation
- [x] Environment variables & `.env.example`
- [x] Seed data with realistic sample records
- [x] Automated test suite passing 100%
