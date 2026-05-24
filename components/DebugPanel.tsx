"use client";
import { useState, useRef, useEffect } from "react";
import { Bug, X, ChevronDown, Activity, Circle, Copy, Check, Brain } from "lucide-react";
import DeepSeekIcon from "@/components/DeepSeekIcon";

interface LogEntry { time: string; type: "info"|"warn"|"error"|"api"; message: string; }
interface ApiCall { id: number; time: string; method: string; url: string; status: number|"pending"|"error"; duration: number|null; preview: string; }
interface AiTrace { id: number; time: string; input: string; parsed: { title: string; description: string; priority: string }; source: "deepseek"|"local"; duration: number; steps: string[]; }

let apiId = 0; let traceId = 0;

export default function DebugPanel() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [tab, setTab] = useState<"logs"|"api"|"ai">("logs");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([]);
  const [aiTraces, setAiTraces] = useState<AiTrace[]>([]);
  const [envVars, setEnvVars] = useState<Record<string,string>>({});
  const [size, setSize] = useState({ w: 400, h: 440 });
  const [copied, setCopied] = useState(false);
  const [copiedTraceId, setCopiedTraceId] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, left: 0, top: 0 });

  useEffect(() => {
    const handler = (e: any) => setOpen(e.detail);
    window.addEventListener("toggle-debug", handler);
    return () => window.removeEventListener("toggle-debug", handler);
  }, []);

  useEffect(() => {
    fetch("/api/debug").then(r=>r.json()).then(setEnvVars);
    const origLog=console.log, origWarn=console.warn, origErr=console.error;
    const add=(type:LogEntry["type"],args:any[])=>{setTimeout(()=>setLogs(p=>[...p.slice(-99),{time:new Date().toLocaleTimeString(),type,message:args.map(String).join(" ")}]),0)};
    console.log=(...a)=>{origLog(...a);add("info",a)}; console.warn=(...a)=>{origWarn(...a);add("warn",a)}; console.error=(...a)=>{origErr(...a);add("error",a)};
    const origFetch=window.fetch;
    window.fetch=async(...args:any[])=>{
      const id=++apiId,start=performance.now(),url=args[0],options=args[1],method=options?.method||"GET";
      setApiCalls(p=>[{id,time:new Date().toLocaleTimeString(),method,url:typeof url==="string"?url:url.toString(),status:"pending",duration:null,preview:""},...p.slice(0,19)]);
      try{
        const res=await origFetch(url as any,options as any); const dur=Math.round(performance.now()-start),clone=res.clone();
        let preview="";try{preview=(await clone.text()).slice(0,120)}catch{}
        setApiCalls(p=>p.map(c=>c.id===id?{...c,status:res.status,duration:dur,preview}:c));
        setTimeout(()=>add("api",[method+" "+url+" \u2192 "+res.status+" ("+dur+"ms)"]),0);
        if (url.includes("/api/chat") && method==="POST" && res.status===200) {
          try {
            const body=JSON.parse(options?.body||"{}"), clone2=res.clone(), json=await clone2.json();
            const input=body.message||"", reply=json.reply||"";
            setAiTraces(p=>[{id:++traceId,time:new Date().toLocaleTimeString(),input:input.slice(0,80),parsed:{title:(reply.match(/\*\*(.+?)\*\*/)||[])[1]||input.slice(0,40),description:(reply.match(/📋 (.+)/)||[])[1]||"",priority:(reply.match(/🔴 Priority: (\w+)/)||[])[1]||"medium"},source:dur<300?"local":"deepseek",duration:dur,steps:json.steps||[]},...p.slice(0,9)]);
          } catch {}
        }
        return res;
      }catch(e:any){setApiCalls(p=>p.map(c=>c.id===id?{...c,status:"error",duration:Math.round(performance.now()-start),preview:e.message}:c)); throw e;}
    };
    return ()=>{console.log=origLog;console.warn=origWarn;console.error=origErr;window.fetch=origFetch};
  },[]);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, left: rect.left, top: rect.top };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current.dragging) return;
      panel.style.left = (dragRef.current.left + ev.clientX - dragRef.current.startX) + "px";
      panel.style.top = (dragRef.current.top + ev.clientY - dragRef.current.startY) + "px";
    };
    const onUp = () => { dragRef.current.dragging = false; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const copyLogs = () => { const text = logs.map(l => `[${l.time}] [${l.type}] ${l.message}`).join("\n"); navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const copyTrace = (t: AiTrace) => { navigator.clipboard.writeText(`AI Trace ${t.time}\nInput: ${t.input}\nSource: ${t.source}\nTitle: ${t.parsed.title}\nDesc: ${t.parsed.description}\nPriority: ${t.parsed.priority}\nSteps:\n${t.steps.map(s=>"▸ "+s).join("\n")}`); setCopiedTraceId(t.id); setTimeout(()=>setCopiedTraceId(null),2000); };

  if(!open) return <button onClick={()=>setOpen(true)} className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-2.5 rounded-full shadow-lg"><Bug size={18}/></button>;

  const sc=(s:number|string)=>{if(s==="pending")return"text-yellow-400";if(s==="error")return"text-red-400";if(typeof s==="number"&&s>=400)return"text-red-400";if(typeof s==="number"&&s>=200)return"text-green-400";return"text-zinc-400"};
  const priorityColor = (p: string) => p==="high"?"text-red-400":p==="medium"?"text-yellow-400":"text-green-400";

  return (
    <div ref={panelRef} style={minimized?{bottom:0,left:"50%",transform:"translateX(-50%)",width:400,height:40}:{right:0,bottom:0,width:size.w,height:size.h}} className="fixed z-[9999] bg-zinc-900/95 backdrop-blur border border-zinc-700 rounded-xl shadow-2xl flex flex-col overflow-hidden text-xs font-mono">
      <div onMouseDown={onMouseDown} className="flex items-center justify-between px-3 py-2 bg-zinc-800 cursor-move shrink-0 select-none">
        <span className="font-medium text-zinc-400 flex items-center gap-2"><Bug size={14}/>Debug</span>
        <div className="flex items-center gap-1">
          <button onClick={()=>setMinimized(!minimized)} className="text-zinc-500 hover:text-white"><ChevronDown size={14} className={`transition-transform duration-200 ${minimized?"rotate-180":""}`}/></button>
          <button onClick={()=>setOpen(false)} className="text-zinc-500 hover:text-white"><X size={14}/></button>
        </div>
      </div>
      {!minimized&&(<>
        <div className="flex border-b border-zinc-800 shrink-0">
          <button onClick={()=>setTab("logs")} className={`flex-1 py-1.5 text-center ${tab==="logs"?"bg-zinc-800 text-white":"text-zinc-500 hover:text-zinc-300"}`}>Logs</button>
          <button onClick={()=>setTab("api")} className={`flex-1 py-1.5 text-center flex items-center justify-center gap-1 ${tab==="api"?"bg-zinc-800 text-white":"text-zinc-500 hover:text-zinc-300"}`}><Activity size={12}/>API</button>
          <button onClick={()=>setTab("ai")} className={`flex-1 py-1.5 text-center flex items-center justify-center gap-1 ${tab==="ai"?"bg-zinc-800 text-white":"text-zinc-500 hover:text-zinc-300"}`}><Brain size={12}/>AI</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 select-text">
          {tab==="logs"&&(<><div className="flex items-center justify-between px-1 mb-1"><span className="text-zinc-600 truncate text-[10px]">{Object.entries(envVars).filter(([k])=>k!=="allKeys").map(([k,v])=>`${k}=${v}`).join(" | ")||"..."}</span><button onClick={copyLogs} className="text-zinc-500 hover:text-white">{copied?<Check size={12} className="text-green-400"/>:<Copy size={12}/>}</button></div>{logs.map((l,i)=>(<div key={i} className={`px-1 ${l.type==="error"?"text-red-400":l.type==="warn"?"text-yellow-400":l.type==="api"?"text-cyan-400":"text-zinc-400"}`}><span className="text-zinc-600">[{l.time}]</span> {l.message}</div>))}</>)}
          {tab==="api"&&apiCalls.map(c=>(<div key={c.id} className="bg-zinc-800/50 rounded px-2 py-1"><div className="flex items-center gap-2"><Circle size={8} className={sc(c.status)}/><span className="text-zinc-500">{c.time}</span><span className="text-blue-400">{c.method}</span><span className="text-zinc-300 truncate">{c.url}</span><span className={sc(c.status)}>{c.status}{c.duration?` (${c.duration}ms)`:""}</span></div>{c.preview&&<div className="text-zinc-500 truncate mt-0.5 pl-5">{c.preview}</div>}</div>))}
          {tab==="ai"&&(aiTraces.length===0?<div className="text-zinc-600 text-center py-8">No AI traces yet.</div>:aiTraces.map(t=>(<div key={t.id} className="bg-zinc-800/50 rounded-lg px-3 py-2 border border-zinc-700/50 relative"><button onClick={()=>copyTrace(t)} className="absolute top-2 right-2 p-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-white">{copiedTraceId===t.id?<Check size={12} className="text-green-400"/>:<Copy size={12}/>}</button><div className="flex items-center justify-between mb-1.5"><span className="text-zinc-500 text-[10px]">{t.time}</span><span className={`text-[10px] px-1.5 py-0.5 rounded-full ${t.source==="deepseek"?"bg-green-900/40 text-green-300":"bg-zinc-700 text-zinc-400"}`}>{t.source}</span><span className="text-zinc-600 text-[10px]">{t.duration}ms</span></div><div className="text-zinc-500 text-[10px] mb-1.5 truncate pr-6">Input: <span className="text-zinc-400">"{t.input}"</span></div><div className="grid grid-cols-3 gap-1.5"><div className="bg-zinc-900/50 rounded px-2 py-1"><div className="text-zinc-600 text-[9px] uppercase">Title</div><div className="text-zinc-300 text-[10px] truncate">{t.parsed.title}</div></div><div className="bg-zinc-900/50 rounded px-2 py-1"><div className="text-zinc-600 text-[9px] uppercase">Desc</div><div className="text-zinc-300 text-[10px] truncate">{t.parsed.description||"—"}</div></div><div className="bg-zinc-900/50 rounded px-2 py-1"><div className="text-zinc-600 text-[9px] uppercase">Priority</div><div className={`text-[10px] font-semibold ${priorityColor(t.parsed.priority)}`}>{t.parsed.priority}</div></div></div>{t.steps.length>0&&(<div className="mt-2 pt-2 border-t border-zinc-700/50"><div className="text-zinc-600 text-[9px] uppercase mb-1">🧠 Logic Trace</div>{t.steps.map((s,i)=>(<div key={i} className="text-zinc-500 text-[9px] flex items-start gap-1"><span className="text-zinc-700">▸</span>{s}</div>))}</div>)}</div>)))}
        </div>
      </>)}
    </div>
  );
}