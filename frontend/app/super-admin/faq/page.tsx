import type { Metadata } from "next";
import { SuperAdminFaqPage } from "@/src/fsd/pages/SuperAdminPage";
import { createPageMetadata } from "@shared/lib/page-metadata";

export const metadata: Metadata = createPageMetadata("Часто задаваемые вопросы");

export default function SuperAdminFaqRoute() {
    return <SuperAdminFaqPage />;
}
