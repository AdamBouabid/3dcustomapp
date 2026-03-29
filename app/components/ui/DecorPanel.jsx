"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Flower2, Lamp, Armchair, Frame, TreePine, Coffee, X,
  BookOpen, Flame, CircleDot, Gem, RectangleHorizontal, Radio, Palette, Brush,
} from "lucide-react";
import PanelStyleDrawer from "./PanelStyleDrawer";
import { getPanelTheme } from "./roomCustomizationConfig";
import { hexToRgba, normalizeHex } from "./wardrobeUtils";

/* ── Material presets ────────────────────────────────────────────────────── */

const MATERIALS = [
  { id: "wood",    label: "Wood",    icon: "🪵" },
  { id: "ceramic", label: "Ceramic", icon: "🏺" },
  { id: "metal",   label: "Metal",   icon: "⚙️" },
  { id: "marble",  label: "Marble",  icon: "🪨" },
  { id: "fabric",  label: "Fabric",  icon: "🧶" },
  { id: "glass",   label: "Glass",   icon: "💎" },
];

const COLOR_SWATCHES = [
  "#c9a87c", "#f5eee3", "#3d3630", "#9b8b7a", "#b08968",
  "#7ba56b", "#a4b8d1", "#d35f7a", "#f2d38a", "#4a6fa5",
  "#2d2d2d", "#e8d5b7", "#8b4513", "#c0392b", "#1a5276",
  "#196f3d",
];

/* ── Decor catalogue ─────────────────────────────────────────────────────── */

const DECOR_ITEMS = [
  { id: "tall-vase",      icon: Flower2,              label: "Vase",          preview: "🏺", accent: "#c9a87c", defaultColor: "#c9a87c", defaultMaterial: "ceramic" },
  { id: "table-lamp",     icon: Lamp,                 label: "Lamp",          preview: "💡", accent: "#f2d38a", defaultColor: "#f5eee3", defaultMaterial: "ceramic" },
  { id: "armchair",       icon: Armchair,             label: "Armchair",      preview: "🪑", accent: "#9b8b7a", defaultColor: "#9b8b7a", defaultMaterial: "fabric" },
  { id: "wall-art",       icon: Frame,                label: "Wall Art",      preview: "🖼️", accent: "#a4b8d1", defaultColor: "#a4b8d1", defaultMaterial: "wood" },
  { id: "plant",          icon: TreePine,             label: "Plant",         preview: "🌿", accent: "#7ba56b", defaultColor: "#7ba56b", defaultMaterial: "ceramic" },
  { id: "coffee-table",   icon: Coffee,               label: "Coffee Table",  preview: "☕", accent: "#b08968", defaultColor: "#b08968", defaultMaterial: "wood" },
  { id: "bookshelf",      icon: BookOpen,             label: "Bookshelf",     preview: "📚", accent: "#8b6f47", defaultColor: "#8b6f47", defaultMaterial: "wood" },
  { id: "candelabra",     icon: Flame,                label: "Candelabra",    preview: "🕯️", accent: "#d4a843", defaultColor: "#d4a843", defaultMaterial: "metal" },
  { id: "sculpture",      icon: Gem,                  label: "Sculpture",     preview: "🗿", accent: "#b0a8a0", defaultColor: "#b0a8a0", defaultMaterial: "marble" },
  { id: "rug",            icon: RectangleHorizontal,  label: "Rug",           preview: "🟫", accent: "#c47a5a", defaultColor: "#c47a5a", defaultMaterial: "fabric" },
  { id: "floor-cushion",  icon: CircleDot,            label: "Cushion",       preview: "🛋️", accent: "#d35f7a", defaultColor: "#d35f7a", defaultMaterial: "fabric" },
  { id: "jazz-radio",     icon: Radio,                label: "Jazz Radio",    preview: "📻", accent: "#4a6fa5", defaultColor: "#3d3630", defaultMaterial: "wood" },
];

/* ── Scene placement spots ───────────────────────────────────────────────── */

const PLACEMENT_SPOTS = [
  { id: "left-back",     label: "Left back corner",   cx: "18%", cy: "34%" },
  { id: "center-back",   label: "Centre back",         cx: "50%", cy: "28%" },
  { id: "right-back",    label: "Right back corner",   cx: "82%", cy: "34%" },
  { id: "left-front",    label: "Left front",          cx: "22%", cy: "68%" },
  { id: "center-front",  label: "Centre front",        cx: "50%", cy: "74%" },
  { id: "right-front",   label: "Right front",         cx: "82%", cy: "68%" },
];

