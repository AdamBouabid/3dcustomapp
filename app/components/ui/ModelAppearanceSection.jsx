"use client";
import React from "react";
import { Droplets, Palette, RefreshCcw, Sparkles } from "lucide-react";
import ColorPicker from "./ColorPicker";
import { MODEL_APPEARANCE_FIELDS } from "./modelAppearanceConfig";
import { hexToRgba, normalizeHex } from "./wardrobeUtils";

function swatchStyle(color, isActive, accentColor) {
  return {
    background: color,
    boxShadow: isActive
      ? `0 0 0 3px rgba(255,255,255,0.94), 0 0 0 7px ${hexToRgba(accentColor, 0.24)}, 0 12px 22px rgba(0,0,0,0.22)`
      : "0 8px 18px rgba(0,0,0,0.22)",
  };
}

export default function ModelAppearanceSection({
  modelAppearance,
  onUpdateModelAppearance,
  onResetModelAppearance,
  onFocusModelAppearance,
  accentColor = "#7486ff",
}) {
  const panelAccent = normalizeHex(accentColor);

  return (
    <section className="mt-3 px-1">
      <div className="relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.018))] px-4 py-3 shadow-[0_14px_30px_rgba(0,0,0,0.14)] backdrop-blur-md">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background: `radial-gradient(circle at 14% 18%, ${hexToRgba(panelAccent, 0.22)}, transparent 30%), radial-gradient(circle at 88% 16%, rgba(255,235,214,0.1), transparent 22%)`,
          }}
        />

        <div className="relative flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-kicker text-[10px] text-white/38">Beauty center</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-[0.9rem] border border-white/10 bg-white/[0.05] text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                <Palette size={14} />
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-[0.96rem] font-semibold text-white">Model finishing</h3>
                <p className="truncate text-[11px] text-white/42">Hair, nails, lips, eyes, and complexion update live.</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onResetModelAppearance?.()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/58 transition hover:bg-white/[0.08] hover:text-white/78"
          >
            <RefreshCcw size={12} /> Reset
          </button>
        </div>

        <div className="relative mt-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/38">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-white/54">
            <Sparkles size={11} /> Live avatar tint
          </span>
          <span className="hidden h-1 w-1 rounded-full bg-white/16 sm:block" />
          <span className="hidden text-white/30 sm:inline">Quick color lineup</span>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2.5 px-1">
        {MODEL_APPEARANCE_FIELDS.map((field) => {
          const value = normalizeHex(modelAppearance?.[field.key] ?? "#7486ff");
          return (
            <div
              key={field.key}
              className="wardrobe-interior-card flex flex-col gap-2.5 rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-3 backdrop-blur-md"
              onClick={() => onFocusModelAppearance?.(field.key)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[0.8rem] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                      style={{ background: `linear-gradient(145deg, ${hexToRgba(value, 0.32)}, rgba(255,255,255,0.05))` }}
                    >
                      <Droplets size={12} style={{ color: value }} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-white/84">{field.label}</p>
                      <p className="truncate text-[10px] text-white/42">{field.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-white/8 bg-white/[0.04] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-white/46">
                    {value}
                  </span>
                  <ColorPicker
                    color={value}
                    onChange={(nextValue) => {
                      onFocusModelAppearance?.(field.key);
                      onUpdateModelAppearance?.({ [field.key]: nextValue });
                    }}
                    triggerClassName="h-9 w-9 shrink-0 rounded-full border border-white/14 shadow-[0_8px_18px_rgba(0,0,0,0.2)] transition hover:scale-[1.04] active:scale-[0.97]"
                    triggerTitle={`Customize ${field.label.toLowerCase()}`}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {field.swatches.map((swatch) => {
                  const isActive = normalizeHex(swatch).toLowerCase() === value.toLowerCase();
                  return (
                    <button
                      key={`${field.key}-${swatch}`}
                      type="button"
                      onClick={() => {
                        onFocusModelAppearance?.(field.key);
                        onUpdateModelAppearance?.({ [field.key]: swatch });
                      }}
                      className={`wardrobe-swatch wardrobe-swatch--compact ${isActive ? "wardrobe-swatch--active" : ""}`}
                      style={swatchStyle(swatch, isActive, panelAccent)}
                      title={`${field.label}: ${swatch}`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
