"use client";
import React, { useMemo } from "react";
import { Home, Image as ImageIcon, Sparkles, SunMedium } from "lucide-react";
import WardrobePanelHeader from "./WardrobePanelHeader";
import WardrobeCustomizationSection from "./WardrobeCustomizationSection";
import { getPanelTheme } from "./roomCustomizationConfig";
import { hexToRgba, normalizeHex } from "./wardrobeUtils";

export default function WardrobeRoomPanel({
  roomCustomization,
  onRoomCustomizationChange,
  onApplyRoomPreset,
  scenePreset,
  onScenePresetChange,
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

  const metaPills = [
    { icon: Home, label: roomCustomization?.preset?.replace(/-/g, " ") ?? "gallery hall" },
    { icon: SunMedium, label: scenePreset.replace("gallery-", "") },
    { icon: ImageIcon, label: roomCustomization?.artImage ? "art linked" : "art pending" },
  ];

  return (
    <aside className="wardrobe-panel-shell wardrobe-panel-shell--atelier wardrobe-shell-in relative z-10 flex h-full w-full flex-col gap-3 overflow-y-auto rounded-[2rem] p-4 pb-6 text-white md:p-5 md:pb-8" style={panelStyle}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 rounded-t-[2rem]" style={{ background: `radial-gradient(ellipse at top, ${hexToRgba(panelAccent, 0.3)}, transparent 70%)` }} />

      <WardrobePanelHeader
        activeTab="room"
        title="Interior Atelier"
        badgeValue={<Sparkles size={20} strokeWidth={1.8} />}
        badgeLabel="Live"
        metaPills={metaPills}
      />

      <div className="wardrobe-room-hero">
        <div className="wardrobe-room-hero__glow" />
        <div className="wardrobe-room-hero__stats">
          <div className="wardrobe-stat-card">
            <span className="wardrobe-stat-card__label">Accent</span>
            <span className="wardrobe-stat-card__value" style={{ color: panelAccent }}>{panelAccent}</span>
          </div>
          <div className="wardrobe-stat-card">
            <span className="wardrobe-stat-card__label">Glow</span>
            <span className="wardrobe-stat-card__value">{Math.round((roomCustomization?.windowGlow ?? 0.92) * 100)}%</span>
          </div>
        </div>
      </div>

      <div className="wardrobe-content-stage wardrobe-content-stage--room wardrobe-fade-up flex flex-1 flex-col">
        <WardrobeCustomizationSection
          roomCustomization={roomCustomization}
          onUpdateRoomCustomization={onRoomCustomizationChange}
          onApplyRoomPreset={onApplyRoomPreset}
          scenePreset={scenePreset}
          onScenePresetChange={onScenePresetChange}
        />
      </div>
    </aside>
  );
}