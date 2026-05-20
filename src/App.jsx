import React, { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useSchedule } from './hooks/useSchedule';
import { useHistory } from './hooks/useHistory';
import { Header } from './components/Header';
import { SchemaView } from './components/SchemaView';
import { StudioView } from './components/StudioView';
import { SettingsView } from './components/SettingsView';
import { AssetManagerModal } from './components/AssetManagerModal';
import { CropModal } from './components/CropModal';

const toMonthKey = (y, m) => `${y}-${String(m + 1).padStart(2, '0')}`;

export default function App() {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [activeTab, setActiveTab] = useState('Schema');
  const [openDays, setOpenDays]   = useState([3, 4, 5]);
  const [assetModalFor, setAssetModalFor] = useState(null);
  const [cropModalFor,  setCropModalFor]  = useState(null);
  const [studioZoom, setStudioZoom]       = useState(0.82);
  const [design, setDesign] = useState({
    layout: 'lively', format: 'A4', colorScheme: 'Per vecka',
    font: 'Inter', background: 'Rutnät', backgroundOpacity: 28,
    backgroundImage: '',
    colors: { week1: '#4f46e5', week2: '#0ea5e9', week3: '#22c55e', week4: '#f97316' },
  });
  const [settings, setSettings] = useState({
    yardName: 'Fritidsgården Solsidan',
    footerText: 'Välkommen till en trygg och kreativ mötesplats.',
    qrLink: 'https://fritidsgard.se',
    cloudExport: true, localMode: false,
    closeOnHolidays: true, fillCalendar: true,
    showStockholmLogo: true, groupWeeks: false,
  });

  const currentMonthKey = toMonthKey(year, month);
  const { schedule, activities, setActivities, templates, isLoading, addTemplate }
    = useSchedule(currentMonthKey, openDays);

  const { pushHistory, undo, redo, canUndo, canRedo } = useHistory(activities, setActivities);

  const updateActivity = useCallback((id, patch) => {
    const next = activities.map(a => a.id === id ? { ...a, ...patch } : a);
    pushHistory(next);
  }, [activities, pushHistory]);

  const moveActivity = useCallback((index, direction) => {
    const next = [...activities];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    pushHistory(next);
  }, [activities, pushHistory]);

  const reorderActivities = useCallback((dragIndex, hoverIndex) => {
    const next = [...activities];
    const [dragged] = next.splice(dragIndex, 1);
    next.splice(hoverIndex, 0, dragged);
    pushHistory(next);
  }, [activities, pushHistory]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-sm font-medium">Ansluter till databasen...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 font-sans">
      <Header
        activeTab={activeTab} setActiveTab={setActiveTab}
        canUndo={canUndo} canRedo={canRedo}
        onUndo={undo} onRedo={redo}
        studioZoom={studioZoom} setStudioZoom={setStudioZoom}
      />
      <main className="pt-[80px] p-4 lg:p-6 min-h-screen">
        {activeTab === 'Schema' && (
          <SchemaView
            year={year} month={month}
            prevMonth={prevMonth} nextMonth={nextMonth}
            openDays={openDays} setOpenDays={setOpenDays}
            activities={activities}
            updateActivity={updateActivity}
            moveActivity={moveActivity}
            reorderActivities={reorderActivities}
            onOpenAsset={setAssetModalFor}
            pushHistory={pushHistory}
          />
        )}
        {activeTab === 'Studio' && (
          <StudioView
            activities={activities}
            design={design} setDesign={setDesign}
            settings={settings}
            year={year} month={month}
            zoom={studioZoom} setZoom={setStudioZoom}
            onCrop={setCropModalFor}
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
          onSelect={(image) => { updateActivity(assetModalFor, { image }); setAssetModalFor(null); }}
          onClose={() => setAssetModalFor(null)}
        />
      )}
      {cropModalFor && (
        <CropModal
          activity={activities.find(a => a.id === cropModalFor)}
          onSave={(crop) => { updateActivity(cropModalFor, { crop }); setCropModalFor(null); }}
          onClose={() => setCropModalFor(null)}
        />
      )}
    </div>
  );
}
