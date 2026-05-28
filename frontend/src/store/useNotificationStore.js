import { create } from 'zustand';
import axiosClient from '../api/axiosClient';

/**
 * useNotificationStore — Zustand store to handle active notification toasts, unread counts, and real-time SSE.
 */
export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  activeToast: null, // { message: string, variant: 'success'|'info'|'warning'|'error' }

  // Set active toast alert
  showToast: (message, variant = 'info') => {
    set({ activeToast: { message, variant } });
  },

  clearToast: () => {
    set({ activeToast: null });
  },

  // Fetch past notifications
  fetchNotifications: async () => {
    try {
      const res = await axiosClient.get('/api/notifications');
      const notifications = res.data;
      const unreadCount = notifications.filter(n => !n.read).length;
      set({ notifications, unreadCount });
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  },

  // Mark a single notification read
  markAsRead: async (id) => {
    try {
      await axiosClient.patch(`/api/notifications/${id}/read`);
      const { notifications } = get();
      const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
      const unreadCount = updated.filter(n => !n.read).length;
      set({ notifications: updated, unreadCount });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  },

  // Mark all notifications read
  markAllAsRead: async () => {
    try {
      await axiosClient.patch('/api/notifications/read-all');
      const { notifications } = get();
      const updated = notifications.map(n => ({ ...n, read: true }));
      set({ notifications: updated, unreadCount: 0 });
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  },

  // Dynamically append a real-time notification from SSE stream
  addIncomingNotification: (notif) => {
    const { notifications } = get();
    // Prepend to show most recent first
    const updated = [notif, ...notifications];
    const unreadCount = updated.filter(n => !n.isRead && !n.read).length;
    set({ notifications: updated, unreadCount });

    // Trigger visual toast
    let toastVariant = 'info';
    if (notif.type === 'BADGE_EARNED' || notif.type === 'CHALLENGE_COMPLETED') {
      toastVariant = 'success';
    } else if (notif.type === 'DOCUMENT_FAILED') {
      toastVariant = 'error';
    }
    get().showToast(notif.title + ": " + notif.body, toastVariant);
  }
}));
