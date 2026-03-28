export const SCENE_MOOD_OPTIONS = [
  {
    id: "gallery-day",
    label: "Daylight",
    description: "Bright interior with clean window light",
  },
  {
    id: "gallery-sunset",
    label: "Golden Hour",
    description: "Warm low sun with a softer room glow",
  },
  {
    id: "gallery-evening",
    label: "Evening",
    description: "Blue window light and gallery accents",
  },
];

export const ROOM_PRESET_OPTIONS = [
  {
    id: "gallery-hall",
    label: "Gallery Hall",
    blurb: "Plaster walls, warm oak flooring, and a polished exhibition feel.",
    values: {
      wallColor: "#ece4d8",
      accentWallColor: "#d7cab8",
      trimColor: "#927d67",
      ceilingColor: "#fbf5ed",
      floorColor: "#7b624d",
      windowColor: "#dcefff",
      windowGlow: 0.92,
      panelTheme: "obsidian",
      panelAccent: "#7486ff",
      artImage: "/models/gallery-art.png",
    },
  },
  {
    id: "sunlit-loft",
    label: "Sunlit Loft",
    blurb: "Airier tones, cleaner trim, and brighter daylight through the windows.",
    values: {
      wallColor: "#efe7df",
      accentWallColor: "#c9d4d0",
      trimColor: "#859487",
      ceilingColor: "#fcf9f2",
      floorColor: "#8a725e",
      windowColor: "#f7f1d8",
      windowGlow: 1.08,
      panelTheme: "porcelain",
      panelAccent: "#0ea5a4",
      artImage: "/models/gallery-art.jpg",
    },
  },
  {
    id: "townhouse-nook",
    label: "Townhouse Nook",
    blurb: "Softer neutrals, richer trim, and a warmer residential mood.",
    values: {
      wallColor: "#e6dccf",
      accentWallColor: "#b5aaa0",
      trimColor: "#6f635a",
      ceilingColor: "#f8f0e7",
      floorColor: "#6c5244",
      windowColor: "#e5e6ff",
      windowGlow: 0.74,
      panelTheme: "terracotta",
      panelAccent: "#d97745",
      artImage: "/models/gallery-art.jpg",
    },
  },
];

