
import React from 'react';
import { Page, User } from '../types';
import { 
  ClipboardDocumentCheckIcon, 
  VideoCameraIcon, 
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  ChartBarIcon,
  TableCellsIcon,
  LifebuoyIcon,
  GlobeAltIcon,
  ArrowLeftOnRectangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, user, onLogout }) => {
  const navItems = [
    { name: Page.Planner, icon: ClipboardDocumentCheckIcon, description: 'Elevate Lesson Plans', role: 'TEACHER' },
    { name: Page.Analyzer, icon: VideoCameraIcon, description: 'Video/Audio Review', role: 'TEACHER' },
    { name: Page.Coaching, icon: ChatBubbleLeftRightIcon, description: 'Data & Growth', role: 'TEACHER' },
    { name: Page.Intervention, icon: LifebuoyIcon, description: 'Skill Group Planner', role: 'TEACHER' },
    { name: Page.Assessments, icon: TableCellsIcon, description: 'High-Stakes Data', role: 'TEACHER' },
    { name: Page.Insights, icon: ChartBarIcon, description: 'Growth Tracker', role: 'TEACHER' },
    { name: Page.Admin, icon: GlobeAltIcon, description: 'Campus Leadership', role: 'ADMIN' },
  ];

  // Strictly filter the navigation. Teachers cannot see Admin items.
  const visibleNavItems = navItems.filter(item => 
    user.role === 'ADMIN' ? true : item.role === 'TEACHER'
  );

  return (
    <div className={`w-64 h-screen fixed left-0 top-0 text-white p-6 flex flex-col shadow-xl z-20 transition-all duration-500 ${
      user.role === 'ADMIN' ? 'bg-slate-950 border-r border-indigo-900/30' : 'bg-slate-900 border-r border-slate-800'
    }`}>
      <div className="flex items-center gap-3 mb-10">
        <div className={`p-2 rounded-lg ${user.role === 'ADMIN' ? 'bg-indigo-700' : 'bg-indigo-600'}`}>
          <AcademicCapIcon className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">EduPro</h1>
          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">
            {user.role === 'ADMIN' ? 'Admin Portal' : 'Teacher Portal'}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setCurrentPage(item.name)}
              className={`w-full flex flex-col items-start p-3 rounded-xl transition-all duration-200 group ${
                isActive 
                ? (user.role === 'ADMIN' ? 'bg-indigo-900/50 text-indigo-200 border border-indigo-700/50' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20') 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? (user.role === 'ADMIN' ? 'text-indigo-400' : 'text-white') : 'text-slate-400 group-hover:text-indigo-400'}`} />
                <span className="font-semibold text-sm">{item.name}</span>
              </div>
              <span className={`text-[10px] mt-1 ml-8 ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}>
                {item.description}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 space-y-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${user.role === 'ADMIN' ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-500 text-white'}`}>
            {user.role === 'ADMIN' ? 'ADM' : 'TX'}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-medium truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{user.grade || 'Campus Staff'}</p>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-all text-sm font-semibold"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
