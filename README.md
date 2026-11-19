# ✂️ TAILOR & BOUTIQUE MEASUREMENT BOOK
### A Digital Boutique & Haute Couture Tailoring Management System
*Full-Stack College Final Project*

---

## 🌟 ONE UNIFIED LINK

Both the **React Frontend** and **Django REST API** are now combined and served simultaneously from a **single port and URL**:

👉 **[http://127.0.0.1:8000](http://127.0.0.1:8000)** *(or [http://localhost:8000](http://localhost:8000))*

- Open that single link in your browser to access the entire application.
- No separate Vite dev server needed.
- No CORS errors.
- All client-side routes (`/customers`, `/measurements`, `/orders`, `/new-order`, `/fitting-notes`, `/deliveries`, `/reports`, `/settings`) and `/api/` endpoints work together seamlessly.

---

## ⚡ Quick 1-Click Launch Options

You can start the unified application using any of the following:

### Option A: Double-Click the Batch File (Windows)
Double-click `run.bat` in the project root folder.

### Option B: Run via Python Runner
```powershell
.\venv\Scripts\python.exe run.py
```

### Option C: Run via Django Manage
```powershell
.\venv\Scripts\python.exe backend\manage.py runserver 127.0.0.1:8000
```

---

## 🔑 Demo Login Credentials
- **Username**: `admin`
- **Password**: `admin123`

*(The frontend automatically logs in with these demo credentials on initial load).*

---

## 🛠️ Technology Stack
- **Frontend**: React.js 19 + Vite 8 + Recharts + Lucide Icons + React Router 7 + Axios
- **Backend**: Python 3.12 + Django 6.1 + Django REST Framework + ReportLab 5.1
- **Database**: MongoDB Atlas via MongoEngine & PyMongo (with continuous in-memory fallback)

---

## 🧪 Automated API Tests
To run backend unit tests verifying all 9 core API endpoints:
```powershell
.\venv\Scripts\python.exe backend\manage.py test api.tests_api
```
*(All 9 tests pass with flying colors)*
# Tailor-Boutique-Measurement-Book
A web based tailor and boutique management system for customer measurements,stiching orders and delivery tracking
