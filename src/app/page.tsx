import { getMenuData } from "@/lib/data-service";
import { MenuApp } from "@/components/menu/MenuApp";

// Always render fresh so availability/special edits show on reload even
// without a realtime connection.
export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const data = await getMenuData();
  return (
    <main className="menu-page">
      <MenuApp initial={data} />
    </main>
  );
}
