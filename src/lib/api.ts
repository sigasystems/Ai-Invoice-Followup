import { Invoice, Customer, Activity } from "@/types";

/**
 * PayPilot Client API Service
 * Fetches data dynamically from internal endpoints (database connected).
 */

/**
 * Fetches dynamic invoices from the database via API.
 */
export async function fetchInvoices(): Promise<Invoice[]> {
  try {
    const response = await fetch('/api/dashboard');
    if (!response.ok) throw new Error(`Failed to fetch invoices: ${response.status}`);
    const data = await response.json();
    return data.invoices || [];
  } catch (error) {
    console.error("Dynamic Fetch Error (Invoices):", error);
    return []; // Return empty array instead of mock data
  }
}

/**
 * Normalizes risk level strings to the standard 'Low' | 'Medium' | 'High' union type.
 */
function normalizeRisk(risk: string): Customer['riskLevel'] {
  if (!risk) return 'Low';
  const value = risk.toLowerCase();
  if (value.includes('high')) return 'High';
  if (value.includes('medium')) return 'Medium';
  return 'Low';
}

/**
 * Formats a number as INR currency.
 */
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Fetches and normalizes dynamic customer data from the database.
 * No mock data fallback.
 */
export async function fetchCustomers(): Promise<Customer[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout for DB queries

  try {
    const response = await fetch('/api/dashboard', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      cache: 'no-store', // ensuring fresh data from DB
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.customers)) {
      throw new Error('Invalid API response structure: customers array missing');
    }

    // ✅ Normalize dynamic database data
    return data.customers.map((c: any) => ({
      id: c.id ?? crypto.randomUUID(),
      name: c.name ?? 'Unknown Customer',
      email: c.email ?? '',
      phone: String(c.phone ?? ''),
      totalInvoices: Number(c.totalInvoices ?? 0),
      behaviorScore: Number(c.behaviorScore ?? 0),
      riskLevel: normalizeRisk(c.riskLevel),
      totalOutstanding: Number(c.totalOutstanding ?? c.outstanding ?? 0),
      avgDelay: Number(c.avgDelay ?? 0),
      onTimeRate: Number(c.onTimeRate ?? 0),
      aiInsight: c.aiInsight ?? c.aiForecast ?? 'No AI analysis available',
      notes: c.notes ?? '',
      predictedPayDate: c.predictedPayDate,
      // Collection journey fields
      maxReminderStage: Number(c.maxReminderStage ?? 0),
      avgReminderStage: Number(c.avgReminderStage ?? 0),
      escalationReached: Boolean(c.escalationReached ?? false),
      stagesUsed: Array.isArray(c.stagesUsed) ? c.stagesUsed : [],
      paidAtStage: Number(c.paidAtStage ?? 0),
    }));
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Database request timed out');
    } else {
      console.error('Fetch Customers Error (Dynamic):', error);
    }
    
    // Return empty array on error - No mock data allowed
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetches dynamic activity logs from the database.
 */
export async function fetchActivities(): Promise<Activity[]> {
  try {
    const response = await fetch('/api/dashboard');
    if (!response.ok) throw new Error(`Failed to fetch activities: ${response.status}`);
    const data = await response.json();
    return data.activities || [];
  } catch (error) {
    console.error("Dynamic Fetch Error (Activities):", error);
    return []; // Return empty array on error
  }
}
