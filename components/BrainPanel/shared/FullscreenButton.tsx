"use client";

interface FullscreenButtonProps {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

export function FullscreenButton({ isFullscreen, toggleFullscreen }: FullscreenButtonProps) {
  return (
    <button onClick={toggleFullscreen} className="p-1.5 rounded text-zinc-500 hover:text-white transition" title={isFullscreen ? "Shrink" : "Expand"}>
      {!isFullscreen ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="10,1 15,1 15,6"/><polyline points="6,15 1,15 1,10"/><line x1="15" y1="1" x2="9" y2="7"/><line x1="1" y1="15" x2="7" y2="9"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1,6 1,1 6,1"/><polyline points="15,10 15,15 10,15"/><line x1="1" y1="1" x2="7" y2="7"/><line x1="15" y1="15" x2="9" y2="9"/>
        </svg>
      )}
    </button>
  );
}