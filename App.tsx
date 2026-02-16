import React, { useState, useRef, useEffect } from 'react';
import { Box, Send, Sparkles, BookOpen, Code2, MessageSquare, Play, FolderGit2 } from 'lucide-react';
import CodeEditor from './components/CodeEditor';
import Console from './components/Console';
import { generatePythonCode, simulatePythonExecution, getTutorExplanation } from './services/geminiService';
import { AppMode, ProjectFile } from './types';

// Initial Project Content
const INITIAL_FILES: ProjectFile[] = [
  {
    name: 'main.py',
    language: 'python',
    content: `import pandas as pd
import matplotlib.pyplot as plt

def load_data(filename):
    """Reads student marks data from a CSV file."""
    try:
        data = pd.read_csv(filename)
        return data
    except FileNotFoundError:
        print(f"Error: The file {filename} was not found.")
        return None

def calculate_metrics(df):
    """Calculates Total, Average and Grade."""
    # Calculate Total and Average
    df['Total'] = df['Math'] + df['Science'] + df['English']
    df['Average'] = df['Total'] / 3.0
    
    # Assign Grade
    def assign_grade(score):
        if score >= 90: return 'A'
        if score >= 80: return 'B'
        if score >= 70: return 'C'
        return 'Fail'
        
    df['Grade'] = df['Average'].apply(assign_grade)
    return df

def generate_insights(df):
    """Prints analysis insights."""
    print("\\n--- Student Result Analysis ---")
    print(f"Class Average: {df['Average'].mean():.2f}")
    
    # Top Performer
    top_student = df.loc[df['Total'].idxmax()]
    print(f"Top Performer: {top_student['Name']} (Total: {top_student['Total']})")
    
    # Subject Toppers
    subjects = ['Math', 'Science', 'English']
    for sub in subjects:
        topper = df.loc[df[sub].idxmax()]
        print(f"{sub} Topper: {topper['Name']} ({topper[sub]})")
        
    # Students needing improvement
    failed = df[df['Grade'] == 'Fail']
    if not failed.empty:
        print(f"\\nStudents Needing Improvement ({len(failed)}):")
        print(failed[['Name', 'Average']].to_string(index=False))
    else:
        print("\\nAll students passed successfully!")

def visualize_results(df):
    """Simulates generating charts."""
    print("\\nGenerating Visualizations...")
    
    # Bar Chart
    plt.figure(figsize=(10,6))
    plt.bar(df['Name'], df['Average'], color='skyblue')
    plt.title('Student Average Marks')
    plt.xlabel('Student')
    plt.ylabel('Score')
    plt.show()
    print("- Created 'average_marks_bar_chart.png'")
    
    # Grade Distribution
    grade_counts = df['Grade'].value_counts()
    plt.figure(figsize=(8,8))
    plt.pie(grade_counts, labels=grade_counts.index, autopct='%1.1f%%')
    plt.title('Grade Distribution')
    plt.show()
    print("- Created 'grade_distribution_pie_chart.png'")

def main():
    print("Starting Student Result Analysis System...")
    file_name = 'students.csv'
    
    df = load_data(file_name)
    if df is not None:
        print("Data Loaded Successfully.")
        print(df.head())
        
        df = calculate_metrics(df)
        generate_insights(df)
        visualize_results(df)
        
        print("\\nAnalysis Complete.")

if __name__ == "__main__":
    main()`
  },
  {
    name: 'students.csv',
    language: 'csv',
    content: `Name,Math,Science,English
Alice,85,92,88
Bob,55,60,58
Charlie,95,98,96
David,72,68,74
Eve,88,85,90
Frank,45,50,48
Grace,92,88,94`
  },
  {
    name: 'README.md',
    language: 'markdown',
    content: `# Student Result Analysis System

## Project Overview
This Python project analyzes student marks data to provide actionable insights into performance. It reads data from a CSV file, calculates grades, identifies top performers, and visualizes the results.

## Features
- **Data Loading**: Reads student data from CSV.
- **Calculations**: Computes Total Marks, Average, and Grades (A, B, C, Fail).
- **Insights**: Identifies class topper and subject-wise toppers.
- **Visualization**: Generates bar charts and pie charts for performance analysis.

## Technologies Used
- **Python 3.x**
- **Pandas**: For data manipulation and analysis.
- **Matplotlib**: For data visualization.

## How to Run
1. Install dependencies:
   \`pip install -r requirements.txt\`
2. Run the main script:
   \`python main.py\`

## Sample Output
- Class Average: 76.4
- Top Performer: Charlie
`
  },
  {
    name: 'requirements.txt',
    language: 'text',
    content: `pandas
matplotlib`
  }
];

