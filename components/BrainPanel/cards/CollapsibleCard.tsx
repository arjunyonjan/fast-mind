"use client";
import { ChevronDown, Info } from "lucide-react";

export default function CollapsibleCard({ id, title, icon, iconBg, collapsed, onToggle, children, infoAction }: any) {
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