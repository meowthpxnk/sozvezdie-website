import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminChromeProvider, SuperModeratorRoleGuard } from "@widgets/AdminShell";
import { createPageMetadata } from "@shared/lib/page-metadata";

export const metadata: Metadata = createPageMetadata("Панель управления");

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
    return (
        <AdminChromeProvider>
            <SuperModeratorRoleGuard>{children}</SuperModeratorRoleGuard>
        </AdminChromeProvider>
    );
}
