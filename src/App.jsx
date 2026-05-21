import React, { useState, useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import { useAuth }         from './hooks/useAuth';
import { useSchedule }     from './hooks/useSchedule';
import { useHistory }      from './hooks/useHistory';
import { useFirebaseSync } from './hooks/useFirebaseSync';

import { LoginScreen }  from './components/LoginScreen';
import { Header }       from './components/Header';
import { SchemaView }   from './components/SchemaView';
import { StudioView }   from './components/StudioView';
import { SettingsView } from './components/SettingsView';
import { AssetManagerModal } from './components/AssetManagerModal';

const toMonthKey = (y, m) => `${y}-${String(m + 1).padStart(2, '0')}`;

export default function App() {
  const today = new Date();
  const [year,   setYear]   = useState(today.getFullYear());
  const [month,  setMonth]  = useState(today.getMonth());
  const [activeTab,    setActiveTab]    = useState('Schema');
  const [openDays,     setOpenDays]     = useState([3, 4, 5]);
  const [syncStatus,   setSyncStatus]   = useState('saved');
  const [studioZoom,   setStudioZoom]   = useState(0.82);
  const [assetModalFor, setAssetModalFor] = useState(null); // aktivitets-id

  const [design, setDesign] = useState({
    layout: 'lively', format: 'A4', colorScheme: 'Per vecka',
    font: 'Inter', background: 'Rutnät', backgroundOpacity: 28,
    backgroundImage: '',
    colors: { week1: '#4f46e5', week2: '#0ea5e9', week3: '#22c55e', week4: '#f97316' },
  });

  const [settings, setSettings] = useState({
    yardName:        'Fritidsgården Solsidan',
    footerText:      'Välkommen till en trygg och kreativ mötesplats.',
    qrLink:          'https://fritidsgard.se',
    cloudExport:     true,
    localMode:       false,
    closeOnHolidays: true,
    fillCalendar:    true,
    groupWeeks:      false,
  });

  const { user, loading: authLoading, error: authError, loginAnon, loginEmail, registerEmail, logout } = useAuth();
  const currentMonthKey = toMonthKey(year, month);
  const { activities, setActivities, templates, addTemplate } = useSchedule(currentMonthKey, openDays);
  const { pushHistory, undo, redo, canUndo, canRedo } = useHistory(activities, setActivities);

  useFirebaseSync({
    uid: user?.uid, monthKey: currentMonthKey,
    activities, settings,
    setActivities, setSettings,
    localMode: settings.localMode || !user,
  });

  useEffect(() => {
    if (!user || settings.localMode) { setSyncStatus('local'); return; }
    setSyncStatus('saving');
    const t = setTimeout(() => setSyncStatus('saved'), 1400);
    return () => clearTimeout(t);
  }, [activities, settings]);

  const updateActivity = useCallback((id, patch) =>
    pushHistory(activities.map(a => a.id === id ? { ...a, ...patch } : a))
  , [activities, pushHistory]);

  const moveActivity = useCallback((index, dir) => {
    const next = [...activities];
    const t = index + dir;
    if (t < 0 || t >= next.length) return;
    [next[index], next[t]] = [next[t], next[index]];
    pushHistory(next);
  }, [activities, pushHistory]);

  const reorderActivities = useCallback((from, to) => {
    const next = [...activities];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    pushHistory(next);
  }, [activities, pushHistory]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); };

  if (authLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-sm text-slate-500 font-medium">Ansluter…</p>
      </div>
    </div>
  );

  if (!user) return (
    <LoginScreen
      onLoginEmail={loginEmail} onLoginAnon={loginAnon}
      onRegister={registerEmail} error={authError} loading={authLoading}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 font-sans">
      <Header
        activeTab={activeTab}  setActiveTab={setActiveTab}
        canUndo={canUndo}      canRedo={canRedo}
        onUndo={undo}          onRedo={redo}
        onLogout={logout}      syncStatus={syncStatus}
        user={user}
      />
      {/* pt-20 säkerställer att header aldrig täcker innehåll */}
      <main className="pt-20 p-4 lg:p-6">
        {activeTab === 'Schema' && (
          <SchemaView
            year={year} month={month}
            prevMonth={prevMonth} nextMonth={nextMonth}
            openDays={openDays} setOpenDays={setOpenDays}
            activities={activities}
            updateActivity={updateActivity}
            moveActivity={moveActivity}
            reorderActivities={reorderActivities}
            pushHistory={pushHistory}
            onOpenAsset={setAssetModalFor}
          />
        )}
        {activeTab === 'Studio' && (
          <StudioView
            activities={activities}
            design={design} setDesign={setDesign}
            settings={settings}
            year={year} month={month}
            zoom={studioZoom} setZoom={setStudioZoom}
            templates={templates} addTemplate={addTemplate}
          />
        )}
        {activeTab === 'Inställningar' && (
          <SettingsView settings={settings} setSettings={setSettings} />
        )}
      </main>

      {assetModalFor && (
        <AssetManagerModal
          activityId={assetModalFor}
          activity={activities.find(a => a.id === assetModalFor)}
          onSelect={img => { updateActivity(assetModalFor, { image: img }); setAssetModalFor(null); }}
          onClose={() => setAssetModalFor(null)}
        />
      )}
    </div>
  );
}
