"use client";
import React from "react";
import BeautyPanel from "../ui/BeautyPanel";
import WardrobePanel from "../ui/WardrobePanel";
import WardrobeRoomPanel from "../ui/WardrobeRoomPanel";
import DecorPanel from "../ui/DecorPanel";

const PANEL_WIDTH = "clamp(320px, 34vw, 420px)";

export default function Sidebar({
  items,
  wardrobe,
  equip,
  unequip,
  activeItem,
  setActiveItem,
  activeTab,
  activeOutfitPanel,
  panelCollapsed,
  advancedActions,
  roomCustomization,
  onRoomCustomizationChange,
  modelAppearance,
  onModelAppearanceChange,
  onResetModelAppearance,
  onModelFocusTargetChange,
  scenePreset,
  onScenePresetChange,
  decorPlacements,
  onDecorPlacementChange,
  selectedDecorItemId,
  onSelectedDecorItemChange,
  activeDecorItemId,
  onActiveDecorItemChange,
}) {
  const isRoomPanel = activeTab === "room";
  const isDecorPanel = activeTab === "decor";
  const isBeautyPanel = activeTab === "outfit" && activeOutfitPanel === "beauty";

  return (
    <aside
      className={`sidebar-shell ${isDecorPanel ? "sidebar-shell--decor" : isRoomPanel ? "sidebar-shell--room" : "sidebar-shell--wardrobe"}`}
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
      {isDecorPanel ? (
        <DecorPanel
          roomCustomization={roomCustomization}
          onRoomCustomizationChange={onRoomCustomizationChange}
          decorPlacements={decorPlacements}
          onDecorPlacementChange={onDecorPlacementChange}
          selectedDecorItemId={selectedDecorItemId}
          onSelectedDecorItemChange={onSelectedDecorItemChange}
          activeDecorItemId={activeDecorItemId}
          onActiveDecorItemChange={onActiveDecorItemChange}
        />
      ) : isRoomPanel ? (
        <WardrobeRoomPanel
          roomCustomization={roomCustomization}
          onRoomCustomizationChange={onRoomCustomizationChange}
          scenePreset={scenePreset}
          onScenePresetChange={onScenePresetChange}
          occasionPresets={advancedActions?.occasionPresets}
          activeOccasionId={advancedActions?.activeOccasionId}
          onApplyOccasionSuggestion={advancedActions?.applyOccasionSuggestion}
          savedScenes={advancedActions?.savedScenes}
          onSaveScene={advancedActions?.saveSceneToLookbook}
          onLoadScene={advancedActions?.loadSceneFromLookbook}
          onDeleteScene={advancedActions?.deleteSceneFromLookbook}
        />
      ) : isBeautyPanel ? (
        <BeautyPanel
          roomCustomization={roomCustomization}
          modelAppearance={modelAppearance}
          onModelAppearanceChange={onModelAppearanceChange}
          onResetModelAppearance={onResetModelAppearance}
          onModelFocusTargetChange={onModelFocusTargetChange}
          scenePreset={scenePreset}
        />
      ) : (
        <WardrobePanel
          items={items}
          wardrobe={wardrobe}
          equip={equip}
          unequip={unequip}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          advancedActions={advancedActions}
          roomCustomization={roomCustomization}
          onRoomCustomizationChange={onRoomCustomizationChange}
          modelAppearance={modelAppearance}
          onModelAppearanceChange={onModelAppearanceChange}
          onResetModelAppearance={onResetModelAppearance}
          scenePreset={scenePreset}
          onScenePresetChange={onScenePresetChange}
        />
      )}
    </aside>
  );
}
