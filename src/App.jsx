import React, { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth }          from './hooks/useAuth';
import { useSchedule }      from './hooks/useSchedule';
import { useHistory }       from './hooks/useHistory';
import { useFirebaseSync }  from './hooks/useFirebaseSync';
import { useOnlineStatus }  from './hooks/useOnlineStatus';
import { LoginScreen }      from './components/LoginScreen';
import { Header }           from './components/Header';
import { ToastProvider }    from './components/Toast';
import { ErrorBoundary }    from './components/ErrorBoundary';
import { SkeletonLoader }   from './components/SkeletonLoader';
import { OfflineBanner }    from './components/OfflineBanner';

const SchemaView        = lazy(() => import('./components/SchemaView').then(m => ({ default: m.SchemaView })));
const StudioView        = lazy(() => import('./components/StudioView').then(m => ({ default: m.StudioView })));
const SettingsView      = lazy(() => import('./components/SettingsView').then(m => ({ default: m.SettingsView })));
const AssetManagerModal = lazy(() => import('./components/AssetManagerModal').then(m => ({ default: m.AssetManagerModal })));
const CropModal         = lazy(() => import('./components/CropModal').then(m => ({ default: m.CropModal })));

const toMonthKey = (y, m) => `${y}-${String(m + 1).padStart(2, '0')}`;

const Spinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-slate-100">
        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" aria-hidden="true" />
      </div>
      <p className="text-sm font-semibold text-slate-400 animate-pulse tracking-wide" aria-live="polite">Laddar…</p>
    </div>
  </div>
);

const DEFAULT_DESIGN = {
  layout: 'lively', format: 'A4', colorScheme: 'Per vecka',
  font: 'Inter', background: 'Rutnat', backgroundOpacity: 28, backgroundImage: '',
  colors: { week1: '#4f46e5', week2: '#0ea5e9', week3: '#22c55e', week4: '#f97316' },
  viewMode: 'grid',
};

const DEFAULT_SETTINGS = {
  // Organisationsinfo
  yardName:        'Fritidsgårderna',
  address:         '',
  websiteUrl:      '',
  footerText:      'Välkommen till en trygg och kreativ mötesplats.',
  qrLink:          'https://fritidsgard.se',
  // Logotyp — används som settings.logoUrl i StudioView
  logoUrl:         '',
  // Visning
  showQr:          false,
  showStockholmLogo: true,
  // Export & synk
  cloudExport:     true,
  localMode:       false,
  // Kalender
  closeOnHolidays: true,
  fillCalendar:    true,
  groupWeeks:      false,
};

