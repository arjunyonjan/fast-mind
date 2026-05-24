"use client";
import { useState, useEffect } from "react";
import { Brain, Droplets, X, Info } from "lucide-react";

interface SipLog { time: string; }

export default function BrainPanel() {
  const [open, setOpen] = useState(false);
  const [sips, setSips] = useState<SipLog[]>([]);
  const [lastSip, setLastSip] = useState<string | null>(null);
  const [minutesSince, setMinutesSince] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [vasodilationPercent, setVasodilationPercent] = useState(100);
  const [glymphaticPercent, setGlymphaticPercent] = useState(0);
  const [saving, setSaving] = useState(false);
  const [notified, setNotified] = useState(false);
  const [infoPopup, setInfoPopup] = useState<string | null>(null);

  useEffect(() => {
    if (Notification.permission === "default") Notification.requestPermission();
    const saved = localStorage.getItem("brain-sips");
    if (saved) { const p = JSON.parse(saved); setSips(p); if (p.length > 0) setLastSip(p[p.length - 1].time); }
  }, []);

  useEffect(() => {
    const i = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
      if (lastSip) {
        const diff = Math.floor((Date.now() - new Date(lastSip).getTime()) / 60000);
        setMinutesSince(diff);
        setGlymphaticPercent(Math.min(100, Math.max(0, 100 - diff * 2)));
        setVasodilationPercent(Math.min(100, Math.max(0, 100 - diff * 1.5)));
        if (diff >= 45 && !notified && Notification.permission === "granted") {
          new Notification("🧠 Warm Water Reminder", { body: "45 min since your last sip. Hydrate to boost glymphatic clearance." });
          setNotified(true);
        }
        if (diff < 45) setNotified(false);
      }
    }, 1000);
    return () => clearInterval(i);
  }, [lastSip, notified]);

  const logSip = () => {
    setSaving(true);
    setTimeout(() => {
      const now = new Date().toISOString();
      const u = [...sips, { time: now }]; setSips(u); setLastSip(now);
      localStorage.setItem("brain-sips", JSON.stringify(u));
      setSaving(false);
    }, 300);
  };

  const hour = new Date().getHours();
  const circadian = hour >= 6 && hour < 12 ? "MORNING" : hour >= 12 && hour < 18 ? "AFTERNOON" : hour >= 18 && hour < 22 ? "EVENING" : "NIGHT";

  const infoData: Record<string, { title: string; body: string }> = {
    vasodilation: { title: "Vasodilation", body: "Warm water triggers vasodilation — the widening of blood vessels. This increases cerebral blood flow, delivering more oxygen and glucose to your brain while accelerating waste removal." },
    glymphatic: { title: "Glymphatic Clearance", body: "The glymphatic system is your brain's waste-clearance network. Warm water boosts clearance by increasing blood flow and cerebrospinal fluid circulation." },
    circadian: { title: "Circadian Rhythm", body: "Your brain's 24-hour clock regulates sleep, focus, and hormone release. Aligning work with your circadian phase maximizes productivity." }
  };

  return (<>
    <button onClick={() => setOpen(true)} className="fixed bottom-4 right-4 z-[9998] p-2.5 rounded-full shadow-lg transition animate-pulse-glow bg-cyan-500 hover:bg-cyan-400" title="YOUR BRAIN"><Brain size={18} className="text-white" /></button>
    {open && (<div className="fixed inset-0 z-[9999] flex items-start justify-end pointer-events-none"><div className="pointer-events-auto w-72 max-sm:w-full h-full bg-zinc-900/95 backdrop-blur border-l border-zinc-800 shadow-2xl p-5 overflow-y-auto text-xs font-sans text-zinc-300">
      <div className="flex items-center justify-between mb-6"><h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2"><Brain size={16} className="text-purple-400" /> YOUR BRAIN</h2><button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white"><X size={14} /></button></div>
      <div className="space-y-4">

        

        <div className="bg-zinc-800 rounded-xl p-3"><div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div className="flex-1"><div className="text-zinc-400 text-[10px] uppercase font-semibold tracking-wider">Circadian Clock</div><div className="text-lg font-semibold text-cyan-400 tracking-wider">{currentTime}</div><div className="text-[10px] text-zinc-500 mt-0.5">{circadian} PHASE</div></div></div><div className="relative pt-2"><div className="absolute top-0 border-l-[6px] border-r-[6px] border-b-[7px] border-l-transparent border-r-transparent border-b-cyan-400 -translate-x-1/2" style={{ left: ((hour >= 6 ? hour - 6 : hour + 18) / 24 * 100) + "%" }} /><div className="w-full h-3 bg-zinc-700 rounded-full relative overflow-hidden"><div className="absolute inset-0 flex"><div className="w-1/4 bg-amber-500/20 border-r border-zinc-600" /><div className="w-1/4 bg-yellow-400/20 border-r border-zinc-600" /><div className="w-1/4 bg-indigo-500/20 border-r border-zinc-600" /><div className="w-1/4 bg-blue-500/20" /></div></div></div><div className="flex justify-between text-[9px] text-zinc-600 mt-1"><span>🌅 6 AM</span><span>☀️ NOON</span><span>🌙 6 PM</span><span>🌙 6 AM</span></div></div>

        <div className="bg-zinc-800 rounded-xl p-3"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${lastSip ? "bg-cyan-500/20" : "bg-zinc-700"}`}><Droplets size={18} className={lastSip ? "text-cyan-400" : "text-zinc-500"} /></div><div className="flex-1 min-w-0"><div className="text-zinc-400 text-[10px] uppercase font-semibold tracking-wider">Last Warm Water</div><div className="text-sm font-semibold text-zinc-200">{lastSip ? new Date(lastSip).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "Not logged"}</div><div className="flex items-center gap-1 text-[10px] mt-0.5"><span className={`w-1.5 h-1.5 rounded-full ${minutesSince < 20 ? "bg-green-400" : minutesSince < 45 ? "bg-yellow-400" : "bg-red-400"}`} />{minutesSince} min ago</div></div></div></div>

        <div className="bg-zinc-800 rounded-xl p-3"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${glymphaticPercent > 60 ? "bg-green-500/20" : glymphaticPercent > 30 ? "bg-yellow-500/20" : "bg-red-500/20"}`}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={glymphaticPercent > 60 ? "text-green-400" : glymphaticPercent > 30 ? "text-yellow-400" : "text-red-400"}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div className="flex-1 min-w-0"><div className="flex items-center justify-between"><div className="text-zinc-400 text-[10px] uppercase font-semibold tracking-wider">Glymphatic</div><button onClick={() => setInfoPopup(infoPopup === "glymphatic" ? null : "glymphatic")} className="text-cyan-400 hover:text-cyan-300"><Info size={10} /></button></div><div className="w-full h-2 bg-zinc-700 rounded-full mt-1.5"><div className={`h-full rounded-full transition-all ${glymphaticPercent > 60 ? "bg-green-400" : glymphaticPercent > 30 ? "bg-yellow-400" : "bg-red-400"}`} style={{ width: glymphaticPercent + "%" }} /></div><div className="text-zinc-500 text-[10px] mt-1"><span className="text-zinc-200 font-semibold">{glymphaticPercent}%</span> efficient</div><div className="mt-1"><span className="text-[9px] px-1.5 py-0.5 rounded-md bg-green-500/10 text-green-400 font-medium">Brain waste clearance</span></div></div></div></div>

        <div className="bg-zinc-800 rounded-xl p-3"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${vasodilationPercent > 60 ? "bg-cyan-500/20" : vasodilationPercent > 30 ? "bg-yellow-500/20" : "bg-red-500/20"}`}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={vasodilationPercent > 60 ? "text-cyan-400" : vasodilationPercent > 30 ? "text-yellow-400" : "text-red-400"}><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><circle cx="12" cy="12" r="3"/></svg></div><div className="flex-1 min-w-0"><div className="flex items-center justify-between"><div className="text-zinc-400 text-[10px] uppercase font-semibold tracking-wider">Vasodilation</div><button onClick={() => setInfoPopup(infoPopup === "vasodilation" ? null : "vasodilation")} className="text-cyan-400 hover:text-cyan-300"><Info size={10} /></button></div><div className="w-full h-2 bg-zinc-700 rounded-full mt-1.5"><div className={`h-full rounded-full transition-all ${vasodilationPercent > 60 ? "bg-cyan-400" : vasodilationPercent > 30 ? "bg-yellow-400" : "bg-red-400"}`} style={{ width: vasodilationPercent + "%" }} /></div><div className="text-zinc-500 text-[10px] mt-1"><span className="text-zinc-200 font-semibold">{vasodilationPercent}%</span> dilated</div><div className="mt-1"><span className="text-[9px] px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 font-medium">Brain blood vessel expansion</span></div></div></div></div>

        <div className="bg-zinc-800 rounded-xl p-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg></div><div className="flex-1"><div className="text-zinc-400 text-[10px] uppercase font-semibold tracking-wider">Sleep Window</div><div className="text-sm font-semibold text-zinc-200">{circadian === "NIGHT" ? "Optimal: Now" : "In ~" + (22 - hour) + " hours"}</div></div></div></div>

        <button onClick={logSip} className="w-full py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-sm transition flex items-center justify-center gap-2">{saving ? <><span className="w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" /> Logging...</> : <><Droplets size={14} /> Log Warm Water Sip</>}</button>
        <div className="text-zinc-600 text-[10px] text-center mt-4">{sips.length} sips logged today</div>
      </div>
    </div></div>)}

    {infoPopup && (<div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setInfoPopup(null)}><div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-96 text-xs font-sans text-zinc-300" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-cyan-400">{infoData[infoPopup].title}</h3><button onClick={() => setInfoPopup(null)} className="text-zinc-500 hover:text-white"><X size={14} /></button></div><div className="w-full h-44 bg-zinc-800 rounded-xl mb-3 flex items-center justify-center text-zinc-600 text-[10px]">🧠 Image placeholder</div><p className="text-zinc-400 leading-relaxed">{infoData[infoPopup].body}</p><button onClick={() => setInfoPopup(null)} className="mt-4 w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition">Got it</button></div></div>)}
  </>);
}