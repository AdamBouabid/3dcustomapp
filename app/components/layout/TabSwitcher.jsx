"use client";
import React, { useMemo, useRef, useState, useEffect } from "react";
import { Flower2, Home, Moon, Paintbrush, Palette, PanelLeft, PanelLeftClose, Sparkles, Sun } from "lucide-react";
import ColorPicker from "../ui/ColorPicker";
import { hexToRgba, isValidHexColor, normalizeHex } from "../ui/wardrobeUtils";

const RECENT_COLORS_KEY = "wardrobe-recent-colors";
const PANEL_WIDTH = "clamp(320px, 34vw, 420px)";
const PRESET_COLORS = [
  { hex: "#d97745", name: "Amber Clay" },
  { hex: "#0ea5a4", name: "Sea Glass" },
  { hex: "#7486ff", name: "Gallery Blue" },
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
      letterSpacing: "0.03em",
      color: light ? "#10253a" : "rgba(241,245,249,0.94)",
      padding: "8px 12px",
      borderRadius: "14px",
      background: light
        ? "linear-gradient(180deg, rgba(255,255,255,0.82), rgba(255,255,255,0.64))"
        : "linear-gradient(180deg, rgba(15,18,28,0.84), rgba(7,10,16,0.72))",
      backdropFilter: "blur(16px) saturate(1.08)",
      border: light ? "1px solid rgba(255,255,255,0.72)" : "1px solid rgba(255,255,255,0.12)",
      boxShadow: light
        ? "0 10px 26px rgba(15,23,42,0.14), inset 0 1px 0 rgba(255,255,255,0.68)"
        : "0 14px 30px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.08)",
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
  activeOutfitPanel = "outfit",
  onOutfitPanelChange,
  panelCollapsed,
  onTogglePanel,
  activeItem,
  activeColor,
  onPaletteColorChange,
  focusMode,
  onFocusModeChange,
  scenePreset = "gallery-day",
  onScenePresetChange,
  accentColor = "#7486ff",
}) {
  const accent = normalizeHex(accentColor);
  const isDayMode = scenePreset !== "gallery-evening";
  const containerLeft = panelCollapsed ? "24px" : `calc(${PANEL_WIDTH} + 20px)`;
  const navItems = useMemo(() => ([
    { id: "outfit", icon: Paintbrush, label: "Outfit" },
    { id: "decor", icon: Flower2, label: "Décor" },
    { id: "room", icon: Home, label: "Atelier" },
  ]), []);

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [recentColors, setRecentColors] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.localStorage.getItem(RECENT_COLORS_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((entry) => typeof entry === "string").slice(0, 12);
      }
    } catch {
      return [];
    }
    return [];
  });
  const paletteButtonRef = useRef(null);

  // Keyboard shortcut: "F" toggles focus mode when outfit tab is active
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e) => {
      if (e.key === "f" || e.key === "F") {
        // Don't trigger if user is typing in an input
        const tag = document.activeElement?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        if (activeTab === "outfit") {
          onFocusModeChange?.(!focusMode);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeTab, focusMode, onFocusModeChange]);

  const paletteVisible = !panelCollapsed && activeTab === "outfit" && activeOutfitPanel === "outfit" && !!activeItem;
  const visiblePaletteOpen = paletteVisible && paletteOpen;
  const hidingNav = visiblePaletteOpen;
  const showFocusButton = activeTab === "outfit" && !visiblePaletteOpen;

  const storeRecentColor = (hex) => {
    if (!hex) return;
    const normalized = normalizeHex(hex).toLowerCase();
    setRecentColors((prev) => {
      const next = [normalized, ...prev.filter((entry) => entry !== normalized)].slice(0, 12);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  const applyColor = (hex) => {
    if (!activeItem || !onPaletteColorChange || !isValidHexColor(hex)) return;
    const normalized = normalizeHex(hex);
    onPaletteColorChange(activeItem, normalized);
    storeRecentColor(normalized);
  };

  const swatches = useMemo(() => {
    const stack = [];
    if (isValidHexColor(activeColor)) {
      stack.push({ hex: normalizeHex(activeColor).toLowerCase(), name: "Current Color" });
    }

    recentColors.slice(0, 2).forEach((hex, index) => {
      stack.push({ hex: normalizeHex(hex).toLowerCase(), name: index === 0 ? "Recent Tone" : "Recent Accent" });
    });

    PRESET_COLORS.forEach((color) => stack.push(color));

    const unique = [];
    const seen = new Set();
    stack.forEach((entry) => {
      const key = entry.hex.toLowerCase();
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      unique.push({ ...entry, hex: key });
    });

    return unique.slice(0, 4);
  }, [activeColor, recentColors]);

  const activeAccentBorder = hexToRgba(accent, isDayMode ? 0.72 : 0.82);
  const activeAccentWash = hexToRgba(accent, isDayMode ? 0.22 : 0.34);
  const activeAccentSoft = hexToRgba(accent, isDayMode ? 0.08 : 0.12);

  const navButtonStyle = (isActive) => ({
    ...CIRCLE_BASE,
    border: isDayMode
      ? `2px solid ${isActive ? activeAccentBorder : "rgba(15,23,42,0.12)"}`
      : `2px solid ${isActive ? activeAccentBorder : "rgba(255,255,255,0.12)"}`,
    background: isDayMode
      ? isActive
        ? `linear-gradient(135deg, ${activeAccentWash} 0%, ${activeAccentSoft} 100%)`
        : "rgba(255,255,255,0.72)"
      : isActive
        ? `linear-gradient(135deg, ${hexToRgba(accent, 0.34)} 0%, ${hexToRgba(accent, 0.12)} 100%)`
        : "rgba(255,255,255,0.04)",
    color: isDayMode
      ? isActive ? "#10253a" : "rgba(15,23,42,0.6)"
      : isActive ? "#eef2ff" : "rgba(255,255,255,0.64)",
    backdropFilter: "blur(10px)",
    boxShadow: isDayMode
      ? isActive ? `0 0 22px ${hexToRgba(accent, 0.22)}` : "0 2px 8px rgba(0,0,0,0.08)"
      : isActive ? `0 0 22px ${hexToRgba(accent, 0.28)}` : "0 2px 8px rgba(0,0,0,0.2)",
    transition: "all 280ms ease",
  });

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
      transition: "left 220ms cubic-bezier(0.22,1,0.36,1)",
    }}>
      <div style={{
        position: "absolute",
        inset: "-10px",
        borderRadius: "999px",
        background: isDayMode
          ? "linear-gradient(180deg, rgba(255,255,255,0.58), rgba(255,255,255,0.18))"
          : "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
        border: isDayMode ? "1px solid rgba(255,255,255,0.35)" : "1px solid rgba(255,255,255,0.08)",
        boxShadow: isDayMode ? "0 12px 28px rgba(0,0,0,0.12)" : "0 16px 28px rgba(0,0,0,0.28)",
        backdropFilter: "blur(14px)",
        zIndex: -1,
      }} />
      <div style={{
        position: "absolute",
        top: "-56px",
        left: "50%",
        transform: "translateX(-50%)",
        padding: "8px 12px",
        borderRadius: "999px",
        border: isDayMode ? "1px solid rgba(15,23,42,0.1)" : "1px solid rgba(255,255,255,0.08)",
        background: isDayMode ? "rgba(255,255,255,0.72)" : "rgba(7,10,16,0.62)",
        boxShadow: isDayMode ? "0 10px 22px rgba(15,23,42,0.12)" : "0 16px 26px rgba(0,0,0,0.28)",
        backdropFilter: "blur(14px)",
        color: isDayMode ? "#10253a" : "rgba(255,255,255,0.88)",
        fontSize: "10px",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}>
        {activeTab === "outfit" && activeOutfitPanel === "beauty" ? "Beauty" : navItems.find((item) => item.id === activeTab)?.label ?? "Outfit"} Panel
      </div>

      <div
        style={{ position: "relative" }}
        onMouseEnter={() => setHoveredId("preset")}
        onMouseLeave={() => setHoveredId(null)}
      >
        <button
          onClick={() => onScenePresetChange?.(scenePreset === "gallery-evening" ? "gallery-day" : "gallery-evening")}
          aria-label={scenePreset === "gallery-evening" ? "Switch to Day Room" : "Switch to Evening Room"}
          title={scenePreset === "gallery-evening" ? "Switch to Day Room" : "Switch to Evening Room"}
          style={{
            ...CIRCLE_BASE,
            border: scenePreset === "gallery-evening"
              ? "2px solid rgba(148,163,184,0.35)"
              : "2px solid rgba(255,191,71,0.45)",
            background: scenePreset === "gallery-evening"
              ? "linear-gradient(135deg, rgba(76,92,123,0.28) 0%, rgba(44,56,84,0.16) 100%)"
              : "linear-gradient(135deg, rgba(255,210,96,0.32) 0%, rgba(255,176,86,0.16) 100%)",
            color: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)",
            transition: "transform 220ms ease, box-shadow 220ms ease, background 220ms ease",
            boxShadow: scenePreset === "gallery-evening"
              ? "0 2px 10px rgba(0,0,0,0.3)"
              : "0 0 20px rgba(255,190,89,0.35), 0 0 10px rgba(255,165,0,0.18)",
          }}
        >
          {scenePreset === "gallery-evening" ? (
            <Moon size={20} strokeWidth={1.75} />
          ) : (
            <Sun size={22} strokeWidth={1.75} />
          )}
        </button>
        {hoveredId === "preset" && (
          <CircleTooltip
            light={isDayMode}
            label={scenePreset === "gallery-evening" ? "Switch to Day Room" : "Switch to Evening Room"}
          />
        )}
      </div>

      {showFocusButton && (
        <div
          style={{ position: "relative" }}
          onMouseEnter={() => setHoveredId("focus")}
          onMouseLeave={() => setHoveredId(null)}
        >
          <button
            onClick={() => onFocusModeChange?.(!focusMode)}
            aria-label={focusMode ? "Exit Focus Mode (F)" : "Enter Focus Mode (F)"}
            aria-pressed={focusMode}
            title={focusMode ? "Exit Focus Mode (F)" : "Enter Focus Mode (F)"}
            style={{
              ...CIRCLE_BASE,
              border: isDayMode
                ? (focusMode ? `2px solid ${activeAccentBorder}` : `2px solid ${hexToRgba(accent, 0.38)}`)
                : `2px solid ${hexToRgba(accent, focusMode ? 0.68 : 0.46)}`,
              background: isDayMode
                ? focusMode
                  ? `linear-gradient(135deg, ${activeAccentWash} 0%, ${activeAccentSoft} 100%)`
                  : "rgba(255,255,255,0.72)"
                : focusMode
                  ? `linear-gradient(135deg, ${hexToRgba(accent, 0.38)} 0%, ${hexToRgba(accent, 0.16)} 100%)`
                  : `linear-gradient(135deg, ${hexToRgba(accent, 0.18)} 0%, ${hexToRgba(accent, 0.08)} 100%)`,
              color: isDayMode ? "#10253a" : "rgba(255,255,255,0.95)",
              transition: "transform 200ms ease, box-shadow 200ms ease, background 200ms ease",
              transform: focusMode ? "scale(1.06)" : "scale(1)",
              boxShadow: isDayMode
                ? focusMode ? `0 0 18px ${hexToRgba(accent, 0.24)}` : "0 2px 8px rgba(0,0,0,0.1)"
                : focusMode ? `0 0 24px ${hexToRgba(accent, 0.42)}` : "0 2px 10px rgba(0,0,0,0.3)",
            }}
          >
            {focusMode && <span className="focus-mode-ring" aria-hidden="true" />}
            <Sparkles size={22} strokeWidth={1.75} />
          </button>
          {focusMode && <span className="focus-mode-badge" aria-hidden="true">FOCUS</span>}
          {hoveredId === "focus" && <CircleTooltip light={isDayMode} label={focusMode ? "Exit Focus (F)" : "Focus Mode (F)"} />}
        </div>
      )}

      {paletteVisible && (
        <div
          style={{ position: "relative", zIndex: 50 }}
          onMouseEnter={() => setHoveredId("palette")}
          onMouseLeave={() => setHoveredId(null)}
        >
          <button
            ref={paletteButtonRef}
            onClick={() => setPaletteOpen((value) => !value)}
            style={{
              ...CIRCLE_BASE,
              border: isDayMode
                ? (visiblePaletteOpen ? `2px solid ${activeAccentBorder}` : `2px solid ${hexToRgba(accent, 0.3)}`)
                : `2px solid ${hexToRgba(accent, 0.48)}`,
              background: isDayMode
                ? visiblePaletteOpen
                  ? `linear-gradient(135deg, ${activeAccentWash} 0%, ${activeAccentSoft} 100%)`
                  : "rgba(255,255,255,0.72)"
                : visiblePaletteOpen
                  ? `linear-gradient(135deg, ${hexToRgba(accent, 0.36)} 0%, ${hexToRgba(accent, 0.16)} 100%)`
                  : `linear-gradient(135deg, ${hexToRgba(accent, 0.18)} 0%, ${hexToRgba(accent, 0.08)} 100%)`,
              color: isDayMode ? "#10253a" : "rgba(255,255,255,0.95)",
              transition: "transform 200ms ease, box-shadow 200ms ease, background 200ms ease",
              transform: visiblePaletteOpen ? "scale(1.06)" : "scale(1)",
              boxShadow: isDayMode
                ? visiblePaletteOpen ? `0 0 18px ${hexToRgba(accent, 0.24)}` : "0 2px 8px rgba(0,0,0,0.1)"
                : visiblePaletteOpen ? `0 0 24px ${hexToRgba(accent, 0.38)}` : "0 2px 10px rgba(0,0,0,0.3)",
            }}
          >
            <Palette size={22} strokeWidth={1.75} />
          </button>
          {hoveredId === "palette" && !visiblePaletteOpen && <CircleTooltip light={isDayMode} label="Color Palette" />}

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
              {swatches.map(({ hex, name }, index) => {
                const isActive = normalizeHex(hex).toLowerCase() === normalizeHex(activeColor || "#7c88ff").toLowerCase();
                return (
                  <div
                    key={hex}
                    style={{ position: "relative" }}
                    onMouseEnter={() => setHoveredId(`swatch-${hex}`)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <button
                      onClick={() => {
                        applyColor(hex);
                        setPaletteOpen(false);
                      }}
                      style={{
                        ...CIRCLE_BASE,
                        background: hex,
                        border: isActive ? "2px solid rgba(255,255,255,0.92)" : "2px solid rgba(255,255,255,0.24)",
                        outline: isActive ? `3px solid ${hexToRgba(accent, 0.6)}` : "none",
                        outlineOffset: "2px",
                        boxShadow: isActive
                          ? `0 0 0 4px ${hexToRgba(accent, 0.18)}, 0 8px 18px rgba(0,0,0,0.34)`
                          : "0 6px 14px rgba(0,0,0,0.35)",
                        animation: "wardrobe-swatch-in 280ms cubic-bezier(0.34,1.56,0.64,1) both",
                        animationDelay: `${index * 60}ms`,
                        transition: "transform 150ms ease, box-shadow 150ms ease, outline 150ms ease",
                      }}
                    />
                    {hoveredId === `swatch-${hex}` && <CircleTooltip light={isDayMode} label={name} />}
                  </div>
                );
              })}

              <div
                style={{ position: "relative" }}
                onMouseEnter={() => setHoveredId("custom")}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div style={{
                  ...CIRCLE_BASE,
                  padding: "2.5px",
                  background: "conic-gradient(from 0deg, #d97745, #7486ff, #0ea5a4, #7ba56b, #d35f7a, #d97745)",
                  animationName: "wardrobe-spin",
                  animationDuration: colorPickerOpen ? "2.4s" : "6s",
                  animationTimingFunction: "linear",
                  animationIterationCount: "infinite",
                }}>
                  <button
                    onClick={() => setColorPickerOpen((value) => !value)}
                    style={{
                      ...CIRCLE_BASE,
                      width: "100%",
                      height: "100%",
                      border: "none",
                      background: colorPickerOpen ? "rgba(24,18,20,0.98)" : "rgba(16,16,18,0.96)",
                      color: "rgba(255,255,255,0.95)",
                      boxShadow: colorPickerOpen ? `0 0 16px ${hexToRgba(accent, 0.4)}` : "none",
                      transition: "background 200ms ease",
                    }}
                  >
                    <Sparkles size={18} strokeWidth={1.75} />
                  </button>
                </div>
                {hoveredId === "custom" && <CircleTooltip light={isDayMode} label="Custom Hue" />}
              </div>
            </div>
          )}

          {visiblePaletteOpen && colorPickerOpen && (
            <ColorPicker
              color={isValidHexColor(activeColor) ? normalizeHex(activeColor) : accent}
              onChange={applyColor}
              open={colorPickerOpen}
              onOpenChange={setColorPickerOpen}
              anchorRef={paletteButtonRef}
            />
          )}
        </div>
      )}

      {navItems.map(({ id, icon: Icon, label }, itemIndex) => {
        const delay = hidingNav ? `${itemIndex * 40}ms` : `${80 + itemIndex * 40}ms`;
        const isActive = activeTab === id;
        const isOutfitButton = id === "outfit";

        return (
        <div
          key={id}
          style={{
            position: "relative",
            opacity: hidingNav ? 0 : 1,
            transform: hidingNav ? "translateY(-6px) scale(0.86)" : "translateY(0) scale(1)",
            transition: "opacity 200ms ease, transform 220ms ease",
            transitionDelay: delay,
            pointerEvents: hidingNav ? "none" : "auto",
          }}
          onMouseEnter={() => setHoveredId(id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <button
            onClick={() => {
              onTabChange(id);
              if (isOutfitButton) {
                onOutfitPanelChange?.("outfit");
              }
            }}
            style={navButtonStyle(isActive)}
            aria-label={label}
            aria-pressed={isActive}
            title={label}
          >
            <Icon size={22} strokeWidth={1.75} />
          </button>
          {isOutfitButton && activeTab === "outfit" && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "calc(100% - 6px)",
                transform: "translateY(-50%)",
                zIndex: 2,
              }}
              onMouseEnter={() => setHoveredId("beauty")}
              onMouseLeave={() => setHoveredId(null)}
            >
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onTabChange("outfit");
                  onOutfitPanelChange?.("beauty");
                }}
                style={{
                  width: "40px",
                  height: "40px",
                  minWidth: "40px",
                  minHeight: "40px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  cursor: "pointer",
                  border: isDayMode
                    ? `2px solid ${activeOutfitPanel === "beauty" ? activeAccentBorder : "rgba(15,23,42,0.12)"}`
                    : `2px solid ${activeOutfitPanel === "beauty" ? activeAccentBorder : "rgba(255,255,255,0.12)"}`,
                  background: isDayMode
                    ? activeOutfitPanel === "beauty"
                      ? `linear-gradient(135deg, ${activeAccentWash} 0%, ${activeAccentSoft} 100%)`
                      : "rgba(255,255,255,0.74)"
                    : activeOutfitPanel === "beauty"
                      ? `linear-gradient(135deg, ${hexToRgba(accent, 0.34)} 0%, ${hexToRgba(accent, 0.12)} 100%)`
                      : "rgba(255,255,255,0.05)",
                  color: isDayMode
                    ? activeOutfitPanel === "beauty" ? "#10253a" : "rgba(15,23,42,0.62)"
                    : activeOutfitPanel === "beauty" ? "#eef2ff" : "rgba(255,255,255,0.72)",
                  backdropFilter: "blur(10px)",
                  boxShadow: activeOutfitPanel === "beauty"
                    ? `0 0 18px ${hexToRgba(accent, 0.22)}`
                    : isDayMode
                      ? "0 2px 8px rgba(0,0,0,0.08)"
                      : "0 2px 8px rgba(0,0,0,0.2)",
                  transition: "all 220ms ease",
                }}
                title="Beauty Center"
                aria-label="Beauty Center"
                aria-pressed={activeOutfitPanel === "beauty"}
              >
                <Palette size={16} strokeWidth={1.8} />
              </button>
              {hoveredId === "beauty" && <CircleTooltip light={isDayMode} label="Beauty Center" />}
            </div>
          )}
          {isActive && (
            <span style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "64px",
              height: "64px",
              transform: "translate(-50%, -50%)",
              borderRadius: "999px",
              border: `1px solid ${hexToRgba(accent, isDayMode ? 0.24 : 0.3)}`,
              boxShadow: `0 0 0 1px ${hexToRgba(accent, 0.12)}, 0 0 24px ${hexToRgba(accent, isDayMode ? 0.12 : 0.18)}`,
              animation: "wardrobe-orbit-pulse 1.8s ease-in-out infinite",
              pointerEvents: "none",
            }} />
          )}
          {hoveredId === id && <CircleTooltip light={isDayMode} label={label} />}
        </div>
      )})}

      <div style={{ height: "8px" }} />

      <div
        style={{
          position: "relative",
          opacity: hidingNav ? 0 : 1,
          transform: hidingNav ? "translateY(-6px) scale(0.86)" : "translateY(0) scale(1)",
          transition: "opacity 200ms ease, transform 220ms ease",
          transitionDelay: hidingNav ? "120ms" : "200ms",
          pointerEvents: hidingNav ? "none" : "auto",
        }}
        onMouseEnter={() => setHoveredId("toggle")}
        onMouseLeave={() => setHoveredId(null)}
      >
        <button
          onClick={onTogglePanel}
          aria-label={panelCollapsed ? "Show Panel" : "Hide Panel"}
          title={panelCollapsed ? "Show Panel" : "Hide Panel"}
          style={{
            ...CIRCLE_BASE,
            border: isDayMode ? "2px solid rgba(0,0,0,0.12)" : "2px solid rgba(255,255,255,0.2)",
            background: isDayMode
              ? panelCollapsed
                ? "linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.08) 100%)"
                : "rgba(255,255,255,0.72)"
              : panelCollapsed
                ? "linear-gradient(135deg, rgba(34,197,94,0.28) 0%, rgba(34,197,94,0.15) 100%)"
                : `linear-gradient(135deg, ${hexToRgba(accent, 0.18)} 0%, ${hexToRgba(accent, 0.08)} 100%)`,
            color: isDayMode ? "rgba(15,23,42,0.82)" : "rgba(255,255,255,0.9)",
            backdropFilter: "blur(8px)",
            boxShadow: isDayMode
              ? panelCollapsed ? "0 0 14px rgba(34,197,94,0.2)" : "0 2px 8px rgba(0,0,0,0.08)"
              : panelCollapsed ? "0 0 20px rgba(34,197,94,0.25)" : "0 2px 8px rgba(0,0,0,0.2)",
            animation: panelCollapsed ? "wardrobe-glow-pulse 1.2s ease-in-out infinite" : "none",
            transition: "all 280ms ease",
          }}
        >
          {panelCollapsed ? <PanelLeft size={22} strokeWidth={1.75} /> : <PanelLeftClose size={22} strokeWidth={1.75} />}
        </button>
        {hoveredId === "toggle" && <CircleTooltip light={isDayMode} label={panelCollapsed ? "Show Panel" : "Hide Panel"} />}
      </div>
    </div>
  );
}