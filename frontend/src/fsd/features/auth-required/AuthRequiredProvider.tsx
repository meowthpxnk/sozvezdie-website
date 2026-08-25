"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import { getAccessToken } from "@entities/auth/auth-token.service";

import { AuthRequiredModal } from "./AuthRequiredModal";

type AuthRequiredContextValue = {
    openAuthRequired: () => void;
    closeAuthRequired: () => void;
    requireAuth: (action?: () => void, options?: { description?: string }) => boolean;
    isAuthenticated: () => boolean;
};

const AuthRequiredContext = createContext<AuthRequiredContextValue | null>(null);

export function AuthRequiredProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [description, setDescription] = useState<string | undefined>();

    const isAuthenticated = useCallback(() => Boolean(getAccessToken()), []);

    const openAuthRequired = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeAuthRequired = useCallback(() => {
        setIsOpen(false);
        setDescription(undefined);
    }, []);

    const requireAuth = useCallback(
        (action?: () => void, options?: { description?: string }) => {
            if (isAuthenticated()) {
                action?.();
                return true;
            }

            setDescription(options?.description);
            openAuthRequired();
            return false;
        },
        [isAuthenticated, openAuthRequired]
    );

    const value = useMemo(
        () => ({
            openAuthRequired,
            closeAuthRequired,
            requireAuth,
            isAuthenticated,
        }),
        [openAuthRequired, closeAuthRequired, requireAuth, isAuthenticated]
    );

    return (
        <AuthRequiredContext.Provider value={value}>
            {children}
            <AuthRequiredModal
                isOpen={isOpen}
                description={description}
                onClose={closeAuthRequired}
            />
        </AuthRequiredContext.Provider>
    );
}

export function useAuthRequired() {
    const context = useContext(AuthRequiredContext);

    if (!context) {
        throw new Error("useAuthRequired must be used within AuthRequiredProvider");
    }

    return context;
}
