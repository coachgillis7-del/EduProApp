
import React from 'react';

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  // Simple rendering logic for demonstration; in a real app, use a lib like react-markdown
  const sections = content.split('\n');
  
  return (
    <div className="prose prose-slate max-w-none space-y-4 text-slate-700">
      {sections.map((line, idx) => {
        if (line.startsWith('# ')) return <h1 key={idx} className="text-3xl font-bold text-indigo-900 border-b pb-2">{line.replace('# ', '')}</h1>;
        if (line.startsWith('## ')) return <h2 key={idx} className="text-2xl font-semibold text-slate-800 mt-6">{line.replace('## ', '')}</h2>;
        if (line.startsWith('### ')) return <h3 key={idx} className="text-xl font-medium text-slate-800 mt-4">{line.replace('### ', '')}</h3>;
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={idx} className="ml-6 list-disc">{line.replace(/^[-*]\s/, '')}</li>;
        if (line.match(/^\d+\./)) return <li key={idx} className="ml-6 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>;
        if (!line.trim()) return <div key={idx} className="h-2" />;
        return <p key={idx}>{line}</p>;
      })}
    </div>
  );
};

export default MarkdownRenderer;
