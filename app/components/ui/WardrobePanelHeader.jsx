"use client";
import { Sparkles } from "lucide-react";

export default function WardrobePanelHeader({ equippedCount }) {
  return (
    <div className="relative flex items-start justify-between gap-3 px-1 pt-1 pb-3">
      <div className="flex items-center gap-3">
        {/* Icon with animated glow ring */}
        <div className="relative flex-shrink-0">
          <div className="wardrobe-icon-glow wardrobe-gradient-primary flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 shadow-[0_8px_24px_rgba(79,70,229,0.45),inset_0_1px_0_rgba(255,255,255,0.25)]">
            <Sparkles size={17} className="text-white drop-shadow-[0_1px_4px_rgba(200,210,255,0.6)]" />
          </div>
          {/* Outer glow halo */}
          <div className="pointer-events-none absolute -inset-1 rounded-[18px] opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />
        </div>
        <div className="min-w-0">
          <p className="font-kicker text-[9px] tracking-[0.14em] text-indigo-300/60">Atelier</p>
          <p className="font-display text-[21px] font-bold leading-tight tracking-tight text-white">Wardrobe Studio</p>
        </div>
      </div>

      {/* Live looks badge — teal gradient */}
      <div className="wardrobe-badge-teal shrink-0 mt-0.5">
        {equippedCount} live looks
      </div>

      {/* Bottom separator */}
      <div className="wardrobe-hairline absolute bottom-0 left-0 right-0" />
    </div>
  );
}
