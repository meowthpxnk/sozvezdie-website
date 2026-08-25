"use client";

import { useCallback, useLayoutEffect, useState } from "react";

import { useAppDispatch } from "../../../shared/store/store";

import {
    readGuestAgeConfirmation,
    subscribeGuestAgeConfirmation,
    writeGuestAgeConfirmation,
} from "../ageConfirmationStorage";
import { confirmUserAge } from "../authThunk";
import { useAuth } from "./useAuth";

export function useAgeConfirmation() {
    const dispatch = useAppDispatch();
    const { ageConfirmed, authReady, isAuthenticated } = useAuth();
    const [guestConfirmed, setGuestConfirmed] = useState(false);
    const [saving, setSaving] = useState(false);

    useLayoutEffect(() => {
        const sync = () => setGuestConfirmed(readGuestAgeConfirmation());
        sync();
        const unsubscribe = subscribeGuestAgeConfirmation(sync);
        window.addEventListener("storage", sync);
        return () => {
            unsubscribe();
            window.removeEventListener("storage", sync);
        };
    }, []);

    const canSeeAdult = (authReady && ageConfirmed) || guestConfirmed;
    const shouldBlurAdult = useCallback(
        (isAdult?: boolean) => Boolean(isAdult) && !canSeeAdult,
        [canSeeAdult]
    );

    const confirmAge = useCallback(async () => {
        if (ageConfirmed || guestConfirmed) {
            return true;
        }

        if (!isAuthenticated) {
            writeGuestAgeConfirmation();
            setGuestConfirmed(true);
            return true;
        }

        setSaving(true);
        try {
            await dispatch(confirmUserAge()).unwrap();
            writeGuestAgeConfirmation();
            setGuestConfirmed(true);
            return true;
        } catch {
            return false;
        } finally {
            setSaving(false);
        }
    }, [ageConfirmed, dispatch, guestConfirmed, isAuthenticated]);

    return {
        ageConfirmed: ageConfirmed || guestConfirmed,
        authReady,
        isAuthenticated,
        shouldBlurAdult,
        confirmAge,
        saving,
    };
}
