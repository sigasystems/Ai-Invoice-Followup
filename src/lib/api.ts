import { Invoice, Customer, Activity } from "@/types";
import { mockInvoices, mockCustomers } from "./mock-data";

/**
 * PayPilot Client API Service
 * Fetches data from internal endpoints to avoid direct database access in the browser.
 */

export async function fetchInvoices(): Promise<Invoice[]> {
  try {
    const response = await fetch('/api/dashboard');
    if (!response.ok) throw new Error('Failed to fetch from API');
    const data = await response.json();
    return data.invoices;
  } catch (error) {
    console.error("Client Fetch Error (Invoices):", error);
    return mockInvoices;
  }
}

export async function fetchCustomers(): Promise<Customer[]> {
  try {
    const response = await fetch('/api/dashboard');
    if (!response.ok) throw new Error('Failed to fetch from API');
    const data = await response.json();
    return data.customers;
  } catch (error) {
    console.error("Client Fetch Error (Customers):", error);
    return mockCustomers;
  }
}

export async function fetchActivities(): Promise<Activity[]> {
  try {
    const response = await fetch('/api/dashboard');
    if (!response.ok) throw new Error('Failed to fetch from API');
    const data = await response.json();
    return data.activities;
  } catch (error) {
    console.error("Client Fetch Error (Activities):", error);
    return [];
  }
}
