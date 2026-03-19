"use client";
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { Sparkles } from "lucide-react";

const MOBILE_POPOVER_WIDTH = 256;
const DESKTOP_POPOVER_WIDTH = 232;
const MOBILE_POPOVER_HEIGHT = 480;
const DESKTOP_POPOVER_HEIGHT = 444;
const VIEWPORT_MARGIN = 8;
const TRIGGER_GAP = 8;

// ── Stylist palette engine ────────────────────────────────────────────────────

function hexToHsl(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return [0, 0, 50];
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rv = 0, gv = 0, bv = 0;
  if (h < 60)       { rv = c; gv = x; bv = 0; }
  else if (h < 120) { rv = x; gv = c; bv = 0; }
  else if (h < 180) { rv = 0; gv = c; bv = x; }
  else if (h < 240) { rv = 0; gv = x; bv = c; }
  else if (h < 300) { rv = x; gv = 0; bv = c; }
  else              { rv = c; gv = 0; bv = x; }
  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(rv)}${toHex(gv)}${toHex(bv)}`;
}

function generateStylistPalettes(hex) {
  const [h, s, l] = hexToHsl(hex);
  const S = Math.max(22, Math.min(72, s));
  const L = Math.max(22, Math.min(72, l));
  return [
    {
      name: "Mono",
      swatches: [
        hslToHex(h, S * 0.18, 90),
        hslToHex(h, S * 0.48, 68),
        hslToHex(h, S, L),
        hslToHex(h, S, Math.max(16, L - 20)),
        hslToHex(h, S * 0.72, 11),
      ],
    },
    {
      name: "Analogous",
      swatches: [
        hslToHex(h - 38, S, L + 7),
        hslToHex(h - 18, S, L + 3),
        hslToHex(h, S, L),
        hslToHex(h + 18, S, L + 3),
        hslToHex(h + 38, S, L + 7),
      ],
    },
    {
      name: "Complement",
      swatches: [
        hslToHex(h, S * 0.4, L + 22),
        hslToHex(h, S, L),
        hslToHex(h, S * 0.22, L + 28),
        hslToHex(h + 180, S * 0.65, L + 8),
        hslToHex(h + 180, S, L),
      ],
    },
    {
      name: "Warm Earth",
      swatches: ["#f5e6d3", "#d4a574", "#a0785a", "#7d5a3c", "#3d2b1f"],
    },
    {
      name: "Cool Nordic",
      swatches: ["#eef3f7", "#b8cfe0", "#7fa8c4", "#4a7fa0", "#1e3a4f"],
    },
  ];
}

export default function ColorPicker({ color, onChange, open: controlledOpen, onOpenChange, anchorRef: externalAnchorRef }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = useCallback((val) => {
    const next = typeof val === "function" ? val(open) : val;
    if (isControlled) onOpenChange?.(next);
    else setInternalOpen(next);
  }, [isControlled, onOpenChange, open]);
  const palettes = useMemo(() => generateStylistPalettes(color), [color]);
  const [popoverSize, setPopoverSize] = useState({ width: DESKTOP_POPOVER_WIDTH, height: DESKTOP_POPOVER_HEIGHT });
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const containerRef = useRef(null);
  const internalTriggerRef = useRef(null);
  const triggerRef = externalAnchorRef ?? internalTriggerRef;
  const popoverRef = useRef(null);

  const updatePopoverPosition = useCallback(() => {
    if (!triggerRef.current) return;

    const isMobile = window.innerWidth < 768;
    const popoverWidth = isMobile ? MOBILE_POPOVER_WIDTH : DESKTOP_POPOVER_WIDTH;
    const popoverHeight = isMobile ? MOBILE_POPOVER_HEIGHT : DESKTOP_POPOVER_HEIGHT;

    const rect = triggerRef.current.getBoundingClientRect();
    const preferredLeft = rect.right - popoverWidth;
    const left = Math.min(
      window.innerWidth - popoverWidth - VIEWPORT_MARGIN,
      Math.max(VIEWPORT_MARGIN, preferredLeft)
    );

    let top = rect.top - popoverHeight - TRIGGER_GAP;
    if (top < VIEWPORT_MARGIN) {
      top = Math.min(
        window.innerHeight - popoverHeight - VIEWPORT_MARGIN,
        rect.bottom + TRIGGER_GAP
      );
    }

    setPopoverSize({ width: popoverWidth, height: popoverHeight });
    setPopoverPos({ top, left });
  }, [triggerRef]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    const rafId = window.requestAnimationFrame(updatePopoverPosition);

    const handler = (e) => {
      const isInsideTrigger = containerRef.current?.contains(e.target) || externalAnchorRef?.current?.contains(e.target);
      const isInsidePopover = popoverRef.current?.contains(e.target);

      if (!isInsideTrigger && !isInsidePopover) {
        setOpen(false);
      }
    };

    const handleViewportChange = () => {
      updatePopoverPosition();
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler, { passive: true });
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.cancelAnimationFrame(rafId);
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open, externalAnchorRef, setOpen, updatePopoverPosition]);

  return (
    <div ref={containerRef} className="relative" onClick={(e) => e.stopPropagation()}>
      {/* Swatch trigger — hidden in controlled mode */}
      {!isControlled && (
        <button
          ref={internalTriggerRef}
          onClick={() => setOpen((v) => !v)}
          title="Pick color"
          className="h-8 w-8 shrink-0 rounded-xl border border-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition hover:scale-105 active:scale-95"
          style={{ background: color }}
        />
      )}

      {/* Popover */}
      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={popoverRef}
          onClick={(e) => e.stopPropagation()}
          style={{ top: popoverPos.top, left: popoverPos.left, width: popoverSize.width }}
          className="fixed z-[80] flex flex-col gap-2 rounded-[1.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02)),rgba(16,18,22,0.96)] p-3 shadow-2xl backdrop-blur-xl"
        >
          <HexColorPicker
            color={color}
            onChange={onChange}
            style={{ width: "100%", height: popoverSize.height >= MOBILE_POPOVER_HEIGHT ? "185px" : "155px" }}
          />

          {/* Hex input */}
          <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.06] px-3 py-1.5">
            <span className="text-white/30 text-[12px] font-mono">#</span>
            <HexColorInput
              color={color}
              onChange={onChange}
              prefixed={false}
              className="flex-1 bg-transparent text-white text-[12px] font-mono outline-none uppercase w-full"
            />
          </div>

          {/* Stylist Palettes */}
          <div className="mt-1.5">
            <div className="mb-2 flex items-center gap-1.5">
              <Sparkles size={10} className="text-indigo-300/75" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/42">Stylist Palettes</span>
            </div>
            <div className="flex flex-col gap-[7px]">
              {palettes.map((palette) => (
                <div key={palette.name} className="flex items-center gap-2">
                  <span className="w-[54px] shrink-0 text-[9px] leading-none tracking-[0.04em] text-white/36">{palette.name}</span>
                  <div className="flex gap-[5px]">
                    {palette.swatches.map((sw) => {
                      const currentColor = typeof color === "string" ? color.toLowerCase() : "";
                      return (
                        <button
                          key={sw}
                          onClick={() => onChange(sw)}
                          style={{ background: sw }}
                          title={sw}
                          className={`h-[22px] w-[22px] shrink-0 rounded-[6px] border transition-transform hover:scale-110 active:scale-95 ${
                            currentColor === sw.toLowerCase()
                              ? "border-white/50 ring-1 ring-white/30 ring-offset-1 ring-offset-[#111]"
                              : "border-white/10"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
