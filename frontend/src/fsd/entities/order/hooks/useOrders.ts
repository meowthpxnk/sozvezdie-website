"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { getAccessToken } from "../../auth/auth-token.service";
import { useAuth } from "../../auth/hooks";
import orderService from "../order.service";

export const useOrders = (archive = false) => {
    const router = useRouter();
    const { isAuthenticated, loading: authLoading } = useAuth();

    const query = useQuery({
        queryKey: ["orders", archive],
        queryFn: () => orderService.getOrders(archive),
        enabled: Boolean(getAccessToken()) && isAuthenticated,
    });

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            // router.replace("/auth");
        }
    }, [authLoading, isAuthenticated, router]);

    return {
        orders: query.data ?? [],
        loading: authLoading || query.isLoading,
        isError: query.isError,
        refetch: query.refetch,
    };
};
