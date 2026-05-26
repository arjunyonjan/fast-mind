"use client";
import { useState, useEffect, useRef } from "react";
import { Brain, Droplets, X, Info, Heart, Activity, Sun, Users, BookOpen, Wind, ChevronDown } from "lucide-react";
import { calcGlymphatic, calcVasodilation, calcTotalClearance } from "@/features/brain/domain/clearance";
import { calcEyeStrain } from "@/features/brain/domain/eyeStrain";
import { calcBrainHealth } from "@/features/brain/domain/brainScore";
import { calcMoodModifier, calcLifestyleModifier, calcNaturalAccumulation, calcAccumulation } from "@/features/brain/domain/accumulation";
import { calcHoursSlept, calcCircadian } from "@/features/brain/domain/sleep";

function CollapsibleCard({ id, title, icon, iconBg, collapsed, onToggle, children, infoAction }: { id: string; title: string; icon: React.ReactNode; iconBg: string; collapsed: boolean; onToggle: () => void; children: React.ReactNode; infoAction?: () => void }) {
  return (
    <div className="bg-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-3 cursor-pointer py-1" onClick={onToggle}>
        {icon && <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>{icon}</div>}
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-zinc-500 text-[13px] uppercase">{title}</div>
            {infoAction && <button onClick={(e) => { e.stopPropagation(); infoAction(); }} className="text-cyan-400 hover:text-cyan-300"><Info size={10} /></button>}
          </div>
          <ChevronDown size={16} className={`text-zinc-500 transition-transform ${collapsed ? "" : "rotate-180"}`} />
        </div>
      </div>
      {!collapsed && <div className="mt-3">{children}</div>}
    </div>
  );
}

