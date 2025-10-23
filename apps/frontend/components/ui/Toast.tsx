'use client';

import React, { useState, useCallback, useRef } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

// Store for multiple toast instances
let toastListeners: ((toast: ToastMessage) => void)[] = [];

export function toast(
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'info',
  duration: number = 3000
) {
  const id = Math.random().toString(36).substr(2, 9);
  const toastMessage: ToastMessage = { id, type, message, duration };

  // Notify all listeners
  toastListeners.forEach((listener) => listener(toastMessage));
}

// Export toast functions for convenience
export const toastSuccess = (message: string, duration?: number) => toast(message, 'success', duration);
export const toastError = (message: string, duration?: number) => toast(message, 'error', duration);
export const toastInfo = (message: string, duration?: number) => toast(message, 'info', duration);
export const toastWarning = (message: string, duration?: number) => toast(message, 'warning', duration);

// Toast Container Component
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  React.useEffect(() => {
    const handleToast = (toast: ToastMessage) => {
      setToasts((prev) => [...prev, toast]);

      if (toast.duration) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toast.id));
        }, toast.duration);
      }
    };

    toastListeners.push(handleToast);

    return () => {
      toastListeners = toastListeners.filter((listener) => listener !== handleToast);
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-3 p-4 pointer-events-none">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

function Toast({
  toast: toastMsg,
  onClose,
}: {
  toast: ToastMessage;
  onClose: () => void;
}) {
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  }[toastMsg.type];

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  }[toastMsg.type];

  return (
    <div
      className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 pointer-events-auto max-w-md animate-slide-up`}
      role="alert"
    >
      <span className="text-lg font-bold">{icon}</span>
      <span className="flex-1 text-sm">{toastMsg.message}</span>
      <button
        onClick={onClose}
        className="ml-2 hover:opacity-75 transition-opacity"
        aria-label="Close toast"
      >
        ✕
      </button>
    </div>
  );
}

// Default export
export default { toast, ToastContainer, toastSuccess, toastError, toastInfo, toastWarning };