function App() {
  const [files, setFiles] = useState<ProjectFile[]>(INITIAL_FILES);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [mode, setMode] = useState<AppMode>(AppMode.EDITOR);
  const [tutorResponse, setTutorResponse] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setTutorResponse('');

    try {
      if (mode === AppMode.TUTOR) {
        const explanation = await getTutorExplanation(prompt, files);
        setTutorResponse(explanation);
      } else {
        // EDITOR MODE - Modify current file or generate new code
        const activeFile = files[activeFileIndex];
        const newCode = await generatePythonCode(prompt, activeFile);
        
        const updatedFiles = [...files];
        updatedFiles[activeFileIndex] = {
            ...activeFile,
            content: newCode
        };
        setFiles(updatedFiles);
        setTutorResponse("I've updated the code based on your request.");
      }
    } catch (error) {
      console.error(error);
      setTutorResponse("Sorry, I encountered an error processing your request.");
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const output = await simulatePythonExecution(files);
      setConsoleOutput(output);
    } catch (error) {
      setConsoleOutput("Error during simulation.");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCodeChange = (newCode: string) => {
      const updatedFiles = [...files];
      updatedFiles[activeFileIndex].content = newCode;
      setFiles(updatedFiles);
  };

  return (
    <div className="flex h-screen w-full bg-[#18181b] text-white font-sans">
      {/* Sidebar Navigation */}
      <div className="w-16 md:w-20 bg-[#202023] border-r border-gray-700 flex flex-col items-center py-6 space-y-8 z-10">
        <div className="p-2 bg-yellow-500/10 rounded-xl">
          <FolderGit2 className="text-python-yellow" size={28} />
        </div>
        
        <div className="flex flex-col space-y-6 w-full">
            <button 
                onClick={() => setMode(AppMode.EDITOR)}
                className={`flex flex-col items-center space-y-1 p-2 w-full transition-colors border-l-4 ${mode === AppMode.EDITOR ? 'border-python-blue text-white bg-white/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
                <Code2 size={24} />
                <span className="text-[10px] font-medium">Editor</span>
            </button>
            <button 
                 onClick={() => setMode(AppMode.TUTOR)}
                 className={`flex flex-col items-center space-y-1 p-2 w-full transition-colors border-l-4 ${mode === AppMode.TUTOR ? 'border-python-yellow text-white bg-white/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
                <BookOpen size={24} />
                <span className="text-[10px] font-medium">Tutor</span>
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        
        {/* Left Column: Editor & Console */}
        <div className="flex-1 flex flex-col h-full p-4 space-y-4 overflow-hidden relative">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#18181b] to-[#18181b] pointer-events-none -z-0"></div>

            {/* Editor Section */}
            <div className="flex-1 min-h-0 z-10 flex flex-col">
                <div className="flex items-center justify-between mb-2 px-1">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Project Files</h2>
                </div>
                <CodeEditor 
                    files={files} 
                    activeFileIndex={activeFileIndex}
                    onFileSelect={setActiveFileIndex}
                    onCodeChange={handleCodeChange}
                />
            </div>

            {/* Console Section */}
            <div className="h-1/3 min-h-[200px] z-10">
                <Console 
                    output={consoleOutput} 
                    isSimulating={isSimulating} 
                    onRun={handleRunSimulation}
                    onClear={() => setConsoleOutput('')}
                />
            </div>
        </div>

        {/* Right Column: Interaction Panel */}
        <div className="w-full md:w-[400px] bg-[#202023] border-l border-gray-700 flex flex-col shadow-2xl z-20">
             {/* Header */}
             <div className="h-16 flex items-center px-6 border-b border-gray-700 bg-[#252526]">
                <h1 className="font-bold text-lg flex items-center">
                    <span className={mode === AppMode.EDITOR ? 'text-python-blue' : 'text-python-yellow'}>
                        {mode === AppMode.EDITOR ? 'PyProject Studio' : 'Data Tutor'}
                    </span>
                    <Sparkles size={16} className="ml-2 text-white/50" />
                </h1>
             </div>

             {/* Output/Explanation Area */}
             <div className="flex-1 overflow-y-auto p-6 space-y-4">
                 {/* Welcome Message */}
                 {!tutorResponse && !isLoading && (
                     <div className="bg-[#2a2a2d] p-4 rounded-lg border border-gray-700">
                        <h3 className="text-sm font-bold text-white mb-2">Student Result Analysis System</h3>
                        <p className="text-sm text-gray-400 mb-2">
                            This project is pre-loaded with a Python Data Analytics boilerplate.
                        </p>
                        <ul className="list-disc list-inside text-xs text-gray-500 space-y-1">
                            <li>Reads <code>students.csv</code></li>
                            <li>Calculates grades using Pandas</li>
                            <li>Visualizes data with Matplotlib</li>
                        </ul>
                    </div>
                 )}
                
                {tutorResponse && (
                     <div className="bg-[#2a2a2d] p-4 rounded-lg border border-gray-600">
                         <div className="flex items-center space-x-2 mb-2">
                             <MessageSquare size={14} className="text-python-blue" />
                             <h3 className="text-xs font-bold text-python-blue uppercase tracking-wider">Assistant</h3>
                         </div>
                        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{tutorResponse}</p>
                    </div>
                )}

                {isLoading && (
                    <div className="flex items-center space-x-2 text-gray-400 text-sm animate-pulse">
                        <div className="w-2 h-2 bg-python-blue rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-python-yellow rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-python-blue rounded-full animate-bounce delay-150"></div>
                        <span>Processing request...</span>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
             </div>

             {/* Input Area */}
             <div className="p-4 bg-[#252526] border-t border-gray-700">
                <form onSubmit={handleGenerate} className="relative">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={mode === AppMode.EDITOR ? "Ex: Add a function to export to PDF..." : "Ex: Explain how pandas read_csv works"}
                        className="w-full bg-[#18181b] text-white rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-python-blue/50 border border-gray-700 placeholder-gray-500"
                    />
                    <button 
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                        className="absolute right-2 top-2 p-1.5 bg-python-blue hover:bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </form>
                <div className="text-[10px] text-gray-500 mt-2 text-center">
                    Powered by Google Gemini • Simulates Python 3.10+
                </div>
             </div>
        </div>

      </div>
    </div>
  );
}

export default App;