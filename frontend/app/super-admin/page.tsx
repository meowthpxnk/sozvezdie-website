import type { Metadata } from "next";
import { SuperAdminDashboardPage } from "@/src/fsd/pages/SuperAdminPage";
import { createPageMetadata } from "@shared/lib/page-metadata";

export const metadata: Metadata = createPageMetadata("Панель управления");

export default function SuperAdminRoute() {
    return <SuperAdminDashboardPage />;
}
