import type { Metadata } from "next";
import { LegalDetailsPage } from "@/src/fsd/pages/LegalDetailsPage";
import { createPageMetadata } from "@shared/lib/page-metadata";

export const metadata: Metadata = createPageMetadata("Правовая информация");

export default function LegalDetailsRoute() {
    return <LegalDetailsPage />;
}
