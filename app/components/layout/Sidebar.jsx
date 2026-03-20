"use client";
import React from "react";
import WardrobePanel from "../ui/WardrobePanel";

export default function Sidebar({
  isDark,
  items,
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
  category,
  search,
  equippedOnly,
  favoritesOnly,
  topsOnly,
  recentlyImportedOnly,
  colorFamily,
  panelCollapsed,
  onCategoryChange,
  applyOutfitTheme,
  undoOutfit,
  clearOutfit,
  activeOutfitMode,
  wardrobeHistory,
}) {
  return (
    <aside style={{
      position: "absolute",
      top: 0,
      left: 0,
      height: "100%",
      width: "420px",
      zIndex: 20,
      transform: panelCollapsed ? "translateX(-100%)" : "translateX(0)",
      transition: "transform 220ms cubic-bezier(0.4,0,0.2,1)",
      padding: panelCollapsed ? 0 : "16px 12px",
      pointerEvents: panelCollapsed ? "none" : "auto",
    }}>
      <WardrobePanel
        isDark={isDark}
        items={items}
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
        onCategoryChange={onCategoryChange}
        applyOutfitTheme={applyOutfitTheme}
        undoOutfit={undoOutfit}
        clearOutfit={clearOutfit}
        activeOutfitMode={activeOutfitMode}
        wardrobeHistory={wardrobeHistory}
      />
    </aside>
  );
}
