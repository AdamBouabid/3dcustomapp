"use client";
import { Activity, Camera, RotateCcw, Sun, Moon, SlidersHorizontal, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { ENVIRONMENTS } from "../../constants/wardrobeItems";

export default function SceneToolbar({
  isDark, onToggleTheme,
  autoRotate, onToggleRotate,
  environment, onEnvironment,
  profileMode, onToggleProfileMode,
  shaderMode, onToggleShaderMode,
  onSnapshot,
  dockOpen,
  onToggleDock,
}) {

  const isToon = shaderMode === "toon";

  return (
    <>
      <div className="absolute bottom-4 left-1/2 z-20 flex w-[min(96%,1000px)] -translate-x-1/2 flex-col items-end gap-2 md:bottom-5">
        <button
          type="button"
          onClick={onToggleDock}
          className={`wardrobe-glow-hover inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold tracking-[0.02em] transition-all shadow-lg backdrop-blur-md ${
            dockOpen
              ? "border-indigo-300/35 bg-[rgba(99,102,241,0.18)] text-indigo-100 shadow-[0_4px_16px_rgba(99,102,241,0.22)]"
              : "border-white/14 bg-[rgba(20,22,32,0.72)] text-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:text-white"
          }`}
        >
          <SlidersHorizontal size={12} />
          Controls
          {dockOpen ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </button>

        <div className={`w-full overflow-hidden transition-all duration-300 ease-out ${dockOpen ? "max-h-[280px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}>
          <div className="wardrobe-panel-shell w-full rounded-[1.35rem] p-3">
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5">

              {/* ── Outfit group ────────────────────────────── */}
              <div className="flex flex-col items-center gap-2">
                <span className={`font-kicker text-[9px] font-bold tracking-[0.14em] ${isDark ? "text-indigo-300/50" : "text-indigo-600/50"}`}>Outfit</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onSnapshot}
                    title="Download snapshot"
                    className={`wardrobe-glow-hover min-h-10 flex items-center gap-2 rounded-[1rem] border px-3.5 py-2 text-[11px] font-medium tracking-[0.02em] transition-all active:scale-95
                      ${isDark ? "border-indigo-300/28 bg-indigo-500/16 text-indigo-50 hover:bg-indigo-500/22" : "border-black/10 bg-black/[0.04] text-gray-800 hover:bg-black/[0.08]"}`}
                  >
                    <Camera size={13} /> Snapshot
                  </button>

                  <button
                    onClick={onToggleProfileMode}
                    title="Profile mode — side-angle view for outfit inspection"
                    className={`wardrobe-glow-hover flex h-10 items-center gap-2 rounded-[1rem] border px-3 py-2 text-[11px] tracking-[0.02em] transition-all active:scale-95
                      ${profileMode
                        ? "border-cyan-200/45 bg-cyan-500/18 text-cyan-50"
                        : isDark ? "border-white/10 bg-white/[0.05] text-white/72 hover:bg-white/[0.09]" : "border-black/10 bg-black/[0.04] text-gray-600 hover:bg-black/[0.08]"
                      }`}
                  >
                    <Activity size={13} />
                    <span>Profile</span>
                  </button>
                </div>
              </div>

              {/* divider */}
              <div className={`hidden h-10 w-px self-end sm:block ${isDark ? "bg-white/10" : "bg-black/10"}`} />

              {/* ── Scene / Environment group ────────────────── */}
              <div className="flex flex-col items-center gap-2">
                <span className={`font-kicker text-[9px] font-bold tracking-[0.14em] ${isDark ? "text-cyan-300/50" : "text-cyan-700/50"}`}>Scene</span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={onToggleTheme}
                    title="Toggle light / dark theme"
                    className={`wardrobe-glow-hover flex h-10 w-10 items-center justify-center rounded-[1rem] border transition-all active:scale-95
                      ${isDark ? "border-white/12 bg-white/[0.07] text-white hover:bg-white/[0.11]" : "border-black/10 bg-black/[0.04] text-gray-800 hover:bg-black/[0.08]"}`}
                  >
                    {isDark ? <Sun size={15} /> : <Moon size={15} />}
                  </button>

                  <button
                    onClick={onToggleRotate}
                    title="Auto-rotate"
                    className={`wardrobe-glow-hover flex h-10 w-10 items-center justify-center rounded-[1rem] border transition-all active:scale-95
                      ${autoRotate
                        ? "border-indigo-300/45 bg-indigo-500/18 text-indigo-100"
                        : isDark ? "border-white/10 bg-white/[0.05] text-white/72 hover:bg-white/[0.09]" : "border-black/10 bg-black/[0.04] text-gray-600 hover:bg-black/[0.08]"
                      }`}
                  >
                    <RotateCcw size={15} />
                  </button>

                  <button
                    onClick={onToggleShaderMode}
                    title={`Shader: ${isToon ? "Toon" : "PBR"}`}
                    className={`wardrobe-glow-hover flex h-10 w-10 items-center justify-center rounded-[1rem] border transition-all active:scale-95
                      ${isToon
                        ? "border-indigo-300/45 bg-indigo-500/18 text-indigo-100"
                        : isDark ? "border-white/10 bg-white/[0.05] text-white/72 hover:bg-white/[0.09]" : "border-black/10 bg-black/[0.04] text-gray-600 hover:bg-black/[0.08]"
                      }`}
                  >
                    <Sparkles size={15} />
                  </button>

                  <div className={`flex gap-1.5 rounded-[1.1rem] p-1.5 ${isDark ? "bg-white/[0.04]" : "bg-white/70"}`}>
                    {ENVIRONMENTS.map(({ id, label }) => (
                      <button
                        key={id}
                        onClick={() => onEnvironment(id)}
                        className={`font-display wardrobe-glow-hover rounded-[0.9rem] px-2.5 py-1.5 text-[10px] font-medium tracking-[0.01em] transition-all
                          ${environment === id
                            ? "wardrobe-gradient-primary text-white shadow-[0_10px_20px_rgba(99,102,241,0.3)]"
                            : isDark ? "text-white/58 hover:bg-white/[0.06] hover:text-white/82" : "text-gray-500 hover:bg-black/[0.05] hover:text-gray-800"
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
