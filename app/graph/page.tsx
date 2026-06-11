"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Share2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import {
  forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide,
  SimulationNodeDatum, SimulationLinkDatum
} from "d3-force";

interface GraphNode extends SimulationNodeDatum {
  id: string;
  label: string;
  type: string;
  href: string;
  color: string;
}

interface GraphEdge extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

export default function GraphPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  const simRef = useRef<any>(null);
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const [canvasSize, setCanvasSize] = useState({ w: 900, h: 600 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasSize({ w: Math.floor(width), h: Math.floor(height) });
      }
    });
    ro.observe(el);
    setCanvasSize({ w: Math.floor(el.clientWidth), h: Math.floor(el.clientHeight) });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    fetch("/api/graph")
      .then(r => r.json())
      .then(data => {
        if (!data.success) { setError(data.error || "Failed"); setLoading(false); return; }
        const n = data.nodes.map((d: any) => ({ ...d, x: Math.random() * 600, y: Math.random() * 400 }));
        const e = data.edges.map((d: any) => ({ source: d.source, target: d.target }));
        setNodes(n);
        setEdges(e);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!nodes.length) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sim = forceSimulation(nodes)
      .force("link", forceLink(edges).id((d: any) => d.id).distance(100))
      .force("charge", forceManyBody().strength(-300))
      .force("center", forceCenter(canvas.width / 2, canvas.height / 2))
      .force("collide", forceCollide(30))
      .alphaDecay(0.02);

    simRef.current = sim;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = transformRef.current;
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.scale(t.k, t.k);

      for (const edge of edges) {
        const s = typeof edge.source === "object" ? edge.source : nodes.find(n => n.id === edge.source);
        const tgt = typeof edge.target === "object" ? edge.target : nodes.find(n => n.id === edge.target);
        if (!s || !tgt) continue;
        ctx.beginPath();
        ctx.moveTo(s.x!, s.y!);
        ctx.lineTo(tgt.x!, tgt.y!);
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x!, node.y!, 8, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = hoveredNode?.id === node.id ? "#fff" : "rgba(255,255,255,0.3)";
        ctx.lineWidth = hoveredNode?.id === node.id ? 2 : 0.5;
        ctx.stroke();

        if (t.k > 0.7 || hoveredNode?.id === node.id) {
          ctx.fillStyle = "#e4e4e7";
          ctx.font = "11px Inter, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(node.label.length > 25 ? node.label.slice(0, 25) + "..." : node.label, node.x!, node.y! - 14);
        }
      }

      ctx.restore();
    };

    sim.on("tick", draw);

    return () => { sim.stop(); };
  }, [nodes, edges, hoveredNode, canvasSize.w, canvasSize.h]);

  const getNodeAt = (cx: number, cy: number) => {
    const t = transformRef.current;
    const nx = (cx - t.x) / t.k;
    const ny = (cy - t.y) / t.k;
    for (const node of nodes) {
      const dx = nx - node.x!;
      const dy = ny - node.y!;
      if (dx * dx + dy * dy < 400) return node;
    }
    return null;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setHoveredNode(getNodeAt(e.nativeEvent.offsetX, e.nativeEvent.offsetY));
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const node = getNodeAt(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    if (node) window.location.href = node.href;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const t = transformRef.current;
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newK = Math.max(0.2, Math.min(5, t.k * delta));
    transformRef.current = { ...t, k: newK };
  };

  let dragNode: GraphNode | null = null;
  let dragOffset = { x: 0, y: 0 };

  const handleDragStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const node = getNodeAt(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    if (node) {
      dragNode = node;
      const t = transformRef.current;
      dragOffset = { x: (e.nativeEvent.offsetX - t.x) / t.k - node.x!, y: (e.nativeEvent.offsetY - t.y) / t.k - node.y! };
      node.fx = node.x;
      node.fy = node.y;
    }
  };

  const handleDragMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragNode) return;
    const t = transformRef.current;
    dragNode.fx = (e.nativeEvent.offsetX - t.x) / t.k - dragOffset.x;
    dragNode.fy = (e.nativeEvent.offsetY - t.y) / t.k - dragOffset.y;
  };

  const handleDragEnd = () => {
    if (dragNode) { dragNode.fx = null; dragNode.fy = null; dragNode = null; }
  };

  const resetView = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    transformRef.current = { x: 0, y: 0, k: 1 };
  };

  const zoomIn = () => {
    const t = transformRef.current;
    transformRef.current = { ...t, k: Math.min(5, t.k * 1.3) };
  };

  const zoomOut = () => {
    const t = transformRef.current;
    transformRef.current = { ...t, k: Math.max(0.2, t.k * 0.7) };
  };

  const nodeCount = { document: nodes.filter(n => n.type === 'document').length, task: nodes.filter(n => n.type === 'task').length, space: nodes.filter(n => n.type === 'space').length };

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-zinc-400 hover:text-white transition"><ArrowLeft size={18} /></Link>
          <h1 className="text-sm font-semibold text-zinc-200 flex items-center gap-2"><Share2 size={15} className="text-cyan-400" /> Graph</h1>
          {!loading && <span className="text-xs text-zinc-500">{nodeCount.document} docs, {nodeCount.task} tasks, {nodeCount.space} spaces</span>}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={zoomIn} className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition" title="Zoom in"><ZoomIn size={15} /></button>
          <button onClick={zoomOut} className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition" title="Zoom out"><ZoomOut size={15} /></button>
          <button onClick={resetView} className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition" title="Reset view"><RotateCcw size={15} /></button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex gap-1.5"><span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" /><span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} /><span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} /></div>
          </div>
        )}
        {error && <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">{error}</div>}
        <canvas
          ref={canvasRef}
          width={canvasSize.w}
          height={canvasSize.h}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          onWheel={handleWheel}
          onMouseDown={handleDragStart}
          onMouseMoveCapture={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          className="w-full h-full cursor-pointer"
        />
        {hoveredNode && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 shadow-xl pointer-events-none">
            <span className="font-medium">{hoveredNode.label}</span>
            <span className="text-zinc-500 ml-2">· {hoveredNode.type}</span>
          </div>
        )}
        <div className="absolute bottom-4 right-4 flex gap-3 text-xs text-zinc-500 pointer-events-none">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> documents</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> tasks</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400 inline-block" /> spaces</span>
        </div>
      </div>
    </div>
  );
}