export const PANEL_THEME_OPTIONS = [
  {
    id: "obsidian",
    label: "Obsidian Glass",
    description: "Cool midnight glass with crisp highlights.",
    surfaceStart: "rgba(14, 18, 27, 0.96)",
    surfaceMid: "rgba(10, 13, 20, 0.95)",
    surfaceEnd: "rgba(4, 6, 10, 0.92)",
    overlayA: "rgba(91, 118, 180, 0.3)",
    overlayB: "rgba(234, 196, 145, 0.16)",
    border: "rgba(122, 145, 205, 0.3)",
    rim: "rgba(255, 255, 255, 0.14)",
    shadow: "rgba(4, 8, 16, 0.56)",
    outline: "rgba(90, 105, 155, 0.24)",
  },
  {
    id: "porcelain",
    label: "Porcelain Smoke",
    description: "Warmer glass with stone and linen undertones.",
    surfaceStart: "rgba(38, 34, 30, 0.96)",
    surfaceMid: "rgba(28, 24, 22, 0.94)",
    surfaceEnd: "rgba(18, 15, 14, 0.92)",
    overlayA: "rgba(209, 193, 165, 0.22)",
    overlayB: "rgba(92, 135, 126, 0.18)",
    border: "rgba(205, 188, 162, 0.24)",
    rim: "rgba(255, 246, 236, 0.14)",
    shadow: "rgba(15, 11, 9, 0.54)",
    outline: "rgba(192, 175, 149, 0.2)",
  },
  {
    id: "terracotta",
    label: "Terracotta Glow",
    description: "A warmer shell with bronze edges and amber depth.",
    surfaceStart: "rgba(35, 22, 18, 0.97)",
    surfaceMid: "rgba(27, 18, 15, 0.95)",
    surfaceEnd: "rgba(15, 9, 8, 0.92)",
    overlayA: "rgba(214, 127, 73, 0.24)",
    overlayB: "rgba(246, 204, 149, 0.14)",
    border: "rgba(219, 146, 104, 0.28)",
    rim: "rgba(255, 245, 236, 0.14)",
    shadow: "rgba(18, 10, 8, 0.58)",
    outline: "rgba(170, 92, 54, 0.22)",
  },
  {
    id: "emerald-velvet",
    label: "Emerald Velvet",
    description: "Deep green glass with soft brass warmth.",
    surfaceStart: "rgba(16, 29, 24, 0.97)",
    surfaceMid: "rgba(11, 22, 18, 0.95)",
    surfaceEnd: "rgba(7, 14, 12, 0.93)",
    overlayA: "rgba(107, 176, 129, 0.26)",
    overlayB: "rgba(214, 183, 120, 0.14)",
    border: "rgba(123, 180, 144, 0.24)",
    rim: "rgba(242, 252, 244, 0.14)",
    shadow: "rgba(5, 14, 11, 0.58)",
    outline: "rgba(78, 128, 101, 0.2)",
  },
  {
    id: "midnight-cobalt",
    label: "Midnight Cobalt",
    description: "Sharper navy shell with electric blue edge light.",
    surfaceStart: "rgba(8, 18, 42, 0.98)",
    surfaceMid: "rgba(7, 14, 31, 0.95)",
    surfaceEnd: "rgba(4, 9, 20, 0.92)",
    overlayA: "rgba(73, 109, 233, 0.24)",
    overlayB: "rgba(157, 199, 255, 0.12)",
    border: "rgba(98, 128, 226, 0.28)",
    rim: "rgba(242, 247, 255, 0.14)",
    shadow: "rgba(2, 7, 18, 0.62)",
    outline: "rgba(72, 96, 184, 0.22)",
  },
  {
    id: "champagne-frost",
    label: "Champagne Frost",
    description: "Soft smoked shell with pale metallic edges.",
    surfaceStart: "rgba(49, 42, 37, 0.96)",
    surfaceMid: "rgba(37, 32, 28, 0.94)",
    surfaceEnd: "rgba(24, 21, 19, 0.92)",
    overlayA: "rgba(223, 196, 162, 0.22)",
    overlayB: "rgba(246, 231, 208, 0.12)",
    border: "rgba(218, 193, 161, 0.24)",
    rim: "rgba(255, 250, 241, 0.15)",
    shadow: "rgba(18, 14, 12, 0.56)",
    outline: "rgba(185, 158, 126, 0.2)",
  },
  {
    id: "graphite-rose",
    label: "Graphite Rose",
    description: "Dark graphite base with muted rose highlights.",
    surfaceStart: "rgba(26, 20, 24, 0.97)",
    surfaceMid: "rgba(20, 16, 19, 0.95)",
    surfaceEnd: "rgba(13, 10, 13, 0.92)",
    overlayA: "rgba(201, 113, 143, 0.22)",
    overlayB: "rgba(238, 200, 181, 0.12)",
    border: "rgba(198, 123, 148, 0.24)",
    rim: "rgba(255, 243, 246, 0.14)",
    shadow: "rgba(16, 8, 11, 0.58)",
    outline: "rgba(150, 84, 106, 0.2)",
  },
];

export const ACCENT_SWATCHES = [
  { id: "gallery-blue", hex: "#7486ff", label: "Gallery Blue" },
  { id: "sea-glass", hex: "#0ea5a4", label: "Sea Glass" },
  { id: "amber", hex: "#d97745", label: "Amber Clay" },
  { id: "rosewood", hex: "#d35f7a", label: "Rosewood" },
  { id: "moss", hex: "#7ba56b", label: "Moss" },
  { id: "cobalt", hex: "#4169e1", label: "Cobalt" },
  { id: "gold-dust", hex: "#d4a94f", label: "Gold Dust" },
  { id: "soft-lilac", hex: "#9d8cff", label: "Soft Lilac" },
  { id: "coral", hex: "#f07c63", label: "Coral" },
  { id: "sage", hex: "#8bab91", label: "Sage" },
  { id: "ice", hex: "#9fd6ee", label: "Ice" },
];

export const ROOM_COLOR_SWATCHES = {
  wallColor: ["#f3ece3", "#ece4d8", "#e6dccf", "#d7cab8", "#c9d4d0"],
  accentWallColor: ["#d7cab8", "#c9d4d0", "#b5aaa0", "#c5b8aa", "#bfc9c3"],
  trimColor: ["#927d67", "#859487", "#6f635a", "#7d6a58", "#8c7a68"],
  floorColor: ["#7b624d", "#8a725e", "#6c5244", "#8a6a53", "#685448"],
  windowColor: ["#dcefff", "#f7f1d8", "#e5e6ff", "#ffd9c1", "#daf6ea"],
};

export const DEFAULT_ROOM_CUSTOMIZATION = {
  preset: ROOM_PRESET_OPTIONS[0].id,
  ...ROOM_PRESET_OPTIONS[0].values,
};

export function getRoomPreset(id) {
  return ROOM_PRESET_OPTIONS.find((preset) => preset.id === id) ?? ROOM_PRESET_OPTIONS[0];
}

export function getPanelTheme(id) {
  return PANEL_THEME_OPTIONS.find((theme) => theme.id === id) ?? PANEL_THEME_OPTIONS[0];
}