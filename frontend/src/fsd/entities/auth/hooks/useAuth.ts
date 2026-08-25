"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { getAccessToken, removeAccessToken } from "../auth-token.service";
import { clearStoreOnLogout } from "../../../shared/store/clearClientStore";
import { isAuthSessionReady } from "../../../shared/lib/auth-session";
import { RootState, useAppDispatch, useAppSelector } from "../../../shared/store/store";
import sessionService from "../../../shared/services/session.service";

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const auth = useAppSelector((state: RootState) => state.auth);
    const hasAccessToken = Boolean(getAccessToken());
    const authReady = isAuthSessionReady(hasAccessToken, auth.sessionChecked);

    const handleLogout = useCallback(async () => {
        try {
            await sessionService.logout();
        } catch {
            // session may already be invalid
        }
        removeAccessToken();
        clearStoreOnLogout(dispatch);
        router.push("/auth");
    }, [dispatch, router]);

    return {
        id: auth.id,
        username: auth.username,
        role: auth.role,
        lastName: auth.lastName,
        firstName: auth.firstName,
        patronymic: auth.patronymic,
        email: auth.email,
        phone: auth.phone,
        oneCAuthorId: auth.oneCAuthorId,
        isBlockedWithout1c: auth.isBlockedWithout1c,
        ageConfirmed: auth.ageConfirmed,
        loading: auth.loading,
        isAuthenticated: auth.isAuthenticated,
        hasAccessToken,
        authReady,
        logout: handleLogout,
    };
};
