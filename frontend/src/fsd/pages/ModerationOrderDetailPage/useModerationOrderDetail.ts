"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { moderationService } from "@entities/moderation";
import type { BackendOrderStatus } from "@entities/order/order.types";

export function useModerationOrderDetail() {
    const params = useParams<{ orderId: string }>();
    const orderId = Number(params.orderId);
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["moderation-order", orderId],
        queryFn: () => moderationService.getOrder(orderId),
        enabled: Number.isFinite(orderId) && orderId > 0,
    });

    const statusMutation = useMutation({
        mutationFn: (status: BackendOrderStatus) =>
            moderationService.updateOrderStatus(orderId, status),
        onSuccess: (order) => {
            queryClient.setQueryData(["moderation-order", orderId], order);
            void queryClient.invalidateQueries({ queryKey: ["moderation-orders"] });
        },
    });

    return {
        orderId,
        order: query.data,
        loading: query.isLoading,
        isError: query.isError,
        updateStatus: statusMutation.mutateAsync,
        updating: statusMutation.isPending,
        updateError: statusMutation.error,
    };
}
