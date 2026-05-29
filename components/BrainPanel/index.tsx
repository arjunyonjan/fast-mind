"use client";
import { useState, useEffect } from "react";
import { Brain, X } from "lucide-react";
import { useBrainState } from "./hooks/useBrainState";
import { useCircadianTimer } from "./hooks/useCircadianTimer";
import { useMetricsCalculator } from "./hooks/useMetricsCalculator";
import { useLocalStorageLoader } from "./hooks/useLocalStorageLoader";
import { MetricsGrid } from "./cards/MetricsGrid";
import { CircadianCard } from "./cards/CircadianCard";
import { MoodCard } from "./cards/MoodCard";
import { LifestyleCard } from "./cards/LifestyleCard";
import { BoostersCard } from "./cards/BoostersCard";
import { WasteCard } from "./cards/WasteCard";
import { GlymphaticCard } from "./cards/GlymphaticCard";
import { VasodilationCard } from "./cards/VasodilationCard";
import { SleepWindowCard } from "./cards/SleepWindowCard";
import { NeuroCard } from "./cards/NeuroCard";
import { WaterLog } from "./shared/WaterLog";
import { TimeSimulator } from "./shared/TimeSimulator";
import { InfoPopup } from "./shared/InfoPopup";
import { FullscreenButton } from "./shared/FullscreenButton";
import { ResizeHandle } from "./shared/ResizeHandle";
import ProcrastinationModule from "@/components/ProcrastinationModule";

