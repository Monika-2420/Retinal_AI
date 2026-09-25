import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { ScreeningPage } from './pages/ScreeningPage';
import { ScreeningHistoryPage } from './pages/ScreeningHistoryPage';
import { ReferralsPage } from './pages/ReferralsPage';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { DatabaseSchemaPage } from './pages/DatabaseSchemaPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RealtimeToastListener } from './components/notifications/RealtimeToastListener';
import { initDatabase } from './services/db';

function MainApp() {
  const { currentUser, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>('/dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [preselectedPatientId, setPreselectedPatientId] = useState<string | undefined>(undefined);

  useEffect(() => {
    initDatabase();
  }, []);

  const navigateTo = (path: string, params?: { patientId?: string }) => {
    if (params?.patientId) {
      setPreselectedPatientId(params.patientId);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-teal-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
          <span className="text-xs font-mono">Initializing RetinaReach Platform...</span>
        </div>
      </div>
    );
  }

  // Auth pages
  if (!currentUser) {
    if (currentPath === '/register') {
      return <RegisterPage onNavigate={navigateTo} />;
    }
    return <LoginPage onNavigate={navigateTo} />;
  }

  // Render current active view
  const renderContent = () => {
    switch (currentPath) {
      case '/dashboard':
        return <DashboardPage onNavigate={navigateTo} />;
      case '/patients':
        return <PatientsPage onNavigate={navigateTo} selectedPatientId={preselectedPatientId} />;
      case '/screening':
        return <ScreeningPage preselectedPatientId={preselectedPatientId} onNavigate={navigateTo} />;
      case '/screenings':
      case '/reports':
        return <ScreeningHistoryPage onNavigate={navigateTo} />;
      case '/referrals':
        return <ReferralsPage onNavigate={navigateTo} />;
      case '/doctor-dashboard':
        return <DoctorDashboardPage onNavigate={navigateTo} />;
      case '/admin':
        return <AdminDashboardPage onNavigate={navigateTo} />;
      case '/database-schema':
        return <DatabaseSchemaPage />;
      default:
        return <DashboardPage onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <Navbar
        currentPath={currentPath}
        onNavigate={navigateTo}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      <div className="flex-1 flex w-full">
        <Sidebar
          currentPath={currentPath}
          onNavigate={navigateTo}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 min-w-0 bg-slate-50/70 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Real-Time Clinical Notifications Toast Listener */}
      <RealtimeToastListener onNavigate={navigateTo} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
