"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FileImage, ArrowLeft, X } from "lucide-react";

export default function DiagramsPage() {
  const [diagrams, setDiagrams] = useState<string[]>([]);
  const [viewing, setViewing] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/diagrams").then(r => r.json()).then(d => { if (d.success) setDiagrams(d.files); });
  }, []);

  return (<>
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-zinc-400 hover:text-white transition"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-semibold flex items-center gap-2"><FileImage size={20} /> Diagrams</h1>
      </div>
      {diagrams.length === 0 ? (
        <p className="text-zinc-500 text-center py-16">No diagrams yet. Drop .svg files in public/docs/</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {diagrams.map(file => (
            <div key={file} onClick={() => setViewing(file)} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition group cursor-pointer">
              <div className="w-full h-32 bg-zinc-800 rounded-lg mb-3 flex items-center justify-center group-hover:bg-zinc-700 transition">
                <FileImage size={32} className="text-zinc-600 group-hover:text-cyan-400 transition" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200 truncate">{file.replace(".svg", "").replace(/-/g, " ")}</h3>
              <p className="text-xs text-zinc-500 mt-1">Click to view</p>
            </div>
          ))}
        </div>
      )}
    </div>
    {viewing && (
      <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center" onClick={() => setViewing(null)}>
        <button onClick={() => setViewing(null)} className="absolute top-4 right-4 text-white hover:text-zinc-300 z-10"><X size={24} /></button>
        <img src={"/docs/" + viewing} alt="diagram" className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
      </div>
    )}
  </>);
}