"use client";
import React from "react";
import { History, CheckSquare, Square, ListChecks, Shirt, Wind, PersonStanding, Footprints, Star } from "lucide-react";
import { buildCardPalette, buildPreviewGradient } from "./wardrobeUtils";
import ColorPicker from "./ColorPicker";
import MiniModelPreview from "./MiniModelPreview";

const ICON_MAP = { Shirt, Wind, PersonStanding, Footprints };

export default function WardrobeCatalogSection({
  catalogItems,
  isCatalogLoading,
  recentItems,
  activeItem,
  setActiveItem,
  wardrobe,
  colors,
  favoriteSet,
  selectionMode,
  selectedCatalogSet,
  selectedCatalogIds,
  toggleSelectionMode,
  selectAllVisible,
  clearSelection,
  equipSelected,
  unequipSelected,
  toggleCatalogSelection,
  handleEquip,
  handleUnequip,
  setColor,
  toggleFavorite,
}) {
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

      <div className="catalog-grid">
        {catalogItems.map(({ id, label, url, icon, accent, category: itemCategory, type }) => {
          const Icon = ICON_MAP[icon] ?? Shirt;
          const isEquipped = Boolean(wardrobe[id]);
          const isActive = activeItem === id;
          const isFavorite = favoriteSet.has(id);
          const isSelected = selectedCatalogSet.has(id);
          const palette = buildCardPalette(accent);

          return (
            <article
              key={id}
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
              }}
            >
              <div className="catalog-card__media" style={{ background: buildPreviewGradient(accent) }}>
                {selectionMode && (
                  <label className="catalog-card__select" onClick={(event) => event.stopPropagation()}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleCatalogSelection(id)} />
                    <span>Select</span>
                  </label>
                )}
                {isEquipped && (
                  <span className="catalog-card__badge">Equipped</span>
                )}

                <button
                  type="button"
                  aria-label={isFavorite ? `Unfavorite ${label}` : `Favorite ${label}`}
                  className={`catalog-card__favorite ${isFavorite ? "catalog-card__favorite--active" : ""}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleFavorite(id);
                  }}
                >
                  <Star size={15} fill={isFavorite ? "currentColor" : "none"} />
                </button>

                <MiniModelPreview url={url} color={accent} />

                <div className="catalog-card__hover" aria-hidden="true">
                  <div className="catalog-card__hover-mannequin">
                    <div className="catalog-card__hover-body" />
                    <div className="catalog-card__hover-item" style={{ background: accent }} />
                  </div>
                  <div className="catalog-card__hover-details">
                    <span className="catalog-card__hover-title">Quick specs</span>
                    <span className="catalog-card__hover-meta">{itemCategory} · {type}</span>
                  </div>
                </div>
              </div>

              <div className="catalog-card__body">
                <div className="catalog-card__title-row">
                  <div>
                    <p className="catalog-card__title">{label}</p>
                    <div className="catalog-card__tags">
                      <span className="catalog-card__tag-main">
                        <Icon size={12} /> {itemCategory ?? "Custom"}
                      </span>
                      {type && <span className="catalog-card__tag-alt">{type}</span>}
                    </div>
                  </div>
                  <div className="catalog-card__cta">
                    {isEquipped ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleUnequip(id);
                        }}
                        className="catalog-card__btn catalog-card__btn--ghost"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleEquip(id, url);
                        }}
                        className="catalog-card__btn"
                      >
                        Equip
                      </button>
                    )}
                  </div>
                </div>

                <div className="catalog-card__swatches">
                  {palette.map((swatch, index) => {
                    const currentColor = (colors[id] ?? accent ?? "").toString().toLowerCase();
                    return (
                      <button
                        key={`${id}-swatch-${index}`}
                        type="button"
                        title={`Apply ${swatch}`}
                        className={`catalog-card__swatch ${currentColor === swatch.toLowerCase() ? "catalog-card__swatch--active" : ""}`}
                        style={{ background: swatch }}
                        onClick={(event) => {
                          event.stopPropagation();
                          setColor?.(id, swatch);
                        }}
                      />
                    );
                  })}
                  <div className="catalog-card__picker">
                    <ColorPicker color={colors[id] ?? accent} onChange={(hex) => setColor?.(id, hex)} />
                  </div>
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
    </section>
  );
}
