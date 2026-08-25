"use client";

import { useEffect, type ReactNode } from "react";

import { useAdminChrome } from "./AdminChromeContext";

type AdminShellProps = {
    title?: string;
    titleRight?: ReactNode;
    children: ReactNode;
};

export function AdminShell({ title, titleRight, children }: AdminShellProps) {
    const { setChrome } = useAdminChrome();

    useEffect(() => {
        setChrome({ title: title ?? "", titleRight });
        return () => setChrome({ title: "" });
    }, [setChrome, title, titleRight]);

    return <>{children}</>;
}

type SetAdminChromeProps = {
    title: string;
    titleRight?: ReactNode;
};

export function SetAdminChrome({ title, titleRight }: SetAdminChromeProps) {
    const { setChrome } = useAdminChrome();

    useEffect(() => {
        setChrome({ title, titleRight });
        return () => setChrome({ title: "" });
    }, [setChrome, title, titleRight]);

    return null;
}
