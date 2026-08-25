import type { Metadata } from "next";
import { SuperAdminCatalogPage } from "@/src/fsd/pages/SuperAdminPage";
import { createPageMetadata } from "@shared/lib/page-metadata";

export const metadata: Metadata = createPageMetadata("Каталог");

export default function SuperAdminCatalogRoute() {
    return <SuperAdminCatalogPage />;
}
