import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminChromeProvider, ModeratorRoleGuard } from "@widgets/AdminShell";
import { createPageMetadata } from "@shared/lib/page-metadata";

export const metadata = createPageMetadata("Модерация");

export default function ModerationLayout({ children }: { children: ReactNode }) {
    return (
        <AdminChromeProvider>
            <ModeratorRoleGuard>{children}</ModeratorRoleGuard>
        </AdminChromeProvider>
    );
}
