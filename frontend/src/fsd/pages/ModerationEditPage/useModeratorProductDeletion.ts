"use client";

import { useQuery } from "@tanstack/react-query";

import { moderationService } from "@entities/moderation";

export function useModeratorProductDeletion(proposalId: string) {
    const query = useQuery({
        queryKey: ["moderation", "edit", proposalId],
        queryFn: () => moderationService.getProposalEdit(proposalId),
    });

    return {
        proposal: query.data?.proposal,
        product: query.data?.product,
        loading: query.isLoading,
        isError: query.isError,
    };
}
