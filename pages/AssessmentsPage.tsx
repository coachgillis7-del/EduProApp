
import React, { useState, useEffect } from 'react';
import { saveAssessment, getAssessments, deleteAssessment, getUserClasses } from '../services/storageService';
import { AssessmentType, StudentRecord, Assessment, ClassPeriod } from '../types';
import { 
  PlusIcon, 
  TrashIcon, 
  TableCellsIcon, 
  CalendarIcon, 
  BookmarkIcon,
  ChevronDownIcon,
  ChartBarIcon,
  NoSymbolIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const ROSTER_KEY = 'edupro_student_roster';

const AssessmentsPage: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [userClasses, setUserClasses] = useState<ClassPeriod[]>([]);
  
  // Form State
  const [selectedClassId, setSelectedClassId] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Reading');
  const [type, setType] = useState<AssessmentType>('Unit');
  const [scores, setScores] = useState<StudentRecord[]>([]);
  const [reflection, setReflection] = useState('');
  const [behaviorNotes, setBehaviorNotes] = useState('');

  useEffect(() => {
    const loadData = async () => {
      // Load available classes for selection
      const classes = await getUserClasses();
      setUserClasses(classes);
      if (classes.length > 0) setSelectedClassId(classes[0].id);

      const loadedAssessments = await getAssessments();
      setAssessments(loadedAssessments);
      
      const savedRoster = localStorage.getItem(ROSTER_KEY);
      if (savedRoster) {
        const names = JSON.parse(savedRoster) as string[];
        setScores(names.map(name => ({ name, score: 0 })));
      }
    };
    loadData();
  }, []);

  // Fix: Added classId to handleSave to satisfy type requirements
  const handleSave = async () => {
    if (!title.trim()) return alert("Assessment title required.");
    if (!selectedClassId) return alert("Please select a class period.");

    await saveAssessment({
      classId: selectedClassId,
      title,
      subject,
      type,
      scores,
      reflection,
      behaviorNotes
    });
    const updatedAssessments = await getAssessments();
    setAssessments(updatedAssessments);
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setSubject('Reading');
    setType('Unit');
    setReflection('');
    setBehaviorNotes('');
    if (userClasses.length > 0) setSelectedClassId(userClasses[0].id);
    
    const savedRoster = localStorage.getItem(ROSTER_KEY);
    if (savedRoster) {
      const names = JSON.parse(savedRoster) as string[];
      setScores(names.map(name => ({ name, score: 0 })));
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm("Permanently delete this assessment record?")) {
      await deleteAssessment(id);
      const updatedAssessments = await getAssessments();
      setAssessments(updatedAssessments);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Summative Assessments</h2>
          <p className="text-slate-500 mt-2">Track BOY, MOY, EOY, and Unit data across all subjects.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg ${
            isAdding ? 'bg-slate-200 text-slate-600' : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700'
          }`}
        >
          {isAdding ? 'Cancel' : <><PlusIcon className="w-5 h-5" /> Log New Assessment</>}
        </button>
      </header>

      {isAdding && (
        <div className="mb-10 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Added Class Period Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Class/Period</label>
              <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                {userClasses.length > 0 ? userClasses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                )) : <option value="">Setup Classes First</option>}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option>Reading</option>
                <option>Math</option>
                <option>Science</option>
                <option>Social Studies</option>
                <option>Writing</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Assessment Type</label>
              <select value={type} onChange={e => setType(e.target.value as AssessmentType)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="BOY">BOY (Beginning of Year)</option>
                <option value="Unit">Unit Assessment</option>
                <option value="Diagnostic">Diagnostic</option>
                <option value="Benchmark">Benchmark</option>
                <option value="MOY">MOY (Middle of Year)</option>
                <option value="EOY">EOY (End of Year)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Title / Name</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. BOY Baseline 2024" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">Student Scoring Roster</h3>
              <span className="text-xs text-slate-400">Class Average: {(scores.reduce((acc, c) => acc + c.score, 0) / (scores.length || 1)).toFixed(1)}%</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto p-2 custom-scrollbar border rounded-xl bg-slate-50/50">
              {scores.map((s, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between shadow-sm">
                  <span className="text-xs font-medium truncate max-w-[100px]">{s.name}</span>
                  <input 
                    type="number" 
                    value={s.score || ''} 
                    onChange={e => {
                      const newScores = [...scores];
                      newScores[idx].score = Math.min(100, Math.max(0, Number(e.target.value)));
                      setScores(newScores);
                    }} 
                    placeholder="%" 
                    className="w-16 px-2 py-1 text-center font-bold text-sm border rounded bg-slate-50 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Instructional Reflection</label>
              <textarea value={reflection} onChange={e => setReflection(e.target.value)} placeholder="Note gaps in student understanding..." className="w-full h-24 p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Behavioral Observations</label>
              <textarea value={behaviorNotes} onChange={e => setBehaviorNotes(e.target.value)} placeholder="Document behavior that affected testing performance..." className="w-full h-24 p-4 border rounded-xl focus:ring-2 focus:ring-rose-500 resize-none text-sm bg-rose-50/5" />
            </div>
          </div>

          <button onClick={handleSave} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
            Finalize and Save Assessment Data
          </button>
        </div>
      )}

      <div className="space-y-6">
        {assessments.length === 0 && !isAdding && (
          <div className="bg-white p-20 rounded-2xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center">
            <div className="bg-indigo-50 p-6 rounded-3xl mb-6"><TableCellsIcon className="w-12 h-12 text-indigo-500" /></div>
            <h3 className="text-xl font-bold text-slate-800">No Assessments Logged</h3>
            <p className="text-slate-500 max-w-sm mt-4">Start by logging your BOY Baseline, Unit Tests or MOY/EOY scores.</p>
          </div>
        )}

        {assessments.map(a => (
          <div key={a.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  a.type === 'BOY' ? 'bg-orange-100 text-orange-600' :
                  a.subject === 'Reading' ? 'bg-blue-100 text-blue-600' :
                  a.subject === 'Math' ? 'bg-emerald-100 text-emerald-600' :
                  'bg-indigo-100 text-indigo-600'
                }`}>
                  <BookmarkIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${
                      a.type === 'BOY' ? 'bg-orange-100 text-orange-700' : 'bg-slate-200 text-slate-600'
                    }`}>{a.type}</span>
                    <span className="text-xs text-slate-400 font-medium">{new Date(a.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 uppercase tracking-tighter bg-indigo-50 px-2 py-0.5 rounded-full">
                      <UserGroupIcon className="w-3 h-3" />
                      {userClasses.find(c => c.id === a.classId)?.name || 'General'}
                    </span>
                  </div>
                  <h3 className="font-black text-slate-900 text-lg leading-tight">{a.title}</h3>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Score</p>
                  <p className="text-2xl font-black text-indigo-600">{a.average.toFixed(1)}%</p>
                </div>
                <button onClick={() => handleDelete(a.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><TrashIcon className="w-5 h-5" /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 divide-x border-b">
              {a.reflection && (
                <div className="p-4 italic text-slate-600 text-xs bg-slate-50/30">
                  <span className="font-bold text-slate-800 not-italic mr-2">Instructional:</span>
                  "{a.reflection}"
                </div>
              )}
              {a.behaviorNotes && (
                <div className="p-4 italic text-rose-600 text-xs bg-rose-50/5">
                  <span className="font-bold text-rose-800 not-italic mr-2 flex items-center gap-1">
                    <NoSymbolIcon className="w-3 h-3" /> Behavioral:
                  </span>
                  "{a.behaviorNotes}"
                </div>
              )}
            </div>

            <div className="p-6">
               <div className="flex flex-wrap gap-2">
                 {a.scores.map((s, i) => (
                   <div key={i} className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 shadow-sm ${
                     s.score >= 70 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                     s.score >= 40 ? 'bg-amber-50 border-amber-100 text-amber-700' :
                     'bg-red-50 border-red-100 text-red-700'
                   }`}>
                     <span className="text-[11px] font-bold">{s.name}</span>
                     <span className="text-[10px] font-black opacity-60">{s.score}%</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssessmentsPage;
