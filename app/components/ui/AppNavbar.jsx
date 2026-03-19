"use client";
import { useEffect, useState } from "react";
import {
  Sparkles, Shirt, Layers, Radar, Search, Shuffle, Trash2,
  SlidersHorizontal, Focus, PanelLeftClose, PanelLeft, Library,
  Paintbrush, Star, ChevronsUp, Package,
} from "lucide-react";
import Select from "./Select";

// ── Minimal icon button with CSS tooltip ──────────────────────────────────────
function IconBtn({ onClick, title, active = false, danger = false, disabled = false, className = "", children }) {
  return (
    <div className="group/ib relative">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={title}
        className={`wardrobe-glow-hover flex h-8 w-8 items-center justify-center rounded-xl border transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-40
          ${active && !danger
            ? "border-indigo-300/45 bg-indigo-500/20 text-indigo-100"
            : danger
            ? "border-white/10 bg-white/[0.04] text-white/62 hover:bg-red-500/14 hover:text-red-200"
            : "border-white/10 bg-white/[0.04] text-white/62 hover:text-white/92"
          } ${className}`}
      >
        {children}
      </button>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/12 bg-[rgba(10,11,18,0.96)] px-2.5 py-1 text-[11px] font-medium tracking-[0.01em] text-white/90 opacity-0 shadow-xl backdrop-blur-md transition-opacity duration-100 group-hover/ib:opacity-100">
        {title}
      </span>
    </div>
  );
}