export default function BrainPanel() {
  const state = useBrainState();
  const [notified, setNotified] = useState(false);
  const [exerciseLoading, setExerciseLoading] = useState<string | null>(null);
  const [infoPopup, setInfoPopup] = useState<string | null>(null);

  
  // Auto-initialize after 1 second if still not initialized
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!state.initialized && (state.sips.length > 0 || state.mood || state.lastSip)) {
        state.setInitialized(true);
      } else if (!state.initialized) {
        // Auto-trigger a dummy action to show the panel
        state.setInitialized(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [state.initialized, state.sips, state.mood, state.lastSip]);

  useCircadianTimer(state.isLive, state.simHour, state.setCurrentTime);

  useMetricsCalculator(
    state.lastSip, state.isLive, state.simHour, state.mood, state.lifestyle,
    state.isAwake, state.sunlight, state.social, state.learning, state.breathwork,
    state.accumulationPercent, state.setMinutesSince, state.setGlymphaticPercent,
    state.setVasodilationPercent, state.setAccumulationPercent, state.setEyeStrain,
    state.setBrainHealth, setNotified, notified
  );

  const hour = state.isLive ? new Date().getHours() : (state.simHour ?? new Date().getHours());
  const circadian = hour >= 6 && hour < 12 ? "MORNING" : hour >= 12 && hour < 18 ? "AFTERNOON" : hour >= 18 && hour < 22 ? "EVENING" : "NIGHT";
  const hc = state.brainHealth > 70 ? "green" : state.brainHealth > 40 ? "yellow" : "red";
  const ec = state.eyeStrain >= 7 ? "red" : state.eyeStrain >= 4 ? "yellow" : "green";
  const hoursSinceMeal = state.lastMeal ? (Date.now() - new Date(state.lastMeal).getTime()) / 3600000 : 12;
  const digestionPhase = Math.min(100, Math.max(0, Math.floor(hoursSinceMeal * 10)));
  const energyLevel = state.isAwake ? Math.min(100, Math.max(0, 70 + (Math.sin(Date.now() / 1000) * 10))) : 20;
  const energyColor = energyLevel > 60 ? "green" : energyLevel > 30 ? "yellow" : "red";

  const toggleOpen = (v: boolean) => { state.setOpen(v); localStorage.setItem("brain-open", String(v)); };
  const toggleFullscreen = () => state.setIsFullscreen(!state.isFullscreen);
  const toggleLive = () => { state.setIsLive(!state.isLive); if (!state.isLive) state.setSimHour(null); };
  const saveMood = (m: string) => { state.setMood(m); localStorage.setItem("brain-mood", m); state.setInitialized(true); };
  const toggleLifestyle = (item: string) => { const next = state.lifestyle.includes(item) ? state.lifestyle.filter(i => i !== item) : [...state.lifestyle, item]; state.setLifestyle(next); localStorage.setItem("brain-lifestyle", JSON.stringify(next)); state.setInitialized(true); };
  const toggleAwake = () => { state.setIsAwake(!state.isAwake); localStorage.setItem("brain-awake", String(!state.isAwake)); };
  const toggleSunlight = () => { state.setSunlight(!state.sunlight); localStorage.setItem("brain-sunlight", String(!state.sunlight)); state.setInitialized(true); };
  const toggleSocial = () => { state.setSocial(!state.social); localStorage.setItem("brain-social", String(!state.social)); state.setInitialized(true); };
  const toggleLearning = () => { state.setLearning(!state.learning); localStorage.setItem("brain-learning", String(!state.learning)); state.setInitialized(true); };
  const toggleBreathwork = () => { state.setBreathwork(!state.breathwork); localStorage.setItem("brain-breathwork", String(!state.breathwork)); state.setInitialized(true); };
  const toggleCard = (id: string) => { const next = state.collapsedCards.includes(id) ? state.collapsedCards.filter(c => c !== id) : [...state.collapsedCards, id]; state.setCollapsedCards(next); localStorage.setItem("brain-collapsed", JSON.stringify(next)); };
  const logExercise = (ex: string) => { setExerciseLoading(ex); setTimeout(() => { const log = [...state.exerciseLog, { exercise: ex, time: new Date().toISOString() }]; state.setExerciseLog(log); localStorage.setItem("brain-exercise-log", JSON.stringify(log)); setExerciseLoading(null); state.setInitialized(true); }, 500); };
  const logSip = () => { setExerciseLoading("sip"); setTimeout(() => { const u = [...state.sips, { time: new Date().toISOString() }]; state.setSips(u); state.setLastSip(new Date().toISOString()); localStorage.setItem("brain-sips", JSON.stringify(u)); setExerciseLoading(null); state.setInitialized(true); }, 500); };
  const logMeal = () => { setExerciseLoading("meal"); setTimeout(() => { state.setLastMeal(new Date().toISOString()); localStorage.setItem("brain-last-meal", new Date().toISOString()); setExerciseLoading(null); state.setInitialized(true); }, 500); };
  const onResize = (e: React.MouseEvent) => { e.preventDefault(); const sx = e.clientX; const sw = state.panelWidth; const mv = (ev: MouseEvent) => state.setPanelWidth(Math.max(280, sw + sx - ev.clientX)); const up = () => { localStorage.setItem("brain-panel-width", String(state.panelWidth)); window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); }; window.addEventListener("mousemove", mv); window.addEventListener("mouseup", up); };

  if (!state.initialized) {
    return (
      <>
        <button onClick={() => toggleOpen(true)} className="fixed z-[9998] p-3.5 rounded-full shadow-lg top-1/2 right-4 -translate-y-1/2 bg-green-500 animate-pulse-glow"><Brain size={26} className="text-white" /></button>
        {state.open && (
          <div className="fixed z-[9999] inset-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:w-96 bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800"><h2 className="text-sm font-semibold text-white">Brain Panel</h2><button onClick={() => toggleOpen(false)} className="text-zinc-400 hover:text-white"><X size={18} /></button></div>
            <div className="flex-1 flex items-center justify-center"><div className="text-center space-y-3"><Brain size={40} className="mx-auto text-zinc-600" /><p className="text-zinc-500 text-sm">Log a sip or select a mood to activate</p></div></div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <button onClick={() => toggleOpen(true)} className="fixed z-[9998] p-3.5 rounded-full shadow-lg top-1/2 right-4 -translate-y-1/2 bg-green-500 animate-pulse-glow"><Brain size={26} className="text-white" /></button>
      {state.open && (
        <div className="fixed z-[9999] inset-0 sm:inset-y-0 sm:right-0 sm:left-auto flex flex-col bg-zinc-900 border-l border-zinc-800 shadow-2xl animate-slide-in" style={{ width: state.isFullscreen ? "100%" : state.panelWidth }}>
          {/* Fixed header: title bar + procrastination + metrics */}
          <div className="shrink-0">
            <div className="flex items-center justify-between p-4 sm:p-5 pb-3 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2"><Brain size={16} className="text-purple-400" />YOUR BRAIN</h2>
              <div className="flex items-center gap-1"><FullscreenButton isFullscreen={state.isFullscreen} toggleFullscreen={toggleFullscreen} /><button onClick={() => toggleOpen(false)} className="p-1.5 rounded text-zinc-500 hover:text-white"><X size={18} /></button></div>
            </div>
            <ProcrastinationModule />
            <MetricsGrid brainHealth={state.brainHealth} hc={hc} eyeStrain={state.eyeStrain} ec={ec} digestionPhase={digestionPhase} energyLevel={energyLevel} energyColor={energyColor} glymphaticPercent={state.glymphaticPercent} vasodilationPercent={state.vasodilationPercent} />
          </div>
          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 pb-6 space-y-4">
            <CircadianCard currentTime={state.currentTime} circadian={circadian} isAwake={state.isAwake} toggleAwake={toggleAwake} />
            <TimeSimulator isLive={state.isLive} simHour={state.simHour} hour={hour} toggleLive={toggleLive} setSimHour={state.setSimHour} />
            <MoodCard mood={state.mood} collapsedCards={state.collapsedCards} toggleCard={toggleCard} saveMood={saveMood} />
            <LifestyleCard lifestyle={state.lifestyle} collapsedCards={state.collapsedCards} toggleCard={toggleCard} toggleLifestyle={toggleLifestyle} />
            <BoostersCard sunlight={state.sunlight} social={state.social} learning={state.learning} breathwork={state.breathwork} collapsedCards={state.collapsedCards} toggleCard={toggleCard} toggleSunlight={toggleSunlight} toggleSocial={toggleSocial} toggleLearning={toggleLearning} toggleBreathwork={toggleBreathwork} />
            <WaterLog lastSip={state.lastSip} minutesSince={state.minutesSince} logSip={logSip} />
            <WasteCard accumulationPercent={state.accumulationPercent} setInfoPopup={setInfoPopup} />
            <GlymphaticCard glymphaticPercent={state.glymphaticPercent} setInfoPopup={setInfoPopup} />
            <VasodilationCard vasodilationPercent={state.vasodilationPercent} setInfoPopup={setInfoPopup} />
            <SleepWindowCard circadian={circadian} hour={hour} />
            <NeuroCard sips={state.sips} exerciseLog={state.exerciseLog} exerciseLoading={exerciseLoading} collapsedCards={state.collapsedCards} toggleCard={toggleCard} logSip={logSip} logMeal={logMeal} logExercise={logExercise} />
          </div>
        </div>
      )}
      {state.open && !state.isFullscreen && <ResizeHandle panelWidth={state.panelWidth} onResize={onResize} />}
      <InfoPopup infoPopup={infoPopup} setInfoPopup={setInfoPopup} />
    </>
  );
}
