"use client";
import React, { useEffect, useMemo, useSyncExternalStore } from "react";
import { profileMark } from "../../utils/perf";
import WardrobePanelHeader from "./WardrobePanelHeader";
import WardrobeCurrentOutfit from "./WardrobeCurrentOutfit";
import { getPanelTheme } from "./roomCustomizationConfig";
import { hexToRgba, normalizeHex } from "./wardrobeUtils";

const FAVORITES_STORAGE_KEY = "wardrobe-favorite-items";
const FAVORITES_UPDATED_EVENT = "wardrobe-favorites-updated";
const EMPTY_FAVORITES = [];

let favoritesSnapshotRaw = null;
let favoritesSnapshotValue = EMPTY_FAVORITES;

function parseFavoriteIds(value) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((id) => typeof id === "string");
  } catch {
    return [];
  }
}

function getFavoriteIdsSnapshot() {
  if (typeof window === "undefined") {
    return EMPTY_FAVORITES;
  }

  const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
  if (raw === favoritesSnapshotRaw) {
    return favoritesSnapshotValue;
  }

  favoritesSnapshotRaw = raw;
  favoritesSnapshotValue = parseFavoriteIds(raw);
  return favoritesSnapshotValue;
}

function subscribeFavoriteIds(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const onStorage = (event) => {
    if (event.key === FAVORITES_STORAGE_KEY) {
      callback();
    }
  };

  const onLocalUpdate = () => {
    callback();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(FAVORITES_UPDATED_EVENT, onLocalUpdate);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(FAVORITES_UPDATED_EVENT, onLocalUpdate);
  };
}

function WardrobePanel(props) {
  const {
    items,
    wardrobe,
    equip,
    unequip,
    activeItem,
    setActiveItem,
    roomCustomization,
    scenePreset = "gallery-day",
    advancedActions,
  } = props;

  const favoriteIds = useSyncExternalStore(
    subscribeFavoriteIds,
    getFavoriteIdsSnapshot,
    () => EMPTY_FAVORITES
  );

  useEffect(() => {
    profileMark("panel-commit");
  }, []);

  const panelTheme = useMemo(() => getPanelTheme(roomCustomization?.panelTheme), [roomCustomization?.panelTheme]);
  const panelAccent = normalizeHex(roomCustomization?.panelAccent ?? "#7486ff");
  const panelStyle = useMemo(() => ({
    "--panel-accent": panelAccent,
    "--panel-accent-soft": hexToRgba(panelAccent, 0.24),
    "--panel-accent-ring": hexToRgba(panelAccent, 0.42),
    "--panel-accent-contrast": hexToRgba(panelAccent, 0.8),
    "--panel-surface-start": panelTheme.surfaceStart,
    "--panel-surface-mid": panelTheme.surfaceMid,
    "--panel-surface-end": panelTheme.surfaceEnd,
    "--panel-overlay-a": panelTheme.overlayA,
    "--panel-overlay-b": panelTheme.overlayB,
    "--panel-border": panelTheme.border,
    "--panel-rim": panelTheme.rim,
    "--panel-shadow-color": panelTheme.shadow,
    "--panel-outline": panelTheme.outline,
  }), [panelAccent, panelTheme]);

  const equippedCount = useMemo(() => {
    return items.filter((item) => Boolean(wardrobe[item.id])).length;
  }, [items, wardrobe]);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const metaPills = useMemo(() => {
    return [
      { label: `${equippedCount} styled` },
      { label: roomCustomization?.panelTheme?.replace(/-/g, " ") ?? "obsidian glass" },
      { label: scenePreset.replace("gallery-", "") },
    ];
  }, [equippedCount, roomCustomization?.panelTheme, scenePreset]);

  const toggleFavorite = (itemId) => {
    if (typeof window === "undefined") {
      return;
    }

    const current = getFavoriteIdsSnapshot();
    const next = current.includes(itemId)
      ? current.filter((id) => id !== itemId)
      : [itemId, ...current];

    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(FAVORITES_UPDATED_EVENT));
  };

  const handleEquip = (id, url) => {
    profileMark("panel-equip-item");
    equip(id, url);
  };

  const handleUnequip = (id) => {
    profileMark("panel-unequip-item");
    unequip(id);
  };

  return (
    <aside className="wardrobe-panel-shell wardrobe-panel-shell--wardrobe wardrobe-shell-in relative z-10 flex h-full w-full flex-col gap-3 overflow-y-auto rounded-[2rem] p-4 pb-6 text-white md:p-5 md:pb-8" style={panelStyle}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-[2rem]" style={{ background: `radial-gradient(ellipse at top, ${hexToRgba(panelAccent, 0.24)}, transparent 68%)` }} />

      <WardrobePanelHeader
        equippedCount={equippedCount}
        activeTab="outfit"
        scenePreset={scenePreset}
        metaPills={metaPills}
      />

      <div className="wardrobe-content-stage wardrobe-content-stage--outfit wardrobe-fade-up flex flex-1 flex-col">
        <WardrobeCurrentOutfit
          items={items}
          wardrobe={wardrobe}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          favoriteSet={favoriteSet}
          handleEquip={handleEquip}
          handleUnequip={handleUnequip}
          toggleFavorite={toggleFavorite}
          accentColor={panelAccent}
          glowColor={roomCustomization?.windowColor}
          advancedActions={advancedActions}
        />
      </div>
    </aside>
  );
}

export default React.memo(WardrobePanel);