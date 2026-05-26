"use client";
import { useState } from "react";
import { FileImage, X } from "lucide-react";

const diagrams = [
  { name: "Brain Panel Architecture", file: "brain-panel-architecture.svg" },
  { name: "AI Router Architecture", file: "ai-router-architecture.svg" },
  { name: "System Architecture", file: "architecture.svg" },
];

export default function DiagramViewer() {
  const [viewing, setViewing] = useState<string | null>(null);

  return (<>
    {diagrams.map(d => (
      <button key={d.file} onClick={() => setViewing(d.file)} className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition w-full">
        <FileImage size={14} className="text-cyan-400" />{d.name}
      </button>
    ))}
    {viewing && (
      <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center" onClick={() => setViewing(null)}>
        <button onClick={() => setViewing(null)} className="absolute top-4 right-4 text-white hover:text-zinc-300 z-10"><X size={24} /></button>
        <img src={"/docs/" + viewing} alt="diagram" className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
      </div>
    )}
  </>);
}
