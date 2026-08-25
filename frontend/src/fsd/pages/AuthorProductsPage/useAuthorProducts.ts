"use client";

import { useQuery } from "@tanstack/react-query";

import authorService from "@entities/author/author.service";

export function useAuthorProducts(options?: { includeDeleted?: boolean }) {
    const includeDeleted = options?.includeDeleted ?? false;

    const query = useQuery({
        queryKey: ["author", "products", { includeDeleted }],
        queryFn: () => authorService.getMyProducts(includeDeleted),
    });

    return {
        products: query.data ?? [],
        loading: query.isLoading,
        isError: query.isError,
        refetch: query.refetch,
    };
}
