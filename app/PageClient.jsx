"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useWardrobe } from "./hooks/useWardrobe";
import OutfitRoom from "./components/layout/OutfitRoom";
import { DEFAULT_ROOM_CUSTOMIZATION, getRoomPreset } from "./components/ui/roomCustomizationConfig";

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

export default function PageClient({ initialCatalogItems }) {
  const { wardrobe, setWardrobe, activeItem, setActiveItem, equip, unequip, colors, setColor } = useWardrobe();
  const [focusMode, setFocusMode] = useState(false);
  const [scenePreset, setScenePreset] = useState("gallery-day");
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("outfit");
  const [search] = useState("");
  const [activeOutfitMode, setActiveOutfitMode] = useState(null);
  const [wardrobeHistory, setWardrobeHistory] = useState([]);
  const [roomCustomization, setRoomCustomization] = useState(DEFAULT_ROOM_CUSTOMIZATION);
  const [catalogLoadState, setCatalogLoadState] = useState(() => ({
    loaded: 0,
    total: initialCatalogItems.length,
    ready: false,
    dismissed: true,
    started: false,
  }));
  const [loadedCatalogCategories, setLoadedCatalogCategories] = useState([]);
  const catalogLoadedIdsRef = useRef(new Set());

  const normalizeLoadingCategory = (category) => {
    if (category === "one-piece") return "dress";
    if (category === "bottoms") return "bottom";
    if (category === "footwear") return "shoes";
    return "top";
  };

  const handleTabChange = (nextTab) => {
    if (nextTab !== "catalog") {
      // reset Catalog load state each time we leave catalog so we replay loader on re-enter
      setLoadedCatalogCategories([]);
      setCatalogLoadState({
        loaded: 0,
        total: initialCatalogItems.length,
        ready: false,
        dismissed: true,
        started: false,
      });
      setActiveTab(nextTab);
      return;
    }

    setActiveTab(nextTab);

    // Always re-run load when entering catalog
    catalogLoadedIdsRef.current = new Set();
    setLoadedCatalogCategories([]);
    setCatalogLoadState({
      loaded: 0,
      total: initialCatalogItems.length,
      ready: false,
      dismissed: false,
      started: true,
    });
  };

  const applyOutfitTheme = (mode) => {
    const presetKeys = Object.keys(OUTFIT_THEME_PRESETS);
    const modeKey = mode === "auto" ? presetKeys[Math.floor(Math.random() * presetKeys.length)] : mode;
    const preset = OUTFIT_THEME_PRESETS[modeKey];
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
  const [equippedOnly] = useState(false);
  const [favoritesOnly] = useState(false);
  const [topsOnly] = useState(false);
  const [recentlyImportedOnly] = useState(false);
  const [colorFamily] = useState("all");

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
    // Ensure every catalog item has a default color so the scene can use it safely
    initialCatalogItems?.forEach((item) => {
      if (!colors[item.id]) {
        setColor(item.id, "#a5b4fc");
      }
    });
  }, [initialCatalogItems, colors, setColor]);

  useEffect(() => {
    if (!catalogLoadState.started || catalogLoadState.ready || catalogLoadState.loaded < catalogLoadState.total) {
      return undefined;
    }

    const dismissTimer = window.setTimeout(() => {
      setCatalogLoadState((current) => ({
        ...current,
        ready: true,
        dismissed: true,
      }));
    }, 320);

    return () => {
      window.clearTimeout(dismissTimer);
    };
  }, [catalogLoadState.loaded, catalogLoadState.ready, catalogLoadState.started, catalogLoadState.total]);

  const handleCatalogPreviewReady = (itemId, category) => {
    if (!itemId || activeTab !== "catalog" || !catalogLoadState.started || catalogLoadState.dismissed) {
      return;
    }

    if (catalogLoadedIdsRef.current.has(itemId)) {
      return;
    }

    catalogLoadedIdsRef.current.add(itemId);
    const normalizedCategory = normalizeLoadingCategory(category);

    setLoadedCatalogCategories((current) => (
      current.includes(normalizedCategory) ? current : [...current, normalizedCategory]
    ));

    setCatalogLoadState((current) => ({
      ...current,
      loaded: Math.min(catalogLoadedIdsRef.current.size, current.total),
    }));
  };

  const updateRoomCustomization = (patch) => {
    setRoomCustomization((current) => ({ ...current, ...patch }));
  };

  const applyRoomPreset = (presetId) => {
    const preset = getRoomPreset(presetId);
    setRoomCustomization((current) => ({
      ...current,
      preset: preset.id,
      ...preset.values,
    }));
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

  const loadProgress = catalogLoadState.total > 0
    ? Math.round((catalogLoadState.loaded / catalogLoadState.total) * 100)
    : 100;
  const showLoadingOverlay = activeTab === "catalog" && !catalogLoadState.dismissed;
  const silhouetteItems = [
    { id: "top", label: "Top" },
    { id: "dress", label: "Dress" },
    { id: "bottom", label: "Bottom" },
    { id: "shoes", label: "Shoes" },
  ];
  const silhouetteOrder = [
    ...loadedCatalogCategories,
    ...silhouetteItems.map((item) => item.id).filter((id) => !loadedCatalogCategories.includes(id)),
  ].slice(0, 4);
  const orderedSilhouettes = silhouetteOrder
    .map((id) => silhouetteItems.find((item) => item.id === id))
    .filter(Boolean);
  const loadingMessage = loadProgress < 34
    ? "Curating silhouettes"
    : loadProgress < 68
      ? "Setting the gallery mood"
      : loadProgress < 100
        ? "Polishing the last looks"
        : "Collection ready";

  return (
    <div style={{ width: "100vw", height: "100vh", margin: 0, padding: 0, position: "relative" }}>
      <OutfitRoom
        initialCatalogItems={initialCatalogItems}
        wardrobe={wardrobe}
        equip={equip}
        unequip={unequip}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        colors={colors}
        setColor={setColor}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
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
        advancedActions={advancedActions}
        roomCustomization={roomCustomization}
        onRoomCustomizationChange={updateRoomCustomization}
        onApplyRoomPreset={applyRoomPreset}
        onCatalogPreviewReady={handleCatalogPreviewReady}
      />
      {showLoadingOverlay && (
        <div
          className={`catalog-loading-screen ${catalogLoadState.ready ? "catalog-loading-screen--exit" : ""}`}
          aria-live="polite"
          aria-busy={!catalogLoadState.ready}
        >
          <div className="catalog-loading-screen__backdrop" />
          <div className="catalog-loading-screen__ambient catalog-loading-screen__ambient--left" />
          <div className="catalog-loading-screen__ambient catalog-loading-screen__ambient--right" />
          <div className="catalog-loading-screen__content">
            <div className="catalog-loading-screen__orbit" aria-hidden="true">
              <span className="catalog-loading-screen__orbit-ring" />
              <span className="catalog-loading-screen__orbit-core" />
              <span className="catalog-loading-screen__orbit-dot catalog-loading-screen__orbit-dot--one" />
              <span className="catalog-loading-screen__orbit-dot catalog-loading-screen__orbit-dot--two" />
              <span className="catalog-loading-screen__orbit-dot catalog-loading-screen__orbit-dot--three" />
            </div>
            <p className="font-kicker catalog-loading-screen__eyebrow">Wardrobe gallery</p>
            <h1 className="wardrobe-script catalog-loading-screen__title">Loading Collection</h1>
            <p className="catalog-loading-screen__message">{loadingMessage}</p>
            <div className="catalog-loading-screen__silhouettes" aria-hidden="true">
              {orderedSilhouettes.map((item, index) => {
                const isActive = loadedCatalogCategories.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className={`catalog-loading-screen__silhouette catalog-loading-screen__silhouette--${item.id} ${isActive ? "catalog-loading-screen__silhouette--active" : ""}`}
                    style={{ animationDelay: `${index * 140}ms` }}
                  >
                    <span className="catalog-loading-screen__silhouette-head" />
                    <span className="catalog-loading-screen__silhouette-body" />
                    <span className="catalog-loading-screen__silhouette-base" />
                  </div>
                );
              })}
            </div>
            <div className="catalog-loading-screen__chips" aria-hidden="true">
              <span className="catalog-loading-screen__chip">Looks</span>
              <span className="catalog-loading-screen__chip">Lighting</span>
              <span className="catalog-loading-screen__chip">Textures</span>
            </div>
            <div className="catalog-loading-screen__meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={loadProgress}>
              <div className="catalog-loading-screen__meter-fill" style={{ width: `${loadProgress}%` }} />
            </div>
            <div className="catalog-loading-screen__status-row">
              <span>{catalogLoadState.loaded} / {catalogLoadState.total || initialCatalogItems.length}</span>
              <span>{catalogLoadState.ready ? "Ready" : `${loadProgress}%`}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

