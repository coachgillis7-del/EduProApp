
import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { analyzeLessonExecution } from '../services/geminiService';
import { BeakerIcon, ChartBarSquareIcon } from '@heroicons/react/24/outline';

const AnalyzerPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleUpload = async (base64: string, type: string) => {
    setLoading(true);
    setResult(null);
    try {
      const aiResult = await analyzeLessonExecution(base64, type);
      setResult(aiResult || "No feedback generated.");
    } catch (error) {
      console.error(error);
      alert("Failed to analyze the media. Large files may take a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-slate-900">Execution Analyzer</h2>
        <p className="text-slate-500 mt-2">
          Upload a recording of your lesson. Gemini evaluates delivery based on T-TESS, 
          the <span className="text-indigo-600 font-medium">Fundamental 5</span> (Power Zone, FSGPT), 
          and usage of <span className="text-indigo-600 font-medium">PAX GBG kernels</span>.
        </p>
      </header>

      {!result && !loading && (
        <FileUpload 
          onUpload={handleUpload}
          accept="video/mp4,audio/mpeg,audio/mp3"
          label="Upload Lesson Recording"
          subLabel="MP4 or MP3 accepted. Max 50MB recommended."
        />
      )}

      {loading && (
        <div className="bg-white rounded-2xl shadow-sm p-12 border border-slate-200 flex flex-col items-center justify-center text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <BeakerIcon className="w-6 h-6 text-indigo-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Observing Classroom Dynamics...</h3>
          <p className="text-slate-500 mt-2 max-w-sm">
            Tracking Power Zone time, FSGPT frequency, and PAX kernel implementation.
          </p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-600 font-semibold">
              <ChartBarSquareIcon className="w-5 h-5" />
              <span>Observational Feedback</span>
            </div>
            <button 
              onClick={() => setResult(null)}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Analyze New Clip
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

export default AnalyzerPage;
