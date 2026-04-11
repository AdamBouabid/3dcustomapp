export const DEFAULT_MODEL_APPEARANCE = {
  skinColor: "#e2b99d",
  hairColor: "#3a241e",
  nailColor: "#c97a8a",
  lipColor: "#c97a83",
  eyeColor: "#7b8faf",
};

export const MODEL_APPEARANCE_FIELDS = [
  {
    key: "hairColor",
    label: "Hair color",
    description: "Tint the bangs, side pieces, and back layers.",
    swatches: ["#1e1513", "#3a241e", "#6a3f28", "#8d5c42", "#c59763", "#d9c8b4"],
  },
  {
    key: "nailColor",
    label: "Nail color",
    description: "Applies to both fingers and toes.",
    swatches: ["#f6e7df", "#d89ea3", "#c97a8a", "#a45168", "#8a203d", "#56253b"],
  },
  {
    key: "lipColor",
    label: "Lip tint",
    description: "Soft stain or bolder glam tones.",
    swatches: ["#d9a08f", "#c97a83", "#ba5d69", "#a24753", "#7b2f4f", "#4c2831"],
  },
  {
    key: "eyeColor",
    label: "Eye tone",
    description: "Shift the iris hue without affecting the sclera.",
    swatches: ["#7b8faf", "#5f7d71", "#786549", "#8e9cac", "#6f7788", "#9d7b62"],
  },
  {
    key: "skinColor",
    label: "Skin tone",
    description: "Adjust the base avatar complexion.",
    swatches: ["#f6d9c3", "#eac4ab", "#e2b99d", "#c99777", "#a86d52", "#744630"],
  },
];
