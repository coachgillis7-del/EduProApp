
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
  BoltIcon
} from 'https://esm.sh/@heroicons/react@2.2.0/24/outline';

const AdminDashboard: React.FC = () => {
  const [selectedCampus, setSelectedCampus] = useState('All Campuses');
  const [loadingAI, setLoadingAI] = useState(false);
  
  // AI Strategic Insights State
  const [pdInsight, setPdInsight] = useState<any>(null);
  const [curriculumAudit, setCurriculumAudit] = useState<any>(null);
  const [behaviorCluster, setBehaviorCluster] = useState<any>(null);

  const teacherData = useMemo(() => getCampusData(), []);

  const stats = useMemo(() => {
    const avg = teacherData.reduce((acc, t) => acc + t.avgMastery, 0) / teacherData.length;
    const planAvg = teacherData.reduce((acc, t) => acc + t.planningScore, 0) / teacherData.length;
    return { campusAvg: avg, planningAvg: planAvg };
  }, [teacherData]);

  const runStrategicScan = async () => {
    setLoadingAI(true);
    try {
      const history = getHistory();
      const lessons = getLessonBank();
      
      // Simulate Behavior Logs from History
      const behaviorLogs = history.filter(h => h.type === 'intervention' || (h.details && h.details.includes('behavior')));

      const [pd, audit, behavior] = await Promise.all([
        scanCampusForPDNeeds(teacherData),
        performCurriculumAudit(selectedCampus, lessons.slice(0, 10)),
        detectBehaviorClusters(behaviorLogs)
      ]);

      setPdInsight(pd);
      setCurriculumAudit(audit);
      setBehaviorCluster(behavior);
    } catch (e) {
      console.error("Strategic Scan Failed", e);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      <header className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-slate-900 p-2 rounded-lg">
              <BuildingOffice2Icon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">District Leadership</h2>
          </div>
          <p className="text-slate-500 mt-2 text-lg">Multi-campus monitoring and organizational proficiency.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
           <button 
             onClick={runStrategicScan}
             disabled={loadingAI}
             className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 group"
           >
             <SparklesIcon className={`w-5 h-5 ${loadingAI ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
             {loadingAI ? 'Scanning Data...' : 'Run Strategic AI Scan'}
           </button>
           <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
             <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">Select Jurisdiction</label>
             <select 
               value={selectedCampus} 
               onChange={(e) => setSelectedCampus(e.target.value)}
               className="text-xs font-bold text-slate-700 bg-transparent outline-none"
             >
                <option>All Campuses</option>
                <option>Faulk Elementary</option>
                <option>Charlie Marshall Elementary</option>
                <option>A.C. Blunt Middle</option>
                <option>Aransas Pass High</option>
             </select>
           </div>
        </div>
      </header>

      {/* Strategic AI Hub */}
      <div className="mb-12 space-y-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px bg-slate-200 flex-1"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Strategic AI Hub</span>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feature A: T-TESS Heat Map */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-900 flex items-center gap-2 tracking-tight">
                <BoltIcon className="w-6 h-6 text-orange-500" /> PD Heat Map
              </h3>
              <div className="bg-orange-50 text-orange-600 text-[10px] font-black px-2 py-1 rounded-full uppercase">Professional Dev</div>
            </div>
            
            {pdInsight ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  {pdInsight.heatMap.map((h: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-500 w-24 truncate">{h.dimension}</span>
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${
                          h.status === 'Strong' ? 'bg-emerald-500' :
                          h.status === 'Growth' ? 'bg-amber-500' : 'bg-rose-500'
                        }`} style={{ width: `${h.score}%` }}></div>
                      </div>
                      <span className={`text-[10px] font-black ${
                        h.status === 'Strong' ? 'text-emerald-600' :
                        h.status === 'Growth' ? 'text-amber-600' : 'text-rose-600'
                      }`}>{h.score}%</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">AI Recommendation</p>
                  <p className="text-xs font-bold text-slate-700 leading-relaxed mb-2">"{pdInsight.topPDNeed.rationale}"</p>
                  <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Email PD Lead</button>
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <BeakerIcon className="w-10 h-10 text-slate-200 mb-4" />
                <p className="text-xs text-slate-400 max-w-[150px]">Run scan to analyze 100+ active lesson plans for T-TESS gaps.</p>
              </div>
            )}
          </div>

          {/* Feature B: Curriculum Audit */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-900 flex items-center gap-2 tracking-tight">
                <MagnifyingGlassIcon className="w-6 h-6 text-indigo-600" /> Curriculum Audit
              </h3>
              <div className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-1 rounded-full uppercase">Fidelity Check</div>
            </div>

            {curriculumAudit ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center flex-col py-4">
                  <div className="relative">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - curriculumAudit.fidelityScore / 100)} className="text-indigo-600 transition-all duration-1000" />
                    </svg>
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-black">{curriculumAudit.fidelityScore}%</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mt-2">Overall Fidelity</p>
                </div>
                <div className="space-y-2">
                  {curriculumAudit.auditFindings.map((f: any, i: number) => (
                    <div key={i} className="flex justify-between items-start gap-2 border-b border-slate-50 pb-2">
                      <div>
                        <p className="text-[10px] font-black text-slate-800">{f.area}</p>
                        <p className="text-[9px] text-slate-500 leading-tight">{f.finding}</p>
                      </div>
                      <span className="text-[10px] font-black text-rose-500 whitespace-nowrap">-{f.deviation}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <TableCellsIcon className="w-10 h-10 text-slate-200 mb-4" />
                <p className="text-xs text-slate-400 max-w-[150px]">Scan will compare District curriculum vs active classroom plans.</p>
              </div>
            )}
          </div>

          {/* Feature C: Behavior Clusters */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <SparklesIcon className="w-32 h-32" />
            </div>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="font-black flex items-center gap-2 tracking-tight">
                <ExclamationTriangleIcon className="w-6 h-6 text-amber-400" /> Behavior Alerts
              </h3>
              <div className="bg-white/10 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase">PAX Monitoring</div>
            </div>

            {behaviorCluster ? (
              <div className="space-y-6 relative z-10">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-black text-indigo-400 uppercase mb-2">Cluster Detected</p>
                  <div className="flex gap-3">
                    <div className="bg-amber-500/20 p-2 rounded-lg h-fit border border-amber-500/30">
                      <EyeIcon className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">{behaviorCluster.clusters[0].issue}</p>
                      <p className="text-[9px] text-slate-400 mt-1">{behaviorCluster.clusters[0].timeBlock} • Grade {behaviorCluster.clusters[0].grade}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-indigo-500/20 rounded-2xl border border-indigo-400/20">
                  <p className="text-[10px] font-black text-indigo-300 uppercase mb-2">AI PAX Solution</p>
                  <h4 className="text-sm font-black text-white mb-1">Kernel: {behaviorCluster.paxSolution.kernel}</h4>
                  <p className="text-[10px] text-indigo-200/70 leading-relaxed">{behaviorCluster.paxSolution.implementation}</p>
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <ShieldCheckIcon className="w-10 h-10 text-white/20 mb-4" />
                <p className="text-xs text-slate-400 max-w-[150px]">Scan identifies behavior clusters and recommends real-time PAX Kernels.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Campuses', val: '12', icon: MapPinIcon, color: 'indigo' },
          { label: 'Total Teachers', val: '482', icon: UserGroupIcon, color: 'emerald' },
          { label: 'Active Goals', val: '1,204', icon: AcademicCapIcon, color: 'blue' },
          { label: 'Risk Factor', val: 'Low', icon: ShieldCheckIcon, color: 'emerald' }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-4">
             <div className={`p-3 rounded-2xl bg-slate-50 text-slate-900 border border-slate-100`}>
               <kpi.icon className="w-6 h-6" />
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
               <p className="text-xl font-black text-slate-900">{kpi.val}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Campus Distribution */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-2">
            <GlobeAltIcon className="w-6 h-6 text-indigo-600" /> Campus Performance Distribution
          </h3>
          <div className="space-y-6">
             {[
               { name: 'Faulk Elementary', val: 88, color: 'emerald' },
               { name: 'Aransas Pass High', val: 74, color: 'indigo' },
               { name: 'A.C. Blunt Middle', val: 62, color: 'amber' },
               { name: 'Charlie Marshall Elementary', val: 92, color: 'indigo' }
             ].map((campus, idx) => (
               <div key={idx} className="group">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">{campus.name}</span>
                    <span className="text-xs font-black text-indigo-600">{campus.val}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                     <div className={`h-full transition-all duration-1000 ${
                       campus.val > 80 ? 'bg-emerald-500' :
                       campus.val > 70 ? 'bg-indigo-500' : 'bg-amber-500'
                     }`} style={{ width: `${campus.val}%` }}></div>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Global Insight Card */}
        <div className="bg-indigo-950 p-8 rounded-3xl text-white relative overflow-hidden flex flex-col justify-between">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <LightBulbIcon className="w-32 h-32" />
           </div>
           <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-indigo-400" /> District Insight
            </h3>
            <p className="text-sm text-indigo-200 leading-relaxed mb-6">
              {pdInsight ? pdInsight.insight : "Run the strategic AI scan to identify correlations between classroom discourse and student mastery across all Aransas Pass ISD campuses."}
            </p>
           </div>
           <button className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
             Generate Longitudinal Report
           </button>
        </div>
      </div>

      {/* Teacher Monitoring Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><TableCellsIcon className="w-6 h-6 text-indigo-600" /> Instructional Leader Roster</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 border-b">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Educator</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Campus</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignment</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Avg Mastery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teacherData.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">{t.name[0]}</div>
                      <span className="font-bold text-slate-900 text-sm">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs text-slate-600 font-medium">
                    {t.name.includes('Miller') ? 'Charlie Marshall' : 
                     t.name.includes('Garcia') ? 'A.C. Blunt' : 
                     t.name.includes('Chen') ? 'Aransas Pass High' : 'Faulk Elementary'}
                  </td>
                  <td className="px-8 py-6 text-xs text-slate-400 font-bold">{t.grade} • {t.subject}</td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black ${
                      t.avgMastery > 85 ? 'bg-emerald-50 text-emerald-700' : 
                      t.avgMastery > 70 ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                    }`}>{t.avgMastery.toFixed(0)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
