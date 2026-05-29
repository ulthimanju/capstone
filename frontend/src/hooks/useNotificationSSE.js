import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';

/**
 * useNotificationSSE — Custom React hook subscribing to Server-Sent Events (SSE) notification stream.
 */
export default function useNotificationSSE() {
  const user = useAuthStore(s => s.user);
  const accessToken = useAuthStore(s => s.accessToken);
  const addIncomingNotification = useNotificationStore(s => s.addIncomingNotification);

  useEffect(() => {
    if (!user || !accessToken) return;

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const streamUrl = `${API_BASE_URL}/api/notifications/stream?token=${accessToken}`;
    logDebug('Establishing SSE connection to: ' + streamUrl);

    const eventSource = new EventSource(streamUrl);

    eventSource.addEventListener('notification', (event) => {
      try {
        const data = JSON.parse(event.data);
        logDebug('Received SSE real-time notification: ' + JSON.stringify(data));
        addIncomingNotification(data);
      } catch (err) {
        console.error('Failed to parse SSE event data:', err);
      }
    });

    eventSource.onopen = () => {
      logDebug('SSE notification stream opened successfully.');
    };

    eventSource.onerror = (err) => {
      console.error('SSE notification stream connection error:', err);
    };

    return () => {
      eventSource.close();
      logDebug('SSE notification stream disconnected.');
    };
  }, [user, accessToken, addIncomingNotification]);
}

function logDebug(msg) {
  console.log('[SSE-Notifications] ' + msg);
}
