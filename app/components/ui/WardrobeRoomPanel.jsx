"use client";
import React, { useMemo } from "react";
import Image from "next/image";
import { Home, Image as ImageIcon, Sparkles, SunMedium } from "lucide-react";
import WardrobePanelHeader from "./WardrobePanelHeader";
import WardrobeCustomizationSection from "./WardrobeCustomizationSection";
import { getPanelTheme } from "./roomCustomizationConfig";
import { hexToRgba, normalizeHex } from "./wardrobeUtils";

export default function WardrobeRoomPanel({
  roomCustomization,
  onRoomCustomizationChange,
  scenePreset,
  onScenePresetChange,
  occasionPresets,
  activeOccasionId,
  onApplyOccasionSuggestion,
  savedScenes,
  onSaveScene,
  onLoadScene,
  onDeleteScene,
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
  const occasionCards = useMemo(() => Object.entries(occasionPresets ?? {}), [occasionPresets]);
  const lookbookScenes = useMemo(() => savedScenes ?? [], [savedScenes]);

  return (
    <aside
      className="wardrobe-panel-shell wardrobe-panel-shell--atelier wardrobe-shell-in relative z-10 flex h-full w-full flex-col rounded-[2rem] text-white"
      style={{ ...panelStyle, overflow: "hidden" }}
    >
      {/* Ambient top glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-36 rounded-t-[2rem]"
        style={{ background: `radial-gradient(ellipse at top, ${hexToRgba(panelAccent, 0.28)}, transparent 68%)` }}
      />

      {/* Scrollable content area */}
      <div className="room-panel-scroll relative flex flex-1 flex-col gap-3 overflow-y-auto p-4 pb-3 md:p-5 md:pb-3">
        <div className="room-panel-sticky-top">
          <WardrobePanelHeader
            activeTab="room"
            title="Interior Atelier"
            badgeValue={<Sparkles size={20} strokeWidth={1.8} />}
            badgeLabel="Live"
            metaPills={metaPills}
          />

          {/* Hero stats strip */}
          <div className="room-hero-strip room-hero-strip--sticky">
          <div className="room-hero-strip__glow" style={{ background: `radial-gradient(circle, ${hexToRgba(panelAccent, 0.3)} 0%, transparent 68%)` }} />
          <div className="room-hero-strip__inner">
            <div className="room-hero-stat">
              <span className="room-hero-stat__label">Accent</span>
              <span className="room-hero-stat__value" style={{ color: panelAccent }}>{panelAccent}</span>
            </div>
            <div className="room-hero-strip__sep" />
            <div className="room-hero-stat">
              <span className="room-hero-stat__label">Theme</span>
              <span className="room-hero-stat__value">{panelTheme.label ?? "Obsidian"}</span>
            </div>
            <div className="room-hero-strip__sep" />
            <div className="room-hero-stat">
              <span className="room-hero-stat__label">Glow</span>
              <span className="room-hero-stat__value">{Math.round((roomCustomization?.windowGlow ?? 0.92) * 100)}%</span>
            </div>
          </div>
        </div>
        </div>

        {occasionCards.length > 0 && (
          <section className="room-occasion-panel">
            <div className="room-section__label">Occasion Director</div>
            <div className="room-occasion-grid">
              {occasionCards.map(([id, preset], index) => {
                const isActive = activeOccasionId === id;
                return (
                  <button
                    key={id}
                    className={`room-occasion-card ${isActive ? "room-occasion-card--active" : ""}`}
                    style={{ animationDelay: `${index * 40}ms` }}
                    onClick={() => onApplyOccasionSuggestion?.(id)}
                  >
                    <span className="room-occasion-card__label">{preset.label}</span>
                    <span className="room-occasion-card__meta">{preset.scenePreset.replace("gallery-", " ")} · {preset.roomPreset.replace(/-/g, " ")}</span>
                    <span className="room-occasion-card__cta">Apply full direction</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section className="room-lookbook-panel">
          <div className="room-lookbook-panel__header">
            <div className="room-section__label">Local Lookbook</div>
            <button className="room-lookbook-panel__save" onClick={() => onSaveScene?.()}>
              Save Current Scene
            </button>
          </div>
          {lookbookScenes.length === 0 ? (
            <div className="room-lookbook-panel__empty">Saved scenes stay on this device. Save a direction once you like the outfit, room mood, and decor layout.</div>
          ) : (
            <div className="room-lookbook-panel__list">
              {lookbookScenes.map((scene) => (
                <div key={scene.id} className="room-lookbook-card">
                  <button className="room-lookbook-card__main" onClick={() => onLoadScene?.(scene.id)}>
                    {scene.snapshot ? (
                      <Image className="room-lookbook-card__thumb" src={scene.snapshot} alt={scene.name} width={58} height={58} unoptimized />
                    ) : (
                      <div className="room-lookbook-card__thumb room-lookbook-card__thumb--empty">No preview</div>
                    )}
                    <span className="room-lookbook-card__copy">
                      <span className="room-lookbook-card__name">{scene.name}</span>
                      <span className="room-lookbook-card__meta">{new Date(scene.createdAt).toLocaleDateString()}</span>
                    </span>
                  </button>
                  <button className="room-lookbook-card__delete" onClick={() => onDeleteScene?.(scene.id)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Room controls */}
        <div className="wardrobe-content-stage wardrobe-content-stage--room wardrobe-fade-up flex flex-1 flex-col">
          <WardrobeCustomizationSection
            roomCustomization={roomCustomization}
            onUpdateRoomCustomization={onRoomCustomizationChange}
            scenePreset={scenePreset}
            onScenePresetChange={onScenePresetChange}
          />
        </div>
      </div>
    </aside>
  );
}