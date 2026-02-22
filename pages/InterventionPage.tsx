
import React, { useState, useEffect, useMemo } from 'react';
import { 
  getAssessments, 
  getHistory, 
  getInterventions, 
  saveIntervention, 
  deleteIntervention,
  saveHistoryEntry 
} from '../services/storageService';
import { generateInterventionGroups } from '../services/geminiService';
import { InterventionGroup } from '../types';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { 
  SparklesIcon, 
  UserGroupIcon, 
  CalendarIcon, 
  CheckCircleIcon, 
  ClockIcon,
  TrashIcon,
  PlusIcon,
  ChevronRightIcon,
  BeakerIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const InterventionPage: React.FC = () => {
  const [interventions, setInterventions] = useState<InterventionGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeInterventionId, setActiveInterventionId] = useState<string | null>(null);

  const [assessments, setAssessments] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [loadedInterventions, loadedAssessments, loadedHistory] = await Promise.all([
        getInterventions(),
        getAssessments(),
        getHistory()
      ]);
      setInterventions(loadedInterventions);
      setAssessments(loadedAssessments);
      setHistory(loadedHistory);
    };
    loadData();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const suggestions = await generateInterventionGroups(assessments, history);
      const newGroups: InterventionGroup[] = suggestions.map((s: any) => ({
        ...s,
        id: crypto.randomUUID(),
        status: 'suggested'
      }));
      
      // Merge with existing
      for (const g of newGroups) {
        await saveIntervention(g);
      }
      const updatedInterventions = await getInterventions();
      setInterventions(updatedInterventions);
    } catch (e) {
      alert("Failed to generate groups.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'suggested' | 'scheduled' | 'delivered') => {
    const list = [...interventions];
    const index = list.findIndex(i => i.id === id);
    if (index !== -1) {
      list[index].status = status;
      if (status === 'scheduled') list[index].scheduledDate = new Date().toISOString();
      if (status === 'delivered') {
        list[index].deliveredDate = new Date().toISOString();
        // Track in history
        await saveHistoryEntry({
          type: 'intervention',
          metric: 100,
          label: `Intervention Delivered: ${list[index].skill}`
        });
      }
      await saveIntervention(list[index]);
      const updatedInterventions = await getInterventions();
      setInterventions(updatedInterventions);
    }
  };

  const suggested = interventions.filter(i => i.status === 'suggested');
  const scheduled = interventions.filter(i => i.status === 'scheduled');
  const delivered = interventions.filter(i => i.status === 'delivered');

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Intervention Planner</h2>
          <p className="text-slate-500 mt-2">Data-driven groupings and 10-minute targeted micro-lessons.</p>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
        >
          {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />}
          AI Group Suggestions
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMN 1: SUGGESTED */}
        <div className="space-y-6">
          <h3 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest px-2">
            <BeakerIcon className="w-4 h-4" /> AI Suggestions ({suggested.length})
          </h3>
          {suggested.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.tier === 3 ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>Tier {item.tier}</span>
                <button onClick={async () => { await deleteIntervention(item.id); const updated = await getInterventions(); setInterventions(updated); }} className="text-slate-300 hover:text-red-500 transition-colors"><TrashIcon className="w-4 h-4" /></button>
              </div>
              <h4 className="font-bold text-slate-900 mb-2">{item.skill}</h4>
              <div className="flex flex-wrap gap-1 mb-4">
                {item.studentNames.map(name => (
                  <span key={name} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">{name}</span>
                ))}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveInterventionId(item.id)}
                  className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  View Lesson
                </button>
                <button 
                  onClick={() => updateStatus(item.id, 'scheduled')}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <CalendarIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {suggested.length === 0 && !loading && (
             <div className="p-10 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs italic">
               Click AI Suggestions to analyze current data gaps.
             </div>
          )}
        </div>

        {/* COLUMN 2: SCHEDULED */}
        <div className="space-y-6">
          <h3 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest px-2">
            <ClockIcon className="w-4 h-4" /> Weekly Schedule ({scheduled.length})
          </h3>
          {scheduled.map(item => (
            <div key={item.id} className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <CalendarIcon className="w-16 h-16" />
              </div>
              <h4 className="font-bold text-indigo-900 mb-2">{item.skill}</h4>
              <p className="text-[10px] text-indigo-700 mb-4 flex items-center gap-1 font-bold">
                <UserGroupIcon className="w-3 h-3" /> {item.studentNames.length} Students
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveInterventionId(item.id)}
                  className="flex-1 py-2 bg-white text-indigo-600 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all"
                >
                  Start Lesson
                </button>
                <button 
                  onClick={() => updateStatus(item.id, 'delivered')}
                  className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  title="Mark as Delivered"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {scheduled.length === 0 && (
            <div className="p-10 border-2 border-dashed border-indigo-100 rounded-2xl text-center text-indigo-300 text-xs italic">
              Move suggested groups here to plan your week.
            </div>
          )}
        </div>

        {/* COLUMN 3: COMPLETED */}
        <div className="space-y-6">
          <h3 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest px-2">
            <CheckCircleIcon className="w-4 h-4" /> Intervention History ({delivered.length})
          </h3>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y">
            {delivered.map(item => (
              <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors">
                <p className="text-xs font-bold text-slate-800">{item.skill}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-slate-400">{new Date(item.deliveredDate!).toLocaleDateString()}</p>
                  <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Delivered</span>
                </div>
              </div>
            ))}
            {delivered.length === 0 && (
              <div className="p-10 text-center text-slate-300 text-xs italic">
                History of delivered skills will appear here.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL FOR LESSON VIEW */}
      {activeInterventionId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Intervention Micro-Lesson</span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{interventions.find(i => i.id === activeInterventionId)?.skill}</h3>
              </div>
              <button 
                onClick={() => setActiveInterventionId(null)}
                className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <PlusIcon className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="mb-6 flex flex-wrap gap-2">
                {interventions.find(i => i.id === activeInterventionId)?.studentNames.map(name => (
                  <span key={name} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                    <UserGroupIcon className="w-3 h-3" /> {name}
                  </span>
                ))}
              </div>
              <MarkdownRenderer content={interventions.find(i => i.id === activeInterventionId)?.lessonPlan || ''} />
            </div>
            <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
               <button 
                onClick={() => setActiveInterventionId(null)}
                className="px-6 py-2 text-slate-600 font-bold text-sm"
               >
                 Close
               </button>
               {interventions.find(i => i.id === activeInterventionId)?.status === 'scheduled' && (
                 <button 
                  onClick={() => { updateStatus(activeInterventionId, 'delivered'); setActiveInterventionId(null); }}
                  className="px-8 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
                 >
                   Finish & Log Lesson
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default InterventionPage;
