# 🚀 PayPilot: Autonomous Debt Recovery & AI Follow-up

**PayPilot** is an intelligent AI-powered platform designed to automate the painful process of chasing unpaid invoices. It serves as the "Command Center" for your accounts receivable, using artificial intelligence to recover debt faster, improve cash flow, and eliminate the need for manual emailing.

---

## 🌟 What is PayPilot? (The Summary)
Chasing payments is usually slow, manual, and uncomfortable. PayPilot solves this by acting as an **Autonomous Collection Agent**. It monitors your invoices 24/7, decides who needs a reminder, and uses AI to write and send personalized emails that sound like they came from your finance team.

Instead of your team spending hours in their inbox, they simply check the PayPilot Dashboard to see how much money has been recovered automatically.

---

## 🛠️ Main Dashboard Features

### 1. **Executive Dashboard (The Nerve Center)**
*   **Cash Flow Monitoring**: See exactly how much is outstanding and how much was collected this month.
*   **Revenue Dynamics**: A visual comparison of your sales (Invoiced) vs. actual cash received (Recovered).
*   **Risk Triage**: Automatically flags "High Risk" accounts that need your attention before they default.

### 2. **Invoices Management (Automation Control)**
*   **Lifecycle Tracking**: Every invoice has a "Journey" bar showing exactly which reminder stage it is currently in.
*   **Next Action Prediction**: The system tells you exactly when the next reminder will be sent (e.g., "Tomorrow at 12:00 AM").
*   **Manual Overrides**: Pause automation or "Snooze" reminders for specific VIP clients with a single click.

### 3. **Customer Intelligence (Behavioral Analysis)**
*   **Behavior Scoring**: Customers are scored (0-100) based on their payment habits.
*   **Collection Journey**: See at a glance how many reminders a specific customer usually takes before they pay.
*   **Risk Profile**: Automatic categorization into Low, Medium, or High risk based on historical delays.

### 4. **Activity Engine (The Audit Trail)**
*   **Real-Time Logs**: A live stream of every email drafted, every reminder sent, and every customer reply received.
*   **AI Efficiency Tracking**: Monitors how well the AI is performing so you can trust the automation.

---

## 🧠 The Escalation Strategy (How it works)
The "Brain" of the platform is the **Escalation Ladder** (found in Settings). You define a series of steps:
1.  **Stage 1 (Day 1)**: A "Gentle" email created as a draft.
2.  **Stage 2 (Day 10)**: A "Firm" follow-up sent automatically.
3.  **Final Stage**: A "Manager Escalation" where leadership is notified to step in.

The system handles the timing, the tone, and the delivery with zero manual effort required.

---

## 🔗 How PayPilot works with n8n
PayPilot isn't just a dashboard—it's connected to your existing tools via **n8n** (an automation bridge). Here is how they work together in simple terms:

1.  **Syncing Data**: n8n pulls your latest invoices from Google Sheets or your CRM and "feeds" them into the PayPilot dashboard.
2.  **Sending Reminders**: When PayPilot's logic says "It's time for a reminder," it sends a signal to n8n. n8n then talks to your **Gmail** to either create a draft or send the email directly.
3.  **Closing the Loop**: Whenever a customer replies to your email, n8n detects it and updates the PayPilot **Activity Engine** so you can see the reply without leaving the dashboard.

---

## 🚀 Quick Setup
1.  **Connect your Database**: Ensure your environment variables are set up.
2.  **Define your Ladder**: Go to **Settings** and set your Delay Days and AI Tones.
3.  **Link n8n**: Paste your n8n Webhook URL in the Settings page to activate the "Bridge."
4.  **Watch it Work**: Your invoices will populate, and the automation will begin monitoring your receivables immediately.

---
*Created for the Future of Finance – PayPilot.*
