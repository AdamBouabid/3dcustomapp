"use client";
import React, { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { profileMark } from "../../utils/perf";
import WardrobePanelHeader from "./WardrobePanelHeader";
import WardrobeCatalogSection from "./WardrobeCatalogSection";
import WardrobeCurrentOutfit from "./WardrobeCurrentOutfit";
import { getPanelTheme } from "./roomCustomizationConfig";
import { hexToRgba, normalizeHex, toColorFamily } from "./wardrobeUtils";

const FAVORITES_STORAGE_KEY = "wardrobe-favorite-items";
const FAVORITES_UPDATED_EVENT = "wardrobe-favorites-updated";
const IMPORT_REGISTRY_STORAGE_KEY = "wardrobe-import-registry";
const RECENTLY_IMPORTED_LIMIT = 12;
const RECENTS_LIMIT = 6;
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

function buildInitialImportRegistry(items) {
  if (typeof window === "undefined") {
    return {};
  }

  const now = Date.now();
  let registry = {};

  try {
    const raw = window.localStorage.getItem(IMPORT_REGISTRY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        registry = parsed;
      }
    }
  } catch {
    window.localStorage.removeItem(IMPORT_REGISTRY_STORAGE_KEY);
  }

  const nextRegistry = { ...registry };
  let hasChanges = false;

  items.forEach((item) => {
    if (typeof nextRegistry[item.id] !== "number") {
      nextRegistry[item.id] = now;
      hasChanges = true;
    }
  });

  if (hasChanges) {
    window.localStorage.setItem(IMPORT_REGISTRY_STORAGE_KEY, JSON.stringify(nextRegistry));
  }

  return nextRegistry;
}

function matchesCatalogCategory(item, selectedCategory) {
  if (selectedCategory === "all") {
    return true;
  }

  const haystack = `${item.label ?? ""} ${item.category ?? ""} ${item.type ?? ""}`.toLowerCase();

  if (selectedCategory === "outfit") {
    return /(one-piece|dress|gown|outfit)/.test(haystack);
  }

  if (selectedCategory === "top") {
    return /(top|shirt|blouse|hoodie|jacket|coat|sweater)/.test(haystack);
  }

  if (selectedCategory === "bottom") {
    return /(bottom|pant|trouser|jean|skirt)/.test(haystack);
  }

  if (selectedCategory === "dress") {
    return /(dress|one-piece|gown)/.test(haystack);
  }

  if (selectedCategory === "shoes") {
    return /(shoe|footwear|heel|boot|sneaker)/.test(haystack);
  }

  return haystack.includes(selectedCategory.toLowerCase());
}

