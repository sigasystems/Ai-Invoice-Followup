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
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  daysOverdue: number;
  createdAt: string;
  prediction?: 'Likely' | 'At Risk' | 'Delayed';
  paymentPlan?: PaymentPlan;
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
}

export interface Activity {
  id: string;
  customerId: string;
  customerName: string;
  channel: 'Email' | 'WhatsApp' | 'SMS';
  status: 'Sent' | 'Delivered' | 'Failed';
  timestamp: string;
  message?: string;
}

export interface DashboardMetrics {
  totalOutstanding: number;
  collectedThisMonth: number;
  overdueInvoices: number;
  recoveryRate: number;
}
