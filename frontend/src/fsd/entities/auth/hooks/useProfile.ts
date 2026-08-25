"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getAccessToken } from "../auth-token.service";
import { fetchMe, updateUserProfile } from "../authThunk";
import { setProfileFields } from "../../../shared/store/AuthSlice";
import { RootState, useAppDispatch, useAppSelector } from "../../../shared/store/store";

export const useProfile = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const auth = useAppSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (!getAccessToken()) {
            return;
        }
        if (!auth.isAuthenticated && !auth.loading) {
            dispatch(fetchMe());
        }
    }, [dispatch, auth.isAuthenticated, auth.loading]);

    useEffect(() => {
        if (!auth.loading && !auth.isAuthenticated) {
            // router.replace("/auth");
        }
    }, [auth.loading, auth.isAuthenticated, router]);

    const setLastName = useCallback(
        (value: string) => dispatch(setProfileFields({ lastName: value })),
        [dispatch]
    );

    const setFirstName = useCallback(
        (value: string) => dispatch(setProfileFields({ firstName: value })),
        [dispatch]
    );

    const setPatronymic = useCallback(
        (value: string) => dispatch(setProfileFields({ patronymic: value })),
        [dispatch]
    );

    const setEmail = useCallback(
        (value: string) => dispatch(setProfileFields({ email: value })),
        [dispatch]
    );

    const setPhone = useCallback(
        (value: string) => dispatch(setProfileFields({ phone: value })),
        [dispatch]
    );

    const saveProfile = useCallback(async () => {
        const result = await dispatch(updateUserProfile());
        if (updateUserProfile.fulfilled.match(result)) {
            toast.success("Профиль успешно сохранён");
            return;
        }
        toast.error("Не удалось сохранить профиль");
    }, [dispatch]);

    return {
        username: auth.username,
        role: auth.role,
        lastName: auth.lastName ?? "",
        firstName: auth.firstName ?? "",
        patronymic: auth.patronymic ?? "",
        email: auth.email ?? "",
        phone: auth.phone ?? "",
        loading: auth.loading,
        saving: auth.saving,
        isAuthenticated: auth.isAuthenticated,
        setLastName,
        setFirstName,
        setPatronymic,
        setEmail,
        setPhone,
        saveProfile,
    };
};
