/**
 * BeneficiarySchedulePage Component
 * Main page for beneficiaries to manage sessions
 */

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Plus, List, Clock } from 'lucide-react';
import BeneficiarySessionBrowser from './BeneficiarySessionBrowser';
import BeneficiaryBookingForm from './BeneficiaryBookingForm';
import BeneficiaryBookingsList from './BeneficiaryBookingsList';

type Tab = 'browse' | 'my-bookings' | 'pending' | 'completed';

interface BeneficiarySchedulePageProps {
  bilanId: string;
}

/**
 * BeneficiarySchedulePage Component
 */
export default function BeneficiarySchedulePage({
  bilanId,
}: BeneficiarySchedulePageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('browse');
  const [selectedSlot, setSelectedSlot] = useState<{
    consultantId: string;
    startTime: string;
    endTime: string;
    date: string;
    durationMinutes: number;
  } | null>(null);

  if (!user?.id) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'browse', label: 'Browse Sessions', icon: <Plus className="w-4 h-4" /> },
    { id: 'my-bookings', label: 'All Bookings', icon: <Calendar className="w-4 h-4" /> },
    { id: 'pending', label: 'Upcoming', icon: <Clock className="w-4 h-4" /> },
    { id: 'completed', label: 'Completed', icon: <List className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schedule Sessions</h1>
            <p className="text-gray-600 mt-2">Book and manage your consultation sessions</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200 bg-white rounded-t-lg shadow-sm overflow-x-auto">
          <div className="flex gap-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedSlot(null);
                }}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-sm p-6">
          {/* Browse Sessions Tab */}
          {activeTab === 'browse' && (
            <div>
              {selectedSlot ? (
                <div>
                  <button
                    onClick={() => setSelectedSlot(null)}
                    className="mb-6 text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    ← Back to Browse
                  </button>
                  <BeneficiaryBookingForm
                    bilanId={bilanId}
                    consultantId={selectedSlot.consultantId}
                    selectedDate={selectedSlot.date}
                    selectedStartTime={selectedSlot.startTime}
                    selectedEndTime={selectedSlot.endTime}
                    durationMinutes={selectedSlot.durationMinutes}
                    onSuccess={() => {
                      setSelectedSlot(null);
                      setActiveTab('my-bookings');
                    }}
                    onCancel={() => setSelectedSlot(null)}
                  />
                </div>
              ) : (
                <BeneficiarySessionBrowser
                  bilanId={bilanId}
                  onSlotSelected={(slot) => setSelectedSlot(slot)}
                />
              )}
            </div>
          )}

          {/* All Bookings Tab */}
          {activeTab === 'my-bookings' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">All Your Bookings</h2>
              <BeneficiaryBookingsList
                beneficiaryId={user.id}
                bilanId={bilanId}
              />
            </div>
          )}

          {/* Upcoming/Pending Tab */}
          {activeTab === 'pending' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Sessions</h2>
              <BeneficiaryBookingsList
                beneficiaryId={user.id}
                bilanId={bilanId}
                status="CONFIRMED"
              />
            </div>
          )}

          {/* Completed Tab */}
          {activeTab === 'completed' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed Sessions</h2>
              <BeneficiaryBookingsList
                beneficiaryId={user.id}
                bilanId={bilanId}
                status="COMPLETED"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