export default function App() {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [activeTab, setActiveTab]   = useState('Schema');
  const [openDays, setOpenDays]     = useState([3, 4, 5]);
  const [syncStatus, setSyncStatus] = useState('saved');
  const [studioZoom, setStudioZoom] = useState(0.82);
  const [assetModalFor, setAssetModalFor] = useState(null);
  const [cropModalFor,  setCropModalFor]  = useState(null);
  const [design,   setDesign]   = useState(DEFAULT_DESIGN);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const { user, loading: authLoading, loginAnon, loginEmail, registerEmail, logout } = useAuth();
  const { isOnline } = useOnlineStatus();
  const currentMonthKey = toMonthKey(year, month);

  const { activities, setActivities, templates, addTemplate } = useSchedule(currentMonthKey, openDays);
  const { pushHistory, undo, redo, resetHistory, canUndo, canRedo } = useHistory(activities, setActivities);

  const prevMonthKeyRef = useRef(currentMonthKey);
  useEffect(() => {
    if (prevMonthKeyRef.current !== currentMonthKey) {
      resetHistory();
      prevMonthKeyRef.current = currentMonthKey;
    }
  }, [currentMonthKey, resetHistory]);

  const { dataLoading, registerDelete } = useFirebaseSync({
    uid:        user?.uid,
    monthKey:   currentMonthKey,
    activities, settings,
    setActivities, setSettings,
    localMode:  settings.localMode || !user,
  });

  // syncStatus — går via mounted-ref så setSyncStatus aldrig anropas
  // på en unmountad komponent.
  const mountedRef  = useRef(true);
  const syncTimerRef = useRef(null);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!user || settings.localMode) { setSyncStatus('local'); return; }
    setSyncStatus('saving');
    clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      if (mountedRef.current) setSyncStatus('saved');
    }, 1600);
    return () => clearTimeout(syncTimerRef.current);
  }, [activities, settings, user]);

  useEffect(() => {
    const handle = e => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
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

  const updateActivity = useCallback((id, patch) => {
    pushHistory(activities.map(a => a.id === id ? { ...a, ...patch } : a));
  }, [activities, pushHistory]);

  const removeActivity = useCallback((id) => {
    registerDelete?.(id);
    pushHistory(activities.filter(a => a.id !== id));
  }, [activities, pushHistory, registerDelete]);

  const prevMonth = useCallback(() => {
    setMonth(m => { if (m === 0) { setYear(y => y - 1); return 11; } return m - 1; });
  }, []);
  const nextMonth = useCallback(() => {
    setMonth(m => { if (m === 11) { setYear(y => y + 1); return 0; } return m + 1; });
  }, []);

  // Null-guards: om aktiviteten tagits bort medan modalen var öppen — stäng modalen.
  const assetActivity = assetModalFor ? activities.find(a => a.id === assetModalFor) ?? null : null;
  const cropActivity  = cropModalFor  ? activities.find(a => a.id === cropModalFor)  ?? null : null;

  if (authLoading) return <Spinner />;
  if (!user) return (
    <ToastProvider>
      <LoginScreen onLoginEmail={loginEmail} onRegister={registerEmail} onAnon={loginAnon} />
    </ToastProvider>
  );

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <OfflineBanner isOnline={isOnline} />

        <Header
          activeTab={activeTab} setActiveTab={setActiveTab}
          syncStatus={syncStatus} canUndo={canUndo} canRedo={canRedo}
          onUndo={undo} onRedo={redo} user={user} onLogout={logout}
        />

        <main className="flex-1">
          <ErrorBoundary>
            <Suspense fallback={<Spinner />}>
              {activeTab === 'Schema' && (
                dataLoading
                  ? <SkeletonLoader />
                  : <SchemaView
                      year={year} month={month}
                      prevMonth={prevMonth} nextMonth={nextMonth}
                      openDays={openDays} setOpenDays={setOpenDays}
                      activities={activities}
                      updateActivity={updateActivity}
                      removeActivity={removeActivity}
                      pushHistory={pushHistory}
                      onOpenAsset={id => setAssetModalFor(id)}
                    />
              )}
              {activeTab === 'Studio' && (
                dataLoading
                  ? <SkeletonLoader />
                  : <StudioView
                      activities={activities} design={design} setDesign={setDesign}
                      settings={settings} year={year} month={month}
                      zoom={studioZoom} setZoom={setStudioZoom}
                      onCrop={id => setCropModalFor(id)}
                      templates={templates} addTemplate={addTemplate}
                    />
              )}
              {activeTab === 'Inställningar' && (
                <SettingsView settings={settings} setSettings={setSettings} user={user} onLogout={logout} />
              )}
            </Suspense>
          </ErrorBoundary>
        </main>

        {/* AssetManagerModal — rendreras inte om aktiviteten inte längre finns */}
        {assetModalFor && assetActivity && (
          <ErrorBoundary fallback={null}>
            <Suspense fallback={null}>
              <AssetManagerModal
                activity={assetActivity}
                onSelect={img => { updateActivity(assetModalFor, { image: img }); setAssetModalFor(null); }}
                onClose={() => setAssetModalFor(null)}
              />
            </Suspense>
          </ErrorBoundary>
        )}

        {/* CropModal — rendreras inte om aktiviteten inte längre finns */}
        {cropModalFor && cropActivity && (
          <ErrorBoundary fallback={null}>
            <Suspense fallback={null}>
              <CropModal
                activity={cropActivity}
                onSave={img => { updateActivity(cropModalFor, { image: img }); setCropModalFor(null); }}
                onClose={() => setCropModalFor(null)}
              />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>
    </ToastProvider>
  );
}
