'use client';

import { useState, useEffect } from 'react';

interface APIKey {
  name: string;
  key: string;
  masked: string;
  description: string;
  status: 'active' | 'inactive';
}

export default function AdminSettingsPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      name: 'STRIPE_SECRET_KEY',
      key: '',
      masked: '••••••••••••••••',
      description: 'Stripe payment processing API key',
      status: 'inactive',
    },
    {
      name: 'GEMINI_API_KEY',
      key: '',
      masked: '••••••••••••••••',
      description: 'Google Gemini AI API key for CV analysis and recommendations',
      status: 'inactive',
    },
    {
      name: 'RESEND_API_KEY',
      key: '',
      masked: '••••••••••••••••',
      description: 'Resend email service API key',
      status: 'inactive',
    },
    {
      name: 'SUPABASE_URL',
      key: '',
      masked: '••••••••••••••••',
      description: 'Supabase project URL',
      status: 'inactive',
    },
    {
      name: 'SUPABASE_ANON_KEY',
      key: '',
      masked: '••••••••••••••••',
      description: 'Supabase anonymous key',
      status: 'inactive',
    },
  ]);

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Load API keys from localStorage (in production, this would be from backend)
    const savedKeys = localStorage.getItem('admin_api_keys');
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        setApiKeys(parsed);
      } catch (e) {
        console.error('Failed to parse saved API keys');
      }
    }
  }, []);

  const handleEdit = (keyName: string) => {
    setEditingKey(keyName);
    const key = apiKeys.find(k => k.name === keyName);
    setTempValue(key?.key || '');
  };

  const handleSave = (keyName: string) => {
    const updatedKeys = apiKeys.map(key => {
      if (key.name === keyName) {
        const masked = tempValue ? '••••••••' + tempValue.slice(-4) : '••••••••••••••••';
        return {
          ...key,
          key: tempValue,
          masked,
          status: tempValue ? 'active' as const : 'inactive' as const,
        };
      }
      return key;
    });

    setApiKeys(updatedKeys);
    localStorage.setItem('admin_api_keys', JSON.stringify(updatedKeys));
    setEditingKey(null);
    setTempValue('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCancel = () => {
    setEditingKey(null);
    setTempValue('');
  };

  const handleTest = async (keyName: string) => {
    // TODO: Implement API key testing
    alert(`Testing ${keyName}... (Not implemented yet)`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Paramètres Système</h1>
          <p className="mt-2 text-gray-600">
            Gérez les clés API et les paramètres de configuration du système
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Configuration enregistrée avec succès !
          </div>
        )}

        {/* Warning Banner */}
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-start">
          <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold">Attention : Zone sensible</p>
            <p className="text-sm mt-1">
              Les clés API sont des informations sensibles. Ne les partagez jamais et assurez-vous de les stocker en toute sécurité.
              En production, ces valeurs doivent être stockées dans les variables d'environnement du serveur.
            </p>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Clés API</h2>
            <p className="text-sm text-gray-600 mt-1">
              Configurez les clés API pour les services externes
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.name} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">{apiKey.name}</h3>
                      <span
                        className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
                          apiKey.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {apiKey.status === 'active' ? 'Active' : 'Non configurée'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{apiKey.description}</p>

                    {editingKey === apiKey.name ? (
                      <div className="mt-3">
                        <input
                          type="password"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          placeholder="Entrez la clé API"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => handleSave(apiKey.name)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Enregistrer
                          </button>
                          <button
                            onClick={handleCancel}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center gap-4">
                        <code className="text-sm bg-gray-100 px-3 py-1 rounded font-mono text-gray-700">
                          {apiKey.masked}
                        </code>
                        <button
                          onClick={() => handleEdit(apiKey.name)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Modifier
                        </button>
                        {apiKey.status === 'active' && (
                          <button
                            onClick={() => handleTest(apiKey.name)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Tester
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Info */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations Système</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">Version</p>
              <p className="text-lg font-semibold text-gray-900">1.0.0</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">Environnement</p>
              <p className="text-lg font-semibold text-gray-900">Production</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">Backend URL</p>
              <p className="text-lg font-semibold text-gray-900 truncate">
                {process.env.NEXT_PUBLIC_API_URL || 'https://web-production-60dbd.up.railway.app'}
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">Database</p>
              <p className="text-lg font-semibold text-gray-900">Supabase PostgreSQL</p>
            </div>
          </div>
        </div>

        {/* Documentation */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📚 Documentation</h3>
          <p className="text-blue-800 mb-4">
            Pour configurer les variables d'environnement en production :
          </p>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Accédez à Railway Dashboard → Variables</li>
            <li>Ajoutez chaque clé API comme variable d'environnement</li>
            <li>Redémarrez le service backend</li>
            <li>Testez les intégrations depuis cette page</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

