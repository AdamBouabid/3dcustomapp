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
}) {
  return (
    <aside style={{ flex: panelCollapsed ? "0 0 0" : "0 0 420px", width: panelCollapsed ? 0 : "420px", overflow: "hidden", transition: "width 180ms ease, flex 180ms ease", padding: panelCollapsed ? 0 : "16px 12px", margin: 0 }}>
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
      />
    </aside>
  );
}
