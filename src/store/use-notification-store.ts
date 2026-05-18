import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  invoiceId?: string;
  timestamp: string;
  read: boolean;
}

interface NotificationStore {
  notifications: NotificationItem[];
  addNotification: (item: Partial<Omit<NotificationItem, 'read'>> & { title: string; description: string }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: [
        {
          id: '1',
          title: 'PayPilot Automation Active',
          description: 'Welcome to PayPilot! AI automated collection paths are running.',
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
          read: true,
        }
      ],
      addNotification: (item) => set((state) => {
        const exists = state.notifications.some(n => 
          (item.id && n.id === item.id) || 
          (n.title === item.title && n.description === item.description)
        );
        if (exists) return {};

        const newItem: NotificationItem = {
          title: item.title,
          description: item.description,
          invoiceId: item.invoiceId,
          id: item.id || Math.random().toString(36).substring(7),
          timestamp: item.timestamp || new Date().toISOString(),
          read: false,
        };
        return {
          notifications: [newItem, ...state.notifications]
        };
      }),
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      })),
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),
      clearAll: () => set({ notifications: [] }),
    }),
    {
      name: 'paypilot-notifications',
    }
  )
);
