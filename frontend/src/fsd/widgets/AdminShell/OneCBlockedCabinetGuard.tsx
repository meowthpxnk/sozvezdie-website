"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { toast } from "sonner";

import { useAuth } from "@entities/auth";

const BLOCKED_TOAST = "Нет доступа, обратитесь в поддержку";

function isAuthorDashboardPath(pathname: string) {
    return pathname === "/admin" || pathname === "/admin/";
}

export function OneCBlockedCabinetGuard({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { authReady, isBlockedWithout1c } = useAuth();

    useEffect(() => {
        if (!authReady || !isBlockedWithout1c) {
            return;
        }
        if (isAuthorDashboardPath(pathname)) {
            return;
        }
        toast.error(BLOCKED_TOAST);
        router.replace("/admin");
    }, [authReady, isBlockedWithout1c, pathname, router]);

    return <>{children}</>;
}
