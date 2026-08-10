# Mini ERP + CRM Operations Portal

A web-based Operations Portal for wholesale/distribution businesses, combining core ERP capabilities with targeted CRM features. Built for Fundsroom Infotech Pvt. Ltd. technical case study evaluation.

---

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Axios, Lucide Icons, Vite
- **Backend**: Node.js, Express.js, TypeScript, Zod, JWT, Prisma ORM
- **Database**: PostgreSQL
- **Architecture**: Modular Monolith

---

## 📂 Repository Structure

```
mini-erp-crm-portal/
├── frontend/          # React + TypeScript + Vite + Tailwind CSS
├── backend/           # Node.js + Express + TypeScript + Prisma
├── docs/              # System architecture & technical documentation
├── postman/           # Postman API Collections & Environment exports
└── README.md          # Project overview & documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- PostgreSQL (v14+)

---

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables file:
   ```bash
   cp .env.example .env
   ```
4. Start the backend dev server:
   ```bash
   npm run dev
   ```
   Backend server starts on `http://localhost:5000`.

---

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables file:
   ```bash
   cp .env.example .env
   ```
4. Start the frontend dev server:
   ```bash
   npm run dev
   ```
   Frontend app runs on `http://localhost:3000`.

---

## 📌 Development Roadmap

- [x] **Phase 0** — Project Initialization
- [ ] **Phase 1** — Architecture + Database
- [ ] **Phase 2** — Backend Foundation
- [ ] **Phase 3** — Authentication + RBAC
- [ ] **Phase 4** — Customer CRM
- [ ] **Phase 5** — Products
- [ ] **Phase 6** — Inventory + Stock Movements
- [ ] **Phase 7** — Sales Challans
- [ ] **Phase 8** — Challan Business Logic + Transactions
- [ ] **Phase 9** — Frontend Foundation
- [ ] **Phase 10** — Dashboard
- [ ] **Phase 11** — CRM Frontend
- [ ] **Phase 12** — Inventory Frontend
- [ ] **Phase 13** — Challan Frontend
- [ ] **Phase 14** — Frontend/Backend Integration
- [ ] **Phase 15** — Testing + Edge Cases
- [ ] **Phase 16** — Postman + API Documentation
- [ ] **Phase 17** — README + Technical Documentation
- [ ] **Phase 18** — Deployment
- [ ] **Phase 19** — Final QA
- [ ] **Phase 20** — Screen Recording Preparation
