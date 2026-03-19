"use client";
import { useEffect, useMemo, useState } from "react";
import { Columns2, X } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import OutfitSaveRow from "./OutfitSlots/OutfitSaveRow";
import OutfitImportExport from "./OutfitSlots/OutfitImportExport";
import OutfitSlotCard from "./OutfitSlots/OutfitSlotCard";

const STORAGE_KEY = "wardrobe-outfit-slots";

function createSlotId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isValidHexColor(color) {
  if (typeof color !== "string") return false;
  return /^#[0-9a-f]{6}$/i.test(color);
}

function isValidOutfit(slot) {
  if (!slot || typeof slot !== "object") return false;
  
  // Validate wardrobe is object with string values (URLs)
  if (!slot.wardrobe || typeof slot.wardrobe !== "object") return false;
  for (const [id, url] of Object.entries(slot.wardrobe)) {
    if (typeof id !== "string" || typeof url !== "string") return false;
  }
  
  // Validate colors are hex codes
  if (!slot.colors || typeof slot.colors !== "object") return false;
  for (const [id, color] of Object.entries(slot.colors)) {
    if (!isValidHexColor(color)) return false;
  }
  
  return true;
}

function moveSlot(slots, fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= slots.length || fromIndex === toIndex) {
    return slots;
  }

  const nextSlots = [...slots];
  const [slot] = nextSlots.splice(fromIndex, 1);

  nextSlots.splice(toIndex, 0, slot);
  return nextSlots;
}

