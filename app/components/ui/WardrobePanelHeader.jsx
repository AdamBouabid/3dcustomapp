"use client";

export default function WardrobePanelHeader({ equippedCount }) {
  return (
    <div className="relative px-3 pb-2 pt-2 text-white">
      <h1 className="text-3xl md:text-4xl wardrobe-script font-extrabold tracking-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.55)]" style={{ textShadow: '0 0 6px rgba(255, 241, 173, 0.65), 0 0 12px rgba(255, 222, 170, 0.35), 0 0 20px rgba(255, 255, 255, 0.55)' }}>
        Wardrobe Studio
      </h1>
      <div className="wardrobe-hairline absolute bottom-0 left-0 right-0" />
    </div>
  );
}
