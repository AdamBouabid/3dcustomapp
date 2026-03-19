"use client";
import { Save } from "lucide-react";

export default function OutfitSaveRow({ nameInput, onNameChange, onSave }) {
  return (
    <div className="flex gap-2 mb-3">
      <input
        value={nameInput}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Name this look"
        className="flex-1 rounded-[1rem] border border-white/[0.08] bg-white/[0.05] px-3.5 py-2.5 text-[12px] tracking-[0.01em] text-white placeholder-white/22 outline-none transition-colors focus:border-[#ef8354]/35"
      />
      <button
        onClick={onSave}
        title="Save current outfit"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-[#ef8354]/25 bg-[#ef8354]/16 text-[#ffd9c8] transition-colors hover:bg-[#ef8354]/24"
      >
        <Save size={14} />
      </button>
    </div>
  );
}
