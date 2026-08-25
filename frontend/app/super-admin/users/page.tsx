import type { Metadata } from "next";
import { SuperAdminUsersPage } from "@/src/fsd/pages/SuperAdminPage";
import { createPageMetadata } from "@shared/lib/page-metadata";

export const metadata: Metadata = createPageMetadata("Пользователи");

export default function SuperAdminUsersRoute() {
    return <SuperAdminUsersPage />;
}
