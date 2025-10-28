'use client';

import { useState } from 'react';
import { DashboardUser } from '../../types';
import { Search, Edit3, Trash2, ChevronLeft, ChevronRight, Users, Mail, Calendar, Shield, UserCheck, UserX } from 'lucide-react';

interface UserManagementTableProps {
  users: DashboardUser[];
  onEdit?: (userId: string) => void;
  onDelete?: (userId: string) => void;
  sortBy?: string;
  filterRole?: string;
}

const ITEMS_PER_PAGE = 10;

const roleConfig = {
  BENEFICIARY: {
    label: 'Beneficiary',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <Users className="w-3 h-3" />,
  },
  CONSULTANT: {
    label: 'Consultant',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: <Shield className="w-3 h-3" />,
  },
  ORG_ADMIN: {
    label: 'Admin',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: <Shield className="w-3 h-3" />,
  },
};

const statusConfig = {
  ACTIVE: {
    label: 'Active',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: <UserCheck className="w-3 h-3" />,
  },
  INACTIVE: {
    label: 'Inactive',
    color: 'bg-gray-100 text-gray-800 dark:text-gray-100 border-gray-200',
    icon: <UserX className="w-3 h-3" />,
  },
};

export function UserManagementTable({
  users,
  onEdit,
  onDelete,
  filterRole,
}: UserManagementTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter users
  let filteredUsers = users;

  if (searchTerm) {
    filteredUsers = filteredUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (filterRole) {
    filteredUsers = filteredUsers.filter((user) => user.role === filterRole);
  }

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 shadow-sm">
      {/* Search */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">User</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Role</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Created</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 font-medium">No users found</p>
                    <p className="text-gray-300 text-sm">Try adjusting your search criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => {
                const role = roleConfig[user.role as keyof typeof roleConfig];
                const status = statusConfig[user.status as keyof typeof statusConfig];
                
                return (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{user.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 truncate flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                        role.color
                      }`}>
                        {role.icon}
                        {role.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                        status.color
                      }`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(user.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs font-medium"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(user.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs font-medium"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-xl">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)} of{' '}
            {filteredUsers.length} users
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg hover:bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-lg border border-gray-200">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg hover:bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
