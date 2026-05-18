import { create } from 'zustand';
import axios from 'axios';

interface InvoiceStore {
  invoices: any[];
  loading: boolean;
  fetchInvoices: () => Promise<void>;
  updateInvoice: (id: string, data: any) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  bulkDeleteInvoices: (ids: string[]) => Promise<void>;
  runFollowup: (id: string) => Promise<any>;
}

export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  invoices: [],
  loading: false,
  fetchInvoices: async () => {
    set({ loading: true });
    try {
      const response = await axios.get('/api/invoices');
      set({ invoices: response.data, loading: false });
    } catch (error) {
      console.error('Failed to fetch invoices', error);
      set({ loading: false });
    }
  },
  updateInvoice: async (id: string, data: any) => {
    try {
      await axios.put(`/api/invoices/${id}`, data);
      await get().fetchInvoices();
    } catch (error) {
      console.error('Failed to update invoice', error);
    }
  },
  deleteInvoice: async (id: string) => {
    try {
      await axios.delete(`/api/invoices/${id}`);
      await get().fetchInvoices();
    } catch (error) {
      console.error('Failed to delete invoice', error);
      throw error;
    }
  },
  bulkDeleteInvoices: async (ids: string[]) => {
    try {
      await axios.post('/api/invoices/bulk-delete', { ids });
      await get().fetchInvoices();
    } catch (error) {
      console.error('Failed to bulk delete invoices', error);
      throw error;
    }
  },
  runFollowup: async (id: string) => {
    try {
      const response = await axios.post('/api/followup/manual', { invoiceId: id });
      await get().fetchInvoices();
      return response.data;
    } catch (error) {
      console.error('Failed to run followup', error);
      throw error;
    }
  },
}));
