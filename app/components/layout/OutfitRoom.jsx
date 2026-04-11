"use client";
import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import Sidebar from "./Sidebar";
import TabSwitcher from "./TabSwitcher";

const Scene = dynamic(() => import("../scene/Scene"), { ssr: false });

export default function OutfitRoom({
  initialItems,
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
  activeOutfitPanel,
  setActiveOutfitPanel,
  panelCollapsed,
  setPanelCollapsed,
  equippedItems,
  canvasRef,
  focusMode,
  setFocusMode,
  scenePreset,
  setScenePreset,
  advancedActions,
  roomCustomization,
  onRoomCustomizationChange,
  modelAppearance,
  onModelAppearanceChange,
  onResetModelAppearance,
  modelFocusTarget,
  onModelFocusTargetChange,
  decorPlacements,
  onDecorPlacementChange,
  selectedDecorItemId,
  onSelectedDecorItemChange,
  activeDecorItemId,
  onActiveDecorItemChange,
}) {
  const sceneItems = useMemo(() => equippedItems, [equippedItems]);

  return (
    <div
      className={activeTab === "decor" && selectedDecorItemId ? "scene-stage scene-stage--placement" : "scene-stage"}
      style={{ position: "relative", height: "100%", width: "100%", overflow: "hidden" }}
    >
      <TabSwitcher
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeOutfitPanel={activeOutfitPanel}
        onOutfitPanelChange={setActiveOutfitPanel}
        panelCollapsed={panelCollapsed}
        onTogglePanel={() => setPanelCollapsed((v) => !v)}
        activeItem={activeItem}
        activeColor={activeItem ? colors?.[activeItem] : "#a5b4fc"}
        onPaletteColorChange={(itemId, value) => setColor(itemId, value)}
        focusMode={focusMode}
        onFocusModeChange={setFocusMode}
        scenePreset={scenePreset}
        onScenePresetChange={setScenePreset}
        accentColor={roomCustomization?.panelAccent}
      />
      <Sidebar
        items={initialItems}
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
        activeOutfitPanel={activeOutfitPanel}
        panelCollapsed={panelCollapsed}
        advancedActions={advancedActions}
        roomCustomization={roomCustomization}
        onRoomCustomizationChange={onRoomCustomizationChange}
        modelAppearance={modelAppearance}
        onModelAppearanceChange={onModelAppearanceChange}
        onResetModelAppearance={onResetModelAppearance}
        onModelFocusTargetChange={onModelFocusTargetChange}
        scenePreset={scenePreset}
        onScenePresetChange={setScenePreset}
        decorPlacements={decorPlacements}
        onDecorPlacementChange={onDecorPlacementChange}
        selectedDecorItemId={selectedDecorItemId}
        onSelectedDecorItemChange={onSelectedDecorItemChange}
        activeDecorItemId={activeDecorItemId}
        onActiveDecorItemChange={onActiveDecorItemChange}
      />

      {/* Scene fills the entire container — sidebar floats on top */}
      <div style={{ position: "absolute", inset: 0 }}>
        <Scene
          items={sceneItems}
          availableItems={initialItems}
          activeItem={activeItem}
          colors={colors}
          canvasRef={canvasRef}
          autoRotate={false}
          environment="city"
          focusMode={focusMode}
          enableFocusMode={activeTab === "outfit"}
          scenePreset={scenePreset}
          roomCustomization={roomCustomization}
          modelAppearance={modelAppearance}
          modelFocusTarget={modelFocusTarget}
          decorPlacements={decorPlacements}
          decorEditMode={activeTab === "decor"}
          selectedDecorItemId={selectedDecorItemId}
          activeDecorItemId={activeDecorItemId}
          onDecorPlacementChange={onDecorPlacementChange}
          onActiveDecorItemChange={onActiveDecorItemChange}
        />
      </div>

      {activeTab === "decor" && (
        <div className="scene-decor-hint">
          <span className="scene-decor-hint__eyebrow">3D Placement</span>
          <strong className="scene-decor-hint__title">
            {selectedDecorItemId ? "Place or drag the selected decor in the room" : "Select a decor piece, then place it directly in the room"}
          </strong>
          <span className="scene-decor-hint__copy">
            Drag placed objects to reposition them. Wall art snaps to the back wall; everything else rides the floor.
          </span>
        </div>
      )}
    </div>
  );
}
