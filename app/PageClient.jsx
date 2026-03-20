"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useWardrobe } from "./hooks/useWardrobe";
import OutfitRoom from "./components/layout/OutfitRoom";

export default function PageClient({ initialCatalogItems }) {
  const { wardrobe, setWardrobe, activeItem, setActiveItem, equip, unequip, colors, setColor } = useWardrobe();
  const [theme, setTheme] = useState("dark");
  const [focusMode, setFocusMode] = useState(false);
  const [scenePreset, setScenePreset] = useState("night-studio");
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("outfit");
  const [search, setSearch] = useState("");
  const [activeOutfitMode, setActiveOutfitMode] = useState(null);
  const [wardrobeHistory, setWardrobeHistory] = useState([]);

  const outfitThemePresets = {
    day: {
      label: "Day",
      scenePreset: "daylight",
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
      scenePreset: "city",
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
      scenePreset: "studio",
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
      scenePreset: "forest",
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

  const applyOutfitTheme = (mode) => {
    const modeKey = mode === "auto" ? Object.keys(outfitThemePresets)[Math.floor(Math.random() * Object.keys(outfitThemePresets).length)] : mode;
    const preset = outfitThemePresets[modeKey];
    if (!preset || initialCatalogItems.length === 0) return;

    setWardrobeHistory((prev) => [
      ...prev,
      { wardrobe: { ...wardrobe }, colors: { ...colors }, activeItem },
    ].slice(-12));

    setActiveOutfitMode(modeKey);

    // pick one item per desired category/type
    const matched = [];
    const remaining = [...initialCatalogItems];

    for (const type of preset.itemTypes) {
      const pickIndex = remaining.findIndex((item) => item.category === type || item.type === type);
      if (pickIndex !== -1) {
        const [item] = remaining.splice(pickIndex, 1);
        matched.push(item);
      }
    }

    // fallback to first items if none were matched
    if (matched.length === 0) {
      matched.push(...initialCatalogItems.slice(0, Math.min(3, initialCatalogItems.length)));
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
  const [category, setCategory] = useState("all");
  const [equippedOnly, setEquippedOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [topsOnly, setTopsOnly] = useState(false);
  const [recentlyImportedOnly, setRecentlyImportedOnly] = useState(false);
  const [colorFamily, setColorFamily] = useState("all");

  const canvasRef = useRef(null);

  const equippedItems = useMemo(() => Object.entries(wardrobe).map(([id, url]) => ({ id, url })), [wardrobe]);
  const equippedCount = equippedItems.length;

  const createSnapshotData = () => {
    const canvasTarget = canvasRef.current?.gl?.domElement ?? canvasRef.current;
    if (!canvasTarget || typeof canvasTarget.toDataURL !== "function") return null;
    return canvasTarget.toDataURL("image/png");
  };

  const activeItemLabel = useMemo(() => {
    return initialCatalogItems.find((item) => item.id === activeItem)?.label ?? "";
  }, [activeItem, initialCatalogItems]);

  const categories = useMemo(() => {
    const all = new Set(initialCatalogItems.map((item) => item.category).filter(Boolean));
    return ["all", ...Array.from(all)];
  }, [initialCatalogItems]);

  const randomizeEquippedColors = () => {
    const randomHex = () => `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`;
    equippedItems.forEach((item) => setColor(item.id, randomHex()));
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
    // Ensure every catalog item has a default color so the scene can use it safely
    initialCatalogItems?.forEach((item) => {
      if (!colors[item.id]) {
        setColor(item.id, "#a5b4fc");
      }
    });
  }, [initialCatalogItems, colors, setColor]);

  return (
    <div style={{ width: "100vw", height: "100vh", margin: 0, padding: 0 }}>
      <OutfitRoom
        isDark={theme === "dark"}
        initialCatalogItems={initialCatalogItems}
        wardrobe={wardrobe}
        equip={equip}
        unequip={unequip}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        colors={colors}
        setColor={setColor}
        onLoadOutfit={handleLoadOutfit}
        createSnapshotData={createSnapshotData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        category={category}
        search={search}
        equippedOnly={equippedOnly}
        favoritesOnly={favoritesOnly}
        topsOnly={topsOnly}
        recentlyImportedOnly={recentlyImportedOnly}
        colorFamily={colorFamily}
        panelCollapsed={panelCollapsed}
        setPanelCollapsed={setPanelCollapsed}
        equippedItems={equippedItems}
        canvasRef={canvasRef}
        focusMode={focusMode}
        setFocusMode={setFocusMode}
        onCategoryChange={setCategory}
        scenePreset={scenePreset}
        setScenePreset={setScenePreset}
        applyOutfitTheme={applyOutfitTheme}
        undoOutfit={undoOutfit}
        clearOutfit={clearOutfit}
        activeOutfitMode={activeOutfitMode}
        wardrobeHistory={wardrobeHistory}
      />
    </div>
  );
}

