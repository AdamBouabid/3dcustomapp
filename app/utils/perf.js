const PROFILE_FLAG = "__WARDROBE_PROFILE__";

function isProductionBuild() {
  return process.env.NODE_ENV === "production";
}

function canProfile() {
  return isProductionBuild()
    && typeof window !== "undefined"
    && typeof performance !== "undefined"
    && window[PROFILE_FLAG] === true;
}

export function profileMark(name) {
  if (!canProfile()) return;
  performance.mark(`wardrobe:${name}`);
}
