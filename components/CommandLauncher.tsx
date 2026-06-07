"use client";
import { useState, useEffect } from "react";
import { Terminal, Play, X, Zap, Copy, Check } from "lucide-react";

const presets = [
  { label: "Dev Server", cmd: "cd C:\\work\\next-fastmind\nnpm run dev" },
  { label: "Git Push", cmd: "cd C:\\work\\next-fastmind\ngit add -A\ngit commit -m \"Update\"\ngit push origin main" },
  { label: "Build", cmd: "cd C:\\work\\next-fastmind\nnpm run build" },
  { label: "Auto-Dump On", cmd: "Start-Process powershell -ArgumentList '-WindowStyle Minimized -File C:\\work\\next-fastmind\\auto-dump.ps1'" },
];

export default function CommandLauncher() {
  const [open, setOpen] = useState(false);
  const [cmd, setCmd] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false); 

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setOpen(!open); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const run = async (command: string) => {
    setRunning(true); setOutput("");
    const lines = command.split("\n").filter(l => l.trim());
    let out = "";
    for (const line of lines) {
      out += "> " + line + "\n";
      try {
        const res = await fetch("/api/terminal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ command: line }) });
        const data = await res.json();
        out += (data.output || data.error || "Done.") + "\n";
      } catch (e: any) { out += "Error: " + e.message + "\n"; }
      setOutput(out);
    }
    setRunning(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <span className="text-sm font-semibold text-zinc-300 flex items-center gap-2"><Zap size={16} className="text-cyan-400" />Command Launcher</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-600">Ctrl+K to toggle</span>
            <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white"><X size={14} /></button>
          </div>
        </div>
        <div className="p-4">
          <div className="flex gap-2 mb-3 flex-wrap">
            {presets.map(p => (
              <button key={p.label} onClick={() => setCmd(p.cmd)} className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition">{p.label}</button>
            ))}
          </div>
          <textarea value={cmd} onChange={e => setCmd(e.target.value)} placeholder="Paste or type commands..." className="w-full h-28 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 font-mono resize-none outline-none focus:border-zinc-600" />
          <div className="flex gap-2 mt-3">
            <button onClick={() => run(cmd)} disabled={running || !cmd.trim()} className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm hover:bg-cyan-600 disabled:opacity-50 transition"><Play size={14} />{running ? "Running..." : "Run"}</button>
            <button onClick={() => { setCmd(""); setOutput(""); }} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition">Clear</button>
          </div>
          {output && <div className="relative"><button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="absolute top-2 right-2 p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition text-xs">{copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}</button><pre className="mt-3 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-400 font-mono max-h-48 overflow-y-auto whitespace-pre-wrap">{output}</pre></div>}
        </div>
      </div>
    </div>
  );
}