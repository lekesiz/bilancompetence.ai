'use client';

export const dynamic = 'force-dynamic';


import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { getCsrfToken } from '@/lib/csrfHelper';

interface Assessment {
  id: string;
  title: string;
  description?: string;
  status: string;
  assessment_type: string;
  created_at: string;
}

export default function AssessmentsPage() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assessment_type: 'career',
  });

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      // 🔒 SECURITY: HttpOnly cookies (GET request doesn't need CSRF token)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assessments`, {
        credentials: 'include', // Send HttpOnly cookies automatically
      });

      if (response.ok) {
        const data = await response.json();
        setAssessments(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 🔒 SECURITY: HttpOnly cookies + CSRF token
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const csrfToken = getCsrfToken();
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assessments`, {
        method: 'POST',
        headers,
        credentials: 'include', // Send HttpOnly cookies automatically
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setAssessments([data.data, ...assessments]);
        setShowCreate(false);
        setFormData({
          title: '',
          description: '',
          assessment_type: 'career',
        });
      }
    } catch (error) {
      console.error('Failed to create assessment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      draft: 'bg-gray-200 text-gray-800 dark:text-gray-100',
      in_progress: 'bg-blue-200 text-blue-800',
      completed: 'bg-green-200 text-green-800',
      archived: 'bg-gray-400 text-gray-800 dark:text-gray-100',
    };
    return colors[status] || 'bg-gray-200 text-gray-800 dark:text-gray-100';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Assessments</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {showCreate ? 'Cancel' : 'New Assessment'}
        </button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Create New Assessment</h2>
          <form onSubmit={handleCreateAssessment} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Type</label>
              <select
                value={formData.assessment_type}
                onChange={(e) => setFormData({ ...formData, assessment_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="career">Career Assessment</option>
                <option value="skills">Skills Assessment</option>
                <option value="comprehensive">Comprehensive</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Create Assessment
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : assessments.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-12 text-center">
          <p className="text-gray-600 dark:text-gray-300 text-lg">No assessments yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assessments.map((assessment) => (
            <div key={assessment.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{assessment.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">{assessment.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(assessment.status)}`}>
                  {assessment.status}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">
                <span>{assessment.assessment_type}</span>
                <span>{new Date(assessment.created_at).toLocaleDateString()}</span>
              </div>

              <button className="mt-4 text-blue-600 hover:text-blue-800 font-semibold">
                View Details →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
