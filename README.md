# 🚀 Zrovyn Finance Dashboard — Backend Developer Assignment

> **A production-ready, full-stack finance dashboard demonstrating clean architecture, secure role-based access control, and robust data aggregation.**
> Built with ❤️ by **Vishal Gupta** (vishal.2226cs@gmail.com)

---

Welcome to my submission for the **Zrovyn Backend Developer Intern** role. 

When approaching this assignment, my primary goal wasn't just to build APIs that "work", but to design a system that is **secure, maintainable, and logically sound**. I treated this project as a real-world production application rather than a simple minimum viable product. 

Below, you'll find a breakdown of the architecture, the specific engineering decisions I made, and a quick guide on how to evaluate the system.

---

## 🌟 Highlights for the Evaluator

If you're short on time, here are the key areas I'd love for you to review:

1. **Robust Role-Based Access Control (RBAC):** I implemented strict middleware that universally protects routes based on user roles (`admin`, `analyst`, `viewer`). Try accessing the `/api/users` endpoint as a Viewer—the system securely rejects it.
2. **Advanced MongoDB Aggregation:** Instead of calculating dashboard metrics in memory, the `/api/dashboard/summary` and `/api/dashboard/monthly-trends` endpoints utilize efficient, multi-stage MongoDB aggregation pipelines to process data directly at the database layer.
3. **Enterprise-Grade Security:** I utilized HTTP-only cookies for JWT storage (preventing XSS), bcrypt for password hashing, and integrated `helmet` and `express-rate-limit` to protect against common web vulnerabilities and brute-force attacks.
4. **Resilient Error Handling:** I built a custom `AppError` class and a centralized global error-handling middleware to ensure the API always returns consistent, predictable JSON error responses.
5. **Bonus - Integration Testing:** I proactively included a basic Jest + Supertest integration suite with an in-memory MongoDB environment to demonstrate automated testing of authentication and health endpoints.

---

## ✨ System Features

### Core Capabilities
- **Complete Financial Record Management:** Full CRUD operations with advanced server-side filtering (by date, category, and type), searching, and pagination.
- **Dynamic Analytics Dashboard:** Summary cards, monthly trailing trends, and category breakdown charts.
- **Hierarchical User Management:** Admins can effortlessly create, update, and manage user roles and their active/inactive status.

### The "Extra Mile" Features
- **Soft Deletes:** Records and users are never permanently dropped, allowing for safe data recovery and audit trails.
- **Data Export:** Built-in capability to export filtered financial records as CSV files.
- **Intelligent Seeding:** A robust `seedData.js` script to instantly populate the database with realistic, multi-month data for immediate visualization.

---

## 🛡️ Access Control Matrix

The system dynamically enforces permissions at both the API routing layer and the frontend UI layer:

| Action / Capability       | 👑 Admin | 📊 Analyst | 👀 Viewer |
|--------------------------|-------|---------|--------|
| **View Dashboard**       | ✅    | ✅      | ✅     |
| **View Financial Records**| ✅    | ✅      | ❌     |
| **Export Data to CSV**   | ✅    | ✅      | ❌     |
| **Create/Update Records**| ✅    | ❌      | ❌     |
| **Manage Users (CRUD)**  | ✅    | ❌      | ❌     |

---

## 🏗️ Technical Architecture

| Layer | Technologies Used | Why? |
|-------|------------------|------|
| **Backend Core** | Node.js, Express.js | Fast, unopinionated, and excellent for rapid REST API development. |
| **Database** | MongoDB, Mongoose | Schema validation and powerful aggregation capabilities for analytics. |
| **Security** | JWT, bcrypt, express-validator | Industry-standard auth, password hashing, and robust input sanitization. |
| **Frontend** | React (Vite), Tailwind CSS | Snappy UI, utility-first styling, and native-feeling interactivity. |
| **Data Viz** | Recharts, Framer Motion | Clean, responsive charting with fluid layout animations. |

---

## 🧠 Engineering Decisions & Trade-offs

During development, I made several deliberate design choices:

1. **HTTP-only Cookies over LocalStorage:** Storing JWTs in HTTP-only cookies protects the application against Cross-Site Scripting (XSS) attacks, which is critical for a financial application. 
2. **Context API over Redux:** For the scope of this dashboard, Redux would introduce unnecessary boilerplate. The Context API handles our global authentication and theme state perfectly without over-engineering.
3. **Soft Deletes implementation:** Instead of hard-deleting records (`DELETE FROM`), I implemented an `isDeleted` boolean flag. In a real-world fintech app, immutable audit trails are vital. This approach mirrors production safety standards while slightly increasing query logic complexity.
4. **Vite Proxy for Development:** The frontend uses a Vite proxy to forward `/api` requests to the Node server, completely bypassing messy local CORS configurations and mimicking a unified production domain.

---

## 🚀 Quick Setup & Evaluation Guide

Ready to see it in action? You can get the entire full-stack environment running in less than 2 minutes.

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or a valid Atlas URI)

### 1. Start the Backend & Seed Data
```bash
cd backend
npm install

# Copy environment variables
cp .env.example .env

# Seed the database with realistic demo data
npm run seed

# Start the development server
npm run dev
```

### 2. Start the Frontend
Open a new terminal window:
```bash
cd frontend
npm install

# Start the Vite application
npm run dev
```

### 3. Log In & Explore
Access the application at `http://localhost:5173`. You can explore the different access tiers using the automatically seeded accounts:

- **Admin Access:** `admin@finance.com` / `Admin@123`
- **Analyst Access:** `analyst@finance.com` / `Analyst@123`
- **Viewer Access:** `viewer@finance.com` / `Viewer@123`

---

## 🧪 Testing

To run the automated integration test suite (covering API health and authentication flows):

```bash
cd backend
npm run test
```
*(Tests utilize `mongodb-memory-server` to run fully isolated from your actual database).*

---

## 📝 API Documentation

A comprehensive **Postman Collection** is included in the root directory (`Finance_Dashboard_API.postman_collection.json`). It contains pre-configured requests, environment variables, and automatic token extraction for seamless API exploration.

---

*Thank you for taking the time to review my code. I look forward to discussing my architecture and implementation with the Zrovyn team!*
