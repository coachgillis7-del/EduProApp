
import React, { useMemo, useState, useEffect } from 'react';
import { getHistory, clearHistory, getAssessments } from '../services/storageService';
import { predictStudentGrowth } from '../services/geminiService';
import { 
  ArrowTrendingUpIcon, 
  UserGroupIcon, 
  AcademicCapIcon, 
  CalendarIcon,
  TrashIcon,
  SparklesIcon,
  ClipboardIcon,
  ClockIcon,
  TableCellsIcon,
  ArrowLongRightIcon,
  BookmarkIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from 'https://esm.sh/@heroicons/react@2.2.0/24/outline';

const InsightsPage: React.FC = () => {
  const [view, setView] = useState<'daily' | 'summative'>('daily');
  const [prediction, setPrediction] = useState<any>(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  const history = useMemo(() => getHistory(), []);
  const assessments = useMemo(() => getAssessments(), []);

  const stats = useMemo(() => {
    const coachingEntries = history.filter(h => h.type === 'coaching');
    const discourseEntries = history.filter(h => h.type === 'execution');
    const alignmentEntries = history.filter(h => h.type === 'alignment');
    const pacingEntries = history.filter(h => h.type === 'pacing');
    
    const getAvg = (entries: any[]) => entries.length ? entries.reduce((acc, curr) => acc + curr.metric, 0) / entries.length : 0;
    const getTrend = (entries: any[]) => entries.length >= 2 ? entries[0].metric - entries[1].metric : 0;

    const latestAssessmentAvg = assessments.length ? assessments[0].average : 0;
    const prevAssessmentAvg = assessments.length >= 2 ? assessments[1].average : 0;

    return {
      mastery: coachingEntries[0]?.metric || 0,
      masteryTrend: getTrend(coachingEntries),
      discourse: discourseEntries[0]?.metric || 0,
      discourseTrend: getTrend(discourseEntries),
      alignment: getAvg(alignmentEntries),
      alignmentTrend: getTrend(alignmentEntries),
      pacing: getAvg(pacingEntries),
      pacingTrend: getTrend(pacingEntries),
      assessmentAvg: latestAssessmentAvg,
      assessmentTrend: latestAssessmentAvg - prevAssessmentAvg,
      totalSessions: history.length,
      totalAssessments: assessments.length
    };
  }, [history, assessments]);

  useEffect(() => {
    const fetchPrediction = async () => {
      if (assessments.length > 0 || history.length > 0) {
        setLoadingPrediction(true);
        try {
          const res = await predictStudentGrowth(assessments, history.filter(h => h.type === 'coaching'));
          setPrediction(res);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingPrediction(false);
        }
      }
    };
    fetchPrediction();
  }, [assessments, history]);

  const SimpleChart = ({ data, color }: { data: number[], color: string }) => {
    if (data.length < 2) return <div className="h-16 flex items-center justify-center text-slate-300 text-[10px] italic">Collecting data...</div>;
    const max = 100;
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (val / max) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox="0 0 100 100" className="w-full h-16 overflow-visible">
        <polyline fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />
        {data.map((val, i) => (
          <circle key={i} cx={(i / (data.length - 1)) * 100} cy={100 - (val / max) * 100} r="3" fill="white" stroke={color} strokeWidth="2" />
        ))}
      </svg>
    );
  };

  const handleClear = () => {
    if (confirm("Reset all growth tracking data? This cannot be undone.")) {
      clearHistory();
      window.location.reload();
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Growth Analytics</h2>
          <p className="text-slate-500 mt-2">Classroom mastery and professional proficiency dashboard.</p>
        </div>
        <button onClick={handleClear} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Reset History"><TrashIcon className="w-5 h-5" /></button>
      </header>

      <div className="mb-8 flex p-1 bg-slate-200 rounded-xl w-fit">
        <button onClick={() => setView('daily')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'daily' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'}`}>Daily Lessons</button>
        <button onClick={() => setView('summative')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'summative' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'}`}>Summative Growth</button>
      </div>

      {view === 'daily' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <UserGroupIcon className="w-5 h-5 text-indigo-600" />
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stats.masteryTrend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {stats.masteryTrend >= 0 ? '+' : ''}{stats.masteryTrend.toFixed(1)}%
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mastery Trend</p>
              <p className="text-2xl font-black text-slate-900">{stats.mastery.toFixed(1)}%</p>
              <div className="mt-3"><SimpleChart data={history.filter(h => h.type === 'coaching').map(h => h.metric).reverse()} color="#4f46e5" /></div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <ArrowTrendingUpIcon className="w-5 h-5 text-indigo-600" />
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stats.discourseTrend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {stats.discourseTrend >= 0 ? '+' : ''}{stats.discourseTrend.toFixed(0)}
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Discourse Score</p>
              <p className="text-2xl font-black text-slate-900">{stats.discourse.toFixed(0)}</p>
              <div className="mt-3"><SimpleChart data={history.filter(h => h.type === 'execution').map(h => h.metric).reverse()} color="#6366f1" /></div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <ClipboardIcon className="w-5 h-5 text-emerald-600" />
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stats.alignmentTrend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {stats.alignmentTrend >= 0 ? '+' : ''}{stats.alignmentTrend.toFixed(0)}
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plan Alignment</p>
              <p className="text-2xl font-black text-slate-900">{stats.alignment.toFixed(0)}%</p>
              <div className="mt-3"><SimpleChart data={history.filter(h => h.type === 'alignment').map(h => h.metric).reverse()} color="#10b981" /></div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <ClockIcon className="w-5 h-5 text-amber-600" />
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stats.pacingTrend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {stats.pacingTrend >= 0 ? '+' : ''}{stats.pacingTrend.toFixed(0)}
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Pacing</p>
              <p className="text-2xl font-black text-slate-900">{stats.pacing.toFixed(0)}%</p>
              <div className="mt-3"><SimpleChart data={history.filter(h => h.type === 'pacing').map(h => h.metric).reverse()} color="#f59e0b" /></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-indigo-600" /> Growth Progress Log</h3>
              <div className="flex items-center gap-2">
                 <AcademicCapIcon className="w-4 h-4 text-indigo-400" />
                 <span className="text-[10px] font-bold text-slate-500 uppercase">T-TESS Readiness: {Math.min(100, (stats.totalSessions / 20) * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div className="divide-y max-h-[400px] overflow-y-auto custom-scrollbar">
              {history.filter(h => h.type !== 'assessment').map((item) => (
                <div key={item.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      item.type === 'coaching' ? 'bg-indigo-50 text-indigo-600' : 
                      item.type === 'execution' ? 'bg-indigo-50 text-indigo-600' : 
                      item.type === 'alignment' ? 'bg-emerald-50 text-emerald-600' :
                      item.type === 'pacing' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'
                    }`}>
                      {item.type === 'coaching' ? <SparklesIcon className="w-5 h-5" /> : 
                       item.type === 'alignment' ? <ClipboardIcon className="w-5 h-5" /> :
                       item.type === 'pacing' ? <ClockIcon className="w-5 h-5" /> : <CalendarIcon className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 capitalize">{item.type} Analysis - {item.label}</p>
                      <p className="text-xs text-slate-400">{new Date(item.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-800">{item.metric.toFixed(0)}<span className="text-[10px] ml-1 font-bold text-slate-400">pts</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
           {/* AI Goal Projections Section */}
           <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <SparklesIcon className="w-48 h-48" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                   <div className="bg-indigo-500/30 p-2 rounded-lg border border-indigo-400/20 backdrop-blur-md">
                     <AcademicCapIcon className="w-6 h-6 text-indigo-200" />
                   </div>
                   <h3 className="text-xl font-bold tracking-tight">AI Summative Goal Projections</h3>
                </div>

                {loadingPrediction ? (
                  <div className="flex flex-col items-center py-12">
                    <div className="w-10 h-10 border-4 border-indigo-400/20 border-t-white rounded-full animate-spin mb-4"></div>
                    <p className="text-indigo-200 text-sm font-medium animate-pulse">Analyzing BOY & Daily mastery trends...</p>
                  </div>
                ) : prediction ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* MOY PROJECTION */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                       <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">MOY Projection</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            prediction.moy.riskLevel === 'Low' ? 'bg-emerald-500/20 text-emerald-300' :
                            prediction.moy.riskLevel === 'Medium' ? 'bg-orange-500/20 text-orange-300' : 'bg-red-500/20 text-red-300'
                          }`}>
                            {prediction.moy.riskLevel} Risk
                          </span>
                       </div>
                       <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-4xl font-black">{prediction.moy.predictedScore}%</span>
                          <span className="text-xs text-indigo-300 opacity-60">Confidence: {(prediction.moy.confidence * 100).toFixed(0)}%</span>
                       </div>
                       <p className="text-xs text-indigo-100/70 mb-4 leading-relaxed">{prediction.moy.reasoning}</p>
                       <div className="bg-indigo-500/20 rounded-xl p-3 border border-indigo-400/10 flex gap-3">
                          <LightBulbIcon className="w-5 h-5 text-indigo-300 shrink-0" />
                          <div className="text-[10px] font-medium leading-relaxed">{prediction.moy.intervention}</div>
                       </div>
                    </div>

                    {/* EOY PROJECTION */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                       <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">EOY Projection</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            prediction.eoy.riskLevel === 'Low' ? 'bg-emerald-500/20 text-emerald-300' :
                            prediction.eoy.riskLevel === 'Medium' ? 'bg-orange-500/20 text-orange-300' : 'bg-red-500/20 text-red-300'
                          }`}>
                            {prediction.eoy.riskLevel} Risk
                          </span>
                       </div>
                       <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-4xl font-black">{prediction.eoy.predictedScore}%</span>
                          <span className="text-xs text-indigo-300 opacity-60">Confidence: {(prediction.eoy.confidence * 100).toFixed(0)}%</span>
                       </div>
                       <p className="text-xs text-indigo-100/70 mb-4 leading-relaxed">{prediction.eoy.reasoning}</p>
                       <div className="bg-emerald-500/20 rounded-xl p-3 border border-emerald-400/10 flex gap-3">
                          <ShieldCheckIcon className="w-5 h-5 text-emerald-300 shrink-0" />
                          <div className="text-[10px] font-medium leading-relaxed">{prediction.eoy.intervention}</div>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-indigo-300 text-sm">Add BOY and at least 3 daily lessons to unlock AI growth projections.</p>
                  </div>
                )}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                 <div>
                    <div className="flex items-center gap-2 mb-2">
                       <TableCellsIcon className="w-6 h-6 text-indigo-600" />
                       <h3 className="font-black text-slate-900 text-xl">Assessment Velocity</h3>
                    </div>
                    <p className="text-slate-500 text-sm">Class average across all summatives.</p>
                 </div>
                 <div className="text-right">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${stats.assessmentTrend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                       {stats.assessmentTrend >= 0 ? '↑' : '↓'} {Math.abs(stats.assessmentTrend).toFixed(1)}%
                    </span>
                    <p className="text-4xl font-black text-indigo-600 mt-2">{stats.assessmentAvg.toFixed(1)}%</p>
                 </div>
              </div>
              <div className="bg-indigo-600 p-8 rounded-2xl border border-indigo-500 shadow-xl shadow-indigo-100 flex items-center justify-between text-white">
                 <div>
                    <h3 className="font-black text-xl">Growth Track</h3>
                    <p className="text-indigo-100 text-sm opacity-80 mt-1">Comparing BOY baseline vs current progress.</p>
                 </div>
                 <div className="flex flex-col items-center">
                    <AcademicCapIcon className="w-10 h-10 text-indigo-200" />
                    <span className="font-black text-lg mt-1">{assessments.length} Records</span>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b flex items-center justify-between bg-slate-50/30">
                 <h3 className="font-black text-slate-800 flex items-center gap-2"><ArrowTrendingUpIcon className="w-5 h-5 text-indigo-600" /> Summative Mastery Timeline</h3>
              </div>
              <div className="p-8">
                 <div className="h-64 flex items-end gap-4 overflow-x-auto pb-4">
                    {assessments.slice().reverse().map((a, idx) => (
                       <div key={idx} className="flex-1 min-w-[100px] flex flex-col items-center group">
                          <div className="relative w-full flex flex-col items-center">
                             <div className="text-[10px] font-black text-indigo-600 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">{a.average.toFixed(1)}%</div>
                             <div 
                                className={`w-full rounded-t-lg transition-all group-hover:opacity-80 ${
                                  a.type === 'BOY' ? 'bg-orange-400' :
                                  a.subject === 'Reading' ? 'bg-blue-400' : 'bg-emerald-400'
                                }`} 
                                style={{ height: `${(a.average / 100) * 160}px` }}
                             ></div>
                          </div>
                          <div className="mt-4 text-center">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate w-full">{a.title}</p>
                             <p className="text-[9px] text-slate-300 font-medium">{a.type}</p>
                          </div>
                       </div>
                    ))}
                    {assessments.length === 0 && <div className="w-full text-center text-slate-300 italic py-20">No assessment data to chart yet.</div>}
                 </div>
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

export default InsightsPage;
