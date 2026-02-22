
import React, { useState } from 'react';
import { User, UserRole, ClassPeriod } from '../types';
import { 
  AcademicCapIcon, 
  ArrowPathIcon,
  GlobeAltIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getUserProfile, saveUserProfile } from '../services/storageService';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [authStep, setAuthStep] = useState<'entry' | 'sso_redirect' | 'role_select'>('entry');
  const [tempUser, setTempUser] = useState<{ uid: string, email: string, name: string } | null>(null);

  const startSSO = async () => {
    setAuthStep('sso_redirect');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      // Check if user exists in Firestore
      const profile = await getUserProfile(firebaseUser.uid);
      
      if (profile) {
        onLogin(profile);
      } else {
        // New user, need to select role
        setTempUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'New Educator'
        });
        setAuthStep('role_select');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setAuthStep('entry');
      alert('Authentication failed. Please try again.');
    }
  };

  const finalizeLogin = async (role: UserRole, options: { name: string, grade: string, subjects: string[], campus: string, classes: ClassPeriod[] }) => {
    if (!tempUser) return;

    const newUser: User = {
      uid: tempUser.uid,
      name: options.name,
      role: role,
      grade: options.grade,
      subjects: options.subjects,
      campusName: options.campus,
      classes: options.classes
    };

    await saveUserProfile(newUser);
    onLogin(newUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-indigo-600 p-4 rounded-3xl shadow-xl shadow-indigo-100 mb-4 relative">
            <AcademicCapIcon className="w-12 h-12 text-white" />
            <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1 border-2 border-white"><CheckBadgeIcon className="w-4 h-4" /></div>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center leading-tight">Aransas Pass ISD<br/><span className="text-indigo-600 italic">EduPro Navigator</span></h1>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mt-3 py-1 px-3 bg-emerald-50 rounded-full border border-emerald-100">Faulk Elementary Pilot Edition</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-slate-100">
          {authStep === 'entry' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Pilot Access Restricted</h2>
                <p className="text-sm text-slate-500 mt-1">Authorized APISD Pilot Staff Only</p>
              </div>
              <button onClick={startSSO} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center justify-center gap-3">
                <GlobeAltIcon className="w-5 h-5" />
                Sign in with Google (APISD)
              </button>
            </div>
          )}

          {authStep === 'sso_redirect' && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <ArrowPathIcon className="w-12 h-12 text-indigo-600 animate-spin mb-6" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Syncing Pilot Identity...</h2>
            </div>
          )}

          {authStep === 'role_select' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-3">
              <h2 className="text-xl font-bold text-slate-800 text-center mb-6 tracking-tight">Complete Your Profile</h2>
              <p className="text-xs text-slate-500 text-center mb-4">Welcome, {tempUser?.name}. Please select your role to continue.</p>
              
              <button 
                onClick={() => finalizeLogin('TEACHER', { 
                  name: tempUser?.name || 'Teacher', 
                  grade: '1st Grade', 
                  subjects: ['Literacy', 'Math'], 
                  campus: 'Faulk Elementary (Pilot)',
                  classes: [{ id: 'c1', name: 'Self-Contained Pilot Group', subject: 'Literacy', students: ['John', 'Jane'] }]
                })}
                className="w-full p-5 bg-emerald-50 border border-emerald-200 rounded-3xl flex items-center gap-4 hover:bg-emerald-100 transition-all relative group"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white">
                  {tempUser?.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-slate-900">Teacher Account</p>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Access Planning & Coaching Tools</p>
                </div>
                <CheckBadgeIcon className="w-5 h-5 text-emerald-500 absolute top-4 right-4" />
              </button>

              <button 
                onClick={() => finalizeLogin('ADMIN', { 
                  name: tempUser?.name || 'Admin', 
                  grade: 'District Leadership',
                  subjects: [],
                  campus: 'District Office',
                  classes: []
                })}
                className="w-full p-5 bg-slate-900 text-white rounded-3xl flex items-center gap-4 hover:bg-black transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white">
                  {tempUser?.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-left">
                  <p className="text-sm font-black">Campus Admin</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Access Dashboard & Insights</p>
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
