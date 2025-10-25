/**
 * BeneficiarySessionBrowser Component
 * Allows beneficiaries to search for available consultants and book sessions
 */

'use client';

import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { Search, Calendar, Clock, MapPin, Video, Phone, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAvailableSlotsForConsultant } from '@/hooks/useScheduling';

// ConsultantSlot removed - using API types directly

// Using AvailabilitySlot from schedulingAPI

interface BeneficiarySessionBrowserProps {
  bilanId: string;
  onSlotSelected?: (slot: {
    consultantId: string;
    startTime: string;
    endTime: string;
    date: string;
    durationMinutes: number;
  }) => void;
}

/**
 * BeneficiarySessionBrowser Component
 */
export default function BeneficiarySessionBrowser({
  bilanId,
  onSlotSelected,
}: BeneficiarySessionBrowserProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [consultantId, setConsultantId] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    from: format(new Date(), 'yyyy-MM-dd'),
    to: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
  });
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [selectedConsultantId, setSelectedConsultantId] = useState<string | null>(null);

  // Fetch available slots for selected consultant
  const { data: availableSlots = [], isLoading, error } = useAvailableSlotsForConsultant(
    consultantId || '',
    {
      date_from: dateRange.from,
      date_to: dateRange.to,
    },
    !!consultantId
  );

  const handleConsultantSelect = (id: string) => {
    setConsultantId(id);
    setSelectedConsultantId(id);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: any) => {
    setSelectedSlot(slot);
  };

  const handleBookSlot = () => {
    if (!selectedSlot || !selectedConsultantId) {
      toast.error('Please select a slot');
      return;
    }

    onSlotSelected?.({
      consultantId: selectedConsultantId,
      startTime: selectedSlot.start_time,
      endTime: selectedSlot.end_time,
      date: selectedSlot.date,
      durationMinutes: selectedSlot.duration_minutes,
    });

    toast.success('Slot selected. Please complete booking details.');
    setSelectedSlot(null);
    setConsultantId('');
    setSelectedConsultantId(null);
  };

  const handleDateRangeChange = (type: 'from' | 'to', value: string) => {
    setDateRange((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Find Available Sessions</h2>

        {/* Search Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Search Consultant
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-300" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or specialty..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Date Range Selection */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => handleDateRangeChange('from', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => handleDateRangeChange('to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={() => {
            if (!searchTerm) {
              toast.error('Please enter a consultant name');
              return;
            }
            // In a real app, this would trigger a search
            toast.success('Searching for consultants...');
          }}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
        >
          Search
        </button>
      </div>

      {/* Results Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Consultants List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 dark:text-white">Available Consultants</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-600 dark:text-gray-300">
                  Loading consultants...
                </div>
              ) : availableSlots && availableSlots.length > 0 ? (
                availableSlots.map((consultant: any) => (
                  <button
                    key={consultant.consultant_id}
                    onClick={() => handleConsultantSelect(consultant.consultant_id)}
                    className={`w-full p-4 text-left transition hover:bg-blue-50 border-l-4 ${
                      selectedConsultantId === consultant.consultant_id
                        ? 'border-l-blue-600 bg-blue-50'
                        : 'border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {consultant.consultant_name || `Consultant ${consultant.consultant_id.slice(0, 8)}`}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          {consultant.slots?.length || 0} available slots
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 mt-1" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-600 dark:text-gray-300 text-sm">
                  No consultants found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Available Slots */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {selectedConsultantId ? 'Available Time Slots' : 'Select a consultant'}
              </h3>
            </div>

            {selectedConsultantId && !isLoading ? (
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {availableSlots && availableSlots.length > 0 ? (
                  availableSlots.map((slot: any) => {
                    const slotDateTime = new Date(`${slot.date_specific || format(new Date(), 'yyyy-MM-dd')}T${slot.start_time}`);
                    const isSelected = selectedSlot?.id === slot.id;

                    return (
                      <button
                        key={slot.id}
                        onClick={() => handleSlotSelect(slot)}
                        className={`w-full p-4 text-left transition ${
                          isSelected
                            ? 'bg-green-50 border-l-4 border-l-green-600'
                            : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                            <Calendar className="w-4 h-4" />
                            {format(slotDateTime, 'EEE, MMM d, yyyy')}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
                            <Clock className="w-4 h-4" />
                            {slot.start_time} - {slot.end_time} ({slot.duration_minutes} min)
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                            {slot.max_concurrent_bookings > 1
                              ? `Up to ${slot.max_concurrent_bookings} concurrent bookings`
                              : 'Limited availability'}
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-gray-600 dark:text-gray-300 text-sm">
                    No available slots for selected date range
                  </div>
                )}
              </div>
            ) : selectedConsultantId && isLoading ? (
              <div className="p-8 text-center text-gray-600 dark:text-gray-300">
                Loading available slots...
              </div>
            ) : (
              <div className="p-8 text-center text-gray-600 dark:text-gray-300">
                Select a consultant to view available slots
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border-t border-red-200 text-red-700 text-sm">
                Failed to load slots. Please try again.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Slot Summary */}
      {selectedSlot && selectedConsultantId && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Selected Slot</h3>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-200 mb-4">
            <p>
              <strong>Date:</strong> {format(new Date(`${selectedSlot.date}T${selectedSlot.start_time}`), 'EEEE, MMMM d, yyyy')}
            </p>
            <p>
              <strong>Time:</strong> {selectedSlot.start_time} - {selectedSlot.end_time}
            </p>
            <p>
              <strong>Duration:</strong> {selectedSlot.duration_minutes} minutes
            </p>
            <p>
              <strong>Timezone:</strong> {selectedSlot.timezone}
            </p>
          </div>
          <button
            onClick={handleBookSlot}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            Continue to Booking Details
          </button>
        </div>
      )}
    </div>
  );
}
