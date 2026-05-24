"use client";

export default function DeepSeekIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" rx="32" fill="#4D6BFE"/>
      <path d="M128 48c-44 0-80 36-80 80s36 80 80 80 80-36 80-80-36-80-80-80zm0 144c-35 0-64-29-64-64s29-64 64-64 64 29 64 64-29 64-64 64z" fill="white" opacity="0.9"/>
      <path d="M128 80c-26 0-48 22-48 48s22 48 48 48 48-22 48-48-22-48-48-48zm0 80c-17 0-32-15-32-32s15-32 32-32 32 15 32 32-15 32-32 32z" fill="white"/>
      <circle cx="108" cy="118" r="6" fill="#4D6BFE"/>
      <path d="M88 148c6-8 16-14 28-16" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
      <path d="M168 148c-6-8-16-14-28-16" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
    </svg>
  );
}