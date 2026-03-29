"use client";
import React, { useEffect, useRef, useState } from "react";
import { Check, Layers, Palette, X } from "lucide-react";
import ColorPicker from "./ColorPicker";
import { ACCENT_SWATCHES, PANEL_THEME_OPTIONS } from "./roomCustomizationConfig";
import { hexToRgba, isValidHexColor, normalizeHex } from "./wardrobeUtils";

export default function PanelStyleDrawer({ roomCustomization, onUpdateRoomCustomization }) {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef(null);

  const accentColor = normalizeHex(roomCustomization?.panelAccent ?? "#7486ff");
  const activeThemeId = roomCustomization?.panelTheme ?? "obsidian";
  const currentTheme = PANEL_THEME_OPTIONS.find((t) => t.id === activeThemeId) ?? PANEL_THEME_OPTIONS[0];

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div className="panel-style-root">
      {/* ── Trigger button ── */}
      <button
        type="button"
        className="panel-style-trigger"
        onClick={() => setOpen(true)}
        aria-label="Customize panel style"
        style={{
          "--accent-soft": hexToRgba(accentColor, 0.18),
          "--accent-border": hexToRgba(accentColor, 0.32),
        }}
      >
        <span
          className="panel-style-trigger__preview"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.surfaceStart}, ${currentTheme.surfaceEnd})`,
            borderColor: hexToRgba(accentColor, 0.4),
          }}
        >
          <span
            className="panel-style-trigger__preview-dot"
            style={{ background: `linear-gradient(135deg, ${currentTheme.overlayA}, ${currentTheme.overlayB})` }}
          />
        </span>

        <span className="panel-style-trigger__body">
          <span className="panel-style-trigger__eyebrow">Panel Style</span>
          <span className="panel-style-trigger__name">{currentTheme.label}</span>
        </span>

        <span
          className="panel-style-trigger__accent-dot"
          style={{ background: accentColor, boxShadow: `0 0 10px ${hexToRgba(accentColor, 0.52)}` }}
        />

        <Layers size={13} className="panel-style-trigger__icon" />
      </button>

      {/* ── Overlay + Drawer ── */}
      {open && (
        <div
          className="panel-style-overlay"
          onMouseDown={() => setOpen(false)}
          aria-modal="true"
          role="dialog"
          aria-label="Panel style options"
          style={{
            "--preview-accent": accentColor,
            "--preview-accent-soft": hexToRgba(accentColor, 0.18),
            "--preview-accent-strong": hexToRgba(accentColor, 0.42),
            "--preview-theme-border": currentTheme.border,
            "--preview-theme-rim": currentTheme.rim,
            "--preview-theme-a": currentTheme.overlayA,
            "--preview-theme-b": currentTheme.overlayB,
          }}
        >
          <div className="panel-style-overlay__showcase" aria-hidden="true">
            <div
              className="panel-style-overlay__ambient panel-style-overlay__ambient--primary"
              style={{ background: `radial-gradient(circle, ${hexToRgba(accentColor, 0.3)} 0%, transparent 68%)` }}
            />
            <div
              className="panel-style-overlay__ambient panel-style-overlay__ambient--secondary"
              style={{ background: `radial-gradient(circle, ${currentTheme.overlayA} 0%, transparent 72%)` }}
            />

            <div
              className="panel-style-preview"
              style={{
                backgroundImage: `radial-gradient(circle at 18% 22%, ${currentTheme.overlayA}, transparent 44%), radial-gradient(circle at 78% 82%, ${currentTheme.overlayB}, transparent 38%), linear-gradient(160deg, ${currentTheme.surfaceStart}, ${currentTheme.surfaceEnd})`,
                borderColor: currentTheme.border,
                boxShadow: `0 24px 48px ${hexToRgba(accentColor, 0.12)}, inset 0 1px 0 ${currentTheme.rim}`,
              }}
            >
              <div className="panel-style-preview__ring" />
              <div className="panel-style-preview__grain" />
              <div className="panel-style-preview__shimmer" />
              <div className="panel-style-preview__header">
                <div className="panel-style-preview__badge-row">
                  <span className="panel-style-preview__eyebrow">Live applied style</span>
                  <span className="panel-style-preview__badge" style={{ borderColor: hexToRgba(accentColor, 0.34), color: accentColor }}>
                    {currentTheme.label}
                  </span>
                </div>
                <div className="panel-style-preview__icon-row">
                  <span className="panel-style-preview__ghost-button panel-style-preview__ghost-button--circle" />
                  <span className="panel-style-preview__ghost-button panel-style-preview__ghost-button--circle" />
                  <span className="panel-style-preview__ghost-button panel-style-preview__ghost-button--pill" />
                </div>
              </div>

              <div className="panel-style-preview__body">
                <div className="panel-style-preview__rail">
                  <span className="panel-style-preview__rail-dot" style={{ background: accentColor, boxShadow: `0 0 14px ${hexToRgba(accentColor, 0.55)}` }} />
                  <span className="panel-style-preview__rail-line panel-style-preview__rail-line--strong" />
                  <span className="panel-style-preview__rail-line" />
                  <span className="panel-style-preview__rail-line panel-style-preview__rail-line--short" />
                </div>

                <div className="panel-style-preview__cards">
                  <div className="panel-style-preview__card panel-style-preview__card--feature">
                    <div className="panel-style-preview__card-top">
                      <span className="panel-style-preview__token" style={{ background: hexToRgba(accentColor, 0.16), borderColor: hexToRgba(accentColor, 0.34), color: accentColor }}>
                        Accent
                      </span>
                      <span className="panel-style-preview__mini-line panel-style-preview__mini-line--short" />
                    </div>
                    <span className="panel-style-preview__line panel-style-preview__line--title" />
                    <span className="panel-style-preview__line panel-style-preview__line--medium" />
                    <div className="panel-style-preview__chip-row">
                      <span className="panel-style-preview__chip">Blur</span>
                      <span className="panel-style-preview__chip">Border</span>
                      <span className="panel-style-preview__chip">Glow</span>
                    </div>
                  </div>

                  <div className="panel-style-preview__card-grid">
                    <div className="panel-style-preview__card panel-style-preview__card--compact">
                      <span className="panel-style-preview__mini-line panel-style-preview__mini-line--tiny" />
                      <span className="panel-style-preview__line panel-style-preview__line--short" />
                    </div>
                    <div className="panel-style-preview__card panel-style-preview__card--compact">
                      <span className="panel-style-preview__mini-line panel-style-preview__mini-line--tiny" />
                      <span className="panel-style-preview__line panel-style-preview__line--short" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel-style-preview__mesh">
                <span className="panel-style-preview__mesh-line panel-style-preview__mesh-line--left" />
                <span className="panel-style-preview__mesh-line panel-style-preview__mesh-line--right" />
              </div>
            </div>
          </div>

          <div
            ref={drawerRef}
            className="panel-style-drawer"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="panel-style-drawer__header">
              <div className="panel-style-drawer__header-left">
                <div
                  className="panel-style-drawer__header-swatch"
                  style={{
                    background: `linear-gradient(135deg, ${currentTheme.surfaceStart}, ${currentTheme.surfaceEnd})`,
                    border: `1px solid ${currentTheme.border}`,
                  }}
                >
                  <span
                    className="panel-style-drawer__header-dot"
                    style={{ background: `linear-gradient(135deg, ${currentTheme.overlayA}, ${currentTheme.overlayB})` }}
                  />
                </div>
                <div>
                  <p className="panel-style-drawer__eyebrow">Panel Appearance</p>
                  <p className="panel-style-drawer__title">{currentTheme.label}</p>
                </div>
              </div>
              <button
                type="button"
                className="panel-style-drawer__close"
                onClick={() => setOpen(false)}
                aria-label="Close panel style drawer"
              >
                <X size={13} />
              </button>
            </div>

            {/* Hairline */}
            <div className="panel-style-drawer__divider" />

            {/* Theme grid */}
            <div className="panel-style-drawer__section">
              <p className="panel-style-drawer__section-label">
                <Layers size={11} className="inline-block mr-1 opacity-60" />
                Theme
              </p>
              <div className="panel-style-drawer__themes">
                {PANEL_THEME_OPTIONS.map((theme) => {
                  const isActive = activeThemeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      className={`panel-style-theme-tile ${isActive ? "panel-style-theme-tile--active" : ""}`}
                      onClick={() => onUpdateRoomCustomization?.({ panelTheme: theme.id })}
                      style={{
                        backgroundImage: `radial-gradient(circle at 18% 22%, ${theme.overlayA}, transparent 44%), linear-gradient(140deg, ${theme.surfaceStart}, ${theme.surfaceEnd})`,
                        borderColor: isActive ? hexToRgba(accentColor, 0.55) : "rgba(255,255,255,0.08)",
                        boxShadow: isActive
                          ? `0 0 0 1px ${hexToRgba(accentColor, 0.22)}, 0 10px 26px rgba(0,0,0,0.24), inset 0 1px 0 ${theme.rim}`
                          : `inset 0 1px 0 ${theme.rim}`,
                      }}
                    >
                      <span
                        className="panel-style-theme-tile__dot"
                        style={{ background: `linear-gradient(135deg, ${theme.overlayA}, ${theme.overlayB})` }}
                      />
                      <span className="panel-style-theme-tile__label">{theme.label}</span>
                      {isActive && (
                        <span className="panel-style-theme-tile__check">
                          <Check size={10} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accent color */}
            <div className="panel-style-drawer__section">
              <div className="panel-style-drawer__accent-header">
                <p className="panel-style-drawer__section-label">
                  <Palette size={11} className="inline-block mr-1 opacity-60" />
                  Accent Color
                </p>
                <ColorPicker
                  color={accentColor}
                  onChange={(val) => {
                    if (isValidHexColor(val)) {
                      onUpdateRoomCustomization?.({ panelAccent: normalizeHex(val) });
                    }
                  }}
                  triggerClassName="h-6 w-6 rounded-full border border-white/18 shadow-md transition hover:scale-110 active:scale-95"
                  triggerTitle="Custom accent"
                />
              </div>
              <div className="panel-style-drawer__accents">
                {ACCENT_SWATCHES.map((swatch) => {
                  const isActive =
                    normalizeHex(swatch.hex).toLowerCase() === accentColor.toLowerCase();
                  return (
                    <button
                      key={swatch.id}
                      type="button"
                      className={`panel-style-accent-swatch ${isActive ? "panel-style-accent-swatch--active" : ""}`}
                      onClick={() => onUpdateRoomCustomization?.({ panelAccent: swatch.hex })}
                      title={swatch.label}
                      style={{
                        background: swatch.hex,
                        boxShadow: isActive
                          ? `0 0 0 3px ${hexToRgba(swatch.hex, 0.4)}, 0 6px 14px rgba(0,0,0,0.22)`
                          : "0 4px 10px rgba(0,0,0,0.18)",
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Description blurb */}
            <p className="panel-style-drawer__blurb">{currentTheme.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
