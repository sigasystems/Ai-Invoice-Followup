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
  calculated_metrics: {};
  daysSinceIssue: number;
  id: string;
  invoice_number: string;
  amount: number;
  dueDate: string | null;
  issueDate: string;
  status: any; // Using any for simplicity as it matches Prisma enum but UI has its own mapping
   startFollowups: number | null;
  followupStartDate: string | null;
  currentStage: number;
  nextActionAt: string | null;
  lastSentAt: string | null;
  lastSentStage: number | null;
  notes: string | null;
  reminder_stages: number[];
  reminder_dates: string[];
  tones: string[];
  hasPendingDraft: boolean;
  gmailDraftId: string | null;
  customerId: string;
  customerName?: string; // These are often flattened in API responses
  customerEmail?: string;
  daysOverdue: number;
  createdAt: string;
  updatedAt: string;
  prediction?: 'Likely' | 'At Risk' | 'Delayed';
  paymentPlan?: PaymentPlan;
  config?: any;
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
  draftUrl?: string; // Optional URL for email drafts
}

export interface GlobalSetting {
  id: string;
  followupStartDelayDays: number;
  escalationLadder: Array<{
    delayDays: number;
    tone: string;
    label: string;
  }>;
  beforeDueReminder: boolean;
  smartEscalation: boolean;
  managerEmails?: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalOutstanding: number;
  collectedThisMonth: number;
  overdueInvoices: number;
  recoveryRate: number;
}
