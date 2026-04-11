"use client";
import React, { useState, useMemo } from "react";
import { Shirt, Layers, Sparkles, Crown, Footprints, ChevronRight, X, Star, Sun, Moon, Briefcase, Coffee, RotateCcw, Trash2, Search, Filter } from "lucide-react";
import { hexToRgba, normalizeHex } from "./wardrobeUtils";

const ICON_MAP = {
  Shirt, Layers, Sparkles, Crown, Footprints,
  Wind: Layers, PersonStanding: Sparkles,
};

const OUTFIT_THEME_PRESETS = {
  day: { label: "Day", icon: Sun, colors: ["#fbbf24", "#60a5fa", "#f4f4f5"] },
  night: { label: "Night", icon: Moon, colors: ["#4b5563", "#7c3aed", "#e879f9"] },
  work: { label: "Work", icon: Briefcase, colors: ["#0ea5e9", "#64748b", "#0f766e"] },
  casual: { label: "Casual", icon: Coffee, colors: ["#22c55e", "#f97316", "#6366f1"] },
};

const CATEGORY_FILTERS = [
  { id: "all", label: "All" },
  { id: "tops", label: "Tops" },
  { id: "bottoms", label: "Bottoms" },
  { id: "footwear", label: "Footwear" },
  { id: "dresses", label: "Dresses" },
];

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
  advancedActions,
}) {
  const [justEquipped, setJustEquipped] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const panelAccent = normalizeHex(accentColor);

  const handleEquipWithFeedback = (id, url) => {
    handleEquip(id, url);
    setJustEquipped(id);
    window.setTimeout(() => setJustEquipped(null), 550);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = !searchQuery ||
        item.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const itemCat = (item.type || item.category || "").toLowerCase();
      const matchesCategory = selectedCategory === "all" ||
        itemCat === selectedCategory.toLowerCase() ||
        itemCat.includes(selectedCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
  };

  const hasFilters = searchQuery || selectedCategory !== "all";
  const canUndo = advancedActions?.wardrobeHistory?.length > 0;

  return (
    <section className="mt-2 px-1 pb-1">
      {/* Outfit Presets */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="font-kicker text-[10px] tracking-[0.12em] text-white/40">Quick presets</p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => advancedActions?.undoOutfit?.()}
              disabled={!canUndo}
              className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-all"
              style={{
                borderColor: canUndo ? hexToRgba(panelAccent, 0.3) : "rgba(255,255,255,0.06)",
                background: canUndo ? hexToRgba(panelAccent, 0.08) : "transparent",
                color: canUndo ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.24)",
                cursor: canUndo ? "pointer" : "not-allowed",
              }}
              aria-label="Undo last outfit change"
              title="Undo last outfit change"
            >
              <RotateCcw size={10} aria-hidden="true" />
              Undo
            </button>
            <button
              onClick={() => advancedActions?.clearOutfit?.()}
              className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-transparent px-2.5 py-1 text-[10px] font-semibold text-white/[0.32] transition-all hover:border-red-400/20 hover:text-red-300/60"
              aria-label="Clear entire outfit"
              title="Clear entire outfit"
            >
              <Trash2 size={10} aria-hidden="true" />
              Clear
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5 px-1">
          {Object.entries(OUTFIT_THEME_PRESETS).map(([id, preset]) => {
            const Icon = preset.icon;
            const isActive = advancedActions?.activeOutfitMode === id;
            return (
              <button
                key={id}
                onClick={() => advancedActions?.applyOutfitTheme?.(id)}
                className="relative flex flex-col gap-1.5 rounded-[1rem] border px-3 py-2.5 text-left transition-all duration-200 hover:-translate-y-[1px]"
                style={{
                  borderColor: isActive ? hexToRgba(panelAccent, 0.48) : "rgba(255,255,255,0.08)",
                  background: isActive
                    ? `linear-gradient(135deg, ${hexToRgba(panelAccent, 0.18)} 0%, ${hexToRgba(panelAccent, 0.06)} 100%)`
                    : "rgba(255,255,255,0.03)",
                  boxShadow: isActive ? `0 8px 20px ${hexToRgba(panelAccent, 0.12)}` : "none",
                }}
                aria-pressed={isActive}
                aria-label={`Apply ${preset.label} outfit preset`}
                title={`Apply ${preset.label} outfit preset`}
              >
                <div className="flex items-center gap-1.5">
                  <Icon size={11} style={{ color: isActive ? panelAccent : "rgba(255,255,255,0.48)" }} aria-hidden="true" />
                  <span className="text-[11px] font-semibold text-white/[0.78]">{preset.label}</span>
                </div>
                <div className="flex gap-1">
                  {preset.colors.map((color, i) => (
                    <span
                      key={i}
                      className="h-3 w-3 rounded-full border border-white/10"
                      style={{ background: color }}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                {isActive && (
                  <span
                    className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full"
                    style={{ background: panelAccent, boxShadow: `0 0 6px ${hexToRgba(panelAccent, 0.8)}` }}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search + Filters */}
      <div className="mb-3 px-1">
        <div className="relative mb-2">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items…"
            className="wardrobe-input w-full rounded-[1rem] border border-white/10 bg-white/[0.04] py-2 pl-8 pr-3 text-[11px] text-white placeholder:text-white/[0.28] focus-visible:outline-none"
            aria-label="Search wardrobe items"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              aria-label="Clear search"
              title="Clear search"
            >
              <X size={10} aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
          {CATEGORY_FILTERS.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] transition-all"
                style={{
                  borderColor: isActive ? hexToRgba(panelAccent, 0.44) : "rgba(255,255,255,0.08)",
                  background: isActive ? hexToRgba(panelAccent, 0.12) : "rgba(255,255,255,0.03)",
                  color: isActive ? "rgba(255,255,255,0.86)" : "rgba(255,255,255,0.38)",
                }}
                aria-pressed={isActive}
                aria-label={`Filter by ${cat.label}`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Items Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="font-kicker text-[10px] tracking-[0.12em] text-white/40">
          {filteredItems.length > 0 ? `${filteredItems.length} item${filteredItems.length !== 1 ? "s" : ""}` : "Current outfit"}
        </p>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-[10px] text-white/[0.36] hover:text-white/60 transition-colors"
            aria-label="Clear all filters"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Items List or Empty State */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[1.4rem] border border-white/[0.06] bg-white/[0.02] py-8 px-4 text-center">
          <Filter size={22} className="text-white/20" aria-hidden="true" />
          <div>
            <p className="text-[12px] font-semibold text-white/[0.48]">No items found</p>
            <p className="mt-0.5 text-[10px] text-white/[0.28]">
              {searchQuery ? `No results for "${searchQuery}"` : "No items in this category"}
            </p>
          </div>
          <button
            onClick={clearFilters}
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[11px] font-semibold text-white/60 transition-all hover:bg-white/[0.08]"
            aria-label="Clear all filters to show all items"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="wardrobe-motion-list flex flex-col gap-2 px-1" role="list" aria-label="Wardrobe items">
          {filteredItems.map(({ id, label, url, icon, accent }, index) => {
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
                role="listitem"
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
                aria-selected={isActive}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActiveItem(id); } }}
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
                  aria-hidden="true"
                >
                  <Icon size={18} style={{ color: cardAccent, filter: `drop-shadow(0 0 6px ${hexToRgba(panelAccent, 0.5)})` }} />
                </div>

                {/* Item label */}
                <div className="flex-1 text-left text-[11px] font-semibold uppercase tracking-wide text-white/70 px-1">
                  {label}
                  {isEquipped && (
                    <span className="ml-1.5 wardrobe-status-equipped">Equipped</span>
                  )}
                </div>

                {/* Right-side actions */}
                <div className="flex items-center gap-1" role="group" aria-label={`Actions for ${label}`}>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(id); }}
                    className="flex h-7 w-7 items-center justify-center rounded-[0.7rem] border transition-all"
                    style={{
                      borderColor: isFavorite ? hexToRgba(panelAccent, 0.42) : "rgba(255,255,255,0.08)",
                      background: isFavorite ? hexToRgba(panelAccent, 0.18) : "rgba(255,255,255,0.04)",
                      color: isFavorite ? "#e8ebff" : "rgba(255,255,255,0.38)",
                    }}
                    aria-label={isFavorite ? `Unfavorite ${label}` : `Favorite ${label}`}
                    aria-pressed={isFavorite}
                    title={isFavorite ? `Unfavorite ${label}` : `Favorite ${label}`}
                  >
                    <Star size={11} fill={isFavorite ? "currentColor" : "none"} aria-hidden="true" />
                  </button>

                  {isEquipped ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleUnequip(id); }}
                      className="flex h-7 w-7 items-center justify-center rounded-[0.7rem] border border-white/[0.08] bg-white/[0.04] text-white/[0.55] transition-all hover:bg-red-500/[0.18] hover:text-red-300"
                      aria-label={`Remove ${label} from outfit`}
                      title={`Remove ${label} from outfit`}
                    >
                      <X size={12} aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEquipWithFeedback(id, url); }}
                      className={`flex h-7 w-7 items-center justify-center rounded-[0.7rem] border border-white/[0.08] bg-white/[0.04] text-white/[0.45] transition-all ${justEquipped === id ? "wardrobe-action-pulse" : ""}`}
                      style={{ borderColor: hexToRgba(panelAccent, 0.14) }}
                      aria-label={`Equip ${label}`}
                      title={`Equip ${label}`}
                    >
                      <ChevronRight size={13} aria-hidden="true" />
                    </button>
                  )}
                </div>

                {/* Active left accent bar */}
                {isActive && (
                  <span
                    className="wardrobe-active-bar absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full"
                    style={{ background: `linear-gradient(180deg, ${panelAccent}, ${cardAccent})`, '--bar-color': panelAccent }}
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
