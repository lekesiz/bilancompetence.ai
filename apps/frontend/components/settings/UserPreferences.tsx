'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, MessageSquare, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PreferenceItem {
  id: string;
  label: string;
  description: string;
  icon: any;
  enabled: boolean;
}

export default function UserPreferences() {
  const [emailPreferences, setEmailPreferences] = useState<PreferenceItem[]>([
    {
      id: 'assessment_updates',
      label: 'Mises à jour du bilan',
      description: 'Recevoir des notifications sur l\'avancement de votre bilan',
      icon: Bell,
      enabled: true,
    },
    {
      id: 'consultant_messages',
      label: 'Messages du consultant',
      description: 'Être notifié des nouveaux messages de votre consultant',
      icon: MessageSquare,
      enabled: true,
    },
    {
      id: 'marketing',
      label: 'Actualités et conseils',
      description: 'Recevoir nos conseils carrière et actualités',
      icon: Mail,
      enabled: false,
    },
    {
      id: 'reminders',
      label: 'Rappels',
      description: 'Rappels pour compléter vos tests et rendez-vous',
      icon: CheckCircle,
      enabled: true,
    },
  ]);

  const [pushPreferences, setPushPreferences] = useState<PreferenceItem[]>([
    {
      id: 'push_messages',
      label: 'Messages instantanés',
      description: 'Notifications push pour les messages urgents',
      icon: MessageSquare,
      enabled: true,
    },
    {
      id: 'push_updates',
      label: 'Mises à jour importantes',
      description: 'Notifications pour les étapes clés de votre bilan',
      icon: Bell,
      enabled: true,
    },
  ]);

  const toggleEmailPreference = (id: string) => {
    setEmailPreferences((prev) =>
      prev.map((pref) =>
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      )
    );
    toast.success('Préférence mise à jour');
  };

  const togglePushPreference = (id: string) => {
    setPushPreferences((prev) =>
      prev.map((pref) =>
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      )
    );
    toast.success('Préférence mise à jour');
  };

  const savePreferences = async () => {
    // TODO: Save to backend
    toast.success('Préférences enregistrées avec succès!');
  };

  return (
    <div className="space-y-8">
      {/* Email Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notifications par email
          </h2>
        </div>

        <div className="space-y-4">
          {emailPreferences.map((pref, index) => (
            <motion.div
              key={pref.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-4">
                <pref.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {pref.label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {pref.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => toggleEmailPreference(pref.id)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${pref.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${pref.enabled ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Push Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notifications push
          </h2>
        </div>

        <div className="space-y-4">
          {pushPreferences.map((pref, index) => (
            <motion.div
              key={pref.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-4">
                <pref.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {pref.label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {pref.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => togglePushPreference(pref.id)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${pref.enabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${pref.enabled ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-end"
      >
        <button
          onClick={savePreferences}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
        >
          Enregistrer les préférences
        </button>
      </motion.div>
    </div>
  );
}

