"use client";
import { useState, useCallback } from "react";

const DEFAULT_COLORS = {
  shirt: "#a5b4fc",
  skirt: "#f9a8d4",
  dress: "#fcd34d",
  heels: "#5eead4",
};

export function useWardrobe(initialState = {}) {
  const [wardrobe, setWardrobe] = useState(() => initialState.wardrobe ?? {});
  const [activeItem, setActiveItem] = useState(() => initialState.activeItem ?? null);
  const [colors, setColors] = useState(() => ({
    ...DEFAULT_COLORS,
    ...(initialState.colors ?? {}),
  }));

  const equip = useCallback((id, url) => {
    setWardrobe((prev) => ({ ...prev, [id]: url }));
  }, []);

  const unequip = useCallback((id) => {
    setWardrobe((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const setColor = useCallback((id, hex) => {
    setColors((prev) => ({ ...prev, [id]: hex }));
  }, []);

  return {
    wardrobe,
    setWardrobe,
    activeItem,
    setActiveItem,
    colors,
    setColors,
    setColor,
    equip,
    unequip,
  };
}
