
import React from 'react';
import { Page } from '../types';
import { 
  ClipboardDocumentCheckIcon, 
  VideoCameraIcon, 
  ChatBubbleLeftRightIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  const navItems = [
    { name: Page.Planner, icon: ClipboardDocumentCheckIcon, description: 'Elevate Lesson Plans' },
    { name: Page.Analyzer, icon: VideoCameraIcon, description: 'Video/Audio Review' },
    { name: Page.Coaching, icon: ChatBubbleLeftRightIcon, description: 'Data & Growth' },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen fixed left-0 top-0 text-white p-6 flex flex-col shadow-xl">
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <AcademicCapIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">EduPro</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setCurrentPage(item.name)}
              className={`w-full flex flex-col items-start p-3 rounded-xl transition-all duration-200 group ${
                isActive 
                ? 'bg-indigo-600 text-white' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                <span className="font-semibold text-sm">{item.name}</span>
              </div>
              <span className={`text-[10px] mt-1 ml-8 ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}>
                {item.description}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800">
        <div className="flex items-center gap-3 p-2 bg-slate-800 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs">TX</div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium truncate">Texas Educator</p>
            <p className="text-[10px] text-slate-400">T-TESS Distinguished Track</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
