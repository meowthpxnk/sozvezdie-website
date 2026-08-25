"use client";

import { LogIn } from "lucide-react";
import { usePathname } from "next/navigation";

import HeaderLinkButton from "@shared/ui/buttons/HeaderLinkButton";

import { isNavLinkActive } from "./header-nav";

export function GuestHeaderAuth() {
    const pathname = usePathname() ?? "";

    return (
        <HeaderLinkButton
            href="/auth"
            Icon={LogIn}
            label="Войти"
            active={isNavLinkActive(pathname, "/auth")}
        />
    );
}
