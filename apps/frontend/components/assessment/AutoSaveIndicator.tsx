'use client';

import { useEffect, useState } from 'react';

interface AutoSaveIndicatorProps {
  lastSavedAt?: string | null;
  isSaving?: boolean;
  unsavedChanges?: boolean;
}

export function AutoSaveIndicator({
  lastSavedAt,
  isSaving = false,
  unsavedChanges = false,
}: AutoSaveIndicatorProps) {
  const [displayTime, setDisplayTime] = useState<string>('');
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (!lastSavedAt) {
      setDisplayTime('Not saved yet');
      return;
    }

    const updateTime = () => {
      const savedDate = new Date(lastSavedAt);
      const now = new Date();
      const diffMs = now.getTime() - savedDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins === 0) {
        setDisplayTime('Just now');
      } else if (diffMins < 60) {
        setDisplayTime(`${diffMins}m ago`);
      } else if (diffMins < 1440) {
        const hours = Math.floor(diffMins / 60);
        setDisplayTime(`${hours}h ago`);
      } else {
        const days = Math.floor(diffMins / 1440);
        setDisplayTime(`${days}d ago`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [lastSavedAt]);

  // Show "Saving..." message temporarily
  useEffect(() => {
    if (isSaving) {
      setShowMessage(true);
      const timer = setTimeout(() => setShowMessage(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSaving]);

  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-600">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
        <span className="font-medium">Saving...</span>
      </div>
    );
  }

  if (unsavedChanges) {
    return (
      <div className="flex items-center gap-2 text-sm text-orange-600">
        <span className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></span>
        <span className="font-medium">Unsaved changes</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
      <span>Saved {displayTime || 'just now'}</span>
    </div>
  );
}
