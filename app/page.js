import PageClient from "./PageClient";
import { listWardrobeItemsFromDisk } from "./utils/wardrobeCatalogServer";

export default async function Page() {
  const initialCatalogItems = await listWardrobeItemsFromDisk();

  return <PageClient initialCatalogItems={initialCatalogItems} />;
}
