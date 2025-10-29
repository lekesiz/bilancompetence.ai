'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/qualiopi';
import { X, Settings, CheckCircle, XCircle } from 'lucide-react';

export interface ConsentPreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  third_party: boolean;
  data_processing: boolean;
  profiling: boolean;
}

const CONSENT_STORAGE_KEY = 'bilancompetence_consent';
const CONSENT_VERSION = '1.0';
const CONSENT_EXPIRY_DAYS = 365;

interface ConsentBannerProps {
  onConsentChange?: (preferences: ConsentPreferences) => void;
}

export default function ConsentBanner({ onConsentChange }: ConsentBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    essential: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
    preferences: false,
    third_party: false,
    data_processing: false,
    profiling: false,
  });

  // Check if consent banner should be shown
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!savedConsent) {
      setShowBanner(true);
      return;
    }

    try {
      const consent = JSON.parse(savedConsent);
      const consentDate = new Date(consent.date);
      const expiryDate = new Date(consentDate);
      expiryDate.setDate(expiryDate.getDate() + CONSENT_EXPIRY_DAYS);

      // Show banner if consent expired or version changed
      if (new Date() > expiryDate || consent.version !== CONSENT_VERSION) {
        setShowBanner(true);
      } else {
        setPreferences(consent.preferences);
      }
    } catch (error) {
      setShowBanner(true);
    }
  }, []);

  // Save consent to localStorage
  const saveConsent = (prefs: ConsentPreferences) => {
    if (typeof window === 'undefined') return;

    const consentData = {
      version: CONSENT_VERSION,
      date: new Date().toISOString(),
      preferences: prefs,
    };

    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData));
    setShowBanner(false);
    onConsentChange?.(prefs);
  };

  // Send consent to backend API
  const sendConsentToBackend = async (prefs: ConsentPreferences) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      if (!token) {
        // User not logged in, just save locally
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const consents = Object.entries(prefs)
        .filter(([type]) => type !== 'essential') // Essential doesn't need consent
        .map(([consent_type, granted]) => ({
          consent_type: consent_type as any,
          granted,
          purpose: getConsentPurpose(consent_type),
          legal_basis: getLegalBasis(consent_type),
        }));

      const response = await fetch(`${API_URL}/api/consent/multiple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          consents,
          consent_version: CONSENT_VERSION,
        }),
      });

      if (!response.ok) {
        console.error('Failed to save consent to backend:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving consent to backend:', error);
      // Don't block user if backend save fails
    }
  };

  const handleAcceptAll = async () => {
    setIsLoading(true);
    const allAccepted: ConsentPreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
      third_party: true,
      data_processing: true,
      profiling: true,
    };

    saveConsent(allAccepted);
    await sendConsentToBackend(allAccepted);
    setIsLoading(false);
  };

  const handleRejectAll = async () => {
    setIsLoading(true);
    const allRejected: ConsentPreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
      third_party: false,
      data_processing: false,
      profiling: false,
    };

    saveConsent(allRejected);
    await sendConsentToBackend(allRejected);
    setIsLoading(false);
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    saveConsent(preferences);
    await sendConsentToBackend(preferences);
    setIsLoading(false);
    setShowSettings(false);
  };

  const togglePreference = (type: keyof ConsentPreferences) => {
    if (type === 'essential') return; // Cannot disable essential

    setPreferences((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Main Banner */}
      {!showSettings && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  🍪 Gestion des Cookies et Consentement RGPD
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Nous utilisons des cookies pour améliorer votre expérience, analyser notre trafic
                  et personnaliser notre contenu. En continuant à utiliser notre site, vous acceptez
                  notre{' '}
                  <a
                    href="/politique-confidentialite"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    politique de confidentialité
                  </a>
                  .
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Button
                  onClick={() => setShowSettings(true)}
                  variant="outline"
                  className="w-full md:w-auto"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Personnaliser
                </Button>
                <Button
                  onClick={handleRejectAll}
                  variant="outline"
                  disabled={isLoading}
                  className="w-full md:w-auto"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Refuser tout
                </Button>
                <Button
                  onClick={handleAcceptAll}
                  disabled={isLoading}
                  className="w-full md:w-auto"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Tout accepter
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Préférences de Consentement
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {/* Essential - Always enabled */}
                <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        Cookies Essentiels
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Nécessaires au fonctionnement du site (session, sécurité). Ils ne peuvent
                        pas être désactivés.
                      </p>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-sm font-medium">Toujours actif</span>
                    </div>
                  </div>
                </div>

                {/* Analytics */}
                <ConsentOption
                  type="analytics"
                  title="Cookies Analytiques"
                  description="Nous permettent d'analyser l'utilisation du site pour améliorer nos services (Google Analytics, etc.)."
                  enabled={preferences.analytics}
                  onChange={() => togglePreference('analytics')}
                />

                {/* Marketing */}
                <ConsentOption
                  type="marketing"
                  title="Cookies Marketing"
                  description="Utilisés pour vous envoyer des communications publicitaires et marketing personnalisées."
                  enabled={preferences.marketing}
                  onChange={() => togglePreference('marketing')}
                />

                {/* Preferences */}
                <ConsentOption
                  type="preferences"
                  title="Cookies de Préférences"
                  description="Mémorisent vos choix (langue, thème, paramètres) pour améliorer votre expérience."
                  enabled={preferences.preferences}
                  onChange={() => togglePreference('preferences')}
                />

                {/* Third Party */}
                <ConsentOption
                  type="third_party"
                  title="Cookies Tiers"
                  description="Utilisés par des services tiers intégrés (vidéos, cartes, réseaux sociaux, etc.)."
                  enabled={preferences.third_party}
                  onChange={() => togglePreference('third_party')}
                />

                {/* Data Processing */}
                <ConsentOption
                  type="data_processing"
                  title="Traitement des Données"
                  description="Nécessaire pour fournir nos services de bilan de compétences. Vous pouvez continuer sans consentir, mais certaines fonctionnalités seront limitées."
                  enabled={preferences.data_processing}
                  onChange={() => togglePreference('data_processing')}
                />

                {/* Profiling */}
                <ConsentOption
                  type="profiling"
                  title="Profilage et Décisions Automatisées"
                  description="Utilisation de l'IA pour l'analyse de profil et les recommandations personnalisées."
                  enabled={preferences.profiling}
                  onChange={() => togglePreference('profiling')}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleSavePreferences} disabled={isLoading} className="flex-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isLoading ? 'Enregistrement...' : 'Enregistrer les préférences'}
                </Button>
                <Button onClick={() => setShowSettings(false)} variant="outline" className="flex-1">
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface ConsentOptionProps {
  type: string;
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}

function ConsentOption({ title, description, enabled, onChange }: ConsentOptionProps) {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{description}</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer ml-4">
          <input
            type="checkbox"
            checked={enabled}
            onChange={onChange}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  );
}

// Helper functions
function getConsentPurpose(type: string): string {
  const purposes: Record<string, string> = {
    analytics: "Analyse de l'utilisation du site pour améliorer nos services",
    marketing: 'Envoi de communications publicitaires et marketing personnalisées',
    preferences: "Mémorisation de vos choix pour améliorer l'expérience utilisateur",
    third_party: 'Services tiers intégrés (vidéos, cartes, réseaux sociaux)',
    data_processing: 'Traitement des données nécessaires au service de bilan de compétences',
    profiling: 'Analyse de profil et recommandations personnalisées via IA',
  };
  return purposes[type] || 'Traitement des données';
}

function getLegalBasis(type: string): string {
  const bases: Record<string, string> = {
    analytics: 'consent',
    marketing: 'consent',
    preferences: 'consent',
    third_party: 'consent',
    data_processing: 'contract',
    profiling: 'consent',
  };
  return bases[type] || 'consent';
}

