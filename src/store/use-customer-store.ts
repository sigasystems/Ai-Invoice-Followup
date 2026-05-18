import { create } from 'zustand';
import axios from 'axios';

interface CustomerStore {
  customers: any[];
  loading: boolean;
  fetchCustomers: () => Promise<void>;
  bulkDeleteCustomers: (ids: string[]) => Promise<void>;
}

import { toast } from 'sonner';

export const useCustomerStore = create<CustomerStore>((set) => ({
  customers: [],
  loading: false,
  fetchCustomers: async () => {
    set({ loading: true });
    try {
      const response = await axios.get('/api/customers');
      set({ customers: response.data, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch customers', error);
      if (error.response?.status === 401) {
        toast.error("Please login to see customers");
      }
      set({ loading: false });
    }
  },
  bulkDeleteCustomers: async (ids: string[]) => {
    try {
      await axios.post('/api/customers/bulk-delete', { ids });
      // Refetch
      const response = await axios.get('/api/customers');
      set({ customers: response.data });
    } catch (error) {
      console.error('Failed to bulk delete customers', error);
      throw error;
    }
  }
}));

