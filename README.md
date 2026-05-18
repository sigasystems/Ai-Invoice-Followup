# PayPilot AI - Modern SaaS MVP

PayPilot AI is a premium SaaS platform designed to automate invoice follow-ups using AI-powered escalation logic.

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **State Management**: Zustand, TanStack Table
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **Authentication**: Better Auth
- **Automation**: n8n (Orchestration & Delivery)
- **Animations**: Framer Motion

## 📂 Project Structure

- `src/app`: Next.js pages and API routes.
- `src/components`: Reusable UI components.
- `src/lib`: Core services, auth, and prisma client.
- `src/store`: Zustand state management.
- `prisma`: Database schema and seed data.

## ⚙️ Features

- **Automated Overdue Tracking**: Automatically calculates escalation stages and tones.
- **Escalation Ladder**: Custom steps for follow-ups (Neutral -> Polite -> Firm -> Urgent -> Escalation).
- **Customer Risk Engine**: Automatically calculates customer risk levels based on payment history.
- **Activity Timeline**: Real-time tracking of all automation events.
- **Modern Dashboard**: High-level analytics and trends.

## 🛠️ Setup Instructions

1. **Clone the repository**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Set up Environment Variables**
   Create a `.env` file based on `.env.example`.
4. **Database Migration**
   ```bash
   npx prisma migrate dev --name init
   ```
5. **Seed the Database**
   ```bash
   npx prisma db seed
   ```
6. **Run the Development Server**
   ```bash
   npm run dev
   ```

## 🤖 n8n Integration

The system sends payloads to n8n for AI generation and delivery. Ensure your n8n webhook URL is configured in `.env`.

---

Built with ❤️ by Antigravity
