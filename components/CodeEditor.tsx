import React from 'react';
import { Copy, Check, FileCode, FileText, Table } from 'lucide-react';
import { ProjectFile } from '../types';

interface CodeEditorProps {
  files: ProjectFile[];
  activeFileIndex: number;
  onFileSelect: (index: number) => void;
  onCodeChange: (newCode: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ files, activeFileIndex, onFileSelect, onCodeChange }) => {
  const [copied, setCopied] = React.useState(false);
  const activeFile = files[activeFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith('.py')) return <FileCode size={14} className="text-blue-400" />;
    if (name.endsWith('.csv')) return <Table size={14} className="text-green-400" />;
    return <FileText size={14} className="text-gray-400" />;
  };

  // Basic syntax highlighting for Python
  const highlightPython = (source: string) => {
    const keywords = ['def', 'import', 'from', 'class', 'return', 'if', 'else', 'elif', 'for', 'while', 'try', 'except', 'print', 'with', 'as', 'pass', 'break', 'continue', 'in', 'is', 'not', 'and', 'or'];
    
    return source.split('\n').map((line, i) => (
      <div key={i} className="table-row">
        <span className="table-cell text-right pr-4 text-gray-600 select-none w-8 text-xs align-top">{i + 1}</span>
        <span className="table-cell whitespace-pre-wrap break-all">
          {line.split(/(\s+|[(){},.[\]])/).map((chunk, j) => {
             // Simple tokenizer
             if (!chunk) return null;
             let colorClass = 'text-gray-300';
             const trimmed = chunk.trim();
             
             if (keywords.includes(trimmed)) colorClass = 'text-python-blue font-bold';
             else if (trimmed.startsWith('"') || trimmed.startsWith("'")) colorClass = 'text-green-400';
             else if (trimmed.match(/^[0-9]+$/)) colorClass = 'text-python-yellow';
             else if (line.trim().startsWith('#')) colorClass = 'text-gray-500 italic';
             else if (trimmed === 'pd' || trimmed === 'plt') colorClass = 'text-purple-400';
             
             // Override full line comment
             if (line.trim().startsWith('#')) {
                 return <span key={j} className="text-gray-500 italic">{chunk}</span>;
             }

             return <span key={`${i}-${j}`} className={colorClass}>{chunk}</span>;
          })}
        </span>
      </div>
    ));
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-lg border border-gray-700 overflow-hidden shadow-2xl">
      {/* File Tabs */}
      <div className="flex items-center overflow-x-auto bg-[#252526] border-b border-gray-700 scrollbar-hide">
        {files.map((file, index) => (
          <button
            key={file.name}
            onClick={() => onFileSelect(index)}
            className={`flex items-center space-x-2 px-4 py-3 text-sm min-w-max border-r border-gray-800 transition-colors ${
              activeFileIndex === index 
                ? 'bg-[#1e1e1e] text-white border-t-2 border-t-python-blue' 
                : 'text-gray-400 hover:bg-[#2d2d2d] hover:text-gray-200 border-t-2 border-t-transparent'
            }`}
          >
            {getFileIcon(file.name)}
            <span>{file.name}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex justify-end px-4 py-1 bg-[#1e1e1e] border-b border-gray-800">
         <button 
          onClick={handleCopy}
          className="p-1.5 hover:bg-gray-700 rounded-md transition-colors text-gray-400 hover:text-white"
          title="Copy Content"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm leading-6">
        <div className="table w-full">
           {activeFile.language === 'python' ? highlightPython(activeFile.content) : (
             <pre className="text-gray-300 font-mono whitespace-pre-wrap">{activeFile.content}</pre>
           )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;