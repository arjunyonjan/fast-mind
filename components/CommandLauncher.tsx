"use client";
import { useState, useRef, useEffect } from "react";
import { Play, X, Terminal, Copy, Check, Loader2 } from "lucide-react";

export default function CommandLauncher() {
  const [open, setOpen] = useState(false);
  const [cmd, setCmd] = useState("");
  const [output, setOutput] = useState("");
  const [activeWs, setActiveWs] = useState<WebSocket | null>(null); const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [output]);

  const cancelRun = () => {
  if (activeWs) {
    activeWs.close();
    setOutput(prev => prev + "\n🛑 Cancelled\n");
    setRunning(false);
    setActiveWs(null);
  }
};

const runCommand = async () => {
    if (!cmd.trim() || running) return;

    // Navigation commands: route through chat API instead of shell
    if (/^(open|show|go to|navigate|view)\s/i.test(cmd.trim())) {
      setRunning(true);
      setOutput("⏳ Processing...");
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: cmd, messages: [] }),
        });
        const data = await res.json();
        if (data.redirect) { window.location.href = data.redirect; return; }
        setOutput(data.reply || "Done.");
      } catch { setOutput("❌ Error"); }
      setRunning(false);
      return;
    }

    setRunning(true);
    setOutput("");
    
    const ws = new WebSocket("ws://localhost:3001");
    
    setActiveWs(ws); ws.onopen = () => {
      ws.send(JSON.stringify({ command: cmd, cwd: "C:\\work\\next-fastmind" }));
    };
    
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "output") {
          setOutput(prev => prev + data.data);
        } else if (data.type === "heartbeat") {
          setOutput(prev => prev + "[⏳] " + data.data + "\n");
        } else if (data.type === "done") {
          setOutput(prev => prev + "\n✅ " + data.data);
          setRunning(false);
          ws.close();
        }
      } catch {
        setOutput(prev => prev + "[Parse error]\n");
      }
    };
    
    ws.onerror = () => {
      setOutput("❌ Server offline. Run: node terminal-server.js");
      setRunning(false);
    };
    
    ws.onclose = () => { setActiveWs(null);
      setRunning(false);
    };
  };

const dumpCode = () => {
  const dumpCmd = `powershell -Command "$files = Get-ChildItem -Recurse -Include *.ts,*.tsx,*.js,*.jsx,*.css,*.json | Where-Object {$_.FullName -notmatch 'node_modules|\\.next|\\.git'}; $total = $files.Count; $i = 0; $output = @(); foreach ($file in $files) { $i++; $percent = [math]::Round(($i / $total) * 100); Write-Host \\"[PROGRESS] $percent% - $($file.Name)\\; [Console]::Out.Flush(); $output += \\"=== $($file.FullName) ===\\"; $output += Get-Content $file.FullName -Raw; $output += \\"\\" }; $filename = \\"code-dump-\\" + (Get-Date -Format 'yyyy-MM-dd_HH-mm-ss') + \\".txt\\"; $output | Out-File -FilePath $filename -Encoding utf8; Write-Host \\"[DONE] Saved $total files to $filename\\""`;
  setCmd(dumpCmd);
};

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70" onClick={() => setOpen(false)}>
      <div className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl w-full max-w-3xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Terminal size={16} className="text-cyan-600 dark:text-cyan-400" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Command Launcher</span><span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 font-mono">LOCAL ONLY</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-500">Ctrl+K</span>
          </div>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setCmd("npm run dev")} className="px-3 py-1 text-xs bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg text-gray-700 dark:text-zinc-300">🚀 Dev</button>
            <button onClick={() => setCmd("npm run build")} className="px-3 py-1 text-xs bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg text-gray-700 dark:text-zinc-300">📦 Build</button>
            <button onClick={() => setCmd("git add .; git commit -m update; git push")} className="px-3 py-1 text-xs bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg text-gray-700 dark:text-zinc-300">📤 Git Push</button>
            <button onClick={dumpCode} className="px-3 py-1 text-xs bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg text-gray-700 dark:text-zinc-300">📦 Dump Code</button>
          </div>
          <textarea value={cmd} onChange={e => setCmd(e.target.value)} placeholder="Enter command..." className="w-full h-24 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg p-3 text-sm font-mono resize-none focus:border-cyan-500 text-gray-900 dark:text-white" />
          <div className="flex gap-2">
  <button onClick={runCommand} disabled={running || !cmd.trim()} className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 rounded-lg text-white font-medium flex items-center justify-center gap-2">
    {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
    {running ? "Running..." : "Run Command"}
  </button>
  <button onClick={cancelRun} disabled={!running} className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg text-white font-medium">
    Cancel
  </button>
</div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500 dark:text-zinc-500">Output</span>
              {output && (
                <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-white flex gap-1 items-center">
                  {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            <pre ref={outputRef} className="bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg p-3 text-xs text-gray-700 dark:text-zinc-400 font-mono h-64 overflow-auto whitespace-pre-wrap">
              {output || (running ? "⏳ Connecting..." : "💡 Run a command to see output")}
            </pre>
          </div>
          <div className="text-[9px] text-gray-400 dark:text-zinc-600 text-center border-t border-gray-200 dark:border-zinc-800 pt-2">
            ✅ npm, git, cd, dir | ⛔ rm -rf, del /f, format, shutdown
          </div>
        </div>
      </div>
    </div>
  );
}