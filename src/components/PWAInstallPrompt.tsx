import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is already running standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("Pour installer l'application :\n\n- Sur Chrome/Android : Appuyez sur le menu (⋮) puis 'Installer l'application'\n- Sur iPhone/Safari : Appuyez sur Partager (↑) puis 'Sur l'écran d'accueil'");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs font-bold border-b border-amber-400/50">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-slate-950 text-amber-400 rounded-lg shrink-0">
          <Smartphone className="w-4 h-4" />
        </div>
        <div>
          <span className="font-extrabold block sm:inline">Installer l'application native RestoPOS</span>
          <span className="text-[10px] font-semibold opacity-90 sm:ml-2 block sm:inline">Accès direct depuis l'écran d'accueil & mode rapide</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstallClick}
          className="bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Installer</span>
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg text-slate-900 hover:bg-black/10 transition"
          title="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
