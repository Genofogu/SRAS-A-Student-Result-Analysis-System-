import React from 'react';
import { Terminal, Play, Loader2, RotateCcw } from 'lucide-react';

interface ConsoleProps {
  output: string;
  isSimulating: boolean;
  onRun: () => void;
  onClear: () => void;
}

const Console: React.FC<ConsoleProps> = ({ output, isSimulating, onRun, onClear }) => {
  return (
    <div className="flex flex-col h-full bg-[#0f0f0f] rounded-lg border border-gray-700 overflow-hidden font-mono shadow-xl">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-gray-700">
        <div className="flex items-center space-x-2 text-gray-400">
          <Terminal size={16} />
          <span className="text-sm font-semibold">Console Output</span>
        </div>
        <div className="flex space-x-2">
           <button
            onClick={onClear}
            className="flex items-center px-3 py-1 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
          >
            <RotateCcw size={12} className="mr-1" />
            Clear
          </button>
          <button
            onClick={onRun}
            disabled={isSimulating}
            className={`flex items-center px-3 py-1 text-xs font-bold rounded transition-colors ${
              isSimulating 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-green-700 hover:bg-green-600 text-white'
            }`}
          >
            {isSimulating ? (
              <Loader2 size={12} className="animate-spin mr-1" />
            ) : (
              <Play size={12} className="mr-1" />
            )}
            Run
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-auto text-sm">
        {isSimulating ? (
             <div className="flex items-center text-gray-500 animate-pulse">
                <span className="mr-2">&gt;</span> Compiling and executing...
             </div>
        ) : output ? (
          <div className="whitespace-pre-wrap text-gray-300">
            <span className="text-green-500 font-bold mb-2 block">&gt; java Main</span>
            {output}
            <div className="mt-4 text-gray-500 text-xs">
              Process finished with exit code 0
            </div>
          </div>
        ) : (
          <div className="text-gray-600 italic">
            // Click Run to simulate execution
          </div>
        )}
      </div>
    </div>
  );
};

export default Console;