export default function OutfitSlots({ items = [], wardrobe, colors, onLoad, createSnapshotData }) {
  const [slots, setSlots] = useState([]);
  const [nameInput, setNameInput] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const { toast, showToast } = useToast();
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [draggedSlotId, setDraggedSlotId] = useState(null);
  const [dropTargetSlotId, setDropTargetSlotId] = useState(null);
  const [compareIds, setCompareIds] = useState([]);
  const itemMeta = useMemo(() => {
    return Object.fromEntries(items.map((item) => [item.id, item]));
  }, [items]);

  const compareSlots = useMemo(() => {
    return compareIds
      .map((id) => slots.find((slot) => slot.id === id))
      .filter(Boolean)
      .slice(0, 2);
  }, [compareIds, slots]);

  useEffect(() => {
    try {
      const storedSlots = window.localStorage.getItem(STORAGE_KEY);

      if (storedSlots) {
        const parsedSlots = JSON.parse(storedSlots);

        if (Array.isArray(parsedSlots)) {
          setSlots(parsedSlots);
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
  }, [isHydrated, slots]);

  const save = () => {
    const name = nameInput.trim() || `Outfit ${slots.length + 1}`;
    const thumbnail = createSnapshotData?.() ?? null;

    setSlots((prev) => [
      ...prev,
      {
        id: createSlotId("slot"),
        name,
        wardrobe: { ...wardrobe },
        colors: { ...colors },
        thumbnail,
      },
    ]);
    setNameInput("");
    showToast(`Saved ${name}`, "success");
  };

  const requestRemove = (id) => {
    setPendingDeleteId(id);
  };

  const cancelRemove = () => {
    setPendingDeleteId(null);
  };

  const remove = (id) => {
    setSlots((prev) => prev.filter((s) => s.id !== id));
    setCompareIds((prev) => prev.filter((slotId) => slotId !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingName("");
    }
    setPendingDeleteId(null);
    showToast("Removed outfit");
  };

  const duplicateSlot = (slot) => {
    const duplicateName = `${slot.name} Copy`;

    setSlots((prev) => [
      ...prev,
      {
        ...slot,
        id: createSlotId("slot-copy"),
        name: duplicateName,
        wardrobe: { ...slot.wardrobe },
        colors: { ...slot.colors },
        thumbnail: slot.thumbnail ?? null,
      },
    ]);
    showToast(`Duplicated ${slot.name}`, "success");
  };

  const refreshThumbnail = (id) => {
    const thumbnail = createSnapshotData?.() ?? null;

    if (!thumbnail) {
      showToast("No scene snapshot available", "error");
      return;
    }

    setSlots((prev) => prev.map((slot) => (slot.id === id ? { ...slot, thumbnail } : slot)));
    showToast("Thumbnail refreshed", "success");
  };

  const reorderSlot = (index, direction) => {
    setSlots((prev) => moveSlot(prev, index, index + direction));
    showToast(direction < 0 ? "Moved outfit up" : "Moved outfit down");
  };

  const handleDragStart = (slotId) => {
    setDraggedSlotId(slotId);
    setDropTargetSlotId(slotId);
    setPendingDeleteId(null);
  };

  const handleDragOver = (event, slotId) => {
    event.preventDefault();

    if (draggedSlotId && draggedSlotId !== slotId) {
      setDropTargetSlotId(slotId);
    }
  };

  const handleDrop = (slotId) => {
    if (!draggedSlotId || draggedSlotId === slotId) {
      setDraggedSlotId(null);
      setDropTargetSlotId(null);
      return;
    }

    setSlots((prev) => {
      const fromIndex = prev.findIndex((slot) => slot.id === draggedSlotId);
      const toIndex = prev.findIndex((slot) => slot.id === slotId);

      if (fromIndex === -1 || toIndex === -1) {
        return prev;
      }

      return moveSlot(prev, fromIndex, toIndex);
    });

    setDraggedSlotId(null);
    setDropTargetSlotId(null);
    showToast("Reordered outfits", "success");
  };

  const handleDragEnd = () => {
    setDraggedSlotId(null);
    setDropTargetSlotId(null);
  };

  const startRename = (slot) => {
    setEditingId(slot.id);
    setEditingName(slot.name);
  };

  const commitRename = (id) => {
    const nextName = editingName.trim();

    if (!nextName) {
      showToast("Name cannot be empty", "error");
      return;
    }

    setSlots((prev) => prev.map((slot) => (slot.id === id ? { ...slot, name: nextName } : slot)));
    setEditingId(null);
    setEditingName("");
    showToast(`Renamed to ${nextName}`, "success");
  };

  const toggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((entry) => entry !== id);
      }

      if (prev.length >= 2) {
        return [prev[1], id];
      }

      return [...prev, id];
    });
  };

  const clearCompare = () => {
    setCompareIds([]);
  };

  const exportSlots = () => {
    if (slots.length === 0) {
      showToast("Nothing to export", "error");
      return;
    }

    const blob = new Blob([JSON.stringify(slots, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "wardrobe-outfits.json";
    link.click();
    window.URL.revokeObjectURL(url);
    showToast(`Exported ${slots.length} outfit${slots.length === 1 ? "" : "s"}`, "success");
  };

  const importSlots = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsedSlots = JSON.parse(text);

      if (!Array.isArray(parsedSlots)) {
        throw new Error("Invalid file format");
      }

      const normalizedSlots = parsedSlots
        .filter((slot) => isValidOutfit(slot))
        .map((slot, index) => ({
          id: createSlotId(`import-${index}`),
          name: typeof slot.name === "string" && slot.name.trim() ? slot.name.trim() : `Imported Outfit ${index + 1}`,
          wardrobe: slot.wardrobe,
          colors: slot.colors,
          thumbnail: typeof slot.thumbnail === "string" ? slot.thumbnail : null,
        }));

      if (normalizedSlots.length === 0) {
        throw new Error("No valid outfits found");
      }

      const skipped = parsedSlots.length - normalizedSlots.length;
      setSlots((prev) => [...prev, ...normalizedSlots]);
      
      if (skipped > 0) {
        showToast(`Imported ${normalizedSlots.length} outfit${normalizedSlots.length === 1 ? "" : "s"} (${skipped} invalid)`, "success");
      } else {
        showToast(`Imported ${normalizedSlots.length} outfit${normalizedSlots.length === 1 ? "" : "s"}`, "success");
      }
    } catch {
      showToast("Import failed", "error");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.025] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" style={{ marginBottom: '18px' }}>
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="font-display text-[20px] font-bold text-white/92">Outfits</p>
        <span className="rounded-full border border-white/8 px-2.5 py-1 font-kicker text-[9px] text-white/45">Saved looks</span>
      </div>

      {/* Save row */}
      <OutfitSaveRow 
        nameInput={nameInput}
        onNameChange={setNameInput}
        onSave={save}
      />

      {/* Import/Export */}
      <OutfitImportExport 
        onExport={exportSlots}
        onImport={importSlots}
      />

      {/* Toast */}
      {toast && (
        <div
          className={`mb-3 rounded-[1.15rem] border px-3 py-2.5 text-[12px] font-medium shadow-lg backdrop-blur
            ${toast.tone === "success"
              ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
              : toast.tone === "error"
                ? "border-red-400/20 bg-red-500/10 text-red-100"
                : "border-white/10 bg-white/[0.05] text-white/70"
            }`}
        >
          {toast.message}
        </div>
      )}

      {/* Slots list */}
      {compareSlots.length > 0 && (
        <div className="mb-3 rounded-[1.15rem] border border-white/10 bg-white/[0.04] p-2.5">
          <div className="mb-2 flex items-center justify-between">
            <p className="inline-flex items-center gap-1.5 font-kicker text-[10px] text-white/72">
              <Columns2 size={12} /> Compare looks
            </p>
            <button
              type="button"
              onClick={clearCompare}
              className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2 py-1 text-[10px] text-white/62 transition-colors hover:text-white/90"
            >
              <X size={11} /> Clear
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {compareSlots.map((slot) => {
              const garmentIds = Object.keys(slot.wardrobe || {});
              return (
                <div key={`compare-${slot.id}`} className="rounded-[1rem] border border-white/8 bg-black/20 px-2.5 py-2">
                  <p className="font-display text-[15px] font-semibold text-white/90 truncate">{slot.name}</p>
                  <p className="mt-1 text-[11px] font-medium text-white/48">{garmentIds.length} items</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {garmentIds.length === 0 && (
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] text-white/35">Empty</span>
                    )}
                    {garmentIds.map((itemId) => {
                      const meta = itemMeta[itemId];
                      return (
                        <span
                          key={`${slot.id}-${itemId}`}
                          className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 text-[9px] text-white/60"
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: slot.colors?.[itemId] ?? meta?.accent ?? "#94a3b8" }} />
                          {meta?.label ?? itemId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {slots.length === 0 && (
        <p className="rounded-[1.1rem] border border-dashed border-white/10 px-1 py-6 text-center text-[12px] font-medium tracking-[0.02em] text-white/24">No saved outfits yet</p>
      )}
      <div className="flex flex-col gap-1.5">
        {slots.map((slot, index) => (
          <OutfitSlotCard
            key={slot.id}
            itemMeta={itemMeta}
            slot={slot}
            index={index}
            totalSlots={slots.length}
            isEditing={editingId === slot.id}
            editingName={editingName}
            isPendingDelete={pendingDeleteId === slot.id}
            isDragging={draggedSlotId === slot.id}
            isDropTarget={dropTargetSlotId === slot.id && draggedSlotId !== slot.id}
            isCompared={compareIds.includes(slot.id)}
            onLoad={onLoad}
            onDuplicate={duplicateSlot}
            onRefreshThumbnail={refreshThumbnail}
            onToggleCompare={toggleCompare}
            onMoveUp={() => reorderSlot(index, -1)}
            onMoveDown={() => reorderSlot(index, 1)}
            onDelete={pendingDeleteId === slot.id ? () => remove(slot.id) : () => requestRemove(slot.id)}
            onCancelDelete={cancelRemove}
            onStartRename={startRename}
            onCommitRename={() => commitRename(slot.id)}
            onRenameChange={setEditingName}
            onDragStart={() => handleDragStart(slot.id)}
            onDragOver={(event) => handleDragOver(event, slot.id)}
            onDrop={() => handleDrop(slot.id)}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>
    </section>
  );
}
