"use client";
import { useState, useRef, useEffect } from "react";

import { Bug, X, ChevronDown, Maximize2, Activity, Circle, Copy, Check, Brain, Wifi, WifiOff } from 'lucide-react';
import DeepSeekIcon from '@/components/DeepSeekIcon';

interface LogEntry { time: string; type: "info"|"warn"|"error"|"api"; message: string; }
interface ApiCall { id: number; time: string; method: string; url: string; status: number|"pending"|"error"; duration: number|null; preview: string; }
interface AiTrace { id: number; time: string; input: string; parsed: { title: string; description: string; priority: string }; source: "deepseek"|"local"; duration: number; steps: string[]; }

let apiId = 0;
let traceId = 0;
const LS_KEY = "debugpanel_state";

function loadState() {
  if (typeof window === "undefined") return null;
  try { const s = localStorage.getItem(LS_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}
function saveState(state: any) { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {} }

export default function DebugPanel() {
  const saved = loadState();
  const [open, setOpen] = useState(saved?.open ?? true);
  const [minimized, setMinimized] = useState(saved?.minimized ?? false);
  const [tab, setTab] = useState<"logs"|"api"|"ai">(saved?.tab ?? "logs");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([]);
  const [aiTraces, setAiTraces] = useState<AiTrace[]>([]);
  const [envVars, setEnvVars] = useState<Record<string,string>>({});
  const [position, setPosition] = useState(saved?.position ?? { x: typeof window!=="undefined"?window.innerWidth-420:100, y: 80 });
  const [size, setSize] = useState(saved?.size ?? { w: 400, h: 440 });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [preMinPos, setPreMinPos] = useState(saved?.preMinPos ?? { x: position.x, y: position.y });
  const [copiedTraceId, setCopiedTraceId] = useState<number | null>(null);
  const [dsOnline, setDsOnline] = useState<boolean | null>(null);
  const [dsChecked, setDsChecked] = useState("");

  const panelRef = useRef<HTMLDivElement>(null);
  const offset = useRef({x:0,y:0});
  const dragPos = useRef({x:0,y:0});
  const resizeStart = useRef({x:0,y:0,w:0,h:0});

  useEffect(() => { saveState({ open, minimized, tab, position, size, preMinPos }); }, [open, minimized, tab, position, size, preMinPos]);

  useEffect(() => {
    const checkDS = async () => { try { const r = await fetch('/api/deepseek-status'); const j = await r.json(); setDsOnline(j.online); setDsChecked(new Date().toLocaleTimeString()); } catch { setDsOnline(false); setDsChecked(new Date().toLocaleTimeString()); } };
    checkDS();
    const interval = setInterval(checkDS, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch("/api/debug").then(r=>r.json()).then(setEnvVars);
    const origLog=console.log, origWarn=console.warn, origErr=console.error;
    const add=(type:LogEntry["type"],args:any[])=>{setTimeout(()=>setLogs(p=>[...p.slice(-99),{time:new Date().toLocaleTimeString(),type,message:args.map(String).join(" ")}]),0)};
    console.log=(...a)=>{origLog(...a);add("info",a)};
    console.warn=(...a)=>{origWarn(...a);add("warn",a)};
    console.error=(...a)=>{origErr(...a);add("error",a)};
    const origFetch=window.fetch;
    window.fetch=async(...args:any[])=>{
      const id=++apiId,start=performance.now(),url=args[0],options=args[1],method=options?.method||"GET";
      const call:ApiCall={id,time:new Date().toLocaleTimeString(),method,url:typeof url==="string"?url:url.toString(),status:"pending",duration:null,preview:""};
      setApiCalls(p=>[call,...p.slice(0,19)]);
      try{
        const res=await origFetch(...args as [input: RequestInfo | URL, init?: RequestInit]);
        const dur=Math.round(performance.now()-start),clone=res.clone();
        let preview="";try{preview=(await clone.text()).slice(0,120)}catch{}
        setApiCalls(p=>p.map(c=>c.id===id?{...c,status:res.status,duration:dur,preview}:c));
        setTimeout(()=>add("api",[method+" "+url+" \u2192 "+res.status+" ("+dur+"ms)"]),0);
        if (url.includes("/api/chat") && method === "POST" && res.status === 200) {
          try {
            const body = JSON.parse(options?.body || "{}");
            const clone2 = res.clone();
            const json = await clone2.json();
            const input = body.message || "";
            const reply = json.reply || "";
            const titleMatch = reply.match(/\*\*(.+?)\*\*/);
            const descMatch = reply.match(/📋 (.+)/);
            const priMatch = reply.match(/🔴 Priority: (\w+)/);
            setAiTraces(p => [{ id: ++traceId, time: new Date().toLocaleTimeString(), input: input.slice(0, 80), parsed: { title: titleMatch?.[1] || input.slice(0, 40), description: descMatch?.[1] || "", priority: priMatch?.[1] || "medium" }, source: dur < 300 ? "local" : "deepseek", duration: dur, steps: json.steps || [] }, ...p.slice(0, 9)]);
          } catch {}
        }
        return res;
      }catch(e:any){
        const dur=Math.round(performance.now()-start);
        setApiCalls(p=>p.map(c=>c.id===id?{...c,status:"error",duration:dur,preview:e.message}:c));
        setTimeout(()=>add("error",[method+" "+url+" \u2192 ERROR: "+e.message]),0);
        throw e;
      }
    };
    return ()=>{console.log=origLog;console.warn=origWarn;console.error=origErr;window.fetch=origFetch};
  },[]);

  const copyLogs = () => { const text = logs.map(l => `[${l.time}] [${l.type}] ${l.message}`).join("\n"); navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const copyTrace = (t: AiTrace) => { const text = `AI Trace ${t.time}\nInput: ${t.input}\nSource: ${t.source} (${t.duration}ms)\nTitle: ${t.parsed.title}\nDescription: ${t.parsed.description || "—"}\nPriority: ${t.parsed.priority}\nLogic Steps:\n${t.steps.map(s => "▸ "+s).join("\n")}`; navigator.clipboard.writeText(text); setCopiedTraceId(t.id); setTimeout(()=>setCopiedTraceId(null),2000); };

  const onMD = (e: React.MouseEvent) => { if (resizing) return; e.preventDefault(); setDragging(true); const rect = panelRef.current?.getBoundingClientRect(); if (rect) { offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }; dragPos.current = { x: rect.left, y: rect.top }; } };
  const onRD = (e: React.MouseEvent) => { e.stopPropagation(); setResizing(true); resizeStart.current = { x: e.clientX, y: e.clientY, w: size.w, h: size.h }; };

  useEffect(() => {
    const mv = (e: MouseEvent) => {
      if (dragging) { const nx = e.clientX - offset.current.x; const ny = e.clientY - offset.current.y; if (panelRef.current) { panelRef.current.style.left = nx + "px"; panelRef.current.style.top = ny + "px"; } dragPos.current = { x: nx, y: ny }; }
      if (resizing) { const nw = Math.max(320, resizeStart.current.w + e.clientX - resizeStart.current.x); const nh = Math.max(240, resizeStart.current.h + e.clientY - resizeStart.current.y); if (panelRef.current) { panelRef.current.style.width = nw + "px"; panelRef.current.style.height = nh + "px"; } setSize({ w: nw, h: nh }); }
    };
    const up = () => { if (dragging) { setDragging(false); setPosition({ ...dragPos.current }); } if (resizing) { setResizing(false); } };
    window.addEventListener("mousemove", mv); window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); };
  }, [dragging, resizing]);

  const toggleMinimize = () => {
    if (!minimized) { setPreMinPos({ x: position.x, y: position.y }); }
    else { const maxY = window.innerHeight - 100; if (preMinPos.y > maxY) { setPosition({ x: window.innerWidth - 420, y: 80 }); } else { setPosition({ x: preMinPos.x, y: preMinPos.y }); } }
    setMinimized(!minimized);
  };

  if(!open) return <button onClick={()=>setOpen(true)} className="fixed bottom-4 right-4 z-[9999] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-2 rounded-full shadow-lg"><Bug size={18}/></button>;

  const sc=(s:number|string)=>{if(s==="pending")return"text-yellow-400";if(s==="error")return"text-red-400";if(typeof s==="number"&&s>=400)return"text-red-400";if(typeof s==="number"&&s>=200)return"text-green-400";return"text-zinc-400"};
  const priorityColor = (p: string) => p === "high" ? "text-red-400" : p === "medium" ? "text-yellow-400" : "text-green-400";

  return (
    <div ref={panelRef} style={minimized ? { bottom:0, left:"50%", transform:"translateX(-50%)", width: typeof window !== "undefined" && window.innerWidth < 640 ? window.innerWidth : size.w, height:40 } : { left:position.x, top:position.y, width: typeof window !== "undefined" && window.innerWidth < 640 ? window.innerWidth : size.w, height:size.h }} className="fixed z-[9999] bg-zinc-900/95 backdrop-blur border border-zinc-700 rounded-xl shadow-2xl flex flex-col overflow-hidden text-xs font-mono transition-all duration-300">
      <div onMouseDown={onMD} onDoubleClick={toggleMinimize} className="flex items-center justify-between px-3 py-2 bg-zinc-800 cursor-move shrink-0">
        <span className="font-medium text-zinc-400 flex items-center gap-2"><Bug size={14}/>Debug {dsOnline !== null && (<span className={`flex items-center gap-1 text-[10px] ${dsOnline ? "text-green-400" : "text-red-400"}`} title={`DeepSeek ${dsOnline ? "online" : "offline"} · ${dsChecked}`}><DeepSeekIcon size={12} />{!minimized && (dsOnline ? " DS up" : " DS down")}</span>)}</span>
        <div className="flex items-center gap-1"><button onClick={toggleMinimize} className="text-zinc-500 hover:text-white"><ChevronDown size={14} className={`transition-transform duration-200 ${minimized ? "rotate-180" : ""}`} /></button><button onClick={()=>setOpen(false)} className="text-zinc-500 hover:text-white"><X size={14}/></button></div>
      </div>
      {!minimized&&(<>
        <div className="flex border-b border-zinc-800 shrink-0"><button onClick={()=>setTab("logs")} className={`flex-1 py-1.5 text-center ${tab==="logs"?"bg-zinc-800 text-white":"text-zinc-500 hover:text-zinc-300"}`}>Logs</button><button onClick={()=>setTab("api")} className={`flex-1 py-1.5 text-center flex items-center justify-center gap-1 ${tab==="api"?"bg-zinc-800 text-white":"text-zinc-500 hover:text-zinc-300"}`}><Activity size={12}/>API ({apiCalls.length})</button><button onClick={()=>setTab("ai")} className={`flex-1 py-1.5 text-center flex items-center justify-center gap-1 ${tab==="ai"?"bg-zinc-800 text-white":"text-zinc-500 hover:text-zinc-300"}`}><Brain size={12}/>AI ({aiTraces.length})</button></div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 select-text">
          {tab==="logs"&&(<><div className="flex items-center justify-between px-1 mb-1"><span className="text-zinc-600 truncate text-[10px]">{Object.entries(envVars).filter(([k])=>k!=="allKeys").map(([k,v])=>`${k}=${String(v)}`).join(" | ")||"loading..."}</span><button onClick={copyLogs} className="flex items-center gap-1 text-zinc-500 hover:text-white shrink-0 ml-2">{copied?<Check size={12} className="text-green-400"/>:<Copy size={12}/>}</button></div>{logs.map((l,i)=>(<div key={i} className={`px-1 select-text ${l.type==="error"?"text-red-400":l.type==="warn"?"text-yellow-400":l.type==="api"?"text-cyan-400":"text-zinc-400"}`}><span className="text-zinc-600">[{l.time}]</span> {l.message}</div>))}</>)}
          {tab==="api"&&apiCalls.map(c=>(<div key={c.id} className="bg-zinc-800/50 rounded px-2 py-1 select-text"><div className="flex items-center gap-2"><Circle size={8} className={sc(c.status)}/><span className="text-zinc-500">{c.time}</span><span className="text-blue-400 font-semibold">{c.method}</span><span className="text-zinc-300 truncate">{c.url}</span><span className={sc(c.status)}>{c.status}{c.duration?` (${c.duration}ms)`:""}</span></div>{c.preview&&<div className="text-zinc-500 truncate mt-0.5 pl-5 select-text">{c.preview}</div>}</div>))}
          {tab==="ai"&&(aiTraces.length===0?<div className="text-zinc-600 text-center py-8">No AI traces yet.</div>:aiTraces.map(t=>(<div key={t.id} className="bg-zinc-800/50 rounded-lg px-3 py-2 select-text border border-zinc-700/50 relative group"><button onClick={()=>copyTrace(t)} className="absolute top-2 right-2 p-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-white transition" title="Copy trace">{copiedTraceId===t.id?<Check size={12} className="text-green-400"/>:<Copy size={12}/>}</button><div className="flex items-center justify-between mb-1.5"><span className="text-zinc-500 text-[10px]">{t.time}</span><span className={`text-[10px] px-1.5 py-0.5 rounded-full ${t.source==="deepseek"?"bg-green-900/40 text-green-300":"bg-zinc-700 text-zinc-400"}`}>{t.source}</span><span className="text-zinc-600 text-[10px]">{t.duration}ms</span></div><div className="text-zinc-500 text-[10px] mb-1.5 truncate pr-6">Input: <span className="text-zinc-400">"{t.input}"</span></div><div className="grid grid-cols-3 gap-1.5"><div className="bg-zinc-900/50 rounded px-2 py-1"><div className="text-zinc-600 text-[9px] uppercase tracking-wider mb-0.5">Title</div><div className="text-zinc-300 text-[10px] truncate">{t.parsed.title}</div></div><div className="bg-zinc-900/50 rounded px-2 py-1"><div className="text-zinc-600 text-[9px] uppercase tracking-wider mb-0.5">Desc</div><div className="text-zinc-300 text-[10px] truncate">{t.parsed.description||"—"}</div></div><div className="bg-zinc-900/50 rounded px-2 py-1"><div className="text-zinc-600 text-[9px] uppercase tracking-wider mb-0.5">Priority</div><div className={`text-[10px] font-semibold ${priorityColor(t.parsed.priority)}`}>{t.parsed.priority}</div></div></div>{t.steps.length>0&&(<div className="mt-2 pt-2 border-t border-zinc-700/50"><div className="text-zinc-600 text-[9px] uppercase tracking-wider mb-1">🧠 Logic Trace</div>{t.steps.map((s,i)=>(<div key={i} className="text-zinc-500 text-[9px] flex items-start gap-1 leading-relaxed"><span className="text-zinc-700 shrink-0">▸</span> {s}</div>))}</div>)}</div>)))}
        </div>
      </>)}
      <div onMouseDown={onRD} className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize text-zinc-600 hover:text-zinc-400 flex items-end justify-end pb-0.5 pr-0.5"><Maximize2 size={12} className="rotate-90"/></div>
    </div>
  );
}