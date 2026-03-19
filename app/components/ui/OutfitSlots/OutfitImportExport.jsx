"use client";
import { useRef } from "react";
import { Download, Upload } from "lucide-react";

export default function OutfitImportExport({ onExport, onImport }) {
  const fileInputRef = useRef(null);

  return (
    <>
      <div className="flex gap-2 mb-3">
        <button
          onClick={onExport}
          title="Export outfits"
          className="flex-1 flex items-center justify-center gap-2 rounded-[1rem] border border-white/[0.08] bg-white/[0.05] px-3 py-2.5 text-[11px] font-medium tracking-[0.03em] text-white/68 transition-colors hover:bg-white/[0.08]"
        >
          <Download size={13} /> Export
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Import outfits"
          className="flex-1 flex items-center justify-center gap-2 rounded-[1rem] border border-white/[0.08] bg-white/[0.05] px-3 py-2.5 text-[11px] font-medium tracking-[0.03em] text-white/68 transition-colors hover:bg-white/[0.08]"
        >
          <Upload size={13} /> Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={onImport}
        />
      </div>
    </>
  );
}
