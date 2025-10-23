/**
 * Tabs Component
 * Tabbed interface for organizing content
 */

import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
}

export default function Tabs({ tabs, defaultTab, onChange, variant = 'default' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const variantClasses = {
    default: {
      container: 'border-b border-gray-200',
      tab: 'px-4 py-2 border-b-2 transition',
      active: 'border-blue-600 text-blue-600',
      inactive: 'border-transparent text-gray-600 hover:text-gray-900',
    },
    pills: {
      container: 'gap-2 mb-4',
      tab: 'px-4 py-2 rounded-lg transition',
      active: 'bg-blue-600 text-white',
      inactive: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    },
    underline: {
      container: 'border-b border-gray-200 space-x-0',
      tab: 'px-4 py-3 border-b-2 text-sm font-medium transition',
      active: 'border-blue-600 text-blue-600',
      inactive: 'border-transparent text-gray-600 hover:text-gray-900',
    },
  };

  const config = variantClasses[variant];

  return (
    <div>
      {/* Tab Buttons */}
      <div className={`flex ${config.container} ${variant === 'pills' ? 'flex-wrap' : ''}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            disabled={tab.disabled}
            className={`${config.tab} ${
              activeTab === tab.id ? config.active : config.inactive
            } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
            aria-selected={activeTab === tab.id}
            aria-label={tab.label}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}
