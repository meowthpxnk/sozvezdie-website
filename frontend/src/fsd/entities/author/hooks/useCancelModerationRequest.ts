"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
    cancelModerationRequest,
    type ModerationRequestTarget,
} from "../cancel-moderation-request";

function getErrorDetail(error: unknown): string | null {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { detail?: string } } }).response
            ?.data?.detail === "string"
    ) {
        return (error as { response: { data: { detail: string } } }).response.data
            .detail;
    }

    return null;
}

export function useCancelModerationRequest() {
    const queryClient = useQueryClient();
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const cancelRequest = useCallback(
        async (feedItemId: string, target: ModerationRequestTarget) => {
            setCancellingId(feedItemId);
            try {
                await cancelModerationRequest(target);
                await Promise.all([
                    queryClient.invalidateQueries({ queryKey: ["author", "products"] }),
                    queryClient.invalidateQueries({
                        queryKey: ["author", "brand-moderations"],
                    }),
                    queryClient.invalidateQueries({ queryKey: ["author", "dashboard"] }),
                ]);
                toast.success("Заявка на модерацию отменена");
                return true;
            } catch (error: unknown) {
                toast.error(getErrorDetail(error) ?? "Не удалось отменить заявку");
                return false;
            } finally {
                setCancellingId(null);
            }
        },
        [queryClient]
    );

    return {
        cancellingId,
        cancelRequest,
        isCancelling: (feedItemId: string) => cancellingId === feedItemId,
    };
}
