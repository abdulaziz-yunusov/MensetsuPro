"use client";

import { use, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle2, RefreshCw } from "lucide-react";

export default function CodingEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [code, setCode] = useState(`function solve() {\n  // Write your code here\n  console.log("Hello Output");\n}\n\nsolve();`);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  // Very basic mock runner for the demonstration
  const runCode = () => {
    setIsRunning(true);
    setOutput("");
    
    // Simulating API lag to a secure execution container
    setTimeout(() => {
      try {
        // DO NOT use eval in production like this!
        // This is strictly a local demo execution placeholder until a secure API is implemented.
        const originalConsoleLog = console.log;
        let logs: string[] = [];
        console.log = (...args) => {
          logs.push(args.join(" "));
        };
        
        // eslint-disable-next-line no-eval
        eval(code);
        
        console.log = originalConsoleLog;
        setOutput(logs.join("\n") || "Code executed successfully with no output.");
      } catch (err: any) {
        setOutput(`Error: ${err.message}`);
      }
      setIsRunning(false);
    }, 800);
  };

  const problemText = id === "two-sum" 
    ? "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
    : "Algorithm challenge prompt goes here.";

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-foreground text-slate-300">
      {/* Problem Description Panel */}
      <div className="w-1/3 bg-slate-800 border-r border-slate-700 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-700 bg-slate-800/50">
          <h2 className="text-xl font-bold text-white capitalize">{id.replace(/-/g, " ")}</h2>
        </div>
        <div className="p-6 flex-1 overflow-y-auto prose prose-invert">
          <p className="text-slate-300 leading-relaxed max-w-none">
            {problemText}
          </p>
          <div className="mt-8 bg-foreground p-4 rounded-md font-mono text-sm border border-slate-700">
            <span className="text-muted-foreground">// Example 1:</span><br/>
            <span className="text-blue-400">Input:</span> nums = [2,7,11,15], target = 9<br/>
            <span className="text-emerald-400">Output:</span> [0,1]
          </div>
        </div>
      </div>

      {/* Editor & Terminal Panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Editor Actions */}
        <div className="h-14 bg-[#1e1e1e] border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
          <div className="flex gap-2 text-sm text-muted-foreground font-mono">
            <span className="bg-slate-800 px-3 py-1 rounded text-slate-200">javascript</span>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setCode("function solve() {\n\n}\n")} className="bg-slate-800 text-slate-300 hover:bg-slate-700 border-none">
               <RefreshCw className="w-4 h-4 mr-2" /> Reset
            </Button>
            <Button size="sm" onClick={runCode} disabled={isRunning} className="bg-emerald-600 hover:bg-emerald-700 text-white border-none">
              {isRunning ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              Run Code
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white border-none" disabled>
               Submit <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Text Area Code Editor */}
        <div className="flex-1 bg-[#1e1e1e] p-4 relative">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full bg-transparent text-slate-300 font-mono text-sm resize-none focus:outline-none leading-relaxed"
            spellCheck="false"
          />
        </div>

        {/* Terminal Output */}
        <div className="h-1/3 bg-[#0d0d0d] border-t border-slate-800 flex flex-col shrink-0">
          <div className="px-4 py-2 bg-[#1e1e1e] border-b border-slate-800 text-xs font-mono text-muted-foreground uppercase flex items-center tracking-wider">
            Terminal Output
          </div>
          <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
            {output ? (
              <pre className={output.startsWith("Error:") ? "text-rose-400" : "text-emerald-400"}>
                {output}
              </pre>
            ) : (
              <div className="text-muted-foreground italic">Click 'Run Code' to see console output here...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
