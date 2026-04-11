"use client";
import React from "react";
import { Home, Palette, Sparkles, Sun } from "lucide-react";
import ColorPicker from "./ColorPicker";
import {
  ROOM_COLOR_SWATCHES,
  SCENE_MOOD_OPTIONS,
} from "./roomCustomizationConfig";
import { hexToRgba, isValidHexColor, normalizeHex } from "./wardrobeUtils";

const COLOR_FIELD_META = {
  wallColor: {
    label: "Main walls",
  },
  accentWallColor: {
    label: "Feature walls",
  },
  trimColor: {
    label: "Trim",
  },
  floorColor: {
    label: "Floor",
  },
};

function swatchButtonStyle(color, isActive, accent) {
  return {
    background: color,
    boxShadow: isActive
      ? `0 0 0 3px rgba(255,255,255,0.92), 0 0 0 7px ${hexToRgba(accent, 0.28)}, 0 12px 24px rgba(0,0,0,0.24)`
      : "0 8px 18px rgba(0,0,0,0.22)",
  };
}

function ColorField({ fieldKey, value, accentColor, onUpdateRoomCustomization }) {
  const meta = COLOR_FIELD_META[fieldKey];
  const swatches = ROOM_COLOR_SWATCHES[fieldKey] ?? [];

  const commitColor = (nextValue) => {
    if (!isValidHexColor(nextValue)) {
      return;
    }
    onUpdateRoomCustomization?.({ [fieldKey]: normalizeHex(nextValue) });
  };

  return (
    <div className="wardrobe-interior-card flex flex-col gap-3 rounded-[1.25rem] border border-white/8 bg-white/[0.035] p-3.5 backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold text-white/82">{meta.label}</p>
        </div>
        <ColorPicker
          color={value}
          onChange={commitColor}
          triggerClassName="h-9 w-9 shrink-0 rounded-full border border-white/14 shadow-[0_8px_18px_rgba(0,0,0,0.22)] transition hover:scale-[1.04] active:scale-[0.97]"
          triggerTitle={`Customize ${meta.label.toLowerCase()}`}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {swatches.map((color) => {
          const isActive = normalizeHex(color).toLowerCase() === normalizeHex(value).toLowerCase();
          return (
            <button
              key={`${fieldKey}-${color}`}
              type="button"
              onClick={() => onUpdateRoomCustomization?.({ [fieldKey]: color })}
              className={`wardrobe-swatch ${isActive ? "wardrobe-swatch--active" : ""}`}
              style={swatchButtonStyle(color, isActive, accentColor)}
              title={`${meta.label}: ${color}`}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function WardrobeCustomizationSection({
  roomCustomization,
  onUpdateRoomCustomization,
  scenePreset,
  onScenePresetChange,
}) {
  const accentColor = normalizeHex(roomCustomization?.panelAccent ?? "#7486ff");
  const currentGlow = Math.round((roomCustomization?.windowGlow ?? 0.92) * 100);
  const artPath = roomCustomization?.artImage ?? "";

  return (
    <section className="flex flex-col gap-3">
      <div className="wardrobe-room-banner relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-4 shadow-[0_18px_36px_rgba(0,0,0,0.16)] backdrop-blur-md">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background: `radial-gradient(circle at 14% 18%, ${hexToRgba(accentColor, 0.28)}, transparent 34%), radial-gradient(circle at 84% 14%, rgba(255,240,214,0.16), transparent 28%)`,
          }}
        />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="font-kicker text-[10px] text-white/44">Interior controls</p>
            <h2 className="font-display mt-1 text-[1.05rem] font-semibold text-white">Room customization</h2>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
            <Sparkles size={12} /> Live
          </span>
        </div>
        <div className="relative mt-4 flex flex-wrap gap-2">
          <span className="wardrobe-panel-header-chip"><Home size={12} /> {roomCustomization?.preset?.replace(/-/g, " ")}</span>
          <span className="wardrobe-panel-header-chip"><Sun size={12} /> {scenePreset.replace("gallery-", " ")}</span>
          <span className="wardrobe-panel-header-chip"><Palette size={12} /> {accentColor}</span>
        </div>
      </div>

      <div className="wardrobe-interior-card flex flex-col gap-3 rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-3.5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Sun size={14} className="text-white/70" />
          <p className="text-[12px] font-semibold text-white/84">Light mood</p>
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          {SCENE_MOOD_OPTIONS.map((option) => {
            const isActive = scenePreset === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onScenePresetChange?.(option.id)}
                className={`rounded-[1.1rem] border px-3 py-3 text-left transition-all duration-200 ${
                  isActive
                    ? "bg-white/[0.08] text-white shadow-[0_10px_28px_rgba(0,0,0,0.16)]"
                    : "bg-white/[0.025] text-white/72 hover:bg-white/[0.055]"
                }`}
                style={{ borderColor: isActive ? hexToRgba(accentColor, 0.34) : "rgba(255,255,255,0.08)" }}
              >
                <p className="text-[12px] font-semibold">{option.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ColorField fieldKey="wallColor" value={roomCustomization?.wallColor} accentColor={accentColor} onUpdateRoomCustomization={onUpdateRoomCustomization} />
        <ColorField fieldKey="accentWallColor" value={roomCustomization?.accentWallColor} accentColor={accentColor} onUpdateRoomCustomization={onUpdateRoomCustomization} />
        <ColorField fieldKey="trimColor" value={roomCustomization?.trimColor} accentColor={accentColor} onUpdateRoomCustomization={onUpdateRoomCustomization} />
        <ColorField fieldKey="floorColor" value={roomCustomization?.floorColor} accentColor={accentColor} onUpdateRoomCustomization={onUpdateRoomCustomization} />
      </div>

      <div className="grid gap-3">
        <div className="wardrobe-interior-card flex flex-col gap-3 rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-3.5 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold text-white/84">Windows</p>
            </div>
            <ColorPicker
              color={roomCustomization?.windowColor}
              onChange={(nextValue) => {
                if (!isValidHexColor(nextValue)) {
                  return;
                }
                onUpdateRoomCustomization?.({ windowColor: normalizeHex(nextValue) });
              }}
              triggerClassName="h-9 w-9 shrink-0 rounded-full border border-white/14 shadow-[0_8px_18px_rgba(0,0,0,0.22)] transition hover:scale-[1.04] active:scale-[0.97]"
              triggerTitle="Customize window light"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {ROOM_COLOR_SWATCHES.windowColor.map((color) => {
              const isActive = normalizeHex(color).toLowerCase() === normalizeHex(roomCustomization?.windowColor ?? color).toLowerCase();
              return (
                <button
                  key={`window-${color}`}
                  type="button"
                  onClick={() => onUpdateRoomCustomization?.({ windowColor: color })}
                  className={`wardrobe-swatch ${isActive ? "wardrobe-swatch--active" : ""}`}
                  style={swatchButtonStyle(color, isActive, accentColor)}
                />
              );
            })}
          </div>

          <div className="rounded-[1rem] border border-white/8 bg-black/10 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-[11px] font-semibold text-white/72">Window glow</span>
              <span className="text-[11px] text-white/46">{currentGlow}%</span>
            </div>
            <div className="rounded-full p-[3px]" style={{ background: `linear-gradient(90deg, ${hexToRgba(roomCustomization?.windowColor ?? "#dcefff", 0.26)}, rgba(255,255,255,0.08))` }}>
              <input
                type="range"
                min="45"
                max="130"
                step="1"
                value={currentGlow}
                onChange={(event) => onUpdateRoomCustomization?.({ windowGlow: Number(event.target.value) / 100 })}
                className="ui-slider"
                aria-label="Adjust window glow"
              />
            </div>
          </div>
        </div>

        <div className="wardrobe-interior-card flex flex-col gap-3 rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-3.5 backdrop-blur-md">
          <div className="mt-4 rounded-[0.85rem] border border-white/10 bg-black/10 p-3 transition-transform duration-300 hover:-translate-y-[2px]">
            <div className="mb-2 flex items-center gap-2">
              <Sun size={12} className="text-white/70" />
              <span className="text-[11px] font-semibold text-white/72">Decor artwork texture</span>
            </div>
            <input
              type="text"
              value={artPath}
              onChange={(event) => onUpdateRoomCustomization?.({ artImage: event.target.value })}
              placeholder="/models/gallery-art.png"
              className="wardrobe-input w-full rounded-[0.9rem] border border-white/20 bg-white/10 px-2.5 py-2 text-[11px] text-white focus-visible:outline-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}