function WardrobePanel(props) {
  const {
    items,
    isCatalogLoading = false,
    wardrobe,
    equip,
    unequip,
    activeItem,
    setActiveItem,
    activeTab = "outfit",
    category = "all",
    search = "",
    equippedOnly = false,
    favoritesOnly = false,
    topsOnly = false,
    recentlyImportedOnly = false,
    colorFamily = "all",
    onToggleSelectionMode,
    onCategoryChange,
    roomCustomization,
    scenePreset = "gallery-day",
    onCatalogPreviewReady,
  } = props;

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedCatalogIds, setSelectedCatalogIds] = useState([]);
  const [catalogPreviewBackdrop, setCatalogPreviewBackdrop] = useState("gallery");
  const favoriteIds = useSyncExternalStore(
    subscribeFavoriteIds,
    getFavoriteIdsSnapshot,
    () => EMPTY_FAVORITES
  );
  const [recentIds, setRecentIds] = useState([]);
  const [importRegistry] = useState(() => buildInitialImportRegistry(items));

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

  const recentItems = useMemo(() => {
    return recentIds
      .map((id) => items.find((item) => item.id === id))
      .filter(Boolean);
  }, [items, recentIds]);

  const recentlyImportedIdSet = useMemo(() => {
    const ids = Object.entries(importRegistry)
      .filter(([, seenAt]) => typeof seenAt === "number")
      .sort(([, leftSeenAt], [, rightSeenAt]) => rightSeenAt - leftSeenAt)
      .slice(0, RECENTLY_IMPORTED_LIMIT)
      .map(([id]) => id);

    return new Set(ids);
  }, [importRegistry]);

  const catalogItems = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();

    return items.filter((item) => {
      if (!matchesCatalogCategory(item, category)) {
        return false;
      }

      if (equippedOnly && !wardrobe[item.id]) {
        return false;
      }

      if (favoritesOnly && !favoriteSet.has(item.id)) {
        return false;
      }

      if (topsOnly && !/(top|shirt|hoodie|jacket|coat|sweater)/.test(`${item.category ?? ""} ${item.type ?? ""}`.toLowerCase())) {
        return false;
      }

      if (recentlyImportedOnly && !recentlyImportedIdSet.has(item.id)) {
        return false;
      }

      if (colorFamily !== "all" && toColorFamily(item.accent) !== colorFamily) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = `${item.label} ${item.category ?? ""} ${item.type ?? ""}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [category, colorFamily, equippedOnly, favoriteSet, favoritesOnly, items, recentlyImportedIdSet, recentlyImportedOnly, search, topsOnly, wardrobe]);

  const metaPills = useMemo(() => {
    const pillCount = activeTab === "catalog" ? catalogItems.length : equippedCount;
    return [
      { label: activeTab === "catalog" ? `${pillCount} visible` : `${pillCount} styled` },
      { label: roomCustomization?.panelTheme?.replace(/-/g, " ") ?? "obsidian glass" },
      { label: scenePreset.replace("gallery-", "") },
    ];
  }, [activeTab, catalogItems.length, equippedCount, roomCustomization?.panelTheme, scenePreset]);

  const selectedCatalogSet = useMemo(() => new Set(selectedCatalogIds), [selectedCatalogIds]);

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

  const registerRecent = (itemId) => {
    setRecentIds((current) => [itemId, ...current.filter((id) => id !== itemId)].slice(0, RECENTS_LIMIT));
  };

  const handleEquip = (id, url) => {
    profileMark("panel-equip-item");
    equip(id, url);
    registerRecent(id);
  };

  const handleUnequip = (id) => {
    profileMark("panel-unequip-item");
    unequip(id);
  };

  const toggleSelectionMode = () => {
    setSelectionMode((current) => {
      const next = !current;
      if (!next) {
        setSelectedCatalogIds([]);
      }
      onToggleSelectionMode?.(next);
      return next;
    });
  };

  const toggleCatalogSelection = (id) => {
    setSelectedCatalogIds((current) => (
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id]
    ));
  };

  const selectAllVisible = () => {
    setSelectedCatalogIds(catalogItems.map((item) => item.id));
  };

  const clearSelection = () => {
    setSelectedCatalogIds([]);
  };

  const equipSelected = () => {
    profileMark("panel-equip-selected");
    catalogItems
      .filter((item) => selectedCatalogSet.has(item.id))
      .forEach((item) => {
        if (!wardrobe[item.id]) {
          equip(item.id, item.url);
          registerRecent(item.id);
        }
      });
  };

  const unequipSelected = () => {
    profileMark("panel-unequip-selected");
    selectedCatalogIds.forEach((id) => {
      if (wardrobe[id]) {
        unequip(id);
      }
    });
  };

  return (
    <aside className="wardrobe-panel-shell wardrobe-panel-shell--wardrobe wardrobe-shell-in relative z-10 flex h-full w-full flex-col gap-3 overflow-y-auto rounded-[2rem] p-4 pb-6 text-white md:p-5 md:pb-8" style={panelStyle}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-[2rem]" style={{ background: `radial-gradient(ellipse at top, ${hexToRgba(panelAccent, 0.24)}, transparent 68%)` }} />

      <WardrobePanelHeader
        equippedCount={equippedCount}
        activeTab={activeTab}
        scenePreset={scenePreset}
        metaPills={metaPills}
      />

      <div key={activeTab} className={`wardrobe-content-stage wardrobe-content-stage--${activeTab} wardrobe-fade-up flex flex-1 flex-col`}>
        {activeTab === "catalog" ? (
          <WardrobeCatalogSection
            catalogItems={catalogItems}
            isCatalogLoading={isCatalogLoading}
            recentItems={recentItems}
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            selectionMode={selectionMode}
            selectedCatalogSet={selectedCatalogSet}
            selectedCatalogIds={selectedCatalogIds}
            toggleSelectionMode={toggleSelectionMode}
            selectAllVisible={selectAllVisible}
            clearSelection={clearSelection}
            equipSelected={equipSelected}
            unequipSelected={unequipSelected}
            toggleCatalogSelection={toggleCatalogSelection}
            previewBackdrop={catalogPreviewBackdrop}
            onPreviewBackdropChange={setCatalogPreviewBackdrop}
            activeCategory={category}
            onCategoryChange={onCategoryChange}
            onPreviewReady={onCatalogPreviewReady}
          />
        ) : (
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
          />
        )}
      </div>
    </aside>
  );
}

export default React.memo(WardrobePanel);