export default function AppNavbar({
  isDark,
  totalItems,
  equippedCount,
  activeLabel,
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories,
  colorFamily,
  onColorFamilyChange,
  equippedOnly,
  onEquippedOnlyChange,
  favoritesOnly,
  onFavoritesOnlyChange,
  topsOnly,
  onTopsOnlyChange,
  recentlyImportedOnly,
  onRecentlyImportedOnlyChange,
  onRandomizeEquippedColors,
  onClearOutfit,
  hasEquipped,
  focusMode,
  onToggleFocusMode,
  panelCollapsed,
  onTogglePanel,
}) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const colorFamilies = ["all", "warm", "cool", "neutral"];

  useEffect(() => {
    const isTypingTarget = (target) => {
      if (!target) {
        return false;
      }

      const tagName = target.tagName?.toLowerCase();
      return tagName === "input" || tagName === "textarea" || tagName === "select" || target.isContentEditable;
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileFiltersOpen(false);
        return;
      }

      if (
        event.key === "/" &&
        window.innerWidth < 768 &&
        activeTab === "catalog" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !isTypingTarget(event.target)
      ) {
        event.preventDefault();
        setMobileFiltersOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeTab]);

  return (
    <header className="absolute left-3 right-3 top-3 z-30 md:left-4 md:right-4 md:top-4">
      <div className={`wardrobe-panel-shell wardrobe-panel-shell--navbar flex flex-col rounded-[1.2rem] px-3 py-0 md:px-3.5 ${isDark ? "" : "bg-white/65"}`}>

        {/* ── Row 1: Brand · Tabs · Icon actions ──────────────────────────── */}
        <div className="flex items-center gap-2 py-2.5">

          {/* Brand */}
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="wardrobe-gradient-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 text-white shadow-[0_8px_20px_rgba(79,70,229,0.35)]">
              <Sparkles size={15} />
            </div>
            <div className="hidden min-w-0 md:block">
              <p className="font-display truncate text-[18px] font-semibold leading-tight text-white">3D Wardrobe</p>
              <p className="font-kicker text-[10px] text-white/50">Studio</p>
            </div>
          </div>

          {/* Tab switcher — icon always, label visible on sm+ */}
          <div className="mx-auto flex rounded-full border border-white/12 bg-white/[0.06] p-1">
            <button
              type="button"
              onClick={() => onTabChange("outfit")}
              title="Outfit editor"
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium tracking-[0.02em] transition-all ${
                activeTab === "outfit" ? "wardrobe-gradient-primary text-white shadow-sm" : "text-white/58 hover:text-white/88"
              }`}
            >
              <Paintbrush size={11} />
              <span className="hidden sm:inline">Outfit</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange("catalog")}
              title="Item catalog"
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium tracking-[0.02em] transition-all ${
                activeTab === "catalog" ? "wardrobe-gradient-primary text-white shadow-sm" : "text-white/58 hover:text-white/88"
              }`}
            >
              <Library size={11} />
              <span className="hidden sm:inline">Catalog</span>
            </button>
          </div>

          {/* Right icon cluster */}
          <div className="flex items-center gap-1">
            {/* Counts — desktop only */}
            <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/62 md:inline-flex" title="Equipped items">
              <Shirt size={11} /> {equippedCount}
            </div>
            <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/62 md:inline-flex" title="Total catalog items">
              <Layers size={11} /> {totalItems}
            </div>
            {/* Active item pill */}
            <div className="wardrobe-gradient-cool hidden max-w-[10rem] items-center gap-1 rounded-full border border-cyan-100/30 px-2.5 py-1 text-[11px] font-medium text-white md:inline-flex">
              <Radar size={11} />
              <span className="truncate">{activeLabel || "—"}</span>
            </div>
            {/* Panel toggle */}
            <IconBtn
              onClick={onTogglePanel}
              title={panelCollapsed ? "Show panel  [B]" : "Hide panel  [B]"}
              active={!panelCollapsed}
            >
              {panelCollapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
            </IconBtn>
            {/* Focus mode */}
            <IconBtn
              onClick={onToggleFocusMode}
              title={focusMode ? "Exit focus  [F]" : "Focus mode  [F]"}
              active={focusMode}
            >
              <Focus size={14} />
            </IconBtn>
          </div>
        </div>

        {/* ── Row 2 (Catalog): filter bar ─────────────────────────────────── */}
        {activeTab === "catalog" && (
          <>
            <div className="wardrobe-hairline" />
            <div className="flex flex-wrap items-center gap-1.5 py-2">
            {/* Mobile: open filter panel */}
            <IconBtn
              onClick={() => setMobileFiltersOpen((v) => !v)}
              title="Filters  [/]"
              active={mobileFiltersOpen}
              className="md:hidden"
            >
              <SlidersHorizontal size={13} />
            </IconBtn>

            {/* Search input */}
            <div className="hidden min-w-[11rem] flex-1 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1.5 md:flex">
              <Search size={12} className="text-white/45" />
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search"
                className="w-full bg-transparent text-[11px] text-white/86 outline-none placeholder:text-white/34"
              />
            </div>

            {/* Category select */}
            <div className="hidden md:flex md:items-center md:gap-2">
              <Select
                value={category}
                onChange={onCategoryChange}
                options={categories.map((c) => ({ value: c, label: c }))}
                ariaLabel="Category"
              />
              <Select
                value={colorFamily}
                onChange={onColorFamilyChange}
                options={colorFamilies.map((c) => ({ value: c, label: c }))}
                ariaLabel="Color family"
              />
            </div>

            {/* Icon filter toggles */}
            <IconBtn onClick={() => onEquippedOnlyChange(!equippedOnly)} title="Equipped only" active={equippedOnly} className="hidden md:flex">
              <Shirt size={13} />
            </IconBtn>
            <IconBtn onClick={() => onFavoritesOnlyChange(!favoritesOnly)} title="Favorites only" active={favoritesOnly} className="hidden md:flex">
              <Star size={13} />
            </IconBtn>
            <IconBtn onClick={() => onTopsOnlyChange(!topsOnly)} title="Tops only" active={topsOnly} className="hidden md:flex">
              <ChevronsUp size={13} />
            </IconBtn>
            <IconBtn onClick={() => onRecentlyImportedOnlyChange(!recentlyImportedOnly)} title="New imports only" active={recentlyImportedOnly} className="hidden md:flex">
              <Package size={13} />
            </IconBtn>
          </div>
          </>
        )}

        {/* ── Row 2 (Outfit): quick actions ───────────────────────────────── */}
        {activeTab === "outfit" && (
          <>
            <div className="wardrobe-hairline" />
            <div className="flex items-center gap-1.5 py-2">
            <IconBtn
              onClick={onRandomizeEquippedColors}
              title="Shuffle all item colors"
              disabled={!hasEquipped}
              className="w-auto gap-1.5 px-3"
            >
              <Shuffle size={13} />
              <span className="text-[11px] font-medium">Shuffle</span>
            </IconBtn>
            <IconBtn
              onClick={onClearOutfit}
              title="Remove all equipped items"
              danger
              disabled={!hasEquipped}
              className="w-auto gap-1.5 px-3"
            >
              <Trash2 size={13} />
              <span className="text-[11px] font-medium">Clear</span>
            </IconBtn>
          </div>
          </>
        )}

        {/* ── Mobile filters panel ────────────────────────────────────────── */}
        {activeTab === "catalog" && mobileFiltersOpen && (
          <div className="md:hidden rounded-[1rem] border border-white/10 bg-black/35 p-2.5">
            <div className="mb-2 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1.5">
              <Search size={12} className="text-white/45" />
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search"
                className="w-full bg-transparent text-[12px] font-medium text-white/90 outline-none placeholder:text-white/36"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={category}
                onChange={onCategoryChange}
                options={categories.map((c) => ({ value: c, label: c }))}
                ariaLabel="Category"
                className="w-full"
                buttonClassName="w-full"
                listClassName="w-full"
              />
              <Select
                value={colorFamily}
                onChange={onColorFamilyChange}
                options={colorFamilies.map((c) => ({ value: c, label: c }))}
                ariaLabel="Color family"
                className="w-full"
                buttonClassName="w-full"
                listClassName="w-full"
              />
              <label className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-white/70">
                <input type="checkbox" checked={equippedOnly} onChange={(e) => onEquippedOnlyChange(e.target.checked)} className="h-3 w-3 accent-indigo-400" />
                Equipped
              </label>
              <label className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-white/70">
                <input type="checkbox" checked={favoritesOnly} onChange={(e) => onFavoritesOnlyChange(e.target.checked)} className="h-3 w-3 accent-indigo-400" />
                Favorites
              </label>
              <label className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-white/70">
                <input type="checkbox" checked={topsOnly} onChange={(e) => onTopsOnlyChange(e.target.checked)} className="h-3 w-3 accent-indigo-400" />
                Tops
              </label>
              <label className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-white/70">
                <input type="checkbox" checked={recentlyImportedOnly} onChange={(e) => onRecentlyImportedOnlyChange(e.target.checked)} className="h-3 w-3 accent-indigo-400" />
                New imports
              </label>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
