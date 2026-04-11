"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Flower2, Lamp, Armchair, Frame, TreePine, Coffee, X,
  BookOpen, Flame, CircleDot, Gem, RectangleHorizontal, Radio, Palette, Brush, RotateCw, Scaling,
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

/* ── Decor collection ────────────────────────────────────────────────────── */

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

const LEGACY_DECOR_SPOT_POSITIONS = {
  "left-back": [-3.6, -0.98, -3.2],
  "center-back": [0, -0.98, -3.6],
  "right-back": [3.6, -0.98, -3.2],
  "left-front": [-3.2, -0.98, 2.4],
  "center-front": [0, -0.98, 2.8],
  "right-front": [3.2, -0.98, 2.4],
};

const FLOOR_DECOR_BOUNDS = {
  minX: -4.1,
  maxX: 4.1,
  minZ: -3.7,
  maxZ: 3.2,
  y: -0.98,
};

const WALL_DECOR_BOUNDS = {
  minX: -3.2,
  maxX: 3.2,
  minY: 1.2,
  maxY: 2.2,
  z: -4.24,
};

const DECOR_DEFAULT_POSITIONS = {
  "tall-vase": [-3.24, -0.98, -2.38],
  "table-lamp": [3.02, -0.98, -2.34],
  armchair: [-2.52, -0.98, 1.88],
  "wall-art": [0, 1.68, -4.24],
  plant: [3.34, -0.98, 2.26],
  "coffee-table": [0.24, -0.98, 2.16],
  bookshelf: [-3.58, -0.98, -2.88],
  candelabra: [-2.1, -0.98, 2.18],
  sculpture: [2.22, -0.98, 2.1],
  rug: [0, -0.98, 1.86],
  "floor-cushion": [1.66, -0.98, 1.94],
  "jazz-radio": [2.84, -0.98, 2.54],
};

function clampValue(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function clampDecorScale(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 1;
  }

  return clampValue(numeric, 0.6, 1.7);
}

function normalizeDecorRotation(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }

  const wrapped = numeric % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

export function isWallDecorItem(itemId) {
  return itemId === "wall-art";
}

export function clampDecorPosition(itemId, rawPosition) {
  const [rawX = 0, rawY = 0, rawZ = 0] = Array.isArray(rawPosition) ? rawPosition : [0, 0, 0];

  if (isWallDecorItem(itemId)) {
    return [
      clampValue(rawX, WALL_DECOR_BOUNDS.minX, WALL_DECOR_BOUNDS.maxX),
      clampValue(rawY || DECOR_DEFAULT_POSITIONS[itemId]?.[1] || WALL_DECOR_BOUNDS.minY, WALL_DECOR_BOUNDS.minY, WALL_DECOR_BOUNDS.maxY),
      WALL_DECOR_BOUNDS.z,
    ];
  }

  return [
    clampValue(rawX, FLOOR_DECOR_BOUNDS.minX, FLOOR_DECOR_BOUNDS.maxX),
    FLOOR_DECOR_BOUNDS.y,
    clampValue(rawZ, FLOOR_DECOR_BOUNDS.minZ, FLOOR_DECOR_BOUNDS.maxZ),
  ];
}

export function createDecorPlacement(itemId, overrides = {}) {
  const meta = DECOR_ITEMS.find((entry) => entry.id === itemId);
  const defaultPosition = DECOR_DEFAULT_POSITIONS[itemId] ?? [0, FLOOR_DECOR_BOUNDS.y, 2];

  return {
    item: itemId,
    color: overrides.color ?? meta?.defaultColor ?? "#c9a87c",
    material: overrides.material ?? meta?.defaultMaterial ?? "wood",
    position: clampDecorPosition(itemId, overrides.position ?? defaultPosition),
    rotation: normalizeDecorRotation(overrides.rotation ?? 0),
    scale: clampDecorScale(overrides.scale ?? 1),
  };
}

