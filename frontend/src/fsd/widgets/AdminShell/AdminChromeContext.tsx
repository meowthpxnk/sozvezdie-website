"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import { AdminPageLayout } from "./AdminPageLayout";

export type AdminChromeState = {
    title: string;
    titleRight?: ReactNode;
};

type AdminChromeContextValue = AdminChromeState & {
    setChrome: (chrome: AdminChromeState) => void;
};

const AdminChromeContext = createContext<AdminChromeContextValue | null>(null);

export function AdminChromeProvider({ children }: { children: ReactNode }) {
    const [chrome, setChromeState] = useState<AdminChromeState>({
        title: "",
    });

    const setChrome = useCallback((next: AdminChromeState) => {
        setChromeState(next);
    }, []);

    const value = useMemo(
        () => ({
            ...chrome,
            setChrome,
        }),
        [chrome, setChrome]
    );

    return (
        <AdminChromeContext.Provider value={value}>
            <AdminPageLayout>{children}</AdminPageLayout>
        </AdminChromeContext.Provider>
    );
}

export function useAdminChrome() {
    const context = useContext(AdminChromeContext);
    if (!context) {
        throw new Error("useAdminChrome must be used within AdminChromeProvider");
    }
    return context;
}
