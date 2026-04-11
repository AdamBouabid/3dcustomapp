import PageClient from "./PageClient";
import { listWardrobeItemsFromDisk } from "./utils/wardrobeItemsServer";

export default async function Page() {
  const initialItems = await listWardrobeItemsFromDisk();

  return <PageClient initialItems={initialItems} />;
}
