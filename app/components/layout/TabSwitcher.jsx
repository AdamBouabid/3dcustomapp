"use client";
import React, { useMemo, useRef, useState } from "react";
import { Paintbrush, Library, PanelLeft, PanelLeftClose, Palette, Sparkles, Sun, Moon } from "lucide-react";
import ColorPicker from "../ui/ColorPicker";

const RECENT_COLORS_KEY = "wardrobe-recent-colors";
const PRESET_COLORS = [
  { hex: "#f97316", name: "Sunset Ember" },
  { hex: "#14b8a6", name: "Nordic Teal" },
  { hex: "#8b5cf6", name: "Midnight Velvet" },
];

const CIRCLE_BASE = {
  width: "52px",
  height: "52px",
  minWidth: "52px",
  minHeight: "52px",
  aspectRatio: "1 / 1",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  cursor: "pointer",
};

function CircleTooltip({ label, light }) {
  return (
    <div style={{
      position: "absolute",
      left: "calc(100% + 10px)",
      top: "50%",
      transform: "translateY(-50%)",
      whiteSpace: "nowrap",
      fontSize: "11px",
      fontWeight: 600,
      color: light ? "#0f172a" : "#e2e8f0",
      padding: "3px 9px",
      borderRadius: "8px",
      background: light ? "rgba(255,255,255,0.93)" : "rgba(8,8,14,0.88)",
      backdropFilter: "blur(10px)",
      border: light ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.08)",
      boxShadow: light ? "0 4px 14px rgba(0,0,0,0.12)" : "0 4px 14px rgba(0,0,0,0.45)",
      pointerEvents: "none",
      zIndex: 100,
    }}>
      {label}
    </div>
  );
}

