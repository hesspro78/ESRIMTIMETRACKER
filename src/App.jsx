import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth.jsx';
import { Toaster } from '@/components/ui/toaster';
import LoginForm from '@/components/LoginForm';
import Dashboard from '@/components/Dashboard';
import AdminPanel from '@/components/AdminPanel';
import QRScannerPage from '@/components/QRScannerPage';
import KioskLockScreen from '@/components/KioskLockScreen';
import ClockingInterface from '@/components/ClockingInterface';
import { AppSettingsProvider, useAppSettings } from '@/contexts/AppSettingsContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

const MainApp = () => {
  const { session, loading: authLoading, userProfile } = useAuth();
  const { appName, appLogo, loadInitialSettings, loadingSettings } = useAppSettings();
  const { applyCurrentTheme } = useTheme();
  const [view, setView] = useState('clocking'); // 'clocking', 'admin', 'qr'

  useEffect(() => {
    document.title = appName;
    const favicon = document.querySelector("link[rel~='icon']");
    if (favicon) {
      favicon.href = appLogo;
    }
  }, [appName, appLogo]);

  useEffect(() => {
    applyCurrentTheme();
  }, [applyCurrentTheme]);
  
  useEffect(() => {
    if (session?.user) {
      loadInitialSettings(session.user);
    } else if (!authLoading) { 
      loadInitialSettings(null);
    }
  }, [session, loadInitialSettings, authLoading]);

  const isLoading = authLoading || loadingSettings;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    if (view === 'qr') {
      return <QRScannerPage onBackToLogin={() => setView('login')} />;
    }
    return <LoginForm onSwitchToQR={() => setView('qr')} />;
  }

  if (userProfile && userProfile.role === 'admin') {
    return <AdminPanel />;
  }
  
  return <Dashboard />;
};

const AppContent = () => {
  const { kioskPassword, loadingSettings } = useAppSettings();
  const [isKioskUnlocked, setIsKioskUnlocked] = useState(false);

  useEffect(() => {
    if (!loadingSettings) {
      if (!kioskPassword || sessionStorage.getItem('kioskUnlocked') === 'true') {
        setIsKioskUnlocked(true);
      }
    }
  }, [kioskPassword, loadingSettings]);

  const handleUnlock = () => {
    sessionStorage.setItem('kioskUnlocked', 'true');
    setIsKioskUnlocked(true);
  };

  if (loadingSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  if (!isKioskUnlocked) {
    return <KioskLockScreen onUnlock={handleUnlock} />;
  }

  return <MainApp />;
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppSettingsProvider>
          <div className="min-h-screen bg-background text-foreground">
            <AppContent />
            <Toaster />
          </div>
        </AppSettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
