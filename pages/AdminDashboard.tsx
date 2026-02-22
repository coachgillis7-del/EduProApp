
import React, { useMemo, useState, useEffect } from 'react';
import { getCampusData, getHistory, getLessonBank } from '../services/storageService';
import { scanCampusForPDNeeds, performCurriculumAudit, detectBehaviorClusters } from '../services/geminiService';
import { 
  GlobeAltIcon, 
  ArrowTrendingUpIcon, 
  ExclamationTriangleIcon, 
  UserGroupIcon, 
  SparklesIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  TableCellsIcon,
  ArrowUpIcon,
  MapPinIcon,
  BuildingOffice2Icon,
  BeakerIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  BoltIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

const AdminDashboard: React.FC = () => {
  const [selectedCampus, setSelectedCampus] = useState('All Campuses');
  const [loadingAI, setLoadingAI] = useState(false);
  
  const [pdInsight, setPdInsight] = useState<any>(null);
  const [curriculumAudit, setCurriculumAudit] = useState<any>(null);
  const [behaviorCluster, setBehaviorCluster] = useState<any>(null);
  const [teacherData, setTeacherData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await getCampusData();
      setTeacherData(data);
    };
    loadData();
  }, []);

  const runStrategicScan = async () => {
    setLoadingAI(true);
    try {
      const [history, lessons] = await Promise.all([getHistory(), getLessonBank()]);
      const behaviorLogs = history.filter(h => h.type === 'intervention' || (h.details && h.details.includes('behavior')));
      const [pd, audit, behavior] = await Promise.all([
        scanCampusForPDNeeds(teacherData),
        performCurriculumAudit(selectedCampus, lessons.slice(0, 10)),
        detectBehaviorClusters(behaviorLogs)
      ]);
      setPdInsight(pd);
      setCurriculumAudit(audit);
      setBehaviorCluster(behavior);
    } catch (e) { console.error("Strategic Scan Failed", e); } finally { setLoadingAI(false); }
  };

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      <header className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-slate-900 p-2 rounded-lg"><BuildingOffice2Icon className="w-8 h-8 text-white" /></div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">District Leadership</h2>
          </div>
          <p className="text-slate-500 mt-2 text-lg">Proof-of-Concept: Faulk Elementary Pilot Monitoring</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
           <button onClick={runStrategicScan} disabled={loadingAI} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 disabled:opacity-50 group">
             <SparklesIcon className={`w-5 h-5 ${loadingAI ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
             {loadingAI ? 'Scanning Pilot Data...' : 'Run Strategic AI Scan'}
           </button>
           <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
             <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">Active Scope</label>
             <select value={selectedCampus} onChange={(e) => setSelectedCampus(e.target.value)} className="text-xs font-bold text-slate-700 bg-transparent outline-none">
                <option>All Campuses</option>
                <option>Faulk Elementary (Pilot)</option>
                <option>Aransas Pass High</option>
             </select>
           </div>
        </div>
      </header>

      {/* Pilot Scorecard (Proof of Concept) */}
      <div className="mb-12 bg-gradient-to-br from-emerald-900 to-teal-950 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border border-emerald-500/30">
        <div className="absolute top-0 right-0 p-8 opacity-10"><CheckBadgeIcon className="w-48 h-48" /></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20"><AcademicCapIcon className="w-6 h-6 text-emerald-300" /></div>
            <h3 className="text-2xl font-black tracking-tight">Faulk Pilot Efficacy Report</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">PAX Fidelity (Avg)</p>
                <p className="text-4xl font-black">94%</p>
                <p className="text-[10px] text-emerald-200/60 mt-2 flex items-center gap-1"><ArrowUpIcon className="w-3 h-3" /> +12% from Baseline</p>
             </div>
             <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">TEKS Proficiency</p>
                <p className="text-4xl font-black">82%</p>
                <p className="text-[10px] text-emerald-200/60 mt-2 flex items-center gap-1"><ArrowUpIcon className="w-3 h-3" /> +8% vs Non-Pilot</p>
             </div>
             <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Teacher Engagement</p>
                <p className="text-4xl font-black">100%</p>
                <p className="text-[10px] text-emerald-200/60 mt-2">Active Daily Usage</p>
             </div>
          </div>
        </div>
      </div>

      {/* Strategic AI Hub */}
      <div className="mb-12 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-900 flex items-center gap-2 tracking-tight"><BoltIcon className="w-6 h-6 text-orange-500" /> PD Heat Map</h3>
              <div className="bg-orange-50 text-orange-600 text-[10px] font-black px-2 py-1 rounded-full uppercase">Professional Dev</div>
            </div>
            {pdInsight ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  {pdInsight.heatMap.map((h: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-500 w-24 truncate">{h.dimension}</span>
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${h.status === 'Strong' ? 'bg-emerald-500' : h.status === 'Growth' ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${h.score}%` }}></div>
                      </div>
                      <span className={`text-[10px] font-black ${h.status === 'Strong' ? 'text-emerald-600' : h.status === 'Growth' ? 'text-amber-600' : 'text-rose-600'}`}>{h.score}%</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Pilot Recommendation</p>
                  <p className="text-xs font-bold text-slate-700 mb-2">"{pdInsight.topPDNeed.rationale}"</p>
                </div>
              </div>
            ) : <div className="py-12 flex flex-col items-center justify-center text-center opacity-40"><BeakerIcon className="w-10 h-10 mb-4" /><p className="text-xs">Scan to analyze Faulk PD gaps.</p></div>}
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-900 flex items-center gap-2 tracking-tight"><MagnifyingGlassIcon className="w-6 h-6 text-indigo-600" /> Curriculum Audit</h3>
              <div className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-1 rounded-full uppercase">Pilot Fidelity</div>
            </div>
            {curriculumAudit ? (
              <div className="space-y-6 text-center">
                <div className="relative inline-block">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - curriculumAudit.fidelityScore / 100)} className="text-indigo-600 transition-all duration-1000" />
                  </svg>
                  <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-black">{curriculumAudit.fidelityScore}%</span>
                </div>
                <div className="space-y-2 text-left">
                  {curriculumAudit.auditFindings.map((f: any, i: number) => (
                    <div key={i} className="flex justify-between items-start border-b pb-2"><div className="text-[10px] font-black">{f.area}</div><span className="text-[10px] font-black text-rose-500">-{f.deviation}%</span></div>
                  ))}
                </div>
              </div>
            ) : <div className="py-12 flex flex-col items-center justify-center text-center opacity-40"><TableCellsIcon className="w-10 h-10 mb-4" /><p className="text-xs">Curriculum vs Pilot usage comparison.</p></div>}
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="font-black flex items-center gap-2 tracking-tight"><ExclamationTriangleIcon className="w-6 h-6 text-amber-400" /> PAX Cluster Alert</h3>
              <div className="bg-white/10 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase">Behavior Hub</div>
            </div>
            {behaviorCluster ? (
              <div className="space-y-6 relative z-10">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-black text-indigo-400 uppercase mb-2">Pilot Detection</p>
                  <p className="text-xs font-bold">{behaviorCluster.clusters[0].issue}</p>
                </div>
                <div className="p-4 bg-indigo-500/20 rounded-2xl border border-indigo-400/20">
                  <p className="text-[10px] font-black text-indigo-300 uppercase mb-2">PAX Solution</p>
                  <h4 className="text-sm font-black text-white">{behaviorCluster.paxSolution.kernel}</h4>
                </div>
              </div>
            ) : <div className="py-12 flex flex-col items-center justify-center text-center opacity-40"><ShieldCheckIcon className="w-10 h-10 mb-4" /><p className="text-xs">Behavior cluster analysis.</p></div>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Pilot Campuses', val: '1 (Faulk)', icon: MapPinIcon },
          { label: 'Pilot Teachers', val: '24', icon: UserGroupIcon },
          { label: 'Lessons Refined', val: '142', icon: AcademicCapIcon },
          { label: 'System Trust', val: 'High', icon: ShieldCheckIcon }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-4">
             <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900"><kpi.icon className="w-6 h-6" /></div>
             <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p><p className="text-xl font-black text-slate-900">{kpi.val}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
