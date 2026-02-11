
import React, { useState, useEffect, useRef } from 'react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import FileUpload from '../components/FileUpload';
import { provideCoaching, refineLessonWithCoaching } from '../services/geminiService';
import { saveHistoryEntry, getLessonBank, updateLessonInBank, getAssessments, getAccommodations } from '../services/storageService';
import { StudentRecord, StoredLesson, Assessment, SpedAccommodation } from '../types';
import { 
  LightBulbIcon, 
  ChatBubbleBottomCenterTextIcon,
  PlusIcon,
  UserIcon,
  PhotoIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  UsersIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ArrowPathRoundedSquareIcon,
  LinkIcon,
  TableCellsIcon,
  NoSymbolIcon,
  ShieldCheckIcon
} from 'https://esm.sh/@heroicons/react@2.2.0/24/outline';

const ROSTER_KEY = 'edupro_student_roster';

const CoachingPage: React.FC = () => {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [reflection, setReflection] = useState('');
  const [behaviorNotes, setBehaviorNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<{ base64: string, type: string } | null>(null);
  const [lessonBank, setLessonBank] = useState<StoredLesson[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [accommodations, setAccommodations] = useState<SpedAccommodation[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  
  useEffect(() => {
    setLessonBank(getLessonBank());
    setAssessments(getAssessments());
    setAccommodations(getAccommodations());
    const savedRoster = localStorage.getItem(ROSTER_KEY);
    if (savedRoster) {
      const names = JSON.parse(savedRoster) as string[];
      setStudents(names.map(name => ({ name, score: 0 })));
    } else {
      setStudents([{ name: 'Student 1', score: 0 }]);
    }
  }, []);

  const handleImportAssessment = () => {
    const assessment = assessments.find(a => a.id === selectedAssessmentId);
    if (assessment) {
      setStudents([...assessment.scores]);
      setReflection(prev => `${prev}\n\nAssessment Link: ${assessment.title} (${assessment.average.toFixed(1)}%)`);
      if (assessment.behaviorNotes) {
        setBehaviorNotes(prev => `${prev}\nPrevious Observations: ${assessment.behaviorNotes}`);
      }
    }
  };

  const handleSubmit = async () => {
    if (!reflection.trim() && !behaviorNotes.trim()) { alert("Please provide details."); return; }
    setLoading(true);
    setResult(null);
    try {
      const accContext = accommodations.map(a => `${a.studentName}: ${a.accommodations}`).join('\n');
      const coachingAdvice = await provideCoaching(students, reflection, evidence?.base64, evidence?.type, behaviorNotes, accContext);
      setResult(coachingAdvice || "No advice found.");
      const avg = students.reduce((acc, curr) => acc + curr.score, 0) / (students.length || 1);
      saveHistoryEntry({ type: 'coaching', metric: avg, label: `Growth Review: ${new Date().toLocaleDateString()}`, details: behaviorNotes });
    } catch (error) { alert("Failed to get coaching."); } finally { setLoading(false); }
  };

  const handleRefinePlan = async () => {
    if (!selectedLessonId || !result) return;
    const lesson = lessonBank.find(l => l.id === selectedLessonId);
    if (!lesson) return;
    setRefining(true);
    try {
      const refinedContent = await refineLessonWithCoaching(lesson.content, result);
      updateLessonInBank(selectedLessonId, { content: refinedContent, status: 'revised' });
      alert("Lesson Plan Revised with Behavioral Success Pathway!");
    } catch (error) { alert("Refinement failed."); } finally { setRefining(false); }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Elite Action Planner</h2>
          <p className="text-slate-500 mt-2">Solving Tier 2/3 behavioral impediments with <span className="font-bold text-rose-600">targeted interventions</span>.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                <h3 className="text-[10px] font-black text-indigo-900 mb-2 flex items-center gap-2 uppercase tracking-widest"><LinkIcon className="w-4 h-4" /> Link Lesson</h3>
                <select value={selectedLessonId} onChange={(e) => setSelectedLessonId(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white">
                  <option value="">-- No linked plan --</option>
                  {lessonBank.map(lesson => <option key={lesson.id} value={lesson.id}>{lesson.focus}</option>)}
                </select>
             </div>
             <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                <h3 className="text-[10px] font-black text-emerald-900 mb-2 flex items-center gap-2 uppercase tracking-widest"><TableCellsIcon className="w-4 h-4" /> Link Assessment</h3>
                <div className="flex gap-2">
                  <select value={selectedAssessmentId} onChange={(e) => setSelectedAssessmentId(e.target.value)} className="flex-1 px-3 py-1.5 border rounded-lg text-xs bg-white">
                    <option value="">-- No assessment --</option>
                    {assessments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                  </select>
                  <button onClick={handleImportAssessment} className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"><ArrowDownTrayIcon className="w-4 h-4" /></button>
                </div>
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><NoSymbolIcon className="w-5 h-5 text-rose-500" /> Behavioral Documentation</h3>
            <textarea value={behaviorNotes} onChange={(e) => setBehaviorNotes(e.target.value)} placeholder="Document TIER 2/3 impediments (e.g., 'Student X requires sensory break but refused today', 'Frequent disruptions during group work')..." className="w-full h-36 p-4 border rounded-xl focus:ring-2 focus:ring-rose-500 border-slate-200 resize-none text-sm bg-rose-50/10" />
            <p className="text-[10px] text-slate-400 mt-2 font-medium">Documenting behavior triggers AI-driven PAX and behavioral success pathways.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-indigo-600" /> Instructional Reflection</h3>
            <textarea value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="Focus on teacher moves and student cognitive lift..." className="w-full h-32 p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 border-slate-200 resize-none text-sm bg-slate-50/20" />
          </div>

          <button onClick={handleSubmit} disabled={loading} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100/50 group">
            {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><SparklesIcon className="w-5 h-5 group-hover:scale-110 transition-transform" /> Solve Gaps & Generate Action Plan</>}
          </button>
        </div>

        <div className="space-y-6 h-full sticky top-8">
          {!result && !loading && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center h-full justify-center min-h-[400px]">
              <div className="bg-rose-50 p-4 rounded-2xl mb-6"><NoSymbolIcon className="w-12 h-12 text-rose-500" /></div>
              <h3 className="text-xl font-bold text-slate-800">Intervention Engine</h3>
              <p className="text-slate-500 text-sm mt-4 max-w-sm">Combining behavioral data with <span className="font-bold">IEP fidelity checks</span> to ensure every student is successful.</p>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in slide-in-from-right duration-500">
              {selectedLessonId && (
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-3"><ArrowPathRoundedSquareIcon className="w-6 h-6 text-emerald-600" /><div><p className="font-bold text-emerald-900 text-sm">Distinguished Pivot</p><p className="text-xs text-emerald-700">Apply interventions to lesson plan.</p></div></div>
                  <button onClick={handleRefinePlan} disabled={refining} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50">{refining ? 'Refining...' : 'Refine Plan'}</button>
                </div>
              )}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar shadow-2xl shadow-indigo-100/20"><MarkdownRenderer content={result} /></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachingPage;
