import type { Metadata } from "next";

import { createPageMetadata } from "@shared/lib/page-metadata";

import { HomePageClient } from "./HomePageClient";

export const metadata: Metadata = createPageMetadata("Главная");

export default function HomePage() {
    return <HomePageClient />;
}
