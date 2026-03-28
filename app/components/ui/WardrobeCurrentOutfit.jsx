"use client";
import React, { useState } from "react";
import { Shirt, Layers, Sparkles, Crown, Footprints, ChevronRight, X, Star, Plus } from "lucide-react";
import { hexToRgba, normalizeHex } from "./wardrobeUtils";

// Maps the icon-string stored on each wardrobe item → Lucide component
const ICON_MAP = {
  Shirt,
  Layers,
  Sparkles,
  Crown,
  Footprints,
  // legacy / fallback aliases
  Wind: Layers,
  PersonStanding: Sparkles,
};

export default function WardrobeCurrentOutfit({
  items,
  wardrobe,
  activeItem,
  setActiveItem,
  favoriteSet,
  handleEquip,
  handleUnequip,
  toggleFavorite,
  accentColor = "#7486ff",
  glowColor = "#dcefff",
}) {
  const [justEquipped, setJustEquipped] = useState(null);
  const panelAccent = normalizeHex(accentColor);

  const handleEquipWithFeedback = (id, url) => {
    handleEquip(id, url);
    setJustEquipped(id);
    window.setTimeout(() => setJustEquipped(null), 550);
  };

  return (
    <section className="mt-3 px-1 pb-1">
      <p className="font-kicker mb-2.5 px-1 text-[10px] tracking-[0.12em] text-white/40">Current outfit</p>
      <div className="wardrobe-motion-list flex flex-col gap-2 px-1">
        {items.map(({ id, label, url, icon, accent }, index) => {
          const Icon = ICON_MAP[icon] ?? Shirt;
          const isEquipped = Boolean(wardrobe[id]);
          const isActive = activeItem === id;
          const isFavorite = favoriteSet.has(id);
          const cardAccent = normalizeHex(accent || panelAccent);
          const cardBorder = isActive ? hexToRgba(panelAccent, 0.46) : isEquipped ? hexToRgba(panelAccent, 0.22) : "rgba(255,255,255,0.06)";
          const cardBackground = isActive
            ? `linear-gradient(135deg, ${hexToRgba(panelAccent, 0.24)} 0%, ${hexToRgba(cardAccent, 0.14)} 58%, rgba(255,255,255,0.03) 100%)`
            : isEquipped
              ? `linear-gradient(135deg, ${hexToRgba(panelAccent, 0.1)} 0%, ${hexToRgba(glowColor, 0.08)} 100%)`
              : "rgba(255,255,255,0.025)";

          return (
            <div
              key={id}
              onClick={() => setActiveItem(id)}
              className="wardrobe-glow-hover group relative flex items-center justify-between gap-3 rounded-[2rem] border px-3.5 py-3 cursor-pointer transition-all duration-200"
              style={{
                animationDelay: `${index * 45}ms`,
                borderColor: cardBorder,
                background: cardBackground,
                boxShadow: isActive
                  ? `0 8px 26px ${hexToRgba(panelAccent, 0.18)}, inset 0 1px 0 rgba(255,255,255,0.08)`
                  : `0 8px 18px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.05)`,
              }}
            >
              {/* Icon thumbnail */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] overflow-hidden ${
                  justEquipped === id ? "animate-pulse" : ""
                }`}
                style={{
                  background: `linear-gradient(145deg, ${hexToRgba(cardAccent, 0.28)}, ${hexToRgba(panelAccent, 0.12)})`,
                  boxShadow: `0 4px 14px ${hexToRgba(panelAccent, 0.24)}, inset 0 1px 0 rgba(255,255,255,0.14)`,
                }}
              >
                <Icon size={18} style={{ color: cardAccent, filter: `drop-shadow(0 0 6px ${hexToRgba(panelAccent, 0.5)})` }} />
              </div>

              {/* Item label */}
              <div className="flex-1 text-left text-[11px] font-semibold uppercase tracking-wide text-white/70 px-1">
                {label}
              </div>

              {/* Right-side actions/status */}
              <div className="flex flex-1 items-center justify-end gap-3">
                <div className="text-[11px] text-white/50">
                  {isEquipped ? (
                    <span className="wardrobe-status-equipped">Equipped</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/8 bg-white/[0.03] px-2 py-0.5 text-[9px] font-semibold tracking-[0.07em] text-white/28 uppercase">
                      <Plus size={9} className="opacity-60" />
                      Add
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(id); }}
                    className="flex h-7 w-7 items-center justify-center rounded-[0.7rem] border transition-all"
                    style={{
                      borderColor: isFavorite ? hexToRgba(panelAccent, 0.42) : "rgba(255,255,255,0.08)",
                      background: isFavorite ? hexToRgba(panelAccent, 0.18) : "rgba(255,255,255,0.04)",
                      color: isFavorite ? "#e8ebff" : "rgba(255,255,255,0.38)",
                    }}
                    title={isFavorite ? `Unfavorite ${label}` : `Favorite ${label}`}
                  >
                    <Star size={11} fill={isFavorite ? "currentColor" : "none"} />
                  </button>

                  {isEquipped ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleUnequip(id); }}
                      className="flex h-7 w-7 items-center justify-center rounded-[0.7rem] border border-white/8 bg-white/[0.04] text-white/55 transition-all hover:bg-red-500/18 hover:text-red-300"
                      title={`Remove ${label}`}
                    >
                      <X size={12} />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEquipWithFeedback(id, url); }}
                      className="flex h-7 w-7 items-center justify-center rounded-[0.7rem] border border-white/8 bg-white/[0.04] text-white/45 transition-all"
                      style={{ borderColor: hexToRgba(panelAccent, 0.14) }}
                      title={`Equip ${label}`}
                    >
                      <ChevronRight size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Active left accent bar */}
              {isActive && (
                <span
                  className="wardrobe-active-bar absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full"
                  style={{ background: `linear-gradient(180deg, ${panelAccent}, ${cardAccent})`, '--bar-color': panelAccent }}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
