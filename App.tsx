
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import PlannerPage from './pages/PlannerPage';
import AnalyzerPage from './pages/AnalyzerPage';
import CoachingPage from './pages/CoachingPage';
import { Page } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Planner);

  const renderPage = () => {
    switch (currentPage) {
      case Page.Planner:
        return <PlannerPage />;
      case Page.Analyzer:
        return <AnalyzerPage />;
      case Page.Coaching:
        return <CoachingPage />;
      default:
        return <PlannerPage />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1 ml-64 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default App;
