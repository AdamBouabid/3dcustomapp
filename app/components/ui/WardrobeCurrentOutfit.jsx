"use client";
import React, { useState } from "react";
import { Shirt, Wind, PersonStanding, Footprints, ChevronRight, X, Star } from "lucide-react";

const ICON_MAP = { Shirt, Wind, PersonStanding, Footprints };

export default function WardrobeCurrentOutfit({
  items,
  wardrobe,
  activeItem,
  setActiveItem,
  favoriteSet,
  handleEquip,
  handleUnequip,
  toggleFavorite,
}) {
  const [justEquipped, setJustEquipped] = useState(null);

  const handleEquipWithFeedback = (id, url) => {
    handleEquip(id, url);
    setJustEquipped(id);
    window.setTimeout(() => setJustEquipped(null), 550);
  };

  return (
    <section className="mt-3">
      <p className="font-kicker mb-2.5 px-1 text-[10px] tracking-[0.12em] text-white/40">Current outfit</p>
      <div className="flex flex-col gap-1.5">
        {items.map(({ id, label, url, icon, accent }) => {
          const Icon = ICON_MAP[icon] ?? Shirt;
          const isEquipped = Boolean(wardrobe[id]);
          const isActive = activeItem === id;
          const isFavorite = favoriteSet.has(id);

          return (
            <div
              key={id}
              onClick={() => setActiveItem(id)}
              className={`wardrobe-glow-hover group relative flex items-center gap-3 rounded-[1.2rem] px-3.5 py-2.5 cursor-pointer transition-all duration-200 ${
                isActive
                  ? "bg-[linear-gradient(135deg,rgba(99,102,241,0.22)_0%,rgba(139,92,246,0.10)_60%,rgba(255,255,255,0.03)_100%)] ring-1 ring-indigo-400/30 shadow-[0_4px_20px_rgba(99,102,241,0.18)]"
                  : "bg-white/[0.025] hover:bg-white/[0.055] hover:ring-1 hover:ring-white/8"
              }`}
            >
              {/* Icon thumbnail */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] overflow-hidden ${
                  justEquipped === id ? "animate-pulse" : ""
                }`}
                style={{
                  background: `linear-gradient(145deg, ${accent}40, ${accent}14)`,
                  boxShadow: `0 4px 14px ${accent}28, inset 0 1px 0 rgba(255,255,255,0.14)`,
                }}
              >
                <Icon size={18} style={{ color: accent, filter: `drop-shadow(0 0 6px ${accent}80)` }} />
              </div>

              <div className="text-[11px] text-white/50">
                {isEquipped ? (
                  <span className="wardrobe-status-equipped">Equipped</span>
                ) : (
                  <span className="wardrobe-status-available">Available</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(id); }}
                  className={`flex h-7 w-7 items-center justify-center rounded-[0.7rem] border transition-all ${
                    isFavorite
                      ? "border-indigo-300/40 bg-indigo-500/18 text-indigo-200"
                      : "border-white/8 bg-white/[0.04] text-white/38 hover:text-indigo-200"
                  }`}
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
                    className="flex h-7 w-7 items-center justify-center rounded-[0.7rem] border border-white/8 bg-white/[0.04] text-white/45 transition-all hover:text-indigo-200 hover:bg-indigo-500/10"
                    title={`Equip ${label}`}
                  >
                    <ChevronRight size={13} />
                  </button>
                )}
              </div>

              {/* Active left accent bar */}
              {isActive && (
                <span
                  className="wardrobe-active-bar absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full"
                  style={{ background: `linear-gradient(180deg, ${accent}, ${accent}90)`, '--bar-color': accent }}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
