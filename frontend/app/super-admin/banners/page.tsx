import type { Metadata } from "next";
import { SuperAdminBannersPage } from "@/src/fsd/pages/SuperAdminPage";
import { createPageMetadata } from "@shared/lib/page-metadata";

export const metadata: Metadata = createPageMetadata("Баннеры лендинга");

export default function SuperAdminBannersRoute() {
    return <SuperAdminBannersPage />;
}
