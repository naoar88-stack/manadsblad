import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth }         from './hooks/useAuth';
import { useSchedule }     from './hooks/useSchedule';
import { useHistory }      from './hooks/useHistory';
import { useFirebaseSync } from './hooks/useFirebaseSync';
import { LoginScreen }     from './components/LoginScreen';
import { Header }          from './components/Header';

const SchemaView        = lazy(() => import('./components/SchemaView').then(m => ({ default: m.SchemaView })));
const StudioView        = lazy(() => import('./components/StudioView').then(m => ({ default: m.StudioView })));
const SettingsView      = lazy(() => import('./components/SettingsView').then(m => ({ default: m.SettingsView })));
const AssetManagerModal = lazy(() => import('./components/AssetManagerModal').then(m => ({ default: m.AssetManagerModal })));
const CropModal         = lazy(() => import('./components/CropModal').then(m => ({ default: m.CropModal })));

const toMonthKey = (y, m) => `${y}-${String(m + 1).padStart(2, '0')}`;

const Spinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 bg-white rounded-2xl shadow flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
      <p className="text-sm font-semibold text-slate-400 animate-pulse">Laddar arbetsytan…</p>
    </div>
  </div>
);

export default function App() {
  const today = new Date();
  const [year, setYear]             = useState(today.getFullYear());
  const [month, setMonth]           = useState(today.getMonth());
  const [activeTab, setActiveTab]   = useState('Schema');
  const [openDays, setOpenDays]     = useState([3, 4, 5]);
  const [syncStatus, setSyncStatus] = useState('saved');
  const [studioZoom, setStudioZoom] = useState(0.82);
  const [assetModalFor, setAssetModalFor] = useState(null);
  const [cropModalFor,  setCropModalFor]  = useState(null);

  const [design, setDesign] = useState({
    layout: 'lively', format: 'A4', colorScheme: 'Per vecka',
    font: 'Inter', background: 'Rutnat', backgroundOpacity: 28, backgroundImage: '',
    colors: { week1: '#4f46e5', week2: '#0ea5e9', week3: '#22c55e', week4: '#f97316' },
  });

  const [settings, setSettings] = useState({
    yardName:          'Fritidsgårdenerna',
    footerText:        'Välkommen till en trygg och kreativ mötesplats.',
    qrLink:            'https://fritidsgard.se',
    cloudExport:       true,
    localMode:         false,
    closeOnHolidays:   true,
    fillCalendar:      true,
    groupWeeks:        false,
    showStockholmLogo: true,
    yardLogo:          '',
  });

  const { user, loading: authLoading, loginAnon, loginEmail, registerEmail, logout } = useAuth();
  const currentMonthKey = toMonthKey(year, month);
  const { activities, setActivities, templates, addTemplate } = useSchedule(currentMonthKey, openDays);
  const { pushHistory, undo, redo, canUndo, canRedo } = useHistory(activities, setActivities);

  useFirebaseSync({
    uid: user?.uid, monthKey: currentMonthKey,
    activities, settings, setActivities, setSettings,
    localMode: settings.localMode || !user,
  });

  useEffect(() => {
    if (!user || settings.localMode) { setSyncStatus('local'); return; }
    setSyncStatus('saving');
    const t = setTimeout(() => setSyncStatus('saved'), 1400);
    return () => clearTimeout(t);
  }, [activities, settings]);

  useEffect(() => {
    const handle = e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) { if (canRedo) redo(); } else { if (canUndo) undo(); }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        if (canRedo) redo();
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [undo, redo, canUndo, canRedo]);

  const updateActivity = useCallback(
    (id, patch) => pushHistory(activities.map(a => a.id === id ? { ...a, ...patch } : a)),
    [activities, pushHistory]
  );

  const prevMonth = useCallback(() => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1);
  }, [month]);

  const nextMonth = useCallback(() => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1);
  }, [month]);

  if (authLoading) return <Spinner />;
  if (!user) return <LoginScreen onLoginEmail={loginEmail} onRegister={registerEmail} onAnon={loginAnon} />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        activeTab={activeTab} setActiveTab={setActiveTab}
        syncStatus={syncStatus} canUndo={canUndo} canRedo={canRedo}
        onUndo={undo} onRedo={redo} user={user} onLogout={logout}
      />
      <main className="flex-1">
        <Suspense fallback={<Spinner />}>
          {activeTab === 'Schema' && (
            <SchemaView
              year={year} month={month}
              prevMonth={prevMonth} nextMonth={nextMonth}
              openDays={openDays} setOpenDays={setOpenDays}
              activities={activities} updateActivity={updateActivity}
              pushHistory={pushHistory} onOpenAsset={id => setAssetModalFor(id)}
            />
          )}
          {activeTab === 'Studio' && (
            <StudioView
              activities={activities} design={design} setDesign={setDesign}
              settings={settings} year={year} month={month}
              zoom={studioZoom} setZoom={setStudioZoom}
              onCrop={id => setCropModalFor(id)} templates={templates} addTemplate={addTemplate}
            />
          )}
          {activeTab === 'Inställningar' && (
            <SettingsView settings={settings} setSettings={setSettings} user={user} onLogout={logout} />
          )}
        </Suspense>
      </main>

      {assetModalFor && (
        <Suspense fallback={null}>
          <AssetManagerModal
            activity={activities.find(a => a.id === assetModalFor)}
            onSelect={img => { updateActivity(assetModalFor, { image: img }); setAssetModalFor(null); }}
            onClose={() => setAssetModalFor(null)}
          />
        </Suspense>
      )}

      {cropModalFor && (
        <Suspense fallback={null}>
          <CropModal
            activity={activities.find(a => a.id === cropModalFor)}
            onSave={crop => { updateActivity(cropModalFor, { crop }); setCropModalFor(null); }}
            onClose={() => setCropModalFor(null)}
          />
        </Suspense>
      )}
    </div>
  );
}
