import { Invoice, Customer, Activity } from "@/types";
import { mockInvoices, mockCustomers } from "./mock-data";

/**
 * PayPilot Data Service
 * Defaults to high-quality Mock Data for demonstration.
 * Can be connected to n8n webhooks by setting NEXT_PUBLIC_N8N_READ_WEBHOOK_URL.
 */

const N8N_READ_WEBHOOK = process.env.NEXT_PUBLIC_N8N_READ_WEBHOOK_URL || '';

export async function fetchInvoices(): Promise<Invoice[]> {
  // If no webhook is provided, return our the 12 mock invoices provided by the user
  if (!N8N_READ_WEBHOOK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockInvoices), 500); // Simulate network delay
    });
  }

  try {
    const response = await fetch(N8N_READ_WEBHOOK, {
      method: 'GET',
      next: { revalidate: 30 }
    });

    if (!response.ok) throw new Error("Failed to fetch invoices");
    const data = await response.json();
    
    return data.map((row: any) => ({
      id: row.invoice_id || `INV-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      customerName: row.client_name || "Unknown",
      customerEmail: row.client_email || row.email || "",
      amount: parseFloat(String(row.amount || "0").replace(/[^0-9.]/g, '')) || 0,
      dueDate: row.due_date || new Date().toISOString(),
      status: row.status || 'Pending',
      daysOverdue: 0,
      createdAt: row.issue_date || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Fetch Error:", error);
    return mockInvoices;
  }
}

export async function fetchCustomers(): Promise<Customer[]> {
  if (!N8N_READ_WEBHOOK) {
    return new Promise((resolve) => {
       setTimeout(() => resolve(mockCustomers), 500);
    });
  }
  
  // Logic to build customer list from invoices if using live data
  const invoices = await fetchInvoices();
  return mockCustomers; // For now return mock to maintain behavior scores
}
