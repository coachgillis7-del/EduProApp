
import React, { useState } from 'react';
import { ArrowUpTrayIcon, DocumentTextIcon } from 'https://esm.sh/@heroicons/react@2.2.0/24/solid';

interface FileUploadProps {
  onUpload: (base64: string, type: string) => void;
  accept: string;
  label: string;
  subLabel: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, accept, label, subLabel }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      onUpload(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${
        isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 bg-white'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFile(e.dataTransfer.files[0]);
        }
      }}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <input 
        id="fileInput"
        type="file" 
        className="hidden" 
        accept={accept} 
        onChange={onFileChange}
      />
      <div className="bg-indigo-100 p-4 rounded-full mb-4">
        <ArrowUpTrayIcon className="w-8 h-8 text-indigo-600" />
      </div>
      <p className="text-lg font-semibold text-slate-800">{fileName || label}</p>
      <p className="text-sm text-slate-500 mt-1">{subLabel}</p>
      <button className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
        Choose File
      </button>
    </div>
  );
};

export default FileUpload;
