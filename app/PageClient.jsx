"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useWardrobe } from "./hooks/useWardrobe";
import AppNavbar from "./components/ui/AppNavbar";
import WardrobePanel from "./components/ui/WardrobePanel";
import SceneToolbar from "./components/ui/SceneToolbar";

const Scene = dynamic(() => import("./components/scene/Scene"), { ssr: false });

export default function PageClient({ initialCatalogItems }) {
  const { wardrobe, setWardrobe, activeItem, setActiveItem, equip, unequip, colors, setColor } = useWardrobe();
  const [theme, setTheme] = useState("dark");
  const [autoRotate, setAutoRotate] = useState(false);
  const [environment, setEnvironment] = useState("city");
  const [profileMode, setProfileMode] = useState(false);
  const [shaderMode, setShaderMode] = useState("toon");
  const [focusMode, setFocusMode] = useState(false);
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

  const handleSnapshot = () => {
    const url = createSnapshotData();
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = "outfit-snapshot.png";
    a.click();
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
      <AppNavbar
        isDark={theme === "dark"}
        totalItems={initialCatalogItems.length}
        equippedCount={equippedCount}
        activeLabel={activeItemLabel}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        categories={categories}
        colorFamily={colorFamily}
        onColorFamilyChange={setColorFamily}
        equippedOnly={equippedOnly}
        onEquippedOnlyChange={setEquippedOnly}
        favoritesOnly={favoritesOnly}
        onFavoritesOnlyChange={setFavoritesOnly}
        topsOnly={topsOnly}
        onTopsOnlyChange={setTopsOnly}
        recentlyImportedOnly={recentlyImportedOnly}
        onRecentlyImportedOnlyChange={setRecentlyImportedOnly}
        onRandomizeEquippedColors={randomizeEquippedColors}
        onClearOutfit={clearOutfit}
        hasEquipped={equippedCount > 0}
        focusMode={focusMode}
        onToggleFocusMode={() => setFocusMode((v) => !v)}
        panelCollapsed={panelCollapsed}
        onTogglePanel={() => setPanelCollapsed((v) => !v)}
      />

      <div style={{ display: "flex", height: "calc(100% - 64px)" }}>
        <div style={{ width: panelCollapsed ? 0 : "420px", overflow: "hidden", transition: "width 180ms ease" }}>
          <WardrobePanel
            isDark={theme === "dark"}
            items={initialCatalogItems}
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
            category={category}
            search={search}
            equippedOnly={equippedOnly}
            favoritesOnly={favoritesOnly}
            topsOnly={topsOnly}
            recentlyImportedOnly={recentlyImportedOnly}
            colorFamily={colorFamily}
          />
        </div>

        <main style={{ flex: 1 }}>
          <Scene
            items={equippedItems}
            colors={colors}
            canvasRef={canvasRef}
            autoRotate={autoRotate}
            environment={environment}
            focusMode={focusMode}
            shaderMode={shaderMode}
          />
        </main>
      </div>

      <SceneToolbar
        isDark={theme === "dark"}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        autoRotate={autoRotate}
        onToggleRotate={() => setAutoRotate((v) => !v)}
        environment={environment}
        onEnvironment={setEnvironment}
        profileMode={profileMode}
        onToggleProfileMode={() => setProfileMode((v) => !v)}
        shaderMode={shaderMode}
        onToggleShaderMode={() => setShaderMode((s) => (s === "toon" ? "pbr" : "toon"))}
        onSnapshot={handleSnapshot}
        dockOpen={!panelCollapsed}
        onToggleDock={() => setPanelCollapsed((v) => !v)}
      />
    </div>
  );
}

