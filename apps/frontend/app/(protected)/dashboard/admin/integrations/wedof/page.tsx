'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RegistrationFolder {
  id: string;
  name: string;
  status: string;
  created_at: string;
  attendees_count: number;
}

interface Attendee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
}

export default function WedofIntegrationPage() {
  const router = useRouter();
  const [folders, setFolders] = useState<RegistrationFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showCreateAttendee, setShowCreateAttendee] = useState(false);

  // Form states
  const [folderForm, setFolderForm] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
  });

  const [attendeeForm, setAttendeeForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    birth_date: '',
    address: '',
    city: '',
    postal_code: '',
  });

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    if (selectedFolder) {
      fetchAttendees(selectedFolder);
    }
  }, [selectedFolder]);

  const fetchFolders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wedof/folders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des dossiers');
      }

      const data = await response.json();
      setFolders(data.folders || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendees = async (folderId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wedof/folders/${folderId}/attendees`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des stagiaires');
      }

      const data = await response.json();
      setAttendees(data.attendees || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wedof/folders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(folderForm),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du dossier');
      }

      await fetchFolders();
      setShowCreateFolder(false);
      setFolderForm({ name: '', description: '', start_date: '', end_date: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAttendee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFolder) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wedof/folders/${selectedFolder}/attendees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(attendeeForm),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du stagiaire');
      }

      await fetchAttendees(selectedFolder);
      setShowCreateAttendee(false);
      setAttendeeForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        birth_date: '',
        address: '',
        city: '',
        postal_code: '',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const syncWithWedof = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wedof/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la synchronisation avec Wedof');
      }

      await fetchFolders();
      alert('Synchronisation réussie avec Wedof');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 text-purple-600 hover:text-purple-700 flex items-center gap-2"
          >
            ← Retour au tableau de bord
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Intégration Wedof
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Gérez vos dossiers de formation et stagiaires via Wedof
              </p>
            </div>
            <button
              onClick={syncWithWedof}
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg disabled:opacity-50"
            >
              🔄 Synchroniser avec Wedof
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Dossiers d'inscription */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dossiers d'inscription</h2>
              <button
                onClick={() => setShowCreateFolder(!showCreateFolder)}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all"
              >
                + Nouveau dossier
              </button>
            </div>

            {/* Create Folder Form */}
            {showCreateFolder && (
              <form onSubmit={handleCreateFolder} className="mb-6 p-4 bg-purple-50 rounded-lg">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Nom du dossier
                    </label>
                    <input
                      type="text"
                      required
                      value={folderForm.name}
                      onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Description
                    </label>
                    <textarea
                      value={folderForm.description}
                      onChange={(e) => setFolderForm({ ...folderForm, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Date de début
                      </label>
                      <input
                        type="date"
                        value={folderForm.start_date}
                        onChange={(e) => setFolderForm({ ...folderForm, start_date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Date de fin
                      </label>
                      <input
                        type="date"
                        value={folderForm.end_date}
                        onChange={(e) => setFolderForm({ ...folderForm, end_date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50"
                    >
                      Créer
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateFolder(false)}
                      className="flex-1 bg-gray-200 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Folders List */}
            <div className="space-y-3">
              {loading && folders.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">Chargement...</div>
              ) : folders.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">
                  Aucun dossier d'inscription trouvé
                </div>
              ) : (
                folders.map((folder) => (
                  <div
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedFolder === folder.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">{folder.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">
                          {folder.attendees_count || 0} stagiaire(s)
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          folder.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {folder.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Stagiaires */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Stagiaires
                {selectedFolder && ` (${attendees.length})`}
              </h2>
              {selectedFolder && (
                <button
                  onClick={() => setShowCreateAttendee(!showCreateAttendee)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                >
                  + Nouveau stagiaire
                </button>
              )}
            </div>

            {!selectedFolder ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">
                Sélectionnez un dossier pour voir les stagiaires
              </div>
            ) : (
              <>
                {/* Create Attendee Form */}
                {showCreateAttendee && (
                  <form onSubmit={handleCreateAttendee} className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Prénom
                          </label>
                          <input
                            type="text"
                            required
                            value={attendeeForm.first_name}
                            onChange={(e) =>
                              setAttendeeForm({ ...attendeeForm, first_name: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Nom
                          </label>
                          <input
                            type="text"
                            required
                            value={attendeeForm.last_name}
                            onChange={(e) =>
                              setAttendeeForm({ ...attendeeForm, last_name: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          required
                          value={attendeeForm.email}
                          onChange={(e) =>
                            setAttendeeForm({ ...attendeeForm, email: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          value={attendeeForm.phone}
                          onChange={(e) =>
                            setAttendeeForm({ ...attendeeForm, phone: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                          Créer
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCreateAttendee(false)}
                          className="flex-1 bg-gray-200 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Attendees List */}
                <div className="space-y-3">
                  {loading && attendees.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">Chargement...</div>
                  ) : attendees.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">
                      Aucun stagiaire dans ce dossier
                    </div>
                  ) : (
                    attendees.map((attendee) => (
                      <div
                        key={attendee.id}
                        className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                              {attendee.first_name} {attendee.last_name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{attendee.email}</p>
                            {attendee.phone && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">{attendee.phone}</p>
                            )}
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              attendee.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700 dark:text-gray-200'
                            }`}
                          >
                            {attendee.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

