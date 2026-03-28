"use client";
import React from "react";
import WardrobePanel from "../ui/WardrobePanel";
import WardrobeRoomPanel from "../ui/WardrobeRoomPanel";

const PANEL_WIDTH = "clamp(320px, 34vw, 420px)";

export default function Sidebar({
  items,
  wardrobe,
  equip,
  unequip,
  activeItem,
  setActiveItem,
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
  advancedActions,
  roomCustomization,
  onRoomCustomizationChange,
  onApplyRoomPreset,
  scenePreset,
  onScenePresetChange,
  onCatalogPreviewReady,
}) {
  const isRoomPanel = activeTab === "room";

  return (
    <aside
      className={`sidebar-shell ${isRoomPanel ? "sidebar-shell--room" : "sidebar-shell--wardrobe"}`}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: PANEL_WIDTH,
        maxWidth: "calc(100vw - 88px)",
        height: "100%",
        zIndex: 20,
        transform: panelCollapsed ? "translateX(calc(-100% - 22px)) scale(0.98)" : "translateX(0) scale(1)",
        opacity: panelCollapsed ? 0 : 1,
        transition: "transform 320ms cubic-bezier(0.22,1,0.36,1), opacity 240ms ease",
        padding: panelCollapsed ? 0 : "16px clamp(10px, 1.5vw, 16px)",
        willChange: "transform, opacity",
        pointerEvents: panelCollapsed ? "none" : "auto",
      }}
    >
      <div className="sidebar-shell__halo" />
      {isRoomPanel ? (
        <WardrobeRoomPanel
          roomCustomization={roomCustomization}
          onRoomCustomizationChange={onRoomCustomizationChange}
          onApplyRoomPreset={onApplyRoomPreset}
          scenePreset={scenePreset}
          onScenePresetChange={onScenePresetChange}
        />
      ) : (
        <WardrobePanel
          items={items}
          wardrobe={wardrobe}
          equip={equip}
          unequip={unequip}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          activeTab={activeTab}
          category={category}
          search={search}
          equippedOnly={equippedOnly}
          favoritesOnly={favoritesOnly}
          topsOnly={topsOnly}
          recentlyImportedOnly={recentlyImportedOnly}
          colorFamily={colorFamily}
          onCategoryChange={onCategoryChange}
          advancedActions={advancedActions}
          roomCustomization={roomCustomization}
          onRoomCustomizationChange={onRoomCustomizationChange}
          onApplyRoomPreset={onApplyRoomPreset}
          scenePreset={scenePreset}
          onScenePresetChange={onScenePresetChange}
          onCatalogPreviewReady={onCatalogPreviewReady}
        />
      )}
    </aside>
  );
}
