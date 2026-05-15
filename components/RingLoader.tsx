"use client";
export default function RingLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-cyan-50 z-50">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-cyan-200 rounded-full animate-pulse" />
        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"><div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" /></div>
        <p className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-cyan-500 font-medium">FastMind</p>
      </div>
    </div>
  );
}
