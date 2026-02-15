# Flowly — Premium Financial Infrastructure

**Clinical Precision. Deterministic Intelligence. Fluid Control.**

Flowly is a high-fidelity, privacy-centric financial operating system designed for individuals who demand surgical precision and a clinical design aesthetic. Developed by **OMReda**, it merges advanced data isolation with AI-assisted deterministic modeling to move beyond simple "expense tracking" into true **Behavioral Wealth Management**.

> [!IMPORTANT]
> **PROJECT STATUS: FOR SALE**
> This project, including its full intellectual property, source code, design architecture, and branding, is currently available for acquisition. For professional inquiries, contact **OMReda**.

---

## 💎 Design Philosophy
Flowly is built on the principle of **"Command Console" density**—high-contrast, medical-grade UI that prioritizes information velocity without visual clutter.
- **Surface Aesthetics**: Modern HSL-based color tokens with a deep obsidian palette.
- **Physicality**: Every interaction is fueled by **Framer Motion** spring physics, making the interface feel tactile, responsive, and alive.
- **Visual Hierarchy**: Data is weighted and anchored to eliminate lopsidedness, creating a balanced, high-density dashboard experience.

## 🧠 Core Intelligence
Designed to eliminate "guesswork" in personal finance through deterministic logic:

- **Pulse Intelligence**: A real-time system vitality engine that monitors spending momentum, efficiency, and behavioral patterns.
- **Roast & Boast**: A personality-driven feedback loop that holds you accountable. It intelligently celebrates discipline and "roasts" lifestyle expansion, adapting its tone and styling based on your live spending data.
- **Deterministic Forecasting**: Unlike standard arithmetic projections, Flowly use weighted temporal averages and anomaly-filtered daily limits to project future month-end spend with high mathematical confidence.
- **Precision Budget Pacing**: Get data-driven context for every dollar. Flowly calculates your **Recommended Daily Limit** vs. your **Current Daily Average** in real-time, clamping negative values to zero and providing immediate recovery guidance if the budget is breached.
- **Smart Insight Framing**: Insights are automatically gated by confidence levels (e.g., "Early Pattern Detected"), ensuring the system never over-promises on limited data.

## 🛠️ Technology Stack
A state-of-the-art stack focused on speed, type-safety, and local-first data sovereignty.

| Layer | Technology |
|---|---|
| **Framework** | **Next.js 16** (App Router, Server Actions) |
| **Logic** | **TypeScript** (Static Typing), **Drizzle ORM** |
| **Data** | **SQLite / LibSQL** (Local-Sovereignty, High-Performance) |
| **Animation** | **Framer Motion** (Custom Physics-based Motion) |
| **Styling** | **Tailwind CSS v4** (Modern CSS Architecture) |
| **AI Engine** | **Google Gemini 1.5 Pro** (Stateless Analysis) |
| **Authentication** | **Auth.js (v5)** (Secure, Edge-ready) |

## 🚀 Deployment & Setup

### Prerequisites
- Node.js 18.x or 20.x
- npm / pnpm

### Installation
1. **Clone the Repository**
   ```bash
   git clone https://github.com/OMReda/Flowly.git
   cd Flowly
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env.local` file with the following keys:
   ```env
   DATABASE_URL="file:./flowly_prod.db"
   AUTH_SECRET="your-generated-secret"
   GEMINI_API_KEY="your-google-ais-key"
   ```

4. **Initialize Database**
   ```bash
   npm run db:push
   ```

5. **Spin Up Development Server**
   ```bash
   npm run dev
   ```

## 📜 Proprietary Notice
Copyright (c) 2026 **OMReda**. All Rights Reserved.

This software is provided under a **Proprietary License**. Unauthorized distribution, modification, reverse-engineering, or commercial exploitation without prior acquisition of the intellectual property is strictly prohibited. 

**For acquisition inquiries or to schedule a demo, contact OMReda.**
