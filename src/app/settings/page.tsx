'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bell,
  Server,
  Palette,
  Save,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

/* SUPABASE */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* TYPES */
type Settings = {
  notifications: {
    email: boolean;
    security: boolean;
  };
  system: {
    maintenance_mode: boolean;
    registration_open: boolean;
  };
  ui: {
    theme: 'dark' | 'light';
  };
};

function applyTheme(theme: Settings['ui']['theme']) {
  document.documentElement.classList.remove('dark', 'light');
  document.documentElement.classList.add(theme);
  localStorage.setItem('admin-theme', theme);
}

/* ================= TOAST MODERNE ================= */
function showToast(
  setToast: any,
  type: 'success' | 'error' | 'info',
  message: string
) {
  const id = Date.now();

  setToast({
    id,
    type,
    message,
  });

  setTimeout(() => {
    setToast(null);
  }, 3000);
}

/* ================= PAGE ================= */
export default function AdminSettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const [settings, setSettings] = useState<Settings>(() => ({
    notifications: {
      email: false,
      security: false,
    },
    system: {
      maintenance_mode: false,
      registration_open: true,
    },
    ui: {
      theme:
        typeof window !== 'undefined' && localStorage.getItem('admin-theme') === 'light'
          ? 'light'
          : 'dark',
    },
  }));

  /* FETCH */
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*');

      if (error) {
        showToast(setToast, 'error', 'Failed to load settings');
        setLoading(false);
        return;
      }

      if (data) {
        const mapped = data.reduce((acc: any, row: any) => {
          acc[row.key] = row.value;
          return acc;
        }, {});

        setSettings((prev) => ({
          ...prev,
          ...mapped,
        }));
      }

      setLoading(false);
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    applyTheme(settings.ui.theme);
  }, [settings.ui.theme]);

  /* UPDATE */
  const update = (section: keyof Settings, key: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [key]: value,
      },
    }));
  };

  const updateTheme = (theme: Settings['ui']['theme']) => {
    setSettings((prev) => ({
      ...prev,
      ui: { theme },
    }));
  };

  /* SAVE */
  const saveSettings = async () => {
    setSaving(true);

    try {
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from('admin_settings')
          .upsert({
            key,
            value,
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
      }

      showToast(setToast, 'success', 'Settings saved successfully');
    } catch {
      showToast(setToast, 'error', 'Save failed');
    }

    setSaving(false);
  };

  /* RESET */
  const resetPlatform = async () => {
    try {
      await supabase.from('trainings').delete().neq('id', '');
      await supabase.from('payments').delete().neq('id', '');

      showToast(setToast, 'success', 'Platform reset completed');
    } catch {
      showToast(setToast, 'error', 'Reset failed');
    }

    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="p-6 text-[hsl(var(--muted-foreground))]">
        Loading settings...
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-6 text-[hsl(var(--foreground))] transition-colors">

      {/* TOAST */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div
            className={`
              flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md
              ${
                toast.type === 'success'
                  ? 'bg-green-500/10 border-green-500 text-green-400'
                  : toast.type === 'error'
                  ? 'bg-red-500/10 border-red-500 text-red-400'
                  : 'bg-blue-500/10 border-blue-500 text-blue-400'
              }
            `}
          >
            {toast.type === 'success' && <CheckCircle className="w-4 h-4" />}
            {toast.type === 'error' && <XCircle className="w-4 h-4" />}
            <span className="text-sm">{toast.message}</span>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">

        <button
          onClick={() => router.push('/dashboard')}
          className="
            flex items-center gap-2 px-4 py-2 rounded-xl
            border border-[hsl(var(--border))] bg-[hsl(var(--card))] backdrop-blur
            hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--muted))] transition
          "
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="
            flex items-center gap-2 px-5 py-2 rounded-xl
            bg-gradient-to-r from-cyan-500 to-blue-500
            hover:scale-105 transition
          "
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* TITLE */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          SaaS system configuration panel
        </p>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-6">

        <Card title="System" icon={<Server />}>
          <Toggle
            label="Maintenance Mode"
            value={settings.system.maintenance_mode}
            onChange={(v) =>
              update('system', 'maintenance_mode', v)
            }
          />
          <Toggle
            label="Open Registration"
            value={settings.system.registration_open}
            onChange={(v) =>
              update('system', 'registration_open', v)
            }
          />
        </Card>

        <Card title="Notifications" icon={<Bell />}>
          <Toggle
            label="Email Alerts"
            value={settings.notifications.email}
            onChange={(v) =>
              update('notifications', 'email', v)
            }
          />
          <Toggle
            label="Security Alerts"
            value={settings.notifications.security}
            onChange={(v) =>
              update('notifications', 'security', v)
            }
          />
        </Card>

        <Card title="Theme" icon={<Palette />}>
          <div className="flex gap-2">
            {['dark', 'light'].map((t) => (
              <button
                key={t}
                onClick={() =>
                  updateTheme(t as Settings['ui']['theme'])
                }
                className={`
                  px-4 py-2 rounded-lg border transition
                  ${
                    settings.ui.theme === t
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]'
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                  }
                `}
              >
                {t}
              </button>
            ))}
          </div>
        </Card>

        {/* DANGER */}
        <Card title="Danger Zone" icon={<AlertTriangle />}>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
          >
            Reset Platform
          </button>
        </Card>
      </div>

      {/* MODAL RESET */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[hsl(var(--card))] border border-red-500/30 p-6 rounded-xl w-[400px]">
            <h2 className="text-lg font-bold text-red-400 mb-2">
              Confirm Reset
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] text-sm mb-4">
              This will permanently delete all trainings and payments.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-[hsl(var(--border))]"
              >
                Cancel
              </button>
              <button
                onClick={resetPlatform}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* CARD */
function Card({ title, icon, children }: any) {
  return (
    <div className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm backdrop-blur transition-colors">
      <div className="flex items-center gap-2 mb-4 font-semibold">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

/* TOGGLE */
function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm text-[hsl(var(--foreground))]">{label}</span>

      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
          value ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted))]'
        }`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow transition ${
            value ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  );
}
