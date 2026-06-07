"use client";
import { useState, useEffect, useRef } from "react";
import { Play, X, Zap, Copy, Check, Loader2, Terminal } from "lucide-react";

export default function CommandLauncher() {
  const [open, setOpen] = useState(false);
  const [cmd, setCmd] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false); const [wsStatus, setWsStatus] = useState<"checking"|"online"|"offline">("checking");
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
  }, [open]); useEffect(() => { const checkWs = async () => { try { const ws = new WebSocket("ws://localhost:3001"); let connected = false; ws.onopen = () => { if (!connected) { connected = true; setWsStatus("online"); setTimeout(() => ws.close(), 100); } }; ws.onerror = () => { if (!connected) setWsStatus("offline"); }; setTimeout(() => { if (ws.readyState !== WebSocket.OPEN && !connected) setWsStatus("offline"); }, 500); } catch { setWsStatus("offline"); } }; checkWs(); const interval = setInterval(checkWs, 5000); return () => clearInterval(interval); }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const blockedFrontend = ["rm -rf", "del /f", "format", "shutdown", "taskkill", "rd /s"]; const run = (command: string) => { if (blockedFrontend.some(b => command.toLowerCase().includes(b))) { setOutput("⛔ BLOCKED: Dangerous command not allowed"); setRunning(false); return; }
    const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    if (!isLocal) {
        setOutput("⚠️ Terminal only available in local development (localhost). Running on Vercel? Use localhost:3000 instead.");
        return;
    }
    if (!command.trim()) return;
    setRunning(true);
    setOutput("");
    
    const ws = new WebSocket("ws://localhost:3001");
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ command, cwd: "C:\\work\\next-fastmind" }));
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
      } catch (err) {
        setOutput(prev => prev + "[⚠️ Parse error]\n");
      }
    };
    
    ws.onerror = () => {
      setOutput("❌ WebSocket connection failed. Run: node terminal-server.js");
      setRunning(false);
    };
    
    ws.onclose = () => setRunning(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70" onClick={() => setOpen(false)}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-3xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-cyan-400" />
            <span className="text-sm font-semibold text-white">Command Launcher</span>
            <span className="text-xs text-zinc-500">Ctrl+K</span><div className="text-[9px] text-zinc-600 mt-1">✅ npm, git, cd, dir, node, python, echo | ⛔ rm -rf, del /f, format, shutdown, taskkill</div>{wsStatus === "offline" && <span className="ml-2 text-xs text-red-400"><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 mr-1.5 shadow-sm"></span><span>⚠️ Terminal offline - run: node terminal-server.js</span> - run: node terminal-server.js</span>}{wsStatus === "checking" && <span className="ml-2 text-xs text-yellow-500">⏳ Checking terminal...</span>}{wsStatus === "online" && <span className="ml-2 text-xs text-green-500"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-sm shadow-green-400"></div><span className="text-green-400 text-xs">Terminal OK</span></div></span>}
          </div>
          <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "Dev Server", cmd: "npm run dev" },
              { label: "Build", cmd: "npm run build" },
              { label: "Git Push", cmd: "git add .; git commit -m update; git push" }
            ].map(p => (
              <button key={p.label} onClick={() => setCmd(p.cmd)} className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg">
                {p.label}
              </button>
            ))}
          </div>
          <textarea value={cmd} onChange={e => setCmd(e.target.value)} placeholder="Enter command..." className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 font-mono resize-none focus:outline-none focus:border-cyan-500" />
          <button onClick={() => run(cmd)} disabled={running || !cmd.trim()} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 rounded-lg text-white font-medium flex items-center justify-center gap-2">
            {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            {running ? "Running..." : "Run"}
          </button>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-zinc-500">Output</span>
              {output && (
                <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="text-xs text-zinc-500 hover:text-white flex gap-1 items-center">
                  {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            <pre ref={outputRef} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-400 font-mono h-64 overflow-auto whitespace-pre-wrap">
              {output || (running ? "⏳ Connecting to WebSocket..." : "Run a command to see output")}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}