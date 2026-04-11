import { readdir } from "node:fs/promises";
import path from "node:path";
import { buildWardrobeItem, isBodyModelFile } from "./wardrobeItems";

export async function listWardrobeItemsFromDisk() {
	const modelsDir = path.join(process.cwd(), "public", "models");
	const entries = await readdir(modelsDir, { withFileTypes: true });

	return entries
		.filter((entry) => entry.isFile())
		.map((entry) => entry.name)
		.filter((name) => /\.glb$/i.test(name))
		.filter((name) => !isBodyModelFile(name))
		.sort((left, right) => left.localeCompare(right))
		.map((name) => buildWardrobeItem(name));
}
