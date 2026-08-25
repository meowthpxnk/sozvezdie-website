"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { ModerationFilter } from "@entities/moderation";
import { moderationService } from "@entities/moderation";

export function useModeration() {
    const [filter, setFilter] = useState<ModerationFilter>("PENDING");

    const query = useQuery({
        queryKey: ["moderation", "proposals", filter],
        queryFn: () => moderationService.getProposals(filter),
    });

    return {
        filter,
        setFilter,
        proposals: query.data ?? [],
        loading: query.isLoading,
        isError: query.isError,
        refetch: query.refetch,
    };
}
