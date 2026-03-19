"use client";
import React, { useState } from "react";
import { History, CheckSquare, Square, ListChecks, Shirt, Wind, PersonStanding, Footprints } from "lucide-react";
import MiniModelPreview from "./MiniModelPreview";

const ICON_MAP = { Shirt, Wind, PersonStanding, Footprints };

export default function WardrobeCatalogSection({
  catalogItems,
  isCatalogLoading,
  recentItems,
  activeItem,
  setActiveItem,
  selectionMode,
  selectedCatalogSet,
  selectedCatalogIds,
  toggleSelectionMode,
  selectAllVisible,
  clearSelection,
  equipSelected,
  unequipSelected,
  toggleCatalogSelection,
  previewBackdrop = "studio",
  onPreviewBackdropChange,
  activeCategory = "all",
  onCategoryChange,
}) {
  const [hoveredId, setHoveredId] = useState(null);
  const categories = [
    { id: "all", label: "All" },
    { id: "outfit", label: "Outfits" },
    { id: "top", label: "Tops" },
    { id: "bottom", label: "Bottoms" },
    { id: "dress", label: "Dresses" },
    { id: "shoes", label: "Shoes" },
  ];

  const backdropOptions = [
    { id: "studio", label: "Studio" },
    { id: "transparent", label: "Clear" },
    { id: "gradient", label: "Glow" },
  ];

  return (
    <section className="flex flex-col gap-3">
      <div className="wardrobe-elevated flex flex-wrap items-center gap-1.5 rounded-[1rem] p-2">
        <button
          type="button"
          onClick={toggleSelectionMode}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
            selectionMode
              ? "wardrobe-gradient-primary text-white"
              : "bg-white/[0.04] text-white/70 hover:text-white/90"
          }`}
        >
          {selectionMode ? <CheckSquare size={11} /> : <Square size={11} />} Multi-select
        </button>
        {selectionMode && (
          <>
            <button
              type="button"
              onClick={selectAllVisible}
              className="rounded-full bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-white/70 transition-colors hover:text-white/90"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="rounded-full bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-white/70 transition-colors hover:text-white/90"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={equipSelected}
              disabled={selectedCatalogIds.length === 0}
              className="wardrobe-gradient-cool rounded-full border border-cyan-100/35 px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors disabled:opacity-40"
            >
              Equip selected
            </button>
            <button
              type="button"
              onClick={unequipSelected}
              disabled={selectedCatalogIds.length === 0}
              className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-white/70 transition-colors hover:bg-red-500/16 hover:text-red-200 disabled:opacity-40"
            >
              Remove selected
            </button>
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-white/52">
              <ListChecks size={11} /> {selectedCatalogIds.length} selected
            </span>
          </>
        )}

        <div className={`flex items-center gap-1 ${selectionMode ? "w-full justify-end pt-1" : "ml-auto"}`}>
          {backdropOptions.map((option) => {
            const isCurrent = previewBackdrop === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onPreviewBackdropChange?.(option.id)}
                className={`rounded-full px-2.5 py-1.5 text-[10px] font-medium tracking-[0.04em] transition-colors ${
                  isCurrent
                    ? "bg-white/[0.14] text-white"
                    : "bg-white/[0.04] text-white/58 hover:text-white/86"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {recentItems.length > 0 && (
        <div className="rounded-[1.1rem] border border-white/8 bg-white/[0.04] px-2.5 py-2.5">
          <div className="mb-2 flex items-center gap-2 px-1">
            <History size={12} className="text-indigo-200/75" />
            <p className="font-kicker text-[10px] text-white/58">Recently used</p>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {recentItems.map(({ id, label, icon, accent }) => {
              const Icon = ICON_MAP[icon] ?? Shirt;
              const isActive = activeItem === id;
              return (
                <button
                  key={`recent-${id}`}
                  type="button"
                  onClick={() => setActiveItem(id)}
                  className={`wardrobe-glow-hover flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                    isActive
                      ? "border-indigo-300/40 bg-indigo-500/20 text-white"
                      : "border-white/10 bg-white/[0.03] text-white/62 hover:text-white/90 hover:bg-white/[0.06]"
                  }`}
                >
                  <Icon size={11} style={{ color: isActive ? "#ffd8c5" : accent }} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="catalog-grid mb-4">
        {catalogItems.map(({ id, label, url, accent, category, type }, index) => {
          const isActive = activeItem === id;
          const isSelected = selectedCatalogSet.has(id);
          const isHovered = hoveredId === id;

          return (
            <article
              key={id}
              role="button"
              tabIndex={0}
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => setHoveredId((current) => (current === id ? null : current))}
              onFocus={() => setHoveredId(id)}
              onBlur={() => setHoveredId((current) => (current === id ? null : current))}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") {
                  return;
                }

                event.preventDefault();
                setActiveItem(id);
                if (selectionMode) {
                  toggleCatalogSelection(id);
                }
              }}
              onClick={() => {
                setActiveItem(id);
                if (selectionMode) {
                  toggleCatalogSelection(id);
                }
              }}
              className={`catalog-card group ${isActive ? "catalog-card--active" : ""} ${isSelected ? "catalog-card--selected" : ""}`}
              style={{
                "--card-accent": accent,
                "--card-accent-soft": `${accent}33`,
                "--card-delay": `${Math.min(index * 24, 240)}ms`,
              }}
            >
              <span className="catalog-card__ring" aria-hidden="true" />
              <div className={`catalog-card__media catalog-card__media--${previewBackdrop}`}>
                {selectionMode && (
                  <label className="catalog-card__select" onClick={(event) => event.stopPropagation()}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleCatalogSelection(id)} />
                    <span>Select</span>
                  </label>
                )}
                <MiniModelPreview
                  url={url}
                  category={category}
                  type={type}
                  label={label}
                  hovered={isHovered}
                  color={accent}
                />
                <div className="catalog-card__label" aria-hidden={!isHovered && !isActive && !isSelected}>
                  <span className="catalog-card__label-text">{label}</span>
                </div>
              </div>
            </article>
          );
        })}

        {isCatalogLoading && (
          <p className="rounded-[1.2rem] border border-white/8 bg-white/[0.04] py-4 text-center text-[11px] tracking-[0.04em] text-white/48 high-contrast-label">Loading catalog...</p>
        )}
        {catalogItems.length === 0 && (
          <p className="rounded-[1.2rem] border border-white/8 bg-white/[0.04] py-4 text-center text-[11px] tracking-[0.04em] text-white/48 high-contrast-label">No items match this filter</p>
        )}
      </div>

      <div className="wardrobe-elevated sticky bottom-0 z-20 mt-auto flex items-center gap-1.5 rounded-[1.2rem] p-2.5 overflow-x-auto custom-scrollbar pb-3 backdrop-blur-md">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onCategoryChange?.(cat.id)}
            className={`flex-none rounded-full px-4 py-1.5 text-[11px] font-bold tracking-wide transition-all duration-200 ${
              activeCategory === cat.id
                ? "bg-[#8b5cf6] text-white shadow-[0_0_12px_rgba(139,92,246,0.6)]"
                : "bg-white/[0.03] text-white/60 border border-white/10 hover:bg-white/[0.08] hover:text-white/80"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </section>
  );
}
