"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useWardrobe } from "./hooks/useWardrobe";
import OutfitRoom from "./components/layout/OutfitRoom";
import { DEFAULT_ROOM_CUSTOMIZATION } from "./components/ui/roomCustomizationConfig";
import { DEFAULT_MODEL_APPEARANCE } from "./components/ui/modelAppearanceConfig";
import { isValidHexColor, normalizeHex } from "./components/ui/wardrobeUtils";

const OUTFIT_THEME_PRESETS = {
  day: {
    label: "Day",
    scenePreset: "gallery-day",
    itemTypes: ["tops", "bottoms", "footwear"],
    colors: {
      tops: "#fbbf24",
      bottoms: "#60a5fa",
      dresses: "#a78bfa",
      footwear: "#2563eb",
      default: "#f4f4f5",
    },
  },
  night: {
    label: "Night",
    scenePreset: "gallery-evening",
    itemTypes: ["one-piece", "footwear"],
    colors: {
      tops: "#4b5563",
      bottoms: "#1e293b",
      dresses: "#7c3aed",
      footwear: "#e879f9",
      default: "#94a3b8",
    },
  },
  work: {
    label: "Work",
    scenePreset: "gallery-sunset",
    itemTypes: ["tops", "bottoms", "footwear"],
    colors: {
      tops: "#0ea5e9",
      bottoms: "#64748b",
      dresses: "#0f766e",
      footwear: "#334155",
      default: "#cbd5e1",
    },
  },
  casual: {
    label: "Casual",
    scenePreset: "gallery-day",
    itemTypes: ["tops", "bottoms", "footwear"],
    colors: {
      tops: "#22c55e",
      bottoms: "#f97316",
      dresses: "#facc15",
      footwear: "#6366f1",
      default: "#dbeafe",
    },
  },
};

