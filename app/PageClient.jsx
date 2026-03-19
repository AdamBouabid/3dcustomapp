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

  const clearOutfit = () => {
    setWardrobe({});
    setActiveItem(null);
  };

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
      />
    </div>
  );
}

