
import React, { useState, useEffect } from 'react';
import FileUpload from '../components/FileUpload';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { analyzeLessonExecution, analyzeLessonTranscript } from '../services/geminiService';
import { saveHistoryEntry, getLessonBank } from '../services/storageService';
import { StoredLesson } from '../types';
import { 
  BeakerIcon, 
  ChartBarSquareIcon, 
  VideoCameraIcon, 
  DocumentTextIcon,
  SparklesIcon,
  ClockIcon,
  ClipboardIcon,
  ChatBubbleLeftRightIcon,
  LinkIcon
} from 'https://esm.sh/@heroicons/react@2.2.0/24/outline';

const AnalyzerPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'recording' | 'transcript'>('recording');
  const [transcriptText, setTranscriptText] = useState('');
  const [lessonBank, setLessonBank] = useState<StoredLesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');

  useEffect(() => {
    setLessonBank(getLessonBank());
  }, []);

  const getSelectedLesson = () => lessonBank.find(l => l.id === selectedLessonId);

  const trackResult = (content: string) => {
    const lesson = getSelectedLesson();
    const label = `Session: ${lesson ? lesson.focus : new Date().toLocaleDateString()}`;
    
    const discourseMatch = content.match(/DISCOURSE SCORE:\s*(\d+)/i);
    const alignmentMatch = content.match(/PLAN ALIGNMENT SCORE:\s*(\d+)/i);
    const pacingMatch = content.match(/PACING SCORE:\s*(\d+)/i);

    if (discourseMatch) {
      saveHistoryEntry({
        type: 'execution',
        metric: parseInt(discourseMatch[1]),
        label: `${label} (Discourse)`,
        lessonId: selectedLessonId
      });
    }
    if (alignmentMatch) {
      saveHistoryEntry({
        type: 'alignment',
        metric: parseInt(alignmentMatch[1]),
        label: `${label} (Alignment)`,
        lessonId: selectedLessonId
      });
    }
    if (pacingMatch) {
      saveHistoryEntry({
        type: 'pacing',
        metric: parseInt(pacingMatch[1]),
        label: `${label} (Pacing)`,
        lessonId: selectedLessonId
      });
    }
  };

  const handleUpload = async (base64: string, type: string) => {
    setLoading(true);
    setResult(null);
    try {
      const plannedLesson = getSelectedLesson();
      const aiResult = await analyzeLessonExecution(base64, type, plannedLesson?.content);
      setResult(aiResult || "No feedback generated.");
      if (aiResult) trackResult(aiResult);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze the media.");
    } finally {
      setLoading(false);
    }
  };

  const handleTranscriptSubmit = async () => {
    if (!transcriptText.trim()) {
      alert("Please enter a transcript to analyze.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const plannedLesson = getSelectedLesson();
      const aiResult = await analyzeLessonTranscript(transcriptText, plannedLesson?.content);
      setResult(aiResult || "No feedback generated.");
      if (aiResult) trackResult(aiResult);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze the transcript.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-slate-900">Execution Analyzer</h2>
        <p className="text-slate-500 mt-2">
          Compare your actual delivery against your <span className="text-indigo-600 font-bold underline">Planned Lesson Bank</span>.
        </p>
      </header>

      {/* Lesson Selector */}
      <div className="mb-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LinkIcon className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-indigo-900 text-sm">Step 1: Link to Planned Lesson</h3>
        </div>
        <select 
          value={selectedLessonId}
          onChange={(e) => setSelectedLessonId(e.target.value)}
          className="flex-1 max-w-md px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 border-indigo-200 text-sm bg-white"
        >
          <option value="">-- Optional: Select a Lesson from Bank --</option>
          {lessonBank.map(lesson => (
            <option key={lesson.id} value={lesson.id}>{lesson.focus} ({lesson.subject})</option>
          ))}
        </select>
      </div>

      <div className="mb-8 flex gap-1 p-1 bg-slate-200 rounded-xl w-fit">
        <button onClick={() => setInputMode('recording')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${inputMode === 'recording' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
          <VideoCameraIcon className="w-4 h-4" /> Lesson Recording
        </button>
        <button onClick={() => setInputMode('transcript')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${inputMode === 'transcript' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
          <DocumentTextIcon className="w-4 h-4" /> Lesson Transcript
        </button>
      </div>

      {!result && !loading && (
        <div className="animate-in slide-in-from-bottom-2 duration-300">
          {inputMode === 'recording' ? (
            <FileUpload onUpload={handleUpload} accept="video/mp4,audio/mpeg,audio/mp3" label="Upload Delivery Audio/Video" subLabel="Gemini will compare this to your selected plan." />
          ) : (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <label className="block text-sm font-bold text-slate-800 mb-4">Paste Delivery Transcript</label>
              <textarea value={transcriptText} onChange={(e) => setTranscriptText(e.target.value)} placeholder="Include turns for teacher and students..." className="w-full h-64 p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 border-slate-300 resize-none text-sm mb-6" />
              <button onClick={handleTranscriptSubmit} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"><SparklesIcon className="w-5 h-5" /> Compare with Plan</button>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-2xl shadow-sm p-12 border border-slate-200 flex flex-col items-center justify-center text-center">
          <div className="relative mb-6"><div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div><BeakerIcon className="w-6 h-6 text-indigo-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" /></div>
          <h3 className="text-xl font-bold text-slate-800">Calculating Fidelity Gaps...</h3>
          <p className="text-slate-500 mt-2 max-w-sm">Comparing delivery transcript against {getSelectedLesson()?.focus || 'generic standards'}.</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-indigo-500" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Discourse</p>
                <p className="text-xl font-black text-slate-800">{result.match(/DISCOURSE SCORE:\s*(\d+)/i)?.[1] || '--'}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
              <ClipboardIcon className="w-8 h-8 text-emerald-500" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plan Alignment</p>
                <p className="text-xl font-black text-slate-800">{result.match(/PLAN ALIGNMENT SCORE:\s*(\d+)/i)?.[1] || '--'}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
              <ClockIcon className="w-8 h-8 text-amber-500" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pacing</p>
                <p className="text-xl font-black text-slate-800">{result.match(/PACING SCORE:\s*(\d+)/i)?.[1] || '--'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-8 lg:p-10 border border-slate-200 animate-in zoom-in-95 duration-300">
             <div className="flex justify-end mb-6">
                <button onClick={() => { setResult(null); setTranscriptText(''); }} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 px-4 py-2 rounded-lg uppercase tracking-wider">Start New Analysis</button>
             </div>
             <MarkdownRenderer content={result} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyzerPage;
