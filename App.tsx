
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import PlannerPage from './pages/PlannerPage';
import AnalyzerPage from './pages/AnalyzerPage';
import CoachingPage from './pages/CoachingPage';
import AssessmentsPage from './pages/AssessmentsPage';
import InsightsPage from './pages/InsightsPage';
import InterventionPage from './pages/InterventionPage';
import AdminDashboard from './pages/AdminDashboard';
import { Page, User } from './types';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getUserProfile } from './services/storageService';

const AUTH_KEY = 'edupro_auth_session';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Planner);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, fetch profile from Firestore
        const profile = await getUserProfile(firebaseUser.uid);
        if (profile) {
          setUser(profile);
          localStorage.setItem(AUTH_KEY, JSON.stringify(profile));
          if (profile.role === 'ADMIN' && currentPage === Page.Planner) {
            setCurrentPage(Page.Admin);
          }
        } else {
          // Auth exists but no profile yet (should be handled by LoginPage)
          setUser(null);
        }
      } else {
        // User is signed out
        setUser(null);
        localStorage.removeItem(AUTH_KEY);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentPage]);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    if (newUser.role === 'ADMIN') {
      setCurrentPage(Page.Admin);
    } else {
      setCurrentPage(Page.Planner);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Initializing EduPro...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case Page.Planner:
        return <PlannerPage />;
      case Page.Analyzer:
        return <AnalyzerPage />;
      case Page.Coaching:
        return <CoachingPage />;
      case Page.Assessments:
        return <AssessmentsPage />;
      case Page.Insights:
        return <InsightsPage />;
      case Page.Intervention:
        return <InterventionPage />;
      case Page.Admin:
        // Double-check role safety
        return user.role === 'ADMIN' ? <AdminDashboard /> : <PlannerPage />;
      default:
        return <PlannerPage />;
    }
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-500 ${user.role === 'ADMIN' ? 'bg-slate-100' : 'bg-slate-50'}`}>
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        user={user}
        onLogout={handleLogout}
      />
      <main className="flex-1 ml-64 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default App;
