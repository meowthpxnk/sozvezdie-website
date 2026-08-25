"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { moderationService } from "@entities/moderation";

export function useModerationDecide() {
    const queryClient = useQueryClient();
    const [deciding, setDeciding] = useState(false);

    const decide = useCallback(
        async (
            proposalId: string,
            status: "APPROVED" | "REJECTED",
            comment?: string
        ) => {
            setDeciding(true);
            try {
                await moderationService.decide(proposalId, { status, comment });
                await queryClient.cancelQueries({ queryKey: ["moderation", "edit", proposalId] });
                queryClient.removeQueries({ queryKey: ["moderation", "edit", proposalId] });
                await queryClient.invalidateQueries({ queryKey: ["moderation", "proposals"] });
                if (status === "APPROVED") {
                    await queryClient.invalidateQueries({ queryKey: ["fandoms"] });
                    await queryClient.invalidateQueries({ queryKey: ["subcategories"] });
                }
                const isDeletion = proposalId.startsWith("product-delete-");
                toast.success(
                    status === "APPROVED"
                        ? isDeletion
                            ? "Удаление подтверждено"
                            : "Заявка принята"
                        : isDeletion
                          ? "Удаление отклонено"
                          : "Заявка отклонена"
                );
                return true;
            } catch (error: unknown) {
                const detail =
                    typeof error === "object" &&
                    error !== null &&
                    "response" in error &&
                    typeof (error as { response?: { data?: { detail?: string } } }).response
                        ?.data?.detail === "string"
                        ? (error as { response: { data: { detail: string } } }).response.data.detail
                        : null;

                toast.error(detail ?? "Не удалось обработать заявку");
                return false;
            } finally {
                setDeciding(false);
            }
        },
        [queryClient]
    );

    return { deciding, decide };
}
