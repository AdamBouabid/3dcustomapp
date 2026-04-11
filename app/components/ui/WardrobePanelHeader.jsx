"use client";

import React from "react";

const TAB_LABELS = {
  outfit: "Current styling",
  room: "Interior atelier",
};

const SCENE_LABELS = {
  "gallery-day": "Daylit gallery room",
  "gallery-sunset": "Golden hour interior",
  "gallery-evening": "Evening house gallery",
};

export default function WardrobePanelHeader({
  equippedCount = 0,
  activeTab = "outfit",
  scenePreset = "gallery-day",
  title = "Wardrobe Gallery",
  eyebrow,
  subtitle,
  badgeValue,
  badgeLabel = "Styled",
  metaPills = [],
}) {
  const resolvedEyebrow = eyebrow ?? TAB_LABELS[activeTab] ?? TAB_LABELS.outfit;
  const resolvedSubtitle = subtitle ?? (SCENE_LABELS[scenePreset] ?? SCENE_LABELS["gallery-day"]);

  return (
    <div className="relative px-3 pb-3 pt-2 text-white">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-kicker mb-1 text-[10px] text-white/42">{resolvedEyebrow}</p>
          <h1 className="text-3xl md:text-4xl wardrobe-script font-extrabold tracking-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.55)]" style={{ textShadow: "0 0 6px rgba(255, 241, 173, 0.65), 0 0 12px rgba(255, 222, 170, 0.35), 0 0 20px rgba(255, 255, 255, 0.55)" }}>
            {title}
          </h1>
          <p className="mt-1 max-w-[260px] text-[12px] leading-5 text-white/54">{resolvedSubtitle}</p>
        </div>

        <div className="flex h-[68px] w-[68px] shrink-0 flex-col items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md transition-transform duration-300 hover:scale-[1.03]">
          <span className="font-display flex min-h-[22px] items-center justify-center text-[22px] font-semibold leading-none text-white">{badgeValue ?? equippedCount}</span>
          <span className="mt-1 text-[9px] uppercase tracking-[0.18em] text-white/44">{badgeLabel}</span>
        </div>
      </div>
      {metaPills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {metaPills.map((pill, index) => {
            const Icon = pill.icon;

            return (
              <div key={`${pill.label}-${index}`} className="wardrobe-panel-header-chip" style={{ animationDelay: `${index * 70}ms` }}>
                {Icon ? <Icon size={12} strokeWidth={1.8} /> : null}
                <span>{pill.label}</span>
              </div>
            );
          })}
        </div>
      )}
      <div className="wardrobe-hairline absolute bottom-0 left-0 right-0" />
    </div>
  );
}
