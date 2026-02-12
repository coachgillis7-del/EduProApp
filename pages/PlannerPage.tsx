
import React, { useState, useEffect } from 'react';
import FileUpload from '../components/FileUpload';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { analyzeLessonPlan } from '../services/geminiService';
import { 
  saveHistoryEntry, 
  saveLessonToBank, 
  getLessonBank, 
  deleteLessonFromBank, 
  getAccommodations, 
  getUserClasses,
  saveUserClasses
} from '../services/storageService';
import { StoredLesson, SpedAccommodation, User, ClassPeriod } from '../types';
import { 
  SparklesIcon, 
  CheckCircleIcon, 
  ChevronDownIcon,
  ArrowPathIcon,
  UserPlusIcon,
  ArchiveBoxIcon,
  TrashIcon,
  CalendarDaysIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  PlusIcon,
  AcademicCapIcon,
  TagIcon,
  ShieldExclamationIcon,
  AdjustmentsHorizontalIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ArrowsPointingInIcon,
  HandThumbUpIcon,
  EyeIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

const PlannerPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  // Selection Context
  const [selectedClassId, setSelectedClassId] = useState('');
  const [activeSubject, setActiveSubject] = useState('');

  // Form State
  const [lessonFocus, setLessonFocus] = useState('');
  const [studentTiers, setStudentTiers] = useState('');
  const [transitionStrategies, setTransitionStrategies] = useState('');
  const [fileData, setFileData] = useState<{ base64: string, type: string } | null>(null);

  // Manual Blueprint Overrides
  const [manualTeacherActions, setManualTeacherActions] = useState<string[]>([]);
  const [manualStudentActions, setManualStudentActions] = useState<string[]>([]);
  const [newTeacherAction, setNewTeacherAction] = useState('');
  const [newStudentAction, setNewStudentAction] = useState('');

  // Management UI
  const [showBank, setShowBank] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);

  // Data
  const [lessonBank, setLessonBank] = useState<StoredLesson[]>([]);
  const [userClasses, setUserClasses] = useState<ClassPeriod[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('edupro_auth_session');
    if (saved) {
      try {
        const parsedUser = JSON.parse(saved) as User;
        setUser(parsedUser);
        setActiveSubject(parsedUser.subjects[0] || '');

        const classes = getUserClasses();
        if (classes.length === 0 && parsedUser.classes.length > 0) {
          saveUserClasses(parsedUser.classes);
          setUserClasses(parsedUser.classes);
        } else {
          setUserClasses(classes);
        }

        if (classes.length > 0) setSelectedClassId(classes[0].id);
      } catch {
        localStorage.removeItem('edupro_auth_session');
      }
    }
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      setLessonBank(getLessonBank(selectedClassId));
    }
  }, [selectedClassId, userClasses]);

  const isFaulk = user?.campusName?.includes('Faulk');

  const handleAddTeacherAction = () => {
    if (!newTeacherAction.trim()) return;
    setManualTeacherActions([...manualTeacherActions, newTeacherAction]);
    setNewTeacherAction('');
  };

  const handleAddStudentAction = () => {
    if (!newStudentAction.trim()) return;
    setManualStudentActions([...manualStudentActions, newStudentAction]);
    setNewStudentAction('');
  };

  const handleAnalyze = async () => {
    if (!fileData) { alert("Please upload your lesson plan file first."); return; }
    if (!lessonFocus.trim()) { alert("Please specify the TEKS standard or lesson focus."); return; }

    const activeClass = userClasses.find(c => c.id === selectedClassId);
    setLoading(true);
    setResult(null);
    try {
      const accommodations = getAccommodations(selectedClassId);
      const accContext = accommodations.map(a => `${a.studentName}: ${a.accommodations}`).join('\n');
      const aiResult = await analyzeLessonPlan(
        fileData.base64, 
        fileData.type, 
        lessonFocus, 
        activeSubject, 
        "", // studentNeeds - replaced by tiers
        studentTiers,
        transitionStrategies,
        accContext,
        user?.grade,
        activeSubject,
        user?.campusName,
        activeClass?.name
      );
      setResult(aiResult || "No analysis generated.");

      if (aiResult) {
        const match = aiResult.match(/PLANNING SCORE:\s*(\d+)/i);
        const score = match ? parseInt(match[1]) : 75;
        saveHistoryEntry({ type: 'planning', metric: score, label: `APISD [${activeClass?.name}]: ${lessonFocus}` });
      }
    } catch (error) {
      console.error(error);
      alert("Failed to analyze the plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg"><SparklesIcon className="w-6 h-6 text-white" /></div>
            <h2 className="text-3xl font-bold text-slate-900">APISD distinguished Planner</h2>
          </div>
          <p className="text-slate-500 mt-2">TEKS-Based Lesson Blueprint Engine</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSetup(!showSetup)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <Cog6ToothIcon className="w-4 h-4 text-slate-400" />
            Manage Classes
          </button>
          <button onClick={() => setShowBank(!showBank)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
            <ArchiveBoxIcon className="w-4 h-4" />
            Plan Bank
          </button>
        </div>
      </header>

      {/* Session Context Bar */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-900 rounded-3xl p-6 border border-indigo-500/30 shadow-2xl">
        <div className="md:col-span-4 border-r border-slate-800 pr-6">
          <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Target Section</label>
          <select 
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full bg-slate-800 text-white font-bold py-2 px-4 rounded-xl border border-slate-700 focus:ring-2 focus:ring-indigo-500 appearance-none"
          >
            {userClasses.length > 0 ? userClasses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            )) : <option>Setup Classes First</option>}
          </select>
        </div>

        <div className="md:col-span-4 border-r border-slate-800 px-6">
          <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Active Subject</label>
          <div className="flex items-center gap-3">
            <TagIcon className="w-5 h-5 text-indigo-500" />
            <span className="text-white font-black text-lg">{activeSubject || 'All Subjects'}</span>
          </div>
        </div>

        <div className="md:col-span-4 pl-6 flex items-center justify-between">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Campus Framework</label>
            <div className="flex gap-2">
              <div className="bg-slate-800 px-3 py-1 rounded-full text-[9px] font-bold text-slate-300 border border-slate-700">T-TESS / F5</div>
              {isFaulk && <div className="bg-emerald-900/40 px-3 py-1 rounded-full text-[9px] font-bold text-emerald-400 border border-emerald-500/30">PAXGBG</div>}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tighter"><TagIcon className="w-5 h-5 text-indigo-600" /> 1. TEKS Standard & Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wider">TEKS Standard(s)</label>
              <input type="text" value={lessonFocus} onChange={(e) => setLessonFocus(e.target.value)} placeholder="e.g., 'Math 3.4A' or 'ELA 7.2B'" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50/50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wider">Differentiation Notes (Tiers/IEP)</label>
              <input type="text" value={studentTiers} onChange={(e) => setStudentTiers(e.target.value)} placeholder="e.g. Tier 3 group: Jose, Maria. IEP focus: John." className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50/50" />
            </div>
          </div>

          <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2"><PencilSquareIcon className="w-4 h-4" /> Personal Blueprint Overrides</h4>
              <button onClick={() => setShowCustomizer(!showCustomizer)} className="text-[10px] font-bold text-indigo-600 uppercase">
                {showCustomizer ? 'Hide Manual' : 'Customize Actions'}
              </button>
            </div>
            
            {showCustomizer && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-indigo-700 uppercase">Add Teacher Move</label>
                  <div className="flex gap-2">
                    <input value={newTeacherAction} onChange={e => setNewTeacherAction(e.target.value)} placeholder="e.g. Signal with Chimes" className="flex-1 px-3 py-1.5 border rounded-lg text-xs" />
                    <button onClick={handleAddTeacherAction} className="p-1.5 bg-indigo-600 text-white rounded-lg"><PlusIcon className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-1">
                    {manualTeacherActions.map((a, i) => (
                      <div key={i} className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border text-[10px] text-slate-600">
                        {a} <button onClick={() => setManualTeacherActions(manualTeacherActions.filter((_, idx) => idx !== i))}><TrashIcon className="w-3 h-3 text-slate-300 hover:text-red-500" /></button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-emerald-700 uppercase">Add Student Task</label>
                  <div className="flex gap-2">
                    <input value={newStudentAction} onChange={e => setNewStudentAction(e.target.value)} placeholder="e.g. Self-Check with Rubric" className="flex-1 px-3 py-1.5 border rounded-lg text-xs" />
                    <button onClick={handleAddStudentAction} className="p-1.5 bg-emerald-600 text-white rounded-lg"><PlusIcon className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-1">
                    {manualStudentActions.map((a, i) => (
                      <div key={i} className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border text-[10px] text-slate-600">
                        {a} <button onClick={() => setManualStudentActions(manualStudentActions.filter((_, idx) => idx !== i))}><TrashIcon className="w-3 h-3 text-slate-300 hover:text-red-500" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {!result && !loading && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center">
            <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center justify-center gap-2"><ArrowPathIcon className="w-5 h-5 text-indigo-600" /> 2. Generate APISD Action Blueprint</h3>
            <FileUpload onUpload={(base64, type) => setFileData({ base64, type })} accept=".pdf" label={fileData ? "Plan Uploaded" : "Upload Draft PDF"} subLabel="Aransas Pass ISD District Format Preferred." />
            <button 
              onClick={handleAnalyze} 
              disabled={!fileData || loading || !selectedClassId} 
              className="w-full mt-8 py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-2xl shadow-indigo-200"
            >
              <SparklesIcon className="w-5 h-5" /> 
              Analyze and Generate Action Steps
            </button>
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-3xl shadow-sm p-16 border border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="relative mb-8"><div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div><SparklesIcon className="w-8 h-8 text-indigo-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" /></div>
            <h3 className="text-2xl font-black text-slate-900">Building Action Steps...</h3>
            <p className="text-slate-500 mt-3 max-w-sm font-medium">Drafting Teacher Moves, Student Actions, and Self-Monitoring Triggers.</p>
          </div>
        )}

        {result && (
          <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            {/* Action Blueprint Table Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100 shadow-sm relative overflow-hidden">
                <div className="absolute -top-4 -right-4 opacity-5"><UserGroupIcon className="w-32 h-32" /></div>
                <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="w-4 h-4" /> Teacher Moves
                </h4>
                <ul className="space-y-3 relative z-10">
                   {manualTeacherActions.length > 0 && manualTeacherActions.map((a, i) => (
                     <li key={i} className="flex gap-3 text-xs font-bold text-indigo-900 border-b border-indigo-200/50 pb-2 italic">
                       <CheckCircleIcon className="w-4 h-4 text-indigo-500 shrink-0" /> {a} (Custom)
                     </li>
                   ))}
                   <li className="text-[10px] text-slate-500 italic">...plus AI generated steps below</li>
                </ul>
              </div>
              <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 shadow-sm relative overflow-hidden">
                <div className="absolute -top-4 -right-4 opacity-5"><UserPlusIcon className="w-32 h-32" /></div>
                <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <AcademicCapIcon className="w-4 h-4" /> Student Actions
                </h4>
                <ul className="space-y-3 relative z-10">
                   {manualStudentActions.length > 0 && manualStudentActions.map((a, i) => (
                     <li key={i} className="flex gap-3 text-xs font-bold text-emerald-900 border-b border-emerald-200/50 pb-2 italic">
                       <HandThumbUpIcon className="w-4 h-4 text-emerald-500 shrink-0" /> {a} (Custom)
                     </li>
                   ))}
                   <li className="text-[10px] text-slate-500 italic">...plus AI generated tasks below</li>
                </ul>
              </div>
            </div>

            {/* Real-time Pivot Protocols (High Flyers & Tier 3) */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
               <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
                  <ArrowsPointingInIcon className="w-6 h-6 text-indigo-400" />
                  <h3 className="text-xl font-bold">Real-Time Lesson Pivots</h3>
               </div>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Mastery Acceleration (High Flyers)</p>
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-400/20">
                        <AcademicCapIcon className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm mb-1">Lead Inspectors Assigned</h5>
                        <p className="text-xs text-slate-400 leading-relaxed">Students who finish with 90%+ accuracy transition to "Class Inspectors". They inspect classmate work and provide coaching before teacher verification.</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-4">Intervention Trigger (Tier 3)</p>
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center shrink-0 border border-rose-400/20">
                        <EyeIcon className="w-6 h-6 text-rose-400" />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm mb-1">Teacher-Led Cluster</h5>
                        <p className="text-xs text-slate-400 leading-relaxed">If a student fails the "Thumb-Check" twice or stalls for >2 mins during independent work, pivot them immediately to the Teacher Small-Group Table.</p>
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Generated Plan Content */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 border border-slate-200 border-t-8 border-t-indigo-600">
               <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                  <h3 className="font-black text-slate-900 text-xl flex items-center gap-2"><ShieldCheckIcon className="w-6 h-6 text-indigo-600" /> Actionable APISD Blueprint</h3>
                  <button onClick={() => { setResult(null); setFileData(null); }} className="text-xs font-bold text-indigo-600">NEW PLAN</button>
               </div>
               <MarkdownRenderer content={result} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlannerPage;
