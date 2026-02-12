
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

const AUTH_KEY = 'edupro_auth_session';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Planner);

  useEffect(() => {
    const savedSession = localStorage.getItem(AUTH_KEY);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession) as User;
        setUser(parsed);
        // Auto-route Admins to Dashboard
        if (parsed.role === 'ADMIN') setCurrentPage(Page.Admin);
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    if (newUser.role === 'ADMIN') {
      setCurrentPage(Page.Admin);
    } else {
      setCurrentPage(Page.Planner);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

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
