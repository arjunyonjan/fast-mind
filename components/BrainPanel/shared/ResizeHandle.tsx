"use client";

interface ResizeHandleProps {
  panelWidth: number;
  onResize: (e: React.MouseEvent) => void;
}

export function ResizeHandle({ panelWidth, onResize }: ResizeHandleProps) {
  return (
    <div
      className="hidden sm:flex fixed flex-col items-center justify-center z-[9999] top-0 bottom-0 w-6 cursor-col-resize group"
      style={{ right: panelWidth - 12 }}
      onMouseDown={onResize}
    >
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-zinc-600/30 group-hover:bg-cyan-400/50 transition-colors" />
      <div className="relative flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {[0,1,2,3,4].map(i => (
          <div key={i} className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-cyan-400/60" />
            <div className="w-1 h-1 rounded-full bg-cyan-400/60" />
          </div>
        ))}
      </div>
    </div>
  );
}