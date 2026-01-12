
import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { analyzeLessonPlan } from '../services/geminiService';
import { 
  SparklesIcon, 
  CheckCircleIcon, 
  DocumentMagnifyingGlassIcon,
  UserGroupIcon 
} from '@heroicons/react/24/outline';

const PlannerPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [lessonFocus, setLessonFocus] = useState('');
  const [curriculum, setCurriculum] = useState('General');
  const [studentNeeds, setStudentNeeds] = useState('');

  const handleUpload = async (base64: string, type: string) => {
    if (!lessonFocus.trim()) {
      alert("Please specify which lesson you want analyzed (e.g., Monday 1.1).");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const aiResult = await analyzeLessonPlan(base64, type, lessonFocus, curriculum, studentNeeds);
      setResult(aiResult || "No analysis generated.");
    } catch (error) {
      console.error(error);
      alert("Failed to analyze the plan. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-slate-900">Distinguished Planner</h2>
        <p className="text-slate-500 mt-2">
          Upload a week's worth of plans. We optimize for <span className="text-indigo-600 font-semibold">Differentiation</span>, 
          <span className="text-indigo-600 font-semibold">Tier 2/3 Needs</span>, and <span className="text-indigo-600 font-semibold">Misconception Mitigation</span>.
        </p>
      </header>

      {!result && !loading && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <DocumentMagnifyingGlassIcon className="w-5 h-5 text-indigo-600" />
              Lesson Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Target Lesson Section</label>
                <input 
                  type="text" 
                  value={lessonFocus}
                  onChange={(e) => setLessonFocus(e.target.value)}
                  placeholder="e.g., Monday Skills Lesson 1.1"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Curriculum Framework</label>
                <select 
                  value={curriculum}
                  onChange={(e) => setCurriculum(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 border-slate-300 text-sm"
                >
                  <option value="General">General T-TESS</option>
                  <option value="Amplify Reading">Amplify (Reading)</option>
                  <option value="Bluebonnet Math">Bluebonnet (Math)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                <UserGroupIcon className="w-4 h-4" />
                Student Data & Specific Needs (Optional)
              </label>
              <textarea 
                value={studentNeeds}
                onChange={(e) => setStudentNeeds(e.target.value)}
                placeholder="Mention students in Tier 2/3, specific learning gaps, or high-achievers needing extension..."
                className="w-full h-24 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 border-slate-300 text-sm resize-none"
              />
            </div>
          </div>

          <FileUpload 
            onUpload={handleUpload}
            accept=".pdf"
            label="Upload Weekly Lesson Documents"
            subLabel="The AI will integrate differentiation and misconception mapping."
          />
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-2xl shadow-sm p-12 border border-slate-200 flex flex-col items-center justify-center text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <SparklesIcon className="w-6 h-6 text-indigo-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Building Scaffolds & Extensions...</h3>
          <p className="text-slate-500 mt-2 max-w-sm">
            Mapping anticipated misconceptions and generating Tier 2/3 intervention strategies for {lessonFocus}.
          </p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <CheckCircleIcon className="w-5 h-5" />
                <span>Distinguished Analysis Ready</span>
              </div>
              <span className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-tighter">Focus: {lessonFocus} | Framework: {curriculum}</span>
            </div>
            <button 
              onClick={() => setResult(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              Analyze Another Lesson
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-8 lg:p-10 border border-slate-200">
            <MarkdownRenderer content={result} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerPage;
