'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

interface DashboardStats {
  userRole: string;
  joinedAt: string;
  lastActive: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/stats`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Welcome, {user?.full_name}!</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Your Role</h3>
          <p className="text-2xl font-bold text-gray-800">{user?.role}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Email</h3>
          <p className="text-lg font-semibold text-gray-800">{user?.email}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Status</h3>
          <p className="text-2xl font-bold text-green-600">Active</p>
        </div>
      </div>

      {/* Role-specific Dashboard */}
      {user?.role === 'BENEFICIARY' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Assessments</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">No assessments yet. Start your first assessment today!</p>
            <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Start Assessment
            </button>
          </div>
        </div>
      )}

      {user?.role === 'CONSULTANT' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Clients</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">No clients assigned yet.</p>
            <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Invite Client
            </button>
          </div>
        </div>
      )}

      {user?.role === 'ORG_ADMIN' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Organization Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-800 mb-2">Users</h3>
              <p className="text-gray-600">Manage your organization users</p>
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                Manage Users
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-800 mb-2">Analytics</h3>
              <p className="text-gray-600">View organization analytics</p>
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                View Analytics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
