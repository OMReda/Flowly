# Flowly AI — Fluid Financial Infrastructure

**High-Fidelity Financial Control, Deterministic Insights.**

Flowly AI is a premium, privacy-centric financial ecosystem designed for those who demand precision, aesthetics, and privacy. Developed by **OMRed**, it merges clinical design with advanced data isolation and AI-assisted financial modeling.

> [!IMPORTANT]
> **PROJECT STATUS: FOR SALE**
> This project, including its intellectual property, source code, and design architecture, is currently available for acquisition. For professional inquiries or to discuss a project acquisition, please contact **OMRed**.

---

## 💎 Design Philosophy
Flowly is built on the principle of **"Medical-Grade" UI**—minimalist, high-contrast, and focused on data density without clutter. Every interaction is fueled by **Framer Motion** spring physics to ensure the interface feels tactile and alive.

## 🧠 Core Intelligence
- **Deterministic Forecasting**: Unlike standard apps, Flowly uses weighted temporal averages to project future spend with high mathematical confidence.
- **Gemini-Powered Insights**: Stateless AI integration provides surgical advice on your spending habits without compromising data sovereignty.
- **Segmented History Management**: An advanced Archive Journal with four-way sorting (Recent, Oldest, Largest, Smallest) for deep-dive forensic accounting.
- **Receipt Extraction Engine**: Proprietary logic to transform raw receipt text or images into structured financial records in seconds.

## 🛡️ Security & Isolation
- **Hardware-Level Scoping**: Redundant user-id validation at the database query level to ensure 100% data isolation.
- **Soft-Delete with Audit Logs**: Full traceability of every modification, restoration, and deletion within your ledger.
- **Local Sovereignty**: Powered by SQLite/LibSQL, ensuring your raw financial history remains within your controlled infrastructure.

## 🛠️ Technology Stack
| Component | Technology |
|---|---|
| **Core** | Next.js 15 (App Router), TypeScript |
| **Logic** | Drizzle ORM, SQLite / Turso |
| **Motion** | Framer Motion (Custom Springs) |
| **Style** | Tailwind CSS v4 (Modern HSL tokens) |
| **Intelligence** | Google Gemini 1.5 Pro |
| **Auth** | Auth.js (v5) |

## 🚀 Deployment
### Prerequisites
- Node.js 18+
- npm

### Quick Start
1. **Clone & Install**
   ```bash
   git clone https://github.com/OMRed/flowly-ai.git
   cd flowly-ai
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file:
   ```env
   DATABASE_URL="file:./flowly_prod.db"
   AUTH_SECRET="your-secret"
   GEMINI_API_KEY="your-api-key"
   ```

3. **Database Migration**
   ```bash
   npm run db:push
   ```

4. **Launch Application**
   ```bash
   npm run dev
   ```

## 📜 Proprietary Notice
Copyright (c) 2026 **OMRed**. All Rights Reserved.
This software is provided under a **Proprietary License**. Unauthorized distribution, modification, or commercial use without prior acquisition is strictly prohibited. 

**For acquisition inquiries, contact OMRed.**
