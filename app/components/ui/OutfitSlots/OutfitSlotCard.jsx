"use client";
import Image from "next/image";
import { FolderOpen, Trash2, Pencil, Check, Copy, ArrowUp, ArrowDown, RefreshCw, GripVertical, Columns2 } from "lucide-react";
import { prettifyWardrobeId } from "../../../utils/wardrobeCatalog";

export default function OutfitSlotCard({
  itemMeta = {},
  slot,
  index,
  totalSlots,
  isEditing,
  editingName,
  isPendingDelete,
  isDragging,
  isDropTarget,
  isCompared,
  onLoad,
  onDuplicate,
  onRefreshThumbnail,
  onToggleCompare,
  onMoveUp,
  onMoveDown,
  onDelete,
  onCancelDelete,
  onStartRename,
  onCommitRename,
  onRenameChange,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) {
  return (
    <div
      draggable={!isEditing}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`group rounded-[1.3rem] border px-3 py-3 transition-colors ${
        isDropTarget
          ? "border-[#ef8354]/25 bg-[#ef8354]/10 ring-1 ring-[#ef8354]/18"
          : "border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07]"
      }`}
    >
      {/* Thumbnail */}
      {slot.thumbnail && (
        <div className="mb-3 overflow-hidden rounded-[1rem] border border-white/[0.08] bg-black/20">
          <Image
            src={slot.thumbnail}
            alt={`${slot.name} preview`}
            width={320}
            height={128}
            unoptimized
            className="h-20 w-full object-cover"
          />
        </div>
      )}

      {/* Title Row */}
      <div className="flex min-w-0 items-center gap-2">
        <span
          title="Drag to reorder"
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-white/20 transition-colors ${isEditing ? "opacity-30" : "cursor-grab hover:bg-white/[0.05] hover:text-white/50 active:cursor-grabbing"}`}
        >
          <GripVertical size={12} />
        </span>
        {isEditing ? (
          <input
            value={editingName}
            onChange={(e) => onRenameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onCommitRename();
              }
              if (e.key === "Escape") {
                onStartRename(null);
              }
            }}
            autoFocus
            className="min-w-0 flex-1 rounded-xl border border-[#ef8354]/30 bg-white/[0.06] px-2.5 py-1.5 text-[13px] font-medium text-white outline-none"
          />
        ) : (
          <span className="font-display min-w-0 flex-1 truncate text-[17px] font-semibold text-white/90">{slot.name}</span>
        )}
        {isEditing ? (
          <button
            onClick={onCommitRename}
            title="Save name"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-white/30 transition-colors hover:bg-white/[0.05] hover:text-emerald-300"
          >
            <Check size={12} />
          </button>
        ) : (
          <button
            onClick={() => onStartRename(slot)}
            title="Rename outfit"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-white/20 transition-colors hover:bg-white/[0.05] hover:text-white/60"
          >
            <Pencil size={12} />
          </button>
        )}
      </div>

      {/* Actions Row */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <button
          onClick={() => onLoad(slot)}
          title="Load outfit"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05] text-white/50 transition-colors hover:bg-white/[0.08] hover:text-[#ffd8c5]"
        >
          <FolderOpen size={12} />
        </button>
        <button
          onClick={() => onDuplicate(slot)}
          title="Duplicate outfit"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05] text-white/50 transition-colors hover:bg-white/[0.08] hover:text-sky-300"
        >
          <Copy size={12} />
        </button>
        <button
          onClick={() => onToggleCompare(slot.id)}
          title={isCompared ? "Remove from compare" : "Add to compare"}
          className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
            isCompared
              ? "border-[#ef8354]/30 bg-[#ef8354]/16 text-[#ffd8c5]"
              : "border-white/[0.08] bg-white/[0.05] text-white/50 hover:bg-white/[0.08] hover:text-[#ffd8c5]"
          }`}
        >
          <Columns2 size={12} />
        </button>
        <button
          onClick={() => onRefreshThumbnail(slot.id)}
          title="Refresh thumbnail from current scene"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05] text-white/50 transition-colors hover:bg-white/[0.08] hover:text-emerald-300"
        >
          <RefreshCw size={12} />
        </button>
        <button
          onClick={() => onMoveUp(index)}
          title="Move up"
          disabled={index === 0}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05] text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white/70 disabled:opacity-30 disabled:hover:bg-white/[0.05] disabled:hover:text-white/50"
        >
          <ArrowUp size={12} />
        </button>
        <button
          onClick={() => onMoveDown(index)}
          title="Move down"
          disabled={index === totalSlots - 1}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05] text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white/70 disabled:opacity-30 disabled:hover:bg-white/[0.05] disabled:hover:text-white/50"
        >
          <ArrowDown size={12} />
        </button>
        {isPendingDelete ? (
          <>
            <button
              onClick={() => onDelete(slot.id)}
              title="Confirm delete"
              className="rounded-xl bg-red-500/15 px-2.5 py-1.5 text-[10px] font-medium tracking-[0.04em] text-red-100 transition-colors hover:bg-red-500/25"
            >
              Delete
            </button>
            <button
              onClick={onCancelDelete}
              title="Cancel delete"
              className="rounded-xl bg-white/[0.05] px-2.5 py-1.5 text-[10px] font-medium tracking-[0.04em] text-white/60 transition-colors hover:bg-white/[0.08]"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => onDelete(slot.id)}
            title="Delete"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05] text-white/50 transition-colors hover:bg-white/[0.08] hover:text-red-300"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* Badges Row */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {Object.keys(slot.wardrobe || {}).length === 0 && (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] tracking-[0.05em] text-white/35">
            Empty outfit
          </span>
        )}
        {Object.keys(slot.wardrobe || {}).map((itemId) => {
          const meta = itemMeta[itemId];
          const tone = slot.colors?.[itemId] ?? meta?.accent ?? "#94a3b8";

          return (
            <span
              key={`${slot.id}-${itemId}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] tracking-[0.04em] text-white/60"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tone }} />
              {meta?.label ?? prettifyWardrobeId(itemId)}
            </span>
          );
        })}
      </div>
    </div>
  );
}
