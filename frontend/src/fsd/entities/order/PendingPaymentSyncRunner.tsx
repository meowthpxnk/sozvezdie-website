"use client";

import { getAccessToken } from "@shared/services/auth-token.service";

import { usePendingPaymentSync } from "./usePendingPaymentSync";

export function PendingPaymentSyncRunner() {
    const hasToken = typeof window !== "undefined" && Boolean(getAccessToken());
    usePendingPaymentSync(hasToken);
    return null;
}
