
import React, { useState } from 'react';
import { User, UserRole, ClassPeriod } from '../types';
import { 
  AcademicCapIcon, 
  ArrowPathIcon,
  GlobeAltIcon
} from 'https://esm.sh/@heroicons/react@2.2.0/24/outline';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [authStep, setAuthStep] = useState<'entry' | 'sso_redirect' | 'role_select'>('entry');

  const startSSO = () => {
    setAuthStep('sso_redirect');
    setTimeout(() => {
      setAuthStep('role_select');
    }, 1500);
  };

  const finalizeLogin = (role: UserRole, options: { name: string, grade: string, subjects: string[], campus: string, classes: ClassPeriod[] }) => {
    const mockUser: User = {
      name: options.name,
      role: role,
      grade: options.grade,
      subjects: options.subjects,
      campusName: options.campus,
      classes: options.classes
    };
    onLogin(mockUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-indigo-600 p-4 rounded-3xl shadow-xl shadow-indigo-100 mb-4">
            <AcademicCapIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center">Aransas Pass ISD<br/><span className="italic text-indigo-600">EduPro Navigator</span></h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 text-center">T-TESS • Fundamental 5 • TEKS Aligned</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 relative">
          {authStep === 'entry' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">District Access</h2>
                <p className="text-sm text-slate-500 mt-1">Authorized APISD Staff Only</p>
              </div>
              <button onClick={startSSO} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3">
                <GlobeAltIcon className="w-5 h-5" />
                APISD Single Sign-On
              </button>
            </div>
          )}

          {authStep === 'sso_redirect' && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <ArrowPathIcon className="w-12 h-12 text-indigo-600 animate-spin mb-6" />
              <h2 className="text-xl font-bold text-slate-900">Verifying Identity...</h2>
            </div>
          )}

          {authStep === 'role_select' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-3">
              <h2 className="text-xl font-bold text-slate-800 text-center mb-6">Simulation Profiles</h2>
              
              <button 
                onClick={() => finalizeLogin('TEACHER', { 
                  name: 'Sarah Jenkins', 
                  grade: '1st Grade', 
                  subjects: ['Literacy', 'Math'], 
                  campus: 'Faulk Elementary',
                  classes: [{ id: 'c1', name: 'Self-Contained A', subject: 'Literacy', students: ['John', 'Jane'] }]
                })}
                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl flex items-center gap-4 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600">SJ</div>
                <div className="text-left">
                  <p className="text-sm font-black text-slate-900">Sarah Jenkins (Faulk)</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Self-Contained • PAX Enabled</p>
                </div>
              </button>

              <button 
                onClick={() => finalizeLogin('TEACHER', { 
                  name: 'Jim Miller', 
                  grade: '11th Grade', 
                  subjects: ['Physics', 'Chemistry'], 
                  campus: 'Aransas Pass High',
                  classes: [
                    { id: 'h1', name: '1st Period: AP Physics', subject: 'Physics', students: [] },
                    { id: 'h2', name: '3rd Period: Chemistry', subject: 'Chemistry', students: [] }
                  ]
                })}
                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl flex items-center gap-4 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">JM</div>
                <div className="text-left">
                  <p className="text-sm font-black text-slate-900">Jim Miller (APHS)</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Multi-Subject • Multi-Period</p>
                </div>
              </button>

              <button 
                onClick={() => finalizeLogin('ADMIN', { 
                  name: 'Dr. Thompson', 
                  grade: 'Campus Leadership',
                  subjects: [],
                  campus: 'District Office',
                  classes: []
                })}
                className="w-full p-5 bg-indigo-900 text-white rounded-3xl flex items-center gap-4 hover:bg-indigo-950 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-800 flex items-center justify-center font-bold text-indigo-300">DT</div>
                <div className="text-left">
                  <p className="text-sm font-black">Dr. Thompson</p>
                  <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">District Admin • APISD</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
