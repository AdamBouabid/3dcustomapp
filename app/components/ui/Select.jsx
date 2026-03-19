"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

export default function Select({
  value,
  onChange,
  options = [],
  className = "",
  buttonClassName = "",
  listClassName = "",
  disabled = false,
  ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const [menuStyles, setMenuStyles] = useState({});
  const ref = useRef(null);

  const selected = useMemo(() => options.find((opt) => opt.value === value), [options, value]);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      setMenuStyles({
        left: rect.left,
        top: rect.bottom + 6,
        width: Math.max(rect.width, 160),
        minWidth: rect.width,
        maxWidth: 260,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`wardrobe-glow-hover flex items-center justify-between gap-2 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-white/78 transition-colors hover:bg-white/[0.06] hover:text-white/90 ${buttonClassName}`}
      >
        <span className="truncate">{selected?.label ?? "—"}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open &&
        createPortal(
          <ul
            role="listbox"
            style={menuStyles}
            className={`fixed z-50 overflow-hidden rounded-xl border border-white/12 bg-black/90 text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur ${listClassName}`}
          >
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={opt.value === value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[11px] transition-colors hover:bg-white/10 ${
                    opt.value === value ? "bg-white/10" : ""
                  }`}
                >
                  <span className="whitespace-normal">{opt.label}</span>
                  {opt.value === value && <span className="text-indigo-200">✓</span>}
                </button>
              </li>
            ))}
          </ul>,
          document.body
        )}
    </div>
  );
}
