"use client";
import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import Sidebar from "./Sidebar";
import TabSwitcher from "./TabSwitcher";

const Scene = dynamic(() => import("../scene/Scene"), { ssr: false });

export default function OutfitRoom({
  isDark,
  initialCatalogItems,
  wardrobe,
  equip,
  unequip,
  activeItem,
  setActiveItem,
  colors,
  setColor,
  onLoadOutfit,
  createSnapshotData,
  activeTab,
  setActiveTab,
  category,
  search,
  equippedOnly,
  favoritesOnly,
  topsOnly,
  recentlyImportedOnly,
  colorFamily,
  panelCollapsed,
  setPanelCollapsed,
  equippedItems,
  canvasRef,
  focusMode,
  setFocusMode,
  onCategoryChange,
}) {
  const sceneItems = useMemo(() => {
    if (activeTab === "catalog") {
      const selectedCatalogItem = initialCatalogItems.find((item) => item.id === activeItem);
      return selectedCatalogItem ? [{ id: selectedCatalogItem.id, url: selectedCatalogItem.url }] : [];
    }

    return equippedItems;
  }, [activeItem, activeTab, equippedItems, initialCatalogItems]);

  return (
    <div style={{ display: "flex", height: "100%", width: "100%", position: "relative" }}>
      <TabSwitcher
        activeTab={activeTab}
        onTabChange={setActiveTab}
        panelCollapsed={panelCollapsed}
        onTogglePanel={() => setPanelCollapsed((v) => !v)}
        activeItem={activeItem}
        activeColor={activeItem ? colors?.[activeItem] : "#a5b4fc"}
        onPaletteColorChange={(itemId, value) => setColor(itemId, value)}
        focusMode={focusMode}
        onFocusModeChange={setFocusMode}
      />
      <Sidebar
        isDark={isDark}
        items={initialCatalogItems}
        wardrobe={wardrobe}
        equip={equip}
        unequip={unequip}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        colors={colors}
        setColor={setColor}
        onLoadOutfit={onLoadOutfit}
        createSnapshotData={createSnapshotData}
        activeTab={activeTab}
        category={category}
        search={search}
        equippedOnly={equippedOnly}
        favoritesOnly={favoritesOnly}
        topsOnly={topsOnly}
        recentlyImportedOnly={recentlyImportedOnly}
        colorFamily={colorFamily}
        panelCollapsed={panelCollapsed}
        onCategoryChange={onCategoryChange}
      />

      <main style={{ flex: 1 }}>
        <Scene
          items={sceneItems}
          initialCatalogItems={initialCatalogItems}
          activeItem={activeItem}
          colors={colors}
          canvasRef={canvasRef}
          autoRotate={false}
          environment="city"
          focusMode={focusMode}
          showBaseModel={activeTab === "outfit"}
          enableFocusMode={activeTab === "outfit"}
        />
      </main>
    </div>
  );
}
