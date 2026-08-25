"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import {
    moderationService,
    type ModeratorOrderListItem,
} from "@entities/moderation";
import type { BackendOrderStatus } from "@entities/order/order.types";

export type ModerationOrdersFilter = "active" | "archive" | BackendOrderStatus;

export function useModerationOrders() {
    const [filter, setFilter] = useState<ModerationOrdersFilter>("active");
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    const queryParams = useMemo(() => {
        if (filter === "active") {
            return { archive: false, search: search || undefined };
        }
        if (filter === "archive") {
            return { archive: true, search: search || undefined };
        }
        return { status: filter, search: search || undefined };
    }, [filter, search]);

    const query = useQuery({
        queryKey: ["moderation-orders", queryParams],
        queryFn: () => moderationService.getOrders(queryParams),
    });

    const applySearch = () => {
        setSearch(searchInput.trim());
    };

    return {
        filter,
        setFilter,
        searchInput,
        setSearchInput,
        applySearch,
        orders: (query.data?.items ?? []) as ModeratorOrderListItem[],
        total: query.data?.total ?? 0,
        loading: query.isLoading,
        isError: query.isError,
        refetch: query.refetch,
    };
}