export default function BrainPanel() {
  const [open, setOpen] = useState(false);
  const [sips, setSips] = useState<{time:string}[]>([]);
  const [lastSip, setLastSip] = useState<string | null>(null);
  const [minutesSince, setMinutesSince] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [vasodilationPercent, setVasodilationPercent] = useState(100);
  const [glymphaticPercent, setGlymphaticPercent] = useState(0);
  const [accumulationPercent, setAccumulationPercent] = useState(0);
  const [notified, setNotified] = useState(false);
  const [infoPopup, setInfoPopup] = useState<string | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [lifestyle, setLifestyle] = useState<string[]>([]);
  const [exerciseLog, setExerciseLog] = useState<{exercise:string,time:string}[]>([]);
  const [isAwake, setIsAwake] = useState(true);
  const [brainHealth, setBrainHealth] = useState(100);
  const [initialized, setInitialized] = useState(false); const [forceInit, setForceInit] = useState(false);
  const [panelWidth, setPanelWidth] = useState(340); const [isFullscreen, setIsFullscreen] = useState(false);
  const [sunlight, setSunlight] = useState(false);
  const [social, setSocial] = useState(false);
  const [learning, setLearning] = useState(false);
  const [breathwork, setBreathwork] = useState(false);
  const [eyeStrain, setEyeStrain] = useState(0);
  const [exerciseLoading, setExerciseLoading] = useState<string | null>(null);
  const [simHour, setSimHour] = useState<number | null>(null);
  const [isLive, setIsLive] = useState(true);
  const simHourRef = useRef<number | null>(null);
  const [collapsedCards, setCollapsedCards] = useState<string[]>(() => { try { const s = localStorage.getItem("brain-collapsed"); return s ? JSON.parse(s) : []; } catch { return []; } });

  useEffect(() => { simHourRef.current = simHour; }, [simHour]);

  const toggleOpen = (v: boolean) => { setOpen(v); localStorage.setItem("brain-open", String(v)); };
  const saveMood = (m: string) => { setMood(m); localStorage.setItem("brain-mood", m); setInitialized(true); };
  const toggleLifestyle = (item: string) => { const next = lifestyle.includes(item) ? lifestyle.filter(i => i !== item) : [...lifestyle, item]; setLifestyle(next); localStorage.setItem("brain-lifestyle", JSON.stringify(next)); setInitialized(true); };
  const toggleAwake = () => { const v = !isAwake; setIsAwake(v); localStorage.setItem("brain-awake", String(v)); };
  const toggleSunlight = () => { const v = !sunlight; setSunlight(v); localStorage.setItem("brain-sunlight", String(v)); setInitialized(true); };
  const toggleSocial = () => { const v = !social; setSocial(v); localStorage.setItem("brain-social", String(v)); setInitialized(true); };
  const toggleLearning = () => { const v = !learning; setLearning(v); localStorage.setItem("brain-learning", String(v)); setInitialized(true); };
  const toggleBreathwork = () => { const v = !breathwork; setBreathwork(v); localStorage.setItem("brain-breathwork", String(v)); setInitialized(true); };
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);
  const toggleCard = (id: string) => { setCollapsedCards(prev => { const next = prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id];  const toggleFullscreen = () => setIsFullscreen(!isFullscreen); localStorage.setItem("brain-collapsed", JSON.stringify(next)); return next; }); };
  const logExercise = (ex: string) => { setExerciseLoading(ex); setTimeout(() => { const log = [...exerciseLog, { exercise: ex, time: new Date().toISOString() }]; setExerciseLog(log); localStorage.setItem("brain-exercise-log", JSON.stringify(log)); setExerciseLoading(null); setInitialized(true); }, 500); };
  const logSip = () => { setExerciseLoading("sip"); setTimeout(() => { const u = [...sips, { time: new Date().toISOString() }]; setSips(u); setLastSip(new Date().toISOString()); localStorage.setItem("brain-sips", JSON.stringify(u)); setExerciseLoading(null); setInitialized(true); }, 500); };

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") Notification.requestPermission();
    try {
      const s = localStorage.getItem("brain-sips"); if (s) { const p = JSON.parse(s); setSips(p); if (p.length) setLastSip(p[p.length-1].time); }
      const m = localStorage.getItem("brain-mood"); if (m) setMood(m);
      const l = localStorage.getItem("brain-lifestyle"); if (l) setLifestyle(JSON.parse(l));
      const pw = localStorage.getItem("brain-panel-width"); if (pw) setPanelWidth(parseInt(pw));
      if (localStorage.getItem("brain-open") === "true") setOpen(true);
      if (localStorage.getItem("brain-awake") === "false") setIsAwake(false);
      if (localStorage.getItem("brain-sunlight") === "true") setSunlight(true);
      if (localStorage.getItem("brain-social") === "true") setSocial(true);
      if (localStorage.getItem("brain-learning") === "true") setLearning(true);
      if (localStorage.getItem("brain-breathwork") === "true") setBreathwork(true);
      if (localStorage.getItem("brain-sips") || localStorage.getItem("brain-mood")) setInitialized(true);
    } catch {}
  }, []);
  useEffect(() => {
    // Auto-initialize for production if no data exists
    if (!initialized && !forceInit) {
      setForceInit(true);
      // Set default values
      setMood("neutral");
      setInitialized(true);
    }
  }, [initialized, forceInit]);

  useEffect(() => {
    const clock = setInterval(() => {
      const d = new Date();
      const h = isLive ? d.getHours() : (simHour ?? d.getHours());
      d.setHours(h, isLive ? d.getMinutes() : 0, isLive ? d.getSeconds() : 0);
      setCurrentTime(d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
    }, 1000);
    return () => clearInterval(clock);
  }, [isLive, simHour]);

  useEffect(() => {
    const i = setInterval(() => {
      if (!lastSip) return;
      const diff = Math.floor((Date.now() - new Date(lastSip).getTime()) / 60000);
      setMinutesSince(diff);
      const g = Math.min(100, Math.max(0, 100 - diff * 2));
      setGlymphaticPercent(g);
      setVasodilationPercent(Math.min(100, Math.max(0, 100 - diff * 1.5)));
      const hour = isLive ? new Date().getHours() : (simHourRef.current ?? new Date().getHours());
      const circadian = hour >= 6 && hour < 12 ? "MORNING" : hour >= 12 && hour < 18 ? "AFTERNOON" : hour >= 18 && hour < 22 ? "EVENING" : "NIGHT";
      const h6 = (hour >= 6 ? hour - 6 : hour + 18) + new Date().getMinutes()/60;
      let mm = 1;
      if (mood === "sad" || mood === "depressed") mm = 1.3;
      if (mood === "anxious") mm = 1.2;
      if (mood === "angry") mm = 1.4;
      if (mood === "lonely") mm = 1.5;
      if (mood === "happy") mm = 0.8;
      const lm = 1 + lifestyle.length * 0.15;
      const nat = Math.min(100, h6 * 5.5 * mm * lm);
      const hoursSlept = (circadian === "NIGHT" && !isAwake) ? Math.min(8, (hour >= 22 ? hour - 22 : hour + 2)) : 0;
      const sc = hoursSlept > 0 ? hoursSlept * 0.06 : 0;
      const tc = calcTotalClearance(hoursSlept, g);
      setAccumulationPercent(Math.round(nat * (1 - tc)));
      const isSleeping = (circadian === "NIGHT" && !isAwake);
      const hoursAwake = isSleeping ? 0 : (hour < 6 ? hour + 18 : hour - 6);
      const be = Math.min(10, Math.floor(hoursAwake * 0.8));
      const sr = (circadian === "NIGHT" && !isAwake) ? Math.min(10, hoursSlept * 1.5) : 0;
      setEyeStrain(Math.max(0, be - sr));
      let health = 100;
      if (accumulationPercent > 60) health -= 25; else if (accumulationPercent > 30) health -= 10;
      if (g < 30) health -= 20; else if (g < 60) health -= 10;
      if (lifestyle.includes("less sleep")) health -= 15;
      if (lifestyle.includes("junk food")) health -= 10;
      if (lifestyle.includes("alcohol")) health -= 15;
      if (lifestyle.includes("no exercise")) health -= 10;
      if (mood === "depressed") health -= 20;
      if (mood === "angry") health -= 15;
      if (mood === "anxious") health -= 10;
      if (mood === "lonely") health -= 25;
      if (circadian === "NIGHT" && isAwake) health -= 35;
      if (circadian === "NIGHT" && !isAwake) health += 10;
      if (circadian !== "NIGHT" && !isAwake) health -= 5;
      if (sunlight) health += 8;
      if (social) health += 10;
      if (learning) health += 7;
      if (breathwork) health += 6;
      health -= eyeStrain * 3;
      if (circadian === "NIGHT" && !isAwake && eyeStrain >= 5) health += 5;
      setBrainHealth(Math.max(0, Math.min(100, health)));
      if (diff >= 45 && !notified && typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("Warm Water Reminder", { body: "45 min since your last sip." });
        setNotified(true);
      }
      if (diff < 45) setNotified(false);
    }, 1000);
    return () => clearInterval(i);
  }, [lastSip, notified, mood, lifestyle, isAwake, sunlight, social, learning, breathwork, accumulationPercent, glymphaticPercent, simHour, isLive]);

  const hour = isLive ? new Date().getHours() : (simHour ?? new Date().getHours());
  const circadian = hour >= 6 && hour < 12 ? "MORNING" : hour >= 12 && hour < 18 ? "AFTERNOON" : hour >= 18 && hour < 22 ? "EVENING" : "NIGHT";
  const hc = brainHealth > 70 ? "green" : brainHealth > 40 ? "yellow" : "red";
  const ec = eyeStrain >= 7 ? "red" : eyeStrain >= 4 ? "yellow" : "green";

  const onResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const sx = e.clientX; const sw = panelWidth;
    const mv = (ev: MouseEvent) => setPanelWidth(Math.max(280, sw + sx - ev.clientX));
    const up = () => { localStorage.setItem("brain-panel-width", String(panelWidth)); window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", mv); window.addEventListener("mouseup", up);
  };

  return (<>
    <button onClick={() => toggleOpen(true)} className={`fixed bottom-4 right-4 z-[9998] p-3.5 rounded-full shadow-lg transition ${hc === "green" ? "bg-green-500 animate-pulse-glow" : hc === "yellow" ? "bg-yellow-500 animate-pulse-glow" : "bg-red-500 animate-pulse-danger"}`}><Brain size={26} className="text-white" /></button>
    {open && (<div className={`fixed inset-0 z-[9999] flex items-start ${isFullscreen ? 'justify-center' : 'justify-end'} pointer-events-none`}><div className={`relative pointer-events-auto h-full bg-zinc-900/95 border-l border-zinc-800 shadow-2xl flex flex-col text-base font-sans text-zinc-300 ${isFullscreen ? 'fixed inset-0 w-full' : ''}`} style={!isFullscreen ? { width: panelWidth } : {}}>      <div className="flex items-center justify-between p-5 pb-2 shrink-0"><h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2"><Brain size={16} className="text-purple-400" /> YOUR BRAIN<span className="text-[9px] font-normal text-zinc-500 ml-1">— powered by</span><span className="text-[9px] font-semibold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent ml-0.5">Buddha Engine</span></h2><button onClick={toggleFullscreen} className="text-zinc-500 hover:text-white mr-2">⛶</button>
<button onClick={() => toggleOpen(false)} className="text-zinc-500 hover:text-white"><X size={14} /></button></div>
      <div className="absolute left-0 top-0 bottom-0 w-1.5 cursor-w-resize hover:bg-cyan-500/20 z-10 group" onMouseDown={onResize}><div className="absolute left-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition"><svg width="8" height="16" viewBox="0 0 8 16" fill="currentColor" className="text-cyan-400"><circle cx="2" cy="4" r="1.2"/><circle cx="6" cy="4" r="1.2"/><circle cx="2" cy="8" r="1.2"/><circle cx="6" cy="8" r="1.2"/><circle cx="2" cy="12" r="1.2"/><circle cx="6" cy="12" r="1.2"/></svg></div></div>

      {!initialized ? (<div className="flex-1 flex items-center justify-center"><div className="text-center space-y-3"><Brain size={40} className="mx-auto text-zinc-600" /><p className="text-zinc-500 text-sm">Your Brain awaits</p><p className="text-zinc-600 text-xs">Log a sip or select a mood to activate.</p></div></div>) : (<div className="flex-1 overflow-y-auto px-6 pb-6">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        <div className="sticky top-0 bg-zinc-900/95 z-10 -mx-5 px-5 pt-2 pb-3">
          <div className="grid grid-cols-2 gap-6 mb-4 max-w-md mx-auto">
            <div className="text-center"><div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg mx-auto bg-${hc}-500/20 text-${hc}-400 ${hc === "red" ? "animate-pulse-danger" : "animate-pulse-glow"}`}><Brain size={42} /></div><div className="text-[10px] font-bold mt-1">{brainHealth}%</div><div className="text-[9px] text-zinc-500">Brain</div></div>
            <div className="text-center"><div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg mx-auto bg-${ec}-500/20 text-${ec}-400 ${ec === "red" ? "animate-pulse-danger" : "animate-pulse-glow"}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></div><div className="text-[10px] font-bold mt-1">{eyeStrain}/10</div><div className="text-[9px] text-zinc-500">Eye Strain</div></div>
          </div>
          <div className="text-center text-[10px]"><span className={`px-2 py-0.5 rounded-full ${circadian === "NIGHT" && !isAwake ? "bg-green-500/10 text-green-400" : eyeStrain >= 7 ? "bg-red-500/10 text-red-400" : eyeStrain >= 4 ? "bg-yellow-500/10 text-yellow-400" : "bg-zinc-700 text-zinc-500"}`}>{circadian === "NIGHT" && !isAwake ? "Eyes recovering" : eyeStrain >= 7 ? "High eye strain" : eyeStrain >= 4 ? "Moderate strain" : "Eyes rested"}</span></div>
          {circadian === "NIGHT" && !isAwake && <div className="text-center mt-1"><span className="text-[9px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">CSF cleaning active</span></div>}
          {circadian === "NIGHT" && isAwake && <div className="text-center mt-1"><span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">CSF cleaning blocked</span></div>}
          <div className="mt-3 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-1"><span className="text-[9px] text-zinc-500">Time Sim</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-zinc-500">SIM</span>
                <div onClick={() => { const goingLive = isLive; setIsLive(!goingLive); if (goingLive) { setSimHour(6); } else { setSimHour(null); } }} className={`w-10 h-5 rounded-full relative cursor-pointer transition ${isLive ? "bg-green-500" : "bg-yellow-500"}`}><div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition ${isLive ? "left-5" : "left-0.5"}`} /></div>
                <span className="text-[9px] text-zinc-500">LIVE</span>
              </div>
            </div>
            {!isLive && <input type="range" min="6" max="29" value={simHour ?? (hour < 6 ? hour + 24 : hour)} onChange={e => setSimHour(parseInt(e.target.value))} className="w-full h-1 accent-cyan-500" />}
            <div className="flex justify-between text-[8px] text-zinc-600"><span>6a</span><span>12p</span><span>6p</span><span>12a</span><span>6a</span></div>
          </div>
        </div>

        <div className="bg-zinc-800 rounded-xl p-4"><div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div className="flex-1"><div className="text-zinc-500 text-[13px] uppercase">Circadian Clock</div><div className="text-lg font-semibold text-cyan-400 tracking-wider">{currentTime}</div><div className="text-[13px] text-zinc-500 mt-0.5">{circadian} PHASE</div><div className="flex items-center gap-2 mt-1.5"><span className="text-[13px] text-zinc-500">Sleeping</span><div onClick={toggleAwake} className={`w-10 h-5 rounded-full relative cursor-pointer transition ${isAwake ? "bg-yellow-500" : "bg-indigo-500"}`}><div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition ${isAwake ? "left-5" : "left-0.5"}`} /></div><span className="text-[13px] text-zinc-500">Awake</span></div></div></div><div className="relative pt-2"><div className="absolute top-0 border-l-[6px] border-r-[6px] border-b-[7px] border-l-transparent border-r-transparent border-b-cyan-400 -translate-x-1/2" style={{ left: ((hour >= 6 ? hour - 6 : hour + 18) / 24 * 100) + "%" }} /><div className="w-full h-3 bg-zinc-700 rounded-full relative overflow-hidden"><div className="absolute inset-0 flex"><div className="w-1/4 bg-amber-500/20 border-r border-zinc-600" /><div className="w-1/4 bg-yellow-400/20 border-r border-zinc-600" /><div className="w-1/4 bg-indigo-500/20 border-r border-zinc-600" /><div className="w-1/4 bg-blue-500/20" /></div></div></div><div className="flex justify-between text-[12px] text-zinc-600 mt-1"><span>6 AM</span><span>NOON</span><span>6 PM</span><span>6 AM</span></div></div>

        <CollapsibleCard id="mood" title="Mood" icon={<Heart size={18} className="text-pink-400 animate-pulse-glow" />} iconBg="bg-pink-500/20" collapsed={collapsedCards.includes("mood")} onToggle={() => toggleCard("mood")}>
          <div className="flex gap-1.5 flex-wrap">{["happy","neutral","sad","anxious","angry","depressed","lonely"].map(m => (<button key={m} onClick={() => saveMood(m)} className={`px-2.5 py-1 rounded-lg text-[13px] capitalize transition ${mood === m ? "bg-cyan-500/20 text-cyan-400" : "bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700"}`}>{m}</button>))}</div>
        </CollapsibleCard>

        <CollapsibleCard id="lifestyle" title="Lifestyle" icon={<Activity size={18} className="text-purple-400" />} iconBg="bg-purple-500/20" collapsed={collapsedCards.includes("lifestyle")} onToggle={() => toggleCard("lifestyle")}>
          <div className="space-y-1">{["overeat","junk food","less sleep","high stress","no exercise","alcohol"].map(item => (<label key={item} className="flex items-center gap-2 text-[13px] text-zinc-400 cursor-pointer"><input type="checkbox" checked={lifestyle.includes(item)} onChange={() => toggleLifestyle(item)} className="w-3 h-3 rounded accent-cyan-500" />{item}</label>))}</div>
        </CollapsibleCard>

        <CollapsibleCard id="boosters" title="Daily Boosters" icon={null} iconBg="" collapsed={collapsedCards.includes("boosters")} onToggle={() => toggleCard("boosters")} infoAction={() => setInfoPopup("boosters")}>
          <div className="grid grid-cols-2 gap-2">{[{id:"sunlight",icon:<Sun size={16}/>,label:"Sunlight",active:sunlight,action:toggleSunlight,color:"amber"},{id:"social",icon:<Users size={16}/>,label:"Social",active:social,action:toggleSocial,color:"sky"},{id:"learning",icon:<BookOpen size={16}/>,label:"Learning",active:learning,action:toggleLearning,color:"violet"},{id:"breathwork",icon:<Wind size={16}/>,label:"Breathwork",active:breathwork,action:toggleBreathwork,color:"teal"}].map(item=>(<button key={item.id} onClick={item.action} className={`flex items-center gap-1.5 px-2 py-2 rounded-lg text-[13px] transition justify-center ${item.active ? "bg-"+item.color+"-500/20 text-"+item.color+"-400" : "bg-zinc-700/50 text-zinc-500 hover:bg-zinc-700"}`}>{item.icon}{item.label}</button>))}</div>
        </CollapsibleCard>

        <div className="bg-zinc-800 rounded-xl p-4"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${lastSip ? "bg-cyan-500/20" : "bg-zinc-700"}`}><Droplets size={18} className={lastSip ? "text-cyan-400" : "text-zinc-500"} /></div><div className="flex-1"><div className="text-zinc-500 text-[13px] uppercase">Last Warm Water</div><div className="text-sm font-semibold text-zinc-200">{lastSip ? new Date(lastSip).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "Not logged"}</div><div className="flex items-center gap-1 text-[13px] mt-0.5"><span className={`w-1.5 h-1.5 rounded-full ${minutesSince < 20 ? "bg-green-400" : minutesSince < 45 ? "bg-yellow-400" : "bg-red-400"}`} />{minutesSince} min ago</div></div></div></div>

        <div className="bg-zinc-800 rounded-xl p-4"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accumulationPercent > 60 ? "bg-red-500/20" : accumulationPercent > 30 ? "bg-yellow-500/20" : "bg-green-500/20"}`}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={accumulationPercent > 60 ? "text-red-400" : accumulationPercent > 30 ? "text-yellow-400" : "text-green-400"}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div><div className="flex-1"><div className="flex items-center justify-between"><div className="text-zinc-500 text-[13px] uppercase">Waste Accumulation</div><button onClick={() => setInfoPopup("accumulation")} className="text-cyan-400 hover:text-cyan-300"><Info size={10} /></button></div><div className="w-full h-2 bg-zinc-700 rounded-full mt-1.5"><div className={`h-full rounded-full transition-all ${accumulationPercent > 60 ? "bg-red-400" : accumulationPercent > 30 ? "bg-yellow-400" : "bg-green-400"}`} style={{ width: accumulationPercent + "%" }} /></div><div className="text-zinc-500 text-[13px] mt-1"><span className="text-zinc-200 font-semibold">{accumulationPercent}%</span> accumulated</div><div className="text-zinc-500 text-[12px] mt-0.5">tau · amyloid-beta · ROS</div></div></div></div>

        <div className="bg-zinc-800 rounded-xl p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-cyan-500/20"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div className="flex-1"><div className="flex items-center justify-between"><div className="text-zinc-500 text-[13px] uppercase">Glymphatic</div><button onClick={() => setInfoPopup("glymphatic")} className="text-cyan-400 hover:text-cyan-300"><Info size={10} /></button></div><div className="w-full h-2 bg-zinc-700 rounded-full mt-1.5"><div className={`h-full rounded-full transition-all ${glymphaticPercent > 60 ? "bg-green-400" : glymphaticPercent > 30 ? "bg-yellow-400" : "bg-red-400"}`} style={{ width: glymphaticPercent + "%" }} /></div><div className="text-zinc-500 text-[13px] mt-1"><span className="text-zinc-200 font-semibold">{glymphaticPercent}%</span> efficient</div><div className="mt-1"><span className="text-[12px] px-1.5 py-0.5 rounded-md bg-green-500/10 text-green-400">Brain waste clearance</span></div></div></div></div>

        <div className="bg-zinc-800 rounded-xl p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-cyan-500/20"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><circle cx="12" cy="12" r="3"/></svg></div><div className="flex-1"><div className="flex items-center justify-between"><div className="text-zinc-500 text-[13px] uppercase">Vasodilation</div><button onClick={() => setInfoPopup("vasodilation")} className="text-cyan-400 hover:text-cyan-300"><Info size={10} /></button></div><div className="w-full h-2 bg-zinc-700 rounded-full mt-1.5"><div className={`h-full rounded-full transition-all ${vasodilationPercent > 60 ? "bg-cyan-400" : vasodilationPercent > 30 ? "bg-yellow-400" : "bg-red-400"}`} style={{ width: vasodilationPercent + "%" }} /></div><div className="text-zinc-500 text-[13px] mt-1"><span className="text-zinc-200 font-semibold">{vasodilationPercent}%</span> dilated</div><div className="mt-1"><span className="text-[12px] px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400">Brain blood vessel expansion</span></div></div></div></div>

        <div className="bg-zinc-800 rounded-xl p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg></div><div className="flex-1"><div className="text-zinc-500 text-[13px] uppercase">Sleep Window</div><div className="text-sm font-semibold text-zinc-200">{circadian === "NIGHT" ? "Optimal: Now" : "In ~" + (22 - hour) + " hours"}</div></div></div></div>

        <CollapsibleCard id="neuro" title="Neuro Protection" icon={null} iconBg="" collapsed={collapsedCards.includes("neuro")} onToggle={() => toggleCard("neuro")} infoAction={() => setInfoPopup("exercise")}>
          <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">{[{id:"sip",icon:<Droplets size={20}/>,label:"Warm Water",color:"purple",action:logSip},{id:"pushups",icon:"🫀",label:"Pushups 50x",color:"emerald",action:()=>logExercise("pushups")},{id:"deadhang",icon:"🧘",label:"Dead Hang 30s",color:"emerald",action:()=>logExercise("deadhang")},{id:"forwardbend",icon:"🙏",label:"Bend 100x",color:"emerald",action:()=>logExercise("forwardbend")}].map(item=>(<button key={item.id} onClick={item.action} className={`w-full aspect-square rounded-2xl max-w-[72px] mx-auto bg-${item.color}-500/10 hover:bg-${item.color}-500/20 flex flex-col items-center justify-center text-${item.color}-400 transition gap-0.5`}>{exerciseLoading === item.id ? <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : item.icon}<span className="text-[12px] text-zinc-400">{exerciseLoading === item.id ? "Done!" : item.label}</span></button>))}</div>
        </CollapsibleCard>

        <div className="text-zinc-600 text-[12px] text-center">{sips.length} sips · {exerciseLog.filter(e => new Date(e.time).toDateString() === new Date().toDateString()).length} exercises today</div>


       </div>
</div>)}

    </div></div>)}
    {infoPopup && (<div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setInfoPopup(null)}><div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-full max-w-2xl text-sm font-sans text-zinc-300" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between mb-3"><h3 className="text-lg font-semibold text-cyan-400">{infoPopup}</h3><button onClick={() => setInfoPopup(null)} className="text-zinc-500 hover:text-white"><X size={18} /></button></div><div className="w-full h-56 bg-zinc-800 rounded-xl mb-4 flex items-center justify-center text-zinc-600 text-sm">Image placeholder</div><p className="text-zinc-400 leading-relaxed">Detailed science explanation coming soon.</p><button onClick={() => setInfoPopup(null)} className="mt-6 w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-base transition">Got it</button></div></div>)}
  </>);
}






