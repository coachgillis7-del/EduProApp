
import React, { useState } from 'react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { provideCoaching } from '../services/geminiService';
import { 
  LightBulbIcon, 
  ChatBubbleBottomCenterTextIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const CoachingPage: React.FC = () => {
  const [scores, setScores] = useState<number[]>([85, 92, 78]);
  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleAddScore = () => {
    setScores([...scores, 0]);
  };

  const handleScoreChange = (index: number, val: string) => {
    const num = Math.min(100, Math.max(0, parseInt(val) || 0));
    const newScores = [...scores];
    newScores[index] = num;
    setScores(newScores);
  };

  const removeScore = (index: number) => {
    setScores(scores.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!reflection.trim()) {
      alert("Please provide a reflection on the lesson.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const coachingAdvice = await provideCoaching(scores, reflection);
      setResult(coachingAdvice || "No advice found.");
    } catch (error) {
      console.error(error);
      alert("Failed to get coaching advice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-slate-900">Reflective Coaching</h2>
        <p className="text-slate-500 mt-2">
          Connect student data with your <span className="font-semibold text-indigo-600">Fundamental 5</span> and <span className="font-semibold text-indigo-600">PAX GBG</span> implementation.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Input Form */}
        <div className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-4">Student Quiz Scores (0-100)</label>
            <div className="flex flex-wrap gap-3 mb-4">
              {scores.map((score, idx) => (
                <div key={idx} className="relative group">
                  <input 
                    type="number"
                    value={score}
                    onChange={(e) => handleScoreChange(idx, e.target.value)}
                    className="w-16 h-10 text-center border rounded-lg focus:ring-2 focus:ring-indigo-500 border-slate-300"
                  />
                  <button 
                    onClick={() => removeScore(idx)}
                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button 
                onClick={handleAddScore}
                className="w-10 h-10 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center text-xs font-medium text-slate-500">
              <span>Class Sample Size: {scores.length}</span>
              <span>Average: {(scores.reduce((a, b) => a + b, 0) / (scores.length || 1)).toFixed(1)}%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Teacher Reflection</label>
            <textarea 
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Reflect on your FSGPT usage, Power Zone time, and PAX kernels. How did these choices impact student success?"
              className="w-full h-40 p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 border-slate-300 resize-none text-sm"
            />
          </div>

          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
                Analyze Performance
              </>
            )}
          </button>
        </div>

        {/* Results / Empty State */}
        <div className="space-y-6">
          {!result && !loading && (
            <div className="bg-indigo-50 p-10 rounded-2xl border border-indigo-100 text-center flex flex-col items-center">
              <LightBulbIcon className="w-12 h-12 text-indigo-400 mb-4" />
              <h3 className="text-xl font-bold text-indigo-900">Instructional Insight</h3>
              <p className="text-indigo-700 text-sm mt-2">
                Gemini will look for ties between your scores and Fundamental 5 framework application.
              </p>
            </div>
          )}

          {loading && (
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-slate-200 rounded w-1/2"></div>
              <div className="h-40 bg-slate-200 rounded"></div>
              <div className="h-20 bg-slate-200 rounded"></div>
            </div>
          )}

          {result && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in slide-in-from-right duration-500">
              <MarkdownRenderer content={result} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachingPage;
