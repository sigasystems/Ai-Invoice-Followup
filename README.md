# 🚀 PayPilot: Smart AI Receivables Dashboard 

**PayPilot** is a high-performance, production-ready SaaS dashboard designed for AI-driven collections automation. It acts as the command center for your **n8n automation workflows**, turning raw invoices into actionable financial insights.

---

## 🏛 The Ecosystem Architecture
PayPilot operates as a **State-of-the-Art Frontend** synchronized with an **n8n Automation Engine**.

### 1. Dashboard (The Command Center)
Built with **Next.js 15+**, **Tailwind CSS v4**, and **shadcn/ui**, it provides:
- **AI Forecast Engine**: Real-time payment probability scoring (e.g., "82% Likely to Pay").
- **Customer Health**: Deep tracking of **On-Time Rates** and **Behavior Scores**.
- **Unified Activity Logs**: A full audit trail of every Email, WhatsApp, and SMS sent by n8n.
- **Privacy Controls**: Native GDPR compliance toggles and consent management.

### 2. n8n Workflow (The Automation Brain)
Your n8n flow handles the heavy lifting:
- **Scheduled Invoicing**: Reads Google Sheets, decides the "Reminder Stage" (Mild, Firm, Urgent).
- **LLM Content Generation**: Dynamically crafts personalized messages based on customer history and your set **"Tone"**.
- **Sentiment Loop**: Listens to incoming Gmail/WhatsApp replies and uses an LLM to detect frustration or payment intent.
- **Auto-Logging**: Appends logs back to your systems to close the data loop.

---

## 🔗 n8n Integration Mapping

### 📤 What the Dashboard sends to n8n:
Triggered via `src/lib/n8n.ts` webhooks.
| Field | Purpose | Example |
| :--- | :--- | :--- |
| `invoiceId` | Uniquely identify the context | `INV-102` |
| `customerEmail` | Destination for Gmail nodes | `finance@buyer.com` |
| `amount` | Injected into LLM prompts | `₹15,400` |
| `tone` | Instructs the "Message a Model" node | `Friendly` / `Firm` |
| `action` | Determines the n8n branch to take | `SEND_FOLLOWUP` |

### 📥 What n8n sends back to the Dashboard:
Resulting in direct UI updates.
| Dashboard Field | Source from n8n | Logic |
| :--- | :--- | :--- |
| **Behavior Score** | `ai_sentiment_score` | LLM analysis of incoming replies (0-100) |
| **AI Insight** | `llm_summary` | One-sentence summary of customer health |
| **On-Time Rate** | `payment_history_calc` | Calculated based on GSheet payment logs |
| **Activity Status** | `message_delivery_callback` | Real-time "Delivered" or "Failed" status |

---

## 🧠 AI Predictions & Tracking
We track three critical "Predictive" metrics to help you recover debt faster:
1.  **Payment Probability**: Calculated by analyzing historical "Average Delay" in your sheets.
2.  **Tone Adaptation**: The dashboard tells n8n whether to be *Friendly*, *Firm*, or *Neutral* based on the customer's behavior score.
3.  **Risk Profiling**: Customers are automatically tagged as **Low**, **Medium**, or **High Risk** based on the frequency of n8n escalations.

---

## 🛠 Setup & Installation

### 1. Clone & Install
```bash
# Install dependencies
npm install

# Run the developer server
npm run dev
```

### 2. Configure n8n Webhook
1. Go to **Settings > n8n Integration** in the dashboard.
2. Paste your **n8n Webhook URL** (e.g., `https://n8n.yourdomain.com/webhook/your-id`).
3. Ensure your n8n flow is active.

### 3. Data Integration
PayPilot is designed to be connected to a database (like Supabase or Postgres). Your n8n flow should:
1. **Read from Sheets** as it does currently.
2. **Post to the Dashboard API** (or shared Database) to update the metrics you see.

---

## 🛡 Privacy & Compliance
- **Opt-Out Logic**: n8n workflows should check the `consent_verified` field before sending WhatsApp messages.
- **GDPR Toggles**: Built-in settings for automatic data retention and consent management.

---

## 🧩 Tech Stack Summary
- **Frontend**: Next.js (App Router), TypeScript
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Data Management**: TanStack Table v8
- **Visuals**: Recharts (Modern Dashboard mode)
- **Automation Helper**: custom `triggerN8nWorkflow` utility

---
*Generated for PayPilot – Smart Receivables Automation System.*
