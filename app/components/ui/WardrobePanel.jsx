"use client";
import React, { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { profileMark } from "../../utils/perf";
import WardrobePanelHeader from "./WardrobePanelHeader";
import WardrobeCatalogSection from "./WardrobeCatalogSection";
import WardrobeCurrentOutfit from "./WardrobeCurrentOutfit";
import { toColorFamily } from "./wardrobeUtils";

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

const OutfitSlots = dynamic(() => import("./OutfitSlots"), {
  ssr: false,
  loading: () => <p className="text-[11px] text-white/30 px-1">Loading outfits...</p>,
});

function WardrobePanel({
  isDark = true,
  items,
  isCatalogLoading = false,
  wardrobe, equip, unequip,
  activeItem, setActiveItem,
  colors, setColor,
  onLoadOutfit,
  createSnapshotData,
  activeTab = "outfit",
  category = "all",
  search = "",
  equippedOnly = false,
  favoritesOnly = false,
  topsOnly = false,
  recentlyImportedOnly = false,
  colorFamily = "all",
  onToggleSelectionMode,
}) {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedCatalogIds, setSelectedCatalogIds] = useState([]);
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
      if (category !== "all" && item.category !== category) {
        return false;
      }

      if (equippedOnly && !wardrobe[item.id]) {
        return false;
      }

      if (favoritesOnly && !favoriteSet.has(item.id)) {
        return false;
      }

      if (topsOnly && !(item.category || "").toLowerCase().includes("top")) {
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
    <aside className="wardrobe-panel-shell relative z-10 flex h-full w-full flex-col gap-3 overflow-y-auto rounded-[2rem] p-4 pb-6 text-white md:p-5 md:pb-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-[2rem] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.28),transparent_65%)]" />

      <WardrobePanelHeader equippedCount={equippedCount} />

      {activeTab === "catalog" ? (
        <WardrobeCatalogSection
          catalogItems={catalogItems}
          isCatalogLoading={isCatalogLoading}
          recentItems={recentItems}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          wardrobe={wardrobe}
          colors={colors}
          favoriteSet={favoriteSet}
          selectionMode={selectionMode}
          selectedCatalogSet={selectedCatalogSet}
          selectedCatalogIds={selectedCatalogIds}
          toggleSelectionMode={toggleSelectionMode}
          selectAllVisible={selectAllVisible}
          clearSelection={clearSelection}
          equipSelected={equipSelected}
          unequipSelected={unequipSelected}
          toggleCatalogSelection={toggleCatalogSelection}
          handleEquip={handleEquip}
          handleUnequip={handleUnequip}
          setColor={setColor}
          toggleFavorite={toggleFavorite}
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
        />
      )}

      {activeTab === "outfit" && (
        <>
          <div className="wardrobe-hairline" />

          {/* Outfit save/load */}
          <OutfitSlots
            items={items}
            wardrobe={wardrobe}
            colors={colors}
            onLoad={onLoadOutfit}
            createSnapshotData={createSnapshotData}
          />
        </>
      )}
    </aside>
  );
}

export default React.memo(WardrobePanel);
