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
    <div className="flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden bg-background">
      {/* Header with title and actions */}
      <div className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-foreground capitalize">{id.replace(/-/g, " ")}</h2>
          <span className="text-sm text-muted-foreground">JavaScript</span>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCode("function solve() {\n\n}\n")}
            className="rounded-lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Reset
          </Button>
          <Button 
            size="sm" 
            onClick={runCode} 
            disabled={isRunning}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
          >
            {isRunning ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            Run Code
          </Button>
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg" 
            disabled
          >
            Submit <CheckCircle2 className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden gap-0">
        {/* Problem Description Panel - Hidden on mobile */}
        <div className="w-1/3 bg-muted border-r border-border flex-col hidden lg:flex overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/50 shrink-0">
            <h3 className="font-semibold text-foreground">Problem Description</h3>
          </div>
          <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">
            <p className="text-sm text-foreground leading-relaxed">
              {problemText}
            </p>
            <div className="bg-card p-3 rounded-lg border border-border font-mono text-xs text-muted-foreground space-y-1">
              <p className="text-muted-foreground">// Example 1:</p>
              <p><span className="text-blue-500">Input:</span> nums = [2,7,11,15], target = 9</p>
              <p><span className="text-green-500">Output:</span> [0,1]</p>
            </div>
          </div>
        </div>

        {/* Editor & Output Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Code Editor */}
          <div className="flex-1 bg-[#1e1e1e] p-4 relative overflow-hidden">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-transparent text-slate-300 font-mono text-sm resize-none focus:outline-none leading-relaxed"
              spellCheck="false"
              placeholder="function solve() {&#10;  // Write your solution here&#10;}"
            />
          </div>

          {/* Terminal Output Panel */}
          <div className="h-1/3 bg-[#0d0d0d] border-t border-slate-800 flex flex-col shrink-0 overflow-hidden">
            <div className="px-4 py-2 bg-[#1e1e1e] border-b border-slate-800 text-xs font-mono text-muted-foreground uppercase flex items-center tracking-wider shrink-0">
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
    </div>
  );
}
