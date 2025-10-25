'use client';

import { useEffect, useState } from 'react';
import useRealtime from '@/hooks/useRealtime';

interface NotificationToast {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
}

export default function RealtimeNotifications() {
  const { notifications, removeNotification, clearNotifications } = useRealtime();
  const [toasts, setToasts] = useState<NotificationToast[]>([]);

  useEffect(() => {
    // Convert notifications to toasts and auto-remove after 5 seconds
    notifications.forEach((notification) => {
      if (notification.id) {
        const toast: NotificationToast = {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
        };

        setToasts((prev) => [...prev, toast]);

        // Auto-remove after 5 seconds
        const timer = setTimeout(() => {
          removeNotification(notification.id!);
        }, 5000);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, removeNotification]);

  useEffect(() => {
    setToasts(
      notifications.map((n) => ({
        id: n.id || `notif-${Date.now()}`,
        type: n.type,
        title: n.title,
        message: n.message,
        data: n.data,
      }))
    );
  }, [notifications]);

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'assessment_started':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'recommendation':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'message':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'system':
        return 'bg-gray-50 border-gray-200 text-gray-800 dark:text-gray-100';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assessment_started':
        return '📊';
      case 'recommendation':
        return '⭐';
      case 'message':
        return '💬';
      case 'system':
        return 'ℹ️';
      default:
        return '🔔';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`border rounded-lg p-4 shadow-lg max-w-sm animate-fade-in ${getNotificationStyles(
            toast.type
          )}`}
          role="alert"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">{getNotificationIcon(toast.type)}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{toast.title}</h3>
              <p className="text-sm opacity-90">{toast.message}</p>
            </div>
            <button
              onClick={() => {
                removeNotification(toast.id);
                setToasts((prev) => prev.filter((t) => t.id !== toast.id));
              }}
              className="text-lg leading-none hover:opacity-70 transition-opacity"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      {toasts.length === 0 && notifications.length === 0 && (
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateX(100%); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        `}</style>
      )}
    </div>
  );
}