export function normalizeDecorPlacements(input = {}) {
  const normalized = {};

  Object.entries(input).forEach(([key, rawValue]) => {
    if (!rawValue) {
      return;
    }

    const itemId = typeof rawValue === "string" ? rawValue : rawValue.item ?? key;
    if (!itemId) {
      return;
    }

    const fallbackPosition = LEGACY_DECOR_SPOT_POSITIONS[key] ?? DECOR_DEFAULT_POSITIONS[itemId];
    normalized[itemId] = createDecorPlacement(itemId, {
      ...(typeof rawValue === "object" ? rawValue : {}),
      position: rawValue?.position ?? fallbackPosition,
    });
  });

  return normalized;
}

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
  selectedDecorItemId,
  onSelectedDecorItemChange,
  activeDecorItemId,
  onActiveDecorItemChange,
}) {
  const [radioVolume, setRadioVolume] = useState(35);
  const [justPlacedId, setJustPlacedId] = useState(null);
  const normalizedPlacements = useMemo(() => normalizeDecorPlacements(decorPlacements), [decorPlacements]);
  const previousPlacementIdsRef = useRef([]);

  const { isPlaying, setVolume } = useJazzRadio(normalizedPlacements);

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

  const placedCount = Object.keys(normalizedPlacements).length;
  const selectedMeta = DECOR_ITEMS.find((d) => d.id === selectedDecorItemId);
  const editingData = activeDecorItemId ? normalizedPlacements[activeDecorItemId] : null;
  const editingMeta = editingData ? DECOR_ITEMS.find((d) => d.id === editingData.item) : null;
  const placedItems = useMemo(() => {
    return Object.values(normalizedPlacements)
      .map((placement) => {
        const meta = DECOR_ITEMS.find((item) => item.id === placement.item);
        return meta ? { ...placement, meta } : null;
      })
      .filter(Boolean);
  }, [normalizedPlacements]);

  const handleCardClick = (itemId) => {
    const nextSelection = selectedDecorItemId === itemId ? null : itemId;
    onSelectedDecorItemChange?.(nextSelection);
    if (!nextSelection) {
      onActiveDecorItemChange?.(activeDecorItemId === itemId ? null : activeDecorItemId);
      return;
    }
    if (normalizedPlacements[itemId]) {
      onActiveDecorItemChange?.(itemId);
    }
  };

  const removeDecorItem = (itemId) => {
    const next = { ...normalizedPlacements };
    delete next[itemId];
    onDecorPlacementChange?.(next);
    if (selectedDecorItemId === itemId) {
      onSelectedDecorItemChange?.(null);
    }
    if (activeDecorItemId === itemId) {
      onActiveDecorItemChange?.(null);
    }
  };

  const updateSpotProp = (itemId, key, value) => {
    const current = normalizedPlacements[itemId];
    if (!current) return;
    onDecorPlacementChange?.({
      ...normalizedPlacements,
      [itemId]: { ...current, [key]: value },
    });
  };

  const handleVolumeChange = (e) => {
    const v = Number(e.target.value);
    setRadioVolume(v);
    setVolume(v / 100);
  };

  useEffect(() => {
    const previousIds = previousPlacementIdsRef.current;
    const currentIds = Object.keys(normalizedPlacements);
    const nextPlacedId = currentIds.find((id) => !previousIds.includes(id)) ?? null;

    previousPlacementIdsRef.current = currentIds;

    if (!nextPlacedId) {
      return undefined;
    }

    const activateTimer = window.setTimeout(() => {
      setJustPlacedId(nextPlacedId);
    }, 0);
    const resetTimer = window.setTimeout(() => setJustPlacedId(null), 700);

    return () => {
      window.clearTimeout(activateTimer);
      window.clearTimeout(resetTimer);
    };
  }, [normalizedPlacements]);

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
            <span className="decor-panel-header__counter-label">pieces placed</span>
          </div>
        </header>

        {/* ── Item grid ─────────────────────────────────────────── */}
        <section className="decor-grid">
          {DECOR_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            const isActive = selectedDecorItemId === item.id;
            const isPlaced = Boolean(normalizedPlacements[item.id]);

            return (
              <button
                key={item.id}
                className={`decor-card ${isActive ? "decor-card--active" : ""} ${isPlaced ? "decor-card--placed" : ""} ${justPlacedId === item.id ? "decor-card--pulse" : ""}`}
                style={{ "--card-accent": item.accent, animationDelay: `${idx * 40}ms` }}
                onClick={() => handleCardClick(item.id)}
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

        <section className="decor-director">
          <div className="decor-director__eyebrow font-kicker">Direct Placement</div>
          <h3 className="decor-director__title">
            {selectedMeta ? `${selectedMeta.label} is armed for placement` : "Place decor directly in the 3D room"}
          </h3>
          <p className="decor-director__copy">
            {selectedMeta
              ? `${selectedMeta.label} can be dropped straight into the scene. Click the floor to place it, or drag it after it appears.`
              : "Choose any piece above, then click inside the room to place it. Existing objects can be dragged to reposition them."}
          </p>
          <div className="decor-director__steps">
            <span className="decor-director__step">1. Select a piece</span>
            <span className="decor-director__step">2. Click the room to place</span>
            <span className="decor-director__step">3. Drag to refine</span>
          </div>
        </section>

        <section className="decor-placed-list">
          <div className="decor-placed-list__header">
            <span className="decor-placed-list__title font-kicker">Placed Pieces</span>
            <span className="decor-placed-list__count">{placedCount}</span>
          </div>
          {placedItems.length === 0 ? (
            <div className="decor-placed-list__empty">Nothing is staged yet. Start with a lamp, plant, or rug to block out the room.</div>
          ) : (
            <div className="decor-placed-list__grid">
              {placedItems.map(({ item, color, meta }) => {
                const isEditing = activeDecorItemId === item;
                return (
                  <button
                    key={item}
                    className={`decor-placed-chip ${isEditing ? "decor-placed-chip--active" : ""} ${justPlacedId === item ? "decor-placed-chip--pulse" : ""}`}
                    style={{ "--chip-accent": meta.accent }}
                    onClick={() => {
                      onActiveDecorItemChange?.(isEditing ? null : item);
                      onSelectedDecorItemChange?.(item);
                    }}
                  >
                    <span className="decor-placed-chip__emoji">{meta.preview}</span>
                    <span className="decor-placed-chip__copy">
                      <span className="decor-placed-chip__name">{meta.label}</span>
                      <span className="decor-placed-chip__meta">{isWallDecorItem(item) ? "Wall-mounted" : "Floor piece"}</span>
                    </span>
                    <span className="decor-placed-chip__swatch" style={{ background: color }} />
                    <span
                      className="decor-placed-chip__remove"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeDecorItem(item);
                      }}
                    >
                      <X size={12} strokeWidth={2.3} />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Item customizer (when editing a placed item) ────── */}
        {activeDecorItemId && editingData && editingMeta && (
          <section className="decor-customizer">
            <div className="decor-customizer__header">
              <Palette size={14} strokeWidth={1.8} />
              <span className="decor-customizer__title">{editingMeta.label}</span>
              <button className="decor-customizer__close" onClick={() => onActiveDecorItemChange?.(null)}>
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
                    onClick={() => updateSpotProp(activeDecorItemId, "color", hex)}
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
                    onClick={() => updateSpotProp(activeDecorItemId, "material", mat.id)}
                  >
                    <span className="decor-customizer__mat-icon">{mat.icon}</span>
                    <span className="decor-customizer__mat-label">{mat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="decor-customizer__section">
              <div className="decor-customizer__section-label">
                <RotateCw size={11} strokeWidth={2} />
                Rotation
              </div>
              <div className="decor-transform-row">
                <input
                  className="decor-transform-row__range"
                  type="range"
                  min={0}
                  max={360}
                  value={Math.round(editingData.rotation ?? 0)}
                  onChange={(event) => updateSpotProp(activeDecorItemId, "rotation", Number(event.target.value))}
                />
                <span className="decor-transform-row__value">{Math.round(editingData.rotation ?? 0)}°</span>
              </div>
            </div>

            <div className="decor-customizer__section">
              <div className="decor-customizer__section-label">
                <Scaling size={11} strokeWidth={2} />
                Scale
              </div>
              <div className="decor-transform-row">
                <input
                  className="decor-transform-row__range"
                  type="range"
                  min={60}
                  max={170}
                  value={Math.round((editingData.scale ?? 1) * 100)}
                  onChange={(event) => updateSpotProp(activeDecorItemId, "scale", Number(event.target.value) / 100)}
                />
                <span className="decor-transform-row__value">{Math.round((editingData.scale ?? 1) * 100)}%</span>
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

export {
  DECOR_ITEMS,
  DECOR_DEFAULT_POSITIONS,
  FLOOR_DECOR_BOUNDS,
  WALL_DECOR_BOUNDS,
  LEGACY_DECOR_SPOT_POSITIONS,
  normalizeDecorRotation,
  clampDecorScale,
};
