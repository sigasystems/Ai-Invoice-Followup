import { ReactNode } from "react";

export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'In Plan';

export interface Installment {
  id: string;
  dueDate: string;
  amount: number;
  status: 'Paid' | 'Upcoming' | 'Delayed';
  percentage: number;
}

export interface PaymentPlan {
  id: string;
  startDate: string;
  totalInstallments: number;
  installments: Installment[];
  progress: number;
}

export interface Invoice {
  last_reminder_sent: any;
  paid: any;
  config: any;
  reminder_dates: never[];
  gmailDraftId: string | null;
  hasPendingDraft: boolean;
  invoice_number: string;
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  daysOverdue: number;
  createdAt: string;
  startFollowups: number;
  prediction?: 'Likely' | 'At Risk' | 'Delayed';
  paymentPlan?: PaymentPlan;
  reminder_stage?: number;
  tone?: string;
  reminder_stages?: number[];
  tones?: string[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalInvoices: number;
  behaviorScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  totalOutstanding: number;
  avgDelay: number;
  onTimeRate: number;
  predictedPayDate?: string;
  aiInsight?: string;
  notes?: string;
  // Collection journey
  maxReminderStage: number;   // Highest stage ever reached across all invoices
  avgReminderStage: number;   // Average stage across invoices with reminders
  escalationReached: boolean; // True if any invoice hit stage ≥ 4 (manager)
  stagesUsed: number[];       // Unique sorted stages used
  paidAtStage: number;        // Avg stage at which paid invoices were resolved
}

export interface Activity {
  id: string;
  customerId: string;
  customerName: string;
  channel: 'Email' | 'WhatsApp' | 'SMS' | 'Manager Escalation' | 'Draft Created' | 'Human Review';
  status: 'Sent' | 'Delivered' | 'Failed' | 'Pending Approval' | 'Escalated';
  timestamp: string;
  message?: string;
}

export interface DashboardMetrics {
  totalOutstanding: number;
  collectedThisMonth: number;
  overdueInvoices: number;
  recoveryRate: number;
}
