# SpendWise AI

**Refined Financial Control.**

SpendWise AI is a modern, privacy-focused financial dashboard that combines deterministic financial logic with AI-powered insights to help you track, analyze, and optimize your spending. It features robust transaction management, intelligent forecasting, and a premium "medical-grade" UI.

![SpendWise Dashboard](./public/dashboard-preview.png)

## Key Features

- **📊 Financial Dashboard**: Real-time view of your Burn Rate, Spending Mix, and Net Balance.
- **🧠 AI Insights**: Google Gemini-powered analysis of your spending habits, providing actionable advice and detecting anomalies.
- **🔮 Smart Forecasting**: Deterministic projection of your next month's expenses based on daily average spend, with confidence gating for low data.
- **🧾 Receipt Processing**: Upload receipts or paste text to automatically extract transaction details using AI.
- **🛡️ Privacy First**: Your data stays local (SQLite) or on your controlled infrastructure. AI processing is stateless.
- **💎 Premium UI**: Built with a focus on aesthetics, using smooth animations (Framer Motion) and clean data visualization (Recharts).

## Tech Stack

- **Framework**: [Next.js 15+ (App Router)](https://nextjs.org/)
- **Language**: TypeScript
- **Database**: [SQLite](https://www.sqlite.org/) (via [Better-SQLite3](https://github.com/WiseLibs/better-sqlite3) / [LibSQL](https://turso.tech/))
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Auth.js (NextAuth v5)](https://authjs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/)
- **Visualization**: [Recharts](https://recharts.org/), [Tremor](https://www.tremor.so/)
- **AI**: [Google Gemini Pro](https://deepmind.google/technologies/gemini/)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/spendwise-ai.git
    cd spendwise-ai
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory and add the following:
    
    ```env
    # Database (SQLite file path)
    DATABASE_URL="file:./local.db"
    
    # Auth.js Secret (Generate with `npx auth secret`)
    AUTH_SECRET="your-secret-here"
    
    # Google Gemini API Key (for AI insights & receipt parsing)
    GEMINI_API_KEY="your-gemini-api-key"
    ```

4.  **Database Setup:**
    Push the schema to your local SQLite database:
    ```bash
    npm run db:push
    ```
    
    *(Optional) Seed with demo data:*
    ```bash
    npm run db:seed
    ```

5.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    
    Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: Reusable UI components and specialized charts.
- `src/lib`: Utility functions, types, and core deterministic logic.
- `src/db`: Drizzle ORM schema and database connection setup.
- `src/actions`: Server Actions for data mutation and AI processing.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open-source and available under the [MIT License](LICENSE).
