"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import {
    saveNavigationReturnPath,
    shouldTrackEntityEntryPath,
} from "@shared/lib/product-return";

export function useProductReturnPathTracker() {
    const pathname = usePathname() ?? "";
    const previousPathRef = useRef<string | null>(null);

    useEffect(() => {
        const search =
            typeof window !== "undefined" ? window.location.search : "";
        const currentPath = search ? `${pathname}${search}` : pathname;

        if (shouldTrackEntityEntryPath(pathname) && previousPathRef.current) {
            saveNavigationReturnPath(previousPathRef.current);
        }

        previousPathRef.current = currentPath;
    }, [pathname]);
}