export default function PageClient({ initialItems = [] }) {
  const { wardrobe, setWardrobe, activeItem, setActiveItem, equip, unequip, colors, setColor } = useWardrobe();
  const [focusMode, setFocusMode] = useState(false);
  const [scenePreset, setScenePreset] = useState("gallery-day");
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("outfit");
  const [activeOutfitPanel, setActiveOutfitPanel] = useState("outfit");
  const [activeOutfitMode, setActiveOutfitMode] = useState(null);
  const [wardrobeHistory, setWardrobeHistory] = useState([]);
  const [roomCustomization, setRoomCustomization] = useState(DEFAULT_ROOM_CUSTOMIZATION);
  const [decorPlacements, setDecorPlacements] = useState({});
  const [modelAppearance, setModelAppearance] = useState(DEFAULT_MODEL_APPEARANCE);
  const [modelFocusTarget, setModelFocusTarget] = useState(null);

  const applyOutfitTheme = (mode) => {
    const presetKeys = Object.keys(OUTFIT_THEME_PRESETS);
    const modeKey = mode === "auto" ? presetKeys[Math.floor(Math.random() * presetKeys.length)] : mode;
    const preset = OUTFIT_THEME_PRESETS[modeKey];
    if (!preset || initialItems.length === 0) return;

    setWardrobeHistory((prev) => [
      ...prev,
      { wardrobe: { ...wardrobe }, colors: { ...colors }, activeItem },
    ].slice(-12));

    setActiveOutfitMode(modeKey);

    // pick one item per desired category/type
    const matched = [];
    const remaining = [...initialItems];

    for (const type of preset.itemTypes) {
      const pickIndex = remaining.findIndex((item) => item.category === type || item.type === type);
      if (pickIndex !== -1) {
        const [item] = remaining.splice(pickIndex, 1);
        matched.push(item);
      }
    }

    // fallback to first items if none were matched
    if (matched.length === 0) {
      matched.push(...initialItems.slice(0, Math.min(3, initialItems.length)));
    }

    setWardrobe(matched.reduce((acc, item) => ({ ...acc, [item.id]: item.url }), {}));
    setActiveItem(matched[0]?.id ?? null);

    // set colors based on type/name, plus default
    matched.forEach((item) => {
      const paletteKey = item.type || item.category || "default";
      const color = preset.colors[paletteKey] || preset.colors.default;
      if (color) {
        setColor(item.id, color);
      }
    });

    if (preset.scenePreset) {
      setScenePreset(preset.scenePreset);
    }
  };

  const undoOutfit = () => {
    if (wardrobeHistory.length === 0) return;

    const last = wardrobeHistory[wardrobeHistory.length - 1];
    if (!last) return;

    setWardrobe(last.wardrobe || {});
    setActiveItem(last.activeItem || null);
    if (last.colors) {
      Object.entries(last.colors).forEach(([id, value]) => setColor(id, value));
    }
    setWardrobeHistory((prev) => prev.slice(0, -1));
    setActiveOutfitMode(null);
  };

  const clearOutfit = () => {
    setWardrobeHistory((prev) => [
      ...prev,
      { wardrobe: { ...wardrobe }, colors: { ...colors }, activeItem },
    ].slice(-12));

    setWardrobe({});
    setActiveItem(null);
    setActiveOutfitMode(null);
  };

  const canvasRef = useRef(null);

  const equippedItems = useMemo(() => Object.entries(wardrobe).map(([id, url]) => ({ id, url })), [wardrobe]);

  const createSnapshotData = () => {
    const canvasTarget = canvasRef.current?.gl?.domElement ?? canvasRef.current;
    if (!canvasTarget || typeof canvasTarget.toDataURL !== "function") return null;
    return canvasTarget.toDataURL("image/png");
  };

  const handleLoadOutfit = (outfit) => {
    if (!outfit) return;
    if (outfit.wardrobe && typeof outfit.wardrobe === "object") {
      setWardrobe(outfit.wardrobe);
    }

    if (outfit.colors && typeof outfit.colors === "object") {
      Object.entries(outfit.colors).forEach(([id, color]) => {
        if (typeof color === "string") {
          setColor(id, color);
        }
      });
    }
  };

  useEffect(() => {
    // Ensure every wardrobe item has a default color so the scene can use it safely
    initialItems.forEach((item) => {
      if (!colors[item.id]) {
        setColor(item.id, "#a5b4fc");
      }
    });
  }, [initialItems, colors, setColor]);

  useEffect(() => {
    if (!modelFocusTarget) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setModelFocusTarget(null);
    }, 2600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [modelFocusTarget]);

  const updateRoomCustomization = (patch) => {
    setRoomCustomization((current) => ({ ...current, ...patch }));
  };

  const updateModelAppearance = (patch) => {
    setModelAppearance((current) => {
      const nextPatch = Object.entries(patch ?? {}).reduce((accumulator, [key, value]) => {
        if (!isValidHexColor(value)) {
          return accumulator;
        }

        accumulator[key] = normalizeHex(value);
        return accumulator;
      }, {});

      return { ...current, ...nextPatch };
    });
  };

  const resetModelAppearance = () => {
    setModelAppearance(DEFAULT_MODEL_APPEARANCE);
  };

  const advancedActions = {
    onLoadOutfit: handleLoadOutfit,
    createSnapshotData,
    applyOutfitTheme,
    undoOutfit,
    clearOutfit,
    activeOutfitMode,
    wardrobeHistory,
  };

  return (
    <div style={{ width: "100vw", height: "100vh", margin: 0, padding: 0, position: "relative" }}>
      <OutfitRoom
        initialItems={initialItems}
        wardrobe={wardrobe}
        equip={equip}
        unequip={unequip}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        colors={colors}
        setColor={setColor}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeOutfitPanel={activeOutfitPanel}
        setActiveOutfitPanel={setActiveOutfitPanel}
        panelCollapsed={panelCollapsed}
        setPanelCollapsed={setPanelCollapsed}
        equippedItems={equippedItems}
        canvasRef={canvasRef}
        focusMode={focusMode}
        setFocusMode={setFocusMode}
        scenePreset={scenePreset}
        setScenePreset={setScenePreset}
        advancedActions={advancedActions}
        roomCustomization={roomCustomization}
        onRoomCustomizationChange={updateRoomCustomization}
        modelAppearance={modelAppearance}
        onModelAppearanceChange={updateModelAppearance}
        onResetModelAppearance={resetModelAppearance}
        modelFocusTarget={modelFocusTarget}
        onModelFocusTargetChange={setModelFocusTarget}
        decorPlacements={decorPlacements}
        onDecorPlacementChange={setDecorPlacements}
      />
    </div>
  );
}

