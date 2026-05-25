import Link from "next/link";
import { FileImage, ArrowLeft } from "lucide-react";

const diagrams = [
  { name: "Brain Panel Architecture", file: "brain-panel-architecture.svg", desc: "Buddha Engine · Domain-driven design · Data flow" },
  { name: "AI Router Architecture", file: "ai-router-architecture.svg", desc: "Intent classification · Multi-action chat · DeepSeek" },
  { name: "System Architecture", file: "architecture.svg", desc: "Full stack · Next.js · MongoDB · AI services" },
];

export default function DiagramsPage() {
  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-zinc-400 hover:text-white transition"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-semibold flex items-center gap-2"><FileImage size={20} /> Diagrams</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {diagrams.map(d => (
          <a key={d.file} href={`/docs/${d.file}`} target="_blank" className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition group">
            <div className="w-full h-32 bg-zinc-800 rounded-lg mb-3 flex items-center justify-center group-hover:bg-zinc-700 transition">
              <FileImage size={32} className="text-zinc-600 group-hover:text-cyan-400 transition" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200">{d.name}</h3>
            <p className="text-xs text-zinc-500 mt-1">{d.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}