/**
 * Registrerar service worker och hanterar uppdateringsflödet.
 * Visar en diskret toast när en ny version finns tillgänglig.
 */
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      // Ny SW väntar på aktivering
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            showUpdateToast();
          }
        });
      });

      // Kontrollera efter uppdatering var 30:e minut (app öppen länge)
      setInterval(() => reg.update(), 30 * 60 * 1000);
    } catch (err) {
      console.warn('[SW] Registrering misslyckades:', err);
    }
  });
}

function showUpdateToast() {
  // Skapa en diskret "uppdatering tillgänglig"-banner
  const existing = document.getElementById('sw-update-toast');
  if (existing) return;

  const toast = document.createElement('div');
  toast.id = 'sw-update-toast';
  Object.assign(toast.style, {
    position:     'fixed',
    bottom:       'calc(env(safe-area-inset-bottom, 0px) + 1rem)',
    left:         '50%',
    transform:    'translateX(-50%)',
    background:   '#4f46e5',
    color:        '#fff',
    padding:      '0.75rem 1.25rem',
    borderRadius: '0.5rem',
    fontSize:     '0.9rem',
    fontWeight:   '600',
    zIndex:       '9999',
    display:      'flex',
    gap:          '0.75rem',
    alignItems:   'center',
    boxShadow:    '0 4px 20px rgba(0,0,0,0.4)',
    cursor:       'pointer',
    whiteSpace:   'nowrap',
  });
  toast.innerHTML = '🔄 Ny version tillgänglig — <strong>uppdatera nu</strong>';
  toast.addEventListener('click', () => window.location.reload());

  document.body.appendChild(toast);

  // Autoförsvinn efter 15 sekunder
  setTimeout(() => toast.remove(), 15_000);
}