/* ── Jazz Radio Audio ────────────────────────────────────────────────────── */

const JAZZ_STREAM_URL = "https://streaming.radio.co/s774887f7b/listen";

function useJazzRadio(decorPlacements) {
  const audioRef = useRef(null);
  const hasRadio = useMemo(
    () => Object.values(decorPlacements).some((p) => p?.item === "jazz-radio"),
    [decorPlacements],
  );

  useEffect(() => {
    if (hasRadio) {
      if (!audioRef.current) {
        const audio = new Audio(JAZZ_STREAM_URL);
        audio.loop = true;
        audio.volume = 0.35;
        audioRef.current = audio;
      }
      audioRef.current.play().catch(() => {});
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [hasRadio]);

  const setVolume = useCallback((v) => {
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  return { isPlaying: hasRadio, setVolume };
}

/* ── The panel component ─────────────────────────────────────────────────── */

export default function DecorPanel({
  roomCustomization,
  onRoomCustomizationChange,
  decorPlacements = {},
  onDecorPlacementChange,
}) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingSpot, setEditingSpot] = useState(null);
  const [radioVolume, setRadioVolume] = useState(35);

  const { isPlaying, setVolume } = useJazzRadio(decorPlacements);

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

  const placedCount = Object.values(decorPlacements).filter(Boolean).length;
  const selectedMeta = DECOR_ITEMS.find((d) => d.id === selectedItem);
  const editingData = editingSpot ? decorPlacements[editingSpot] : null;
  const editingMeta = editingData ? DECOR_ITEMS.find((d) => d.id === editingData.item) : null;

  const placeItem = (spotId) => {
    if (!selectedItem) return;
    const meta = DECOR_ITEMS.find((d) => d.id === selectedItem);
    onDecorPlacementChange?.({
      ...decorPlacements,
      [spotId]: {
        item: selectedItem,
        color: meta?.defaultColor ?? "#c9a87c",
        material: meta?.defaultMaterial ?? "wood",
      },
    });
    setSelectedItem(null);
  };

  const removeFromSpot = (spotId) => {
    const next = { ...decorPlacements };
    delete next[spotId];
    onDecorPlacementChange?.(next);
    if (editingSpot === spotId) setEditingSpot(null);
  };

  const updateSpotProp = (spotId, key, value) => {
    const current = decorPlacements[spotId];
    if (!current) return;
    onDecorPlacementChange?.({
      ...decorPlacements,
      [spotId]: { ...current, [key]: value },
    });
  };

  const handleVolumeChange = (e) => {
    const v = Number(e.target.value);
    setRadioVolume(v);
    setVolume(v / 100);
  };

  return (
    <aside
      className="wardrobe-panel-shell wardrobe-panel-shell--decor wardrobe-shell-in relative z-10 flex h-full w-full flex-col rounded-[2rem] text-white"
      style={{ ...panelStyle, overflow: "hidden" }}
    >
      {/* Ambient top glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-36 rounded-t-[2rem]"
        style={{ background: `radial-gradient(ellipse at top, ${hexToRgba(panelAccent, 0.22)}, transparent 68%)` }}
      />

      {/* Scrollable content */}
      <div className="relative flex flex-1 flex-col gap-4 overflow-y-auto p-4 pb-3 md:p-5 md:pb-3">

        {/* ── Header ────────────────────────────────────────────── */}
        <header className="decor-panel-header">
          <span className="decor-panel-header__eyebrow font-kicker">Décor Studio</span>
          <h2 className="decor-panel-header__title wardrobe-script">Curate your Space</h2>
          <div className="decor-panel-header__counter">
            <span className="decor-panel-header__counter-num" style={{ color: panelAccent }}>{placedCount}</span>
            <span className="decor-panel-header__counter-label">/ {PLACEMENT_SPOTS.length} placed</span>
          </div>
        </header>

        {/* ── Item grid ─────────────────────────────────────────── */}
        <section className="decor-grid">
          {DECOR_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            const isActive = selectedItem === item.id;
            const isPlaced = Object.values(decorPlacements).some((p) => p?.item === item.id);

            return (
              <button
                key={item.id}
                className={`decor-card ${isActive ? "decor-card--active" : ""} ${isPlaced ? "decor-card--placed" : ""}`}
                style={{ "--card-accent": item.accent, animationDelay: `${idx * 40}ms` }}
                onClick={() => setSelectedItem(isActive ? null : item.id)}
              >
                <span className="decor-card__glow" />
                <span className="decor-card__icon">
                  <Icon size={22} strokeWidth={1.5} />
                </span>
                <span className="decor-card__name">{item.label}</span>
                {isPlaced && <span className="decor-card__badge">✓</span>}
              </button>
            );
          })}
        </section>

        {/* ── Placement map ─────────────────────────────────────── */}
        <section className="decor-placement">
          <div className="decor-placement__label font-kicker">
            {selectedMeta ? `Tap a spot for ${selectedMeta.label}` : "Tap item above · then a spot"}
          </div>

          <div className="decor-placement__map">
            <div className="decor-placement__room" />

            {PLACEMENT_SPOTS.map((spot) => {
              const data = decorPlacements[spot.id];
              const occupantMeta = data ? DECOR_ITEMS.find((d) => d.id === data.item) : null;
              const isEmpty = !data;
              const isReady = selectedItem && isEmpty;
              const isEditing = editingSpot === spot.id;

              return (
                <div
                  key={spot.id}
                  className={`decor-spot ${isReady ? "decor-spot--ready" : ""} ${data ? "decor-spot--filled" : ""} ${isEditing ? "decor-spot--editing" : ""}`}
                  style={{ left: spot.cx, top: spot.cy, "--spot-accent": occupantMeta?.accent ?? panelAccent }}
                  onClick={() => {
                    if (isReady) placeItem(spot.id);
                    else if (data) setEditingSpot(isEditing ? null : spot.id);
                  }}
                >
                  {data ? (
                    <>
                      <span className="decor-spot__emoji">{occupantMeta?.preview}</span>
                      <button
                        className="decor-spot__remove"
                        onClick={(e) => { e.stopPropagation(); removeFromSpot(spot.id); }}
                      >
                        <X size={10} strokeWidth={2.5} />
                      </button>
                    </>
                  ) : (
                    <span className="decor-spot__ring" />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Item customizer (when editing a placed item) ────── */}
        {editingSpot && editingData && editingMeta && (
          <section className="decor-customizer">
            <div className="decor-customizer__header">
              <Palette size={14} strokeWidth={1.8} />
              <span className="decor-customizer__title">{editingMeta.label}</span>
              <button className="decor-customizer__close" onClick={() => setEditingSpot(null)}>
                <X size={14} strokeWidth={2} />
              </button>
            </div>

            {/* Color picker */}
            <div className="decor-customizer__section">
              <div className="decor-customizer__section-label">
                <Palette size={11} strokeWidth={2} />
                Color
              </div>
              <div className="decor-customizer__swatches">
                {COLOR_SWATCHES.map((hex) => (
                  <button
                    key={hex}
                    className={`decor-customizer__swatch ${editingData.color === hex ? "decor-customizer__swatch--active" : ""}`}
                    style={{ background: hex }}
                    onClick={() => updateSpotProp(editingSpot, "color", hex)}
                  />
                ))}
              </div>
            </div>

            {/* Material picker */}
            <div className="decor-customizer__section">
              <div className="decor-customizer__section-label">
                <Brush size={11} strokeWidth={2} />
                Material
              </div>
              <div className="decor-customizer__materials">
                {MATERIALS.map((mat) => (
                  <button
                    key={mat.id}
                    className={`decor-customizer__mat ${editingData.material === mat.id ? "decor-customizer__mat--active" : ""}`}
                    onClick={() => updateSpotProp(editingSpot, "material", mat.id)}
                  >
                    <span className="decor-customizer__mat-icon">{mat.icon}</span>
                    <span className="decor-customizer__mat-label">{mat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Jazz Radio volume ───────────────────────────────── */}
        {isPlaying && (
          <section className="decor-radio">
            <div className="decor-radio__indicator">
              <span className="decor-radio__bar" />
              <span className="decor-radio__bar" />
              <span className="decor-radio__bar" />
              <span className="decor-radio__bar" />
              <span className="decor-radio__bar" />
            </div>
            <div className="decor-radio__info">
              <Radio size={14} strokeWidth={1.8} />
              <span className="decor-radio__label">Jazz Radio</span>
              <span className="decor-radio__live">LIVE</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={radioVolume}
              onChange={handleVolumeChange}
              className="decor-radio__slider"
            />
          </section>
        )}
      </div>

      {/* Sticky footer — Panel Style */}
      <div className="room-panel-footer">
        <PanelStyleDrawer
          roomCustomization={roomCustomization}
          onUpdateRoomCustomization={onRoomCustomizationChange}
        />
      </div>
    </aside>
  );
}

export { DECOR_ITEMS, PLACEMENT_SPOTS };
