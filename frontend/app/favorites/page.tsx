import type { Metadata } from "next";
import { FavoritesPage } from "@pages";

export const metadata: Metadata = {
    title: "Избранное",
};

export default function FavoritesRoute() {
    return <FavoritesPage />;
}
