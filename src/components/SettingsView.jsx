import React, { useState, useCallback } from 'react';
import { LogOut, User, Image as ImageIcon, QrCode, Building2, AlignLeft,
         Cloud, Wifi, Calendar, BookOpen, Check, AlertCircle } from 'lucide-react';

// Validera att en sträng är en giltig HTTPS-URL (tom sträng tillåts)
function isValidUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

function Field({ label, icon: Icon, hint, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        {Icon && <Icon size={14} className="text-slate-400" />}
        {label}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 font-medium" role="alert">
          <AlertCircle size={11} /> {error}
        </p>
      )}
      {!error && hint && <p className="text-xs text-slate-400 leading-relaxed">{hint}</p>}
    </div>
  );
}

function SwitchRow({ icon: Icon, label, description, checked, onChange }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
      {Icon && <Icon size={16} className="text-slate-400 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors shrink-0 relative ${checked ? 'bg-indigo-500' : 'bg-slate-200'}`}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${checked ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

function Card({ title, description, children }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-slate-100">
        <h2 className="font-black text-slate-900 text-base">{title}</h2>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
  );
}

export function SettingsView({ settings, setSettings, user, onLogout }) {
  const [saved,      setSaved]      = useState(false);
  const [urlErrors,  setUrlErrors]  = useState({});

  const update = useCallback((patch) => {
    setSettings(prev => ({ ...prev, ...patch }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [setSettings]);

  // Validera URL-fält innan sparning
  const handleUrlChange = useCallback((field, value) => {
    const valid = isValidUrl(value);
    setUrlErrors(prev => ({ ...prev, [field]: valid ? '' : 'Måste vara en giltig https://-adress' }));
    if (valid) update({ [field]: value });
    else setSettings(prev => ({ ...prev, [field]: value })); // Uppdatera fältet men spara inte
  }, [update, setSettings]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

      {saved && (
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl" role="status">
          <Check size={15} aria-hidden="true" /> Inställningar sparade
        </div>
      )}

      {/* Fritidsgårdsinfo */}
      <Card title="Fritidsgårdsinfo" description="Namn och logotyp visas i månadsbladets header.">
        <Field label="Gårdens namn" icon={Building2}>
          <input
            value={settings.yardName}
            onChange={e => update({ yardName: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200 transition"
            placeholder="T.ex. Fryshuset Väst"
          />
        </Field>

        <Field label="Webbplats" icon={AlignLeft} hint="Visas som länk i exporten." error={urlErrors.websiteUrl}>
          <input
            value={settings.websiteUrl || ''}
            onChange={e => handleUrlChange('websiteUrl', e.target.value)}
            className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 transition ${
              urlErrors.websiteUrl ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200'
            }`}
            placeholder="https://fritidsgard.se"
            type="url"
            inputMode="url"
          />
        </Field>

        <Field label="Logotyp" icon={ImageIcon} hint="Rekommenderat: PNG med transparent bakgrund.">
          {settings.yardLogo ? (
            <div className="flex items-center gap-3">
              <img
                src={settings.yardLogo}
                alt="Logotyp"
                className="h-12 w-auto rounded-xl border border-slate-200 bg-slate-50 object-contain p-1"
              />
              <button
                onClick={() => update({ yardLogo: '' })}
                className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
              >
                Ta bort
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 h-11 px-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer transition text-sm text-slate-500 font-medium">
              <ImageIcon size={15} className="text-slate-400" />
              Ladda upp logotyp
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => update({ yardLogo: ev.target?.result });
                  reader.readAsDataURL(file);
                }}
              />
            </label>
          )}
        </Field>
      </Card>

      {/* Export & QR */}
      <Card title="Export & QR" description="Styr sidfot, QR-länk och organisationsinfo i exporten.">
        <Field label="Sidfotstext" icon={AlignLeft}>
          <input
            value={settings.footerText}
            onChange={e => update({ footerText: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200 transition"
            placeholder="Välkommen till en trygg och kreativ mötesplats."
          />
        </Field>
        <Field label="QR-länk" icon={QrCode} hint="QR-koden placeras i sidfoten." error={urlErrors.qrLink}>
          <input
            value={settings.qrLink}
            onChange={e => handleUrlChange('qrLink', e.target.value)}
            className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 transition ${
              urlErrors.qrLink ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200'
            }`}
            placeholder="https://fritidsgard.se"
            type="url"
            inputMode="url"
          />
        </Field>
        <div className="space-y-0 divide-y divide-slate-100">
          <SwitchRow icon={Building2} label="Visa Stockholms logotyp" checked={settings.showStockholmLogo} onChange={v => update({ showStockholmLogo: v })} />
          <SwitchRow icon={Cloud}     label="Molnexport" description="Spara PDF direkt i molnet"  checked={settings.cloudExport}       onChange={v => update({ cloudExport: v })} />
        </div>
      </Card>

      {/* Schema */}
      <Card title="Schemainställningar">
        <div className="space-y-0 divide-y divide-slate-100">
          <SwitchRow icon={Wifi}     label="Lokalt läge"               description="Sparar bara på den här enheten"        checked={settings.localMode}        onChange={v => update({ localMode: v })} />
          <SwitchRow icon={Calendar} label="Stäng vid helgdagar"        description="Helgdagar markeras automatiskt"        checked={settings.closeOnHolidays} onChange={v => update({ closeOnHolidays: v })} />
          <SwitchRow icon={Calendar} label="Fyll kalender automatiskt" description="Kopierar mall till tomma dagar"        checked={settings.fillCalendar}    onChange={v => update({ fillCalendar: v })} />
          <SwitchRow icon={BookOpen} label="Gruppera per vecka i Studio" description="Veckobaserad layout istället för grid" checked={settings.groupWeeks}      onChange={v => update({ groupWeeks: v })} />
        </div>
      </Card>

      {/* Konto */}
      <Card title="Konto">
        <div className="flex items-center gap-3 py-1">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
            <User size={18} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{user?.email ?? 'Anonymt konto'}</p>
            <p className="text-xs text-slate-400">
              {user?.isAnonymous ? 'Anonym session — data försvinner vid utloggning' : 'Inloggad med e-post'}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="ml-auto flex items-center gap-2 h-9 px-4 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm transition"
          >
            <LogOut size={14} aria-hidden="true" /> Logga ut
          </button>
        </div>
      </Card>
    </div>
  );
}