export default function TabSwitcher({
  activeTab,
  onTabChange,
  panelCollapsed,
  onTogglePanel,
  activeItem,
  activeColor,
  onPaletteColorChange,
  focusMode,
  onFocusModeChange,
  scenePreset = "night-studio",
  onScenePresetChange,
}) {
  const containerLeft = panelCollapsed ? "24px" : "calc(420px + 20px)";
  const isDaylight = scenePreset === "daylight";

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [recentColors, setRecentColors] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.localStorage.getItem(RECENT_COLORS_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed.slice(0, 12);
    } catch { /* ignore */ }
    return [];
  });
  const paletteButtonRef = useRef(null);

  const paletteVisible = !panelCollapsed && activeTab === "outfit" && !!activeItem;
  const visiblePaletteOpen = paletteVisible && paletteOpen;
  const hidingNav = visiblePaletteOpen;
  const showFocusButton = activeTab === "outfit" && !visiblePaletteOpen;

  const storeRecentColor = (hex) => {
    if (!hex) return;
    const normalized = hex.toLowerCase();
    setRecentColors((prev) => {
      const next = [normalized, ...prev.filter((c) => c !== normalized)].slice(0, 12);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  const applyColor = (hex) => {
    if (!activeItem || !onPaletteColorChange) return;
    onPaletteColorChange(activeItem, hex);
    storeRecentColor(hex);
  };

  const swatches = useMemo(() => {
    const normalizedActive = activeColor?.toLowerCase();
    const isPreset = PRESET_COLORS.some((p) => p.hex === normalizedActive);
    if (normalizedActive && !isPreset) {
      return [{ hex: normalizedActive, name: "Current Color" }, ...PRESET_COLORS].slice(0, 3);
    }
    return PRESET_COLORS;
  }, [activeColor]);

  return (
    <div style={{
      position: "absolute",
      left: containerLeft,
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 30,
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      alignItems: "center",
      pointerEvents: "auto",
      transition: "left 180ms ease",
    }}>
      {/* ── Scene Preset Toggle (always visible) ── */}
      <div
        style={{ position: "relative" }}
        onMouseEnter={() => setHoveredId("preset")}
        onMouseLeave={() => setHoveredId(null)}
      >
        <button
          onClick={() =>
            onScenePresetChange?.(
              scenePreset === "night-studio" ? "daylight" : "night-studio"
            )
          }
          style={{
            ...CIRCLE_BASE,
            border:
              scenePreset === "daylight"
                ? "2px solid rgba(255,215,0,0.55)"
                : "2px solid rgba(148,163,184,0.35)",
            background:
              scenePreset === "daylight"
                ? "linear-gradient(135deg, rgba(255,210,0,0.35) 0%, rgba(255,165,0,0.18) 100%)"
                : "linear-gradient(135deg, rgba(100,116,139,0.28) 0%, rgba(100,116,139,0.12) 100%)",
            color: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(8px)",
            transition: "transform 200ms ease, box-shadow 200ms ease, background 200ms ease",
            boxShadow:
              scenePreset === "daylight"
                ? "0 0 22px rgba(255,200,0,0.55), 0 0 8px rgba(255,165,0,0.3)"
                : "0 2px 10px rgba(0,0,0,0.3)",
          }}
        >
          {scenePreset === "daylight" ? (
            <Sun size={22} strokeWidth={1.75} />
          ) : (
            <Moon size={20} strokeWidth={1.75} />
          )}
        </button>
        {hoveredId === "preset" && (
          <CircleTooltip
            light={isDaylight}
            label={
              scenePreset === "daylight" ? "Switch to Night Studio" : "Switch to Daylight"
            }
          />
        )}
      </div>

      {showFocusButton && (
        <>
          {/* ── Focus Mode ── */}
          <div style={{ position: "relative" }}
            onMouseEnter={() => setHoveredId("focus")}
            onMouseLeave={() => setHoveredId(null)}
          >
            <button
              onClick={() => onFocusModeChange?.(!focusMode)}
              style={{
                ...CIRCLE_BASE,
                border: isDaylight
                  ? (focusMode ? "2px solid rgba(14,165,233,0.8)" : "2px solid rgba(14,165,233,0.4)")
                  : "2px solid rgba(34,211,238,0.5)",
                background: isDaylight
                  ? focusMode
                    ? "linear-gradient(135deg, rgba(14,165,233,0.22) 0%, rgba(14,165,233,0.1) 100%)"
                    : "rgba(255,255,255,0.72)"
                  : focusMode
                    ? "linear-gradient(135deg, rgba(34,211,238,0.4) 0%, rgba(34,211,238,0.2) 100%)"
                    : "linear-gradient(135deg, rgba(34,211,238,0.2) 0%, rgba(34,211,238,0.1) 100%)",
                color: isDaylight ? "#0c4a6e" : "rgba(255,255,255,0.95)",
                transition: "transform 200ms ease, box-shadow 200ms ease, background 200ms ease",
                transform: focusMode ? "scale(1.06)" : "scale(1)",
                boxShadow: isDaylight
                  ? focusMode ? "0 0 18px rgba(14,165,233,0.3)" : "0 2px 8px rgba(0,0,0,0.1)"
                  : focusMode
                    ? "0 0 24px rgba(34,211,238,0.7), 0 0 12px rgba(34,211,238,0.4), inset 0 0 8px rgba(255,255,255,0.2)"
                    : "0 2px 10px rgba(0,0,0,0.3)",
              }}
            >
              <Sparkles size={22} strokeWidth={1.75} />
            </button>
            {hoveredId === "focus" && <CircleTooltip light={isDaylight} label={focusMode ? "Exit Focus" : "Focus Mode"} />}
          </div>

        </>
      )}

      {/* ── Palette trigger ── */}
      {paletteVisible && (
        <div style={{ position: "relative", zIndex: 50 }}
          onMouseEnter={() => setHoveredId("palette")}
          onMouseLeave={() => setHoveredId(null)}
        >
          <button
            ref={paletteButtonRef}
            onClick={() => setPaletteOpen((v) => !v)}
            style={{
              ...CIRCLE_BASE,
              border: isDaylight
                ? (visiblePaletteOpen ? "2px solid rgba(124,58,237,0.7)" : "2px solid rgba(124,58,237,0.35)")
                : "2px solid rgba(168,85,247,0.5)",
              background: isDaylight
                ? visiblePaletteOpen
                  ? "linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0.07) 100%)"
                  : "rgba(255,255,255,0.72)"
                : visiblePaletteOpen
                  ? "linear-gradient(135deg, rgba(168,85,247,0.4) 0%, rgba(168,85,247,0.2) 100%)"
                  : "linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(168,85,247,0.1) 100%)",
              color: isDaylight ? "#3b0764" : "rgba(255,255,255,0.95)",
              transition: "transform 200ms ease, box-shadow 200ms ease, background 200ms ease",
              transform: visiblePaletteOpen ? "scale(1.06)" : "scale(1)",
              boxShadow: isDaylight
                ? visiblePaletteOpen ? "0 0 18px rgba(124,58,237,0.28)" : "0 2px 8px rgba(0,0,0,0.1)"
                : visiblePaletteOpen
                  ? "0 0 24px rgba(168,85,247,0.7), 0 0 12px rgba(168,85,247,0.4), inset 0 0 8px rgba(255,255,255,0.2)"
                  : "0 2px 10px rgba(0,0,0,0.3)",
            }}
          >
            <Palette size={22} strokeWidth={1.75} />
          </button>
          {hoveredId === "palette" && !visiblePaletteOpen && <CircleTooltip light={isDaylight} label="Color Palette" />}

          {/* ── Swatch stack ── */}
          {visiblePaletteOpen && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              left: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              zIndex: 60,
            }}>
              {swatches.map(({ hex, name }, i) => {
                const isActive = hex.toLowerCase() === activeColor?.toLowerCase();
                return (
                  <div key={hex} style={{ position: "relative" }}
                    onMouseEnter={() => setHoveredId(`swatch-${hex}`)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <button
                      onClick={() => { applyColor(hex); setPaletteOpen(false); }}
                      style={{
                        ...CIRCLE_BASE,
                        background: hex,
                        border: isActive ? "2px solid rgba(255,255,255,0.9)" : "2px solid rgba(255,255,255,0.2)",
                        outline: isActive ? "3px solid rgba(168,85,247,0.7)" : "none",
                        outlineOffset: "2px",
                        boxShadow: isActive
                          ? "0 0 0 4px rgba(168,85,247,0.2), 0 8px 18px rgba(0,0,0,0.4)"
                          : "0 6px 14px rgba(0,0,0,0.35)",
                        animation: `wardrobe-swatch-in 280ms cubic-bezier(0.34,1.56,0.64,1) both`,
                        animationDelay: `${i * 60}ms`,
                        transition: "transform 150ms ease, box-shadow 150ms ease, outline 150ms ease",
                      }}
                    />
                    {hoveredId === `swatch-${hex}` && <CircleTooltip light={isDaylight} label={name} />}
                  </div>
                );
              })}

              {/* AI / Custom color wheel — rotating gradient ring */}
              <div style={{ position: "relative" }}
                onMouseEnter={() => setHoveredId("ai")}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div style={{
                  ...CIRCLE_BASE,
                  padding: "2.5px",
                  background: "conic-gradient(from 0deg, #a855f7, #3b82f6, #06b6d4, #10b981, #f59e0b, #ef4444, #a855f7)",
                  animationName: "wardrobe-spin",
                  animationDuration: colorPickerOpen ? "2s" : "5s",
                  animationTimingFunction: "linear",
                  animationIterationCount: "infinite",
                }}>
                  <button
                    onClick={() => setColorPickerOpen((v) => !v)}
                    style={{
                      ...CIRCLE_BASE,
                      width: "100%",
                      height: "100%",
                      border: "none",
                      background: colorPickerOpen ? "rgba(30,18,50,0.98)" : "rgba(18,12,30,0.96)",
                      color: "rgba(255,255,255,0.95)",
                      boxShadow: colorPickerOpen ? "0 0 16px rgba(168,85,247,0.4)" : "none",
                      transition: "background 200ms ease",
                    }}
                  >
                    <Sparkles size={18} strokeWidth={1.75} />
                  </button>
                </div>
                {hoveredId === "ai" && <CircleTooltip light={isDaylight} label="Custom Hue" />}
              </div>
            </div>
          )}

          {visiblePaletteOpen && colorPickerOpen && (
            <ColorPicker
              color={activeColor || "#a5b4fc"}
              onChange={(hex) => { applyColor(hex); }}
              open={colorPickerOpen}
              onOpenChange={setColorPickerOpen}
              anchorRef={paletteButtonRef}
            />
          )}
        </div>
      )}

      {/* ── Outfit ── */}
      <div style={{
        position: "relative",
        opacity: hidingNav ? 0 : 1,
        transform: hidingNav ? "translateY(-6px) scale(0.86)" : "translateY(0) scale(1)",
        transition: "opacity 200ms ease, transform 220ms ease",
        transitionDelay: hidingNav ? "0ms" : "80ms",
        pointerEvents: hidingNav ? "none" : "auto",
      }}
        onMouseEnter={() => setHoveredId("outfit")}
        onMouseLeave={() => setHoveredId(null)}
      >
        <button
          onClick={() => onTabChange("outfit")}
          style={{
            ...CIRCLE_BASE,
            border: isDaylight
              ? `2px solid ${activeTab === "outfit" ? "rgba(14,165,233,0.8)" : "rgba(0,0,0,0.12)"}`
              : `2px solid ${activeTab === "outfit" ? "rgb(99,102,241)" : "rgba(255,255,255,0.1)"}`,
            background: isDaylight
              ? activeTab === "outfit"
                ? "linear-gradient(135deg, rgba(14,165,233,0.2) 0%, rgba(14,165,233,0.08) 100%)"
                : "rgba(255,255,255,0.72)"
              : activeTab === "outfit"
                ? "linear-gradient(135deg, rgba(99,102,241,0.35) 0%, rgba(99,102,241,0.12) 100%)"
                : "rgba(255,255,255,0.04)",
            color: isDaylight
              ? activeTab === "outfit" ? "#0c4a6e" : "rgba(15,23,42,0.6)"
              : activeTab === "outfit" ? "#e0e7ff" : "rgba(255,255,255,0.6)",
            backdropFilter: "blur(8px)",
            boxShadow: isDaylight
              ? activeTab === "outfit" ? "0 0 18px rgba(14,165,233,0.22)" : "0 2px 8px rgba(0,0,0,0.08)"
              : activeTab === "outfit" ? "0 0 20px rgba(99,102,241,0.3)" : "0 2px 8px rgba(0,0,0,0.2)",
            transition: "all 280ms ease",
          }}
        >
          <Paintbrush size={22} strokeWidth={1.75} />
        </button>
        {hoveredId === "outfit" && <CircleTooltip light={isDaylight} label="Outfit" />}
      </div>

      {/* ── Catalog ── */}
      <div style={{
        position: "relative",
        opacity: hidingNav ? 0 : 1,
        transform: hidingNav ? "translateY(-6px) scale(0.86)" : "translateY(0) scale(1)",
        transition: "opacity 200ms ease, transform 220ms ease",
        transitionDelay: hidingNav ? "40ms" : "120ms",
        pointerEvents: hidingNav ? "none" : "auto",
      }}
        onMouseEnter={() => setHoveredId("catalog")}
        onMouseLeave={() => setHoveredId(null)}
      >
        <button
          onClick={() => onTabChange("catalog")}
          style={{
            ...CIRCLE_BASE,
            border: isDaylight
              ? `2px solid ${activeTab === "catalog" ? "rgba(14,165,233,0.8)" : "rgba(0,0,0,0.12)"}`
              : `2px solid ${activeTab === "catalog" ? "rgb(99,102,241)" : "rgba(255,255,255,0.1)"}`,
            background: isDaylight
              ? activeTab === "catalog"
                ? "linear-gradient(135deg, rgba(14,165,233,0.2) 0%, rgba(14,165,233,0.08) 100%)"
                : "rgba(255,255,255,0.72)"
              : activeTab === "catalog"
                ? "linear-gradient(135deg, rgba(99,102,241,0.35) 0%, rgba(99,102,241,0.12) 100%)"
                : "rgba(255,255,255,0.04)",
            color: isDaylight
              ? activeTab === "catalog" ? "#0c4a6e" : "rgba(15,23,42,0.6)"
              : activeTab === "catalog" ? "#e0e7ff" : "rgba(255,255,255,0.6)",
            backdropFilter: "blur(8px)",
            boxShadow: isDaylight
              ? activeTab === "catalog" ? "0 0 18px rgba(14,165,233,0.22)" : "0 2px 8px rgba(0,0,0,0.08)"
              : activeTab === "catalog" ? "0 0 20px rgba(99,102,241,0.3)" : "0 2px 8px rgba(0,0,0,0.2)",
            transition: "all 280ms ease",
          }}
        >
          <Library size={22} strokeWidth={1.75} />
        </button>
        {hoveredId === "catalog" && <CircleTooltip light={isDaylight} label="Catalog" />}
      </div>

      <div style={{ height: "8px" }} />

      {/* ── Hide / Show panel ── */}
      <div style={{
        position: "relative",
        opacity: hidingNav ? 0 : 1,
        transform: hidingNav ? "translateY(-6px) scale(0.86)" : "translateY(0) scale(1)",
        transition: "opacity 200ms ease, transform 220ms ease",
        transitionDelay: hidingNav ? "80ms" : "160ms",
        pointerEvents: hidingNav ? "none" : "auto",
      }}
        onMouseEnter={() => setHoveredId("toggle")}
        onMouseLeave={() => setHoveredId(null)}
      >
        <button
          onClick={onTogglePanel}
          style={{
            ...CIRCLE_BASE,
            border: isDaylight ? "2px solid rgba(0,0,0,0.12)" : "2px solid rgba(255,255,255,0.2)",
            background: isDaylight
              ? panelCollapsed
                ? "linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.08) 100%)"
                : "rgba(255,255,255,0.72)"
              : panelCollapsed
                ? "linear-gradient(135deg, rgba(34,197,94,0.28) 0%, rgba(34,197,94,0.15) 100%)"
                : "linear-gradient(135deg, rgba(124,136,255,0.2) 0%, rgba(124,136,255,0.1) 100%)",
            color: isDaylight ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.9)",
            backdropFilter: "blur(8px)",
            boxShadow: isDaylight
              ? panelCollapsed ? "0 0 14px rgba(34,197,94,0.2)" : "0 2px 8px rgba(0,0,0,0.08)"
              : panelCollapsed ? "0 0 20px rgba(34,197,94,0.25)" : "0 2px 8px rgba(0,0,0,0.2)",
            animation: panelCollapsed ? "wardrobe-glow-pulse 1.2s ease-in-out infinite" : "none",
            transition: "all 280ms ease",
          }}
        >
          {panelCollapsed ? <PanelLeft size={22} strokeWidth={1.75} /> : <PanelLeftClose size={22} strokeWidth={1.75} />}
        </button>
        {hoveredId === "toggle" && <CircleTooltip light={isDaylight} label={panelCollapsed ? "Show Panel" : "Hide Panel"} />}
      </div>
    </div>
  );
}
