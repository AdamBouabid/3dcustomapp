const ACCENT_PALETTE = [
	"#6366f1",
	"#ec4899",
	"#f59e0b",
	"#14b8a6",
	"#60a5fa",
	"#f97316",
	"#22c55e",
	"#a855f7",
];

function toWords(value) {
	return value
		.replace(/\.[^.]+$/, "")
		.replace(/[_-]+/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

export function prettifyWardrobeId(value) {
	const words = toWords(value);
	if (!words) {
		return "Item";
	}

	return words
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function inferCategory(id) {
	const value = id.toLowerCase();

	if (/(heel|shoe|boot|sneaker|loafer|sandal)/.test(value)) {
		return "footwear";
	}

	if (/(dress|gown|onesie|jumpsuit)/.test(value)) {
		return "one-piece";
	}

	if (/(skirt|pant|pants|jean|trouser|short|bottom)/.test(value)) {
		return "bottoms";
	}

	if (/(hat|cap|beanie|helmet)/.test(value)) {
		return "headwear";
	}

	return "tops";
}

function inferType(id) {
	const value = id.toLowerCase();

	if (value.includes("shirt")) return "shirt";
	if (value.includes("skirt")) return "skirt";
	if (value.includes("dress")) return "dress";
	if (value.includes("heel")) return "heels";
	if (value.includes("jacket")) return "jacket";
	if (value.includes("hoodie")) return "hoodie";
	if (value.includes("pant") || value.includes("trouser")) return "pants";
	if (value.includes("short")) return "shorts";
	if (value.includes("shoe") || value.includes("boot") || value.includes("sneaker")) return "shoes";

	return "custom";
}

function inferMaterial(id) {
	const value = id.toLowerCase();

	if (/denim|jean/.test(value)) return "Denim";
	if (/knit|wool|cotton/.test(value)) return "Knit";
	if (/leather|suede/.test(value)) return "Leather";
	if (/silk|satin/.test(value)) return "Silk";
	if (/mesh|sports|active/.test(value)) return "Sport";

	return "Fabric";
}

function isFeaturedItem(id) {
	const value = id.toLowerCase();
	return /(dress|heel|boot|sneaker)/.test(value);
}

function inferIcon(category) {
	switch (category) {
		case "footwear":
			return "Footprints";
		case "one-piece":
			return "Sparkles";
		case "bottoms":
			return "Layers";
		case "headwear":
			return "Crown";
		default:
			return "Shirt";
	}
}

function inferAccent(id) {
	let hash = 0;
	for (let index = 0; index < id.length; index += 1) {
		hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
	}

	return ACCENT_PALETTE[hash % ACCENT_PALETTE.length];
}

export function isBodyModelFile(fileName) {
	return /(female_anatomy|anatomy|body)\.glb$/i.test(fileName);
}

export function buildWardrobeItem(fileName) {
	const id = fileName.replace(/\.glb$/i, "");
	const category = inferCategory(id);

	return {
		id,
		label: prettifyWardrobeId(id),
		url: `/models/${fileName}`,
		icon: inferIcon(category),
		accent: inferAccent(id),
		category,
		type: inferType(id),
		material: inferMaterial(id),
		featured: isFeaturedItem(id),
	};
}
