import React from 'react';
import { LogOut, User, Image as ImageIcon, QrCode, Building2, AlignLeft, Users, Cloud, Wifi, Calendar, BookOpen } from 'lucide-react';

function Field({ label, icon: Icon, children }) {
  return (
    <div className="mb-5">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}{label}
      </label>
      {children}
    </div>
  );
}

function SwitchRow({ icon: Icon, label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
        <div>
          <div className="text-sm font-medium text-slate-800">{label}</div>
          {description && <div className="text-xs text-slate-500 mt-0.5">{description}</div>}
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-indigo-500' : 'bg-slate-200'}`}
      >
        <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

export function SettingsView({ settings, setSettings, user, onLogout }) {
  const update = (p) => setSettings(prev => ({ ...prev, ...p }));

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">

      {/* Fritidsgård-info */}
      <section>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Fritidsgårdsinfo</h2>
        <p className="text-sm text-slate-500 mb-4">Namn och logotyp visas i månadsbladets header.</p>

        <Field label="Fritidsgårdens namn" icon={Building2}>
          <input value={settings.yardName} onChange={e => update({ yardName: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
        </Field>

        {/* Logotyp-uppladdning */}
        <Field label="Logotyp (visas i headern)" icon={ImageIcon}>
          <div className="flex items-center gap-4">
            {settings.yardLogo ? (
              <img src={settings.yardLogo} alt="Logotyp" className="h-14 max-w-[120px] object-contain rounded-xl border border-slate-200 bg-white p-1" />
            ) : (
              <div className="h-14 w-24 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs text-center p-1">
                Ingen logotyp
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="cursor-pointer px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-sm font-semibold hover:bg-indigo-100 transition">
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => update({ yardLogo: ev.target?.result });
                    reader.readAsDataURL(file);
                  }} />
                Ladda upp logotyp
              </label>
              {settings.yardLogo && (
                <button onClick={() => update({ yardLogo: '' })} className="text-xs text-rose-500 hover:text-rose-700">Ta bort</button>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Rekommenderat: PNG med transparent bakgrund. Logotypen placeras uppe till höger i månadsbladet.</p>
        </Field>
      </section>

      {/* Export */}
      <section>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Export & QR</h2>
        <p className="text-sm text-slate-500 mb-4">Styr sidfot, QR-länk och organisationsinfo i exporten.</p>

        <Field label="Sidfottext" icon={AlignLeft}>
          <input value={settings.footerText} onChange={e => update({ footerText: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
        </Field>

        <Field label="QR-kodslänk (visas i sidfoten)" icon={QrCode}>
          <input value={settings.qrLink} onChange={e => update({ qrLink: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
          <p className="text-xs text-slate-400 mt-1">QR-koden placeras nu i sidfoten (inte i headern).</p>
        </Field>

        <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
          <SwitchRow icon={Users} label="Stockholm Stad-logotyp" description="Logotyp i sidfoten vid export." checked={settings.showStockholmLogo} onChange={v => update({ showStockholmLogo: v })} />
          <SwitchRow icon={Cloud} label="Molnexport" description="Spara PDF direkt i molnet." checked={settings.cloudExport} onChange={v => update({ cloudExport: v })} />
        </div>
      </section>

      {/* Schema */}
      <section>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Schema</h2>
        <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
          <SwitchRow icon={Wifi}     label="Lokal läge" description="Inga data sparas till molnet." checked={settings.localMode} onChange={v => update({ localMode: v })} />
          <SwitchRow icon={Calendar} label="Stäng på helgdagar" description="Röda dagar markeras automatiskt som stängt." checked={settings.closeOnHolidays} onChange={v => update({ closeOnHolidays: v })} />
          <SwitchRow icon={BookOpen} label="Fyll kalender automatiskt" description="Visa platshållare för alla öppna dagar." checked={settings.fillCalendar} onChange={v => update({ fillCalendar: v })} />
          <SwitchRow icon={Calendar} label="Gruppera per vecka i Studio" description="Visa månadsbladet uppdelat i veckor med dag-kolumner (som referensbilden)." checked={settings.groupWeeks} onChange={v => update({ groupWeeks: v })} />
        </div>
      </section>

      {/* Konto */}
      <section>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Konto</h2>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center"><User className="w-4 h-4 text-indigo-600" /></div>
            <div>
              <div className="text-sm font-semibold text-slate-900">{user?.email ?? 'Anonym'}</div>
              <div className="text-xs text-slate-500">{user?.isAnonymous ? 'Anonym session' : 'Inloggad'}</div>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition">
            <LogOut className="w-4 h-4" />Logga ut
          </button>
        </div>
      </section>
    </div>
  );
}
