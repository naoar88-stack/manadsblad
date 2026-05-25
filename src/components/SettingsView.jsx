import React from 'react';
import { Info, Cloud, Database, Calendar, Globe, Users, Layout } from 'lucide-react';

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-slate-700 mb-2">{label}</div>
      {children}
    </label>
  );
}

function SwitchRow({ icon: Icon, label, description, checked, onChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {Icon && <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-indigo-600" /></div>}
        <div>
          <div className="font-medium text-slate-900">{label}</div>
          <div className="text-sm text-slate-500 mt-0.5">{description}</div>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-14 h-8 rounded-full relative transition-colors shrink-0 mt-0.5 ${ checked ? 'bg-indigo-600' : 'bg-slate-200' }`}
      >
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${ checked ? 'left-7' : 'left-1' }`} />
      </button>
    </div>
  );
}

export function SettingsView({ settings, setSettings , user, onLogout }) {
  const update = (patch) => setSettings(prev => ({ ...prev, ...patch }));

  return (
    <div className="max-w-screen-lg mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-5">
      {/* Gårdsinformation */}
      <div className="bg-white/80 backdrop-blur rounded-[28px] border border-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center"><Info className="w-5 h-5 text-indigo-600" /></div>
          <div>
            <h2 className="font-bold text-slate-900">Gårdsinformation</h2>
            <p className="text-sm text-slate-500">Styr sidfot, QR-länk och organisationsinfo i exporten.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Namn på fritidsgård">
            <input value={settings.yardName} onChange={e => update({ yardName: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
          </Field>
          <Field label="QR-kodslänk">
            <input value={settings.qrLink} onChange={e => update({ qrLink: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Sidfotstext">
              <textarea value={settings.footerText} onChange={e => update({ footerText: e.target.value })} rows={4} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
            </Field>
          </div>
        </div>
      </div>

      {/* Systeminställningar */}
      <div className="bg-white/80 backdrop-blur rounded-[28px] border border-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center"><Layout className="w-5 h-5 text-indigo-600" /></div>
          <div>
            <h2 className="font-bold text-slate-900">Systeminställningar</h2>
            <p className="text-sm text-slate-500">Moln-export, lokalt läge och smart kalenderlogik.</p>
          </div>
        </div>
        <div className="space-y-3">
          <SwitchRow icon={Cloud}     label="Aktivera Moln-export"   description="Render-server: manadsblad-export.onrender.com"         checked={settings.cloudExport}       onChange={v => update({ cloudExport: v })} />
          <SwitchRow icon={Database}  label="Kör lokalt"             description="Fallback till LocalStorage istället för Firestore."   checked={settings.localMode}         onChange={v => update({ localMode: v })} />
          <SwitchRow icon={Calendar}  label="Stäng på röda dagar"    description="Filtrerar helgdagar i den beräknade kalendern."         checked={settings.closeOnHolidays}  onChange={v => update({ closeOnHolidays: v })} />
          <SwitchRow icon={Globe}     label="Fyll ut kalendern"      description="Skapar platshållare om verksamheten har glapp."        checked={settings.fillCalendar}     onChange={v => update({ fillCalendar: v })} />
          <SwitchRow icon={Users}     label="Stockholm Stad-logotyp" description="Logotyp i nederkant av affischen vid export."           checked={settings.showStockholmLogo} onChange={v => update({ showStockholmLogo: v })} />
          <SwitchRow icon={Layout}    label="Gruppera i veckor"      description="Delar aktivitetslistan i block per vecka."             checked={settings.groupWeeks}       onChange={v => update({ groupWeeks: v })} />
        </div>

        <div className="mt-5 rounded-2xl bg-slate-900 text-white p-4">
          <div className="font-semibold mb-2 text-sm">Arkitektur</div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            <li>· useMemo för kalenderdagar och helgdagar</li>
            <li>· Debounced autosave till Firestore</li>
            <li>· useHistory för Ctrl+Z / Ctrl+Y</li>
            <li>· Off-canvas sidopanel i Studio (mobil)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
