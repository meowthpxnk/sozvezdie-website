import type { Metadata } from "next";
import { ProfilePage } from "@pages";

export const metadata: Metadata = {
    title: "Профиль",
};

export default function ProfileRoute() {
    return <ProfilePage />;
}
