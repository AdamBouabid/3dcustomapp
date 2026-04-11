"use client";
import React, { useMemo } from "react";
import { Palette, Sparkles } from "lucide-react";
import WardrobePanelHeader from "./WardrobePanelHeader";
import ModelAppearanceSection from "./ModelAppearanceSection";
import { getPanelTheme } from "./roomCustomizationConfig";
import { hexToRgba, normalizeHex } from "./wardrobeUtils";

export default function BeautyPanel({
  roomCustomization,
  modelAppearance,
  onModelAppearanceChange,
  onResetModelAppearance,
  onModelFocusTargetChange,
  scenePreset = "gallery-day",
}) {
  const panelTheme = useMemo(() => getPanelTheme(roomCustomization?.panelTheme), [roomCustomization?.panelTheme]);
  const panelAccent = normalizeHex(roomCustomization?.panelAccent ?? "#7486ff");
  const panelStyle = useMemo(() => ({
    "--panel-accent": panelAccent,
    "--panel-accent-soft": hexToRgba(panelAccent, 0.24),
    "--panel-accent-ring": hexToRgba(panelAccent, 0.42),
    "--panel-accent-contrast": hexToRgba(panelAccent, 0.8),
    "--panel-surface-start": panelTheme.surfaceStart,
    "--panel-surface-mid": panelTheme.surfaceMid,
    "--panel-surface-end": panelTheme.surfaceEnd,
    "--panel-overlay-a": panelTheme.overlayA,
    "--panel-overlay-b": panelTheme.overlayB,
    "--panel-border": panelTheme.border,
    "--panel-rim": panelTheme.rim,
    "--panel-shadow-color": panelTheme.shadow,
    "--panel-outline": panelTheme.outline,
  }), [panelAccent, panelTheme]);

  const metaPills = useMemo(() => ([
    { icon: Palette, label: "hair nails lips" },
    { icon: Sparkles, label: "live beauty" },
    { label: scenePreset.replace("gallery-", "") },
  ]), [scenePreset]);

  return (
    <aside className="wardrobe-panel-shell wardrobe-panel-shell--wardrobe wardrobe-shell-in relative z-10 flex h-full w-full flex-col gap-3 overflow-y-auto rounded-[2rem] p-4 pb-6 text-white md:p-5 md:pb-8" style={panelStyle}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-[2rem]" style={{ background: `radial-gradient(ellipse at top, ${hexToRgba(panelAccent, 0.24)}, transparent 68%)` }} />

      <WardrobePanelHeader
        activeTab="outfit"
        title="Beauty Center"
        subtitle="Editorial finishing for the live model"
        badgeValue={<Palette size={20} strokeWidth={1.9} />}
        badgeLabel="Beauty"
        metaPills={metaPills}
      />

      <div className="wardrobe-content-stage wardrobe-content-stage--outfit wardrobe-fade-up flex flex-1 flex-col">
        <ModelAppearanceSection
          modelAppearance={modelAppearance}
          onUpdateModelAppearance={onModelAppearanceChange}
          onResetModelAppearance={onResetModelAppearance}
          onFocusModelAppearance={onModelFocusTargetChange}
          accentColor={panelAccent}
        />
      </div>
    </aside>
  );
}
