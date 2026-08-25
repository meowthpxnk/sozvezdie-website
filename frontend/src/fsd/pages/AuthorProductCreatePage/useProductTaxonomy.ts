"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { categoryService } from "@entities/category";
import { fandomService } from "@entities/fandom";

function dedupeBySlug<T extends { slug: string }>(items: T[]): T[] {
    const seen = new Set<string>();

    return items.filter((item) => {
        if (!item.slug || seen.has(item.slug)) {
            return false;
        }

        seen.add(item.slug);
        return true;
    });
}

export function useProductTaxonomy(categorySlug: string) {
    const categoriesQuery = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoryService.getCategories(),
    });

    const subcategoriesQuery = useQuery({
        queryKey: ["subcategories", categorySlug],
        queryFn: () => categoryService.getSubcategories(categorySlug),
        enabled: Boolean(categorySlug),
    });

    const fandomsQuery = useQuery({
        queryKey: ["fandoms"],
        queryFn: () => fandomService.getFandoms(),
    });

    const categories = useMemo(
        () => dedupeBySlug(categoriesQuery.data ?? []),
        [categoriesQuery.data]
    );

    const subcategories = useMemo(
        () => dedupeBySlug(subcategoriesQuery.data ?? []),
        [subcategoriesQuery.data]
    );

    const fandoms = useMemo(() => dedupeBySlug(fandomsQuery.data ?? []), [fandomsQuery.data]);

    return {
        categories,
        subcategories,
        fandoms,
        hasSubcategories: Boolean(categorySlug) && subcategories.length > 0,
        hasFandoms: fandoms.length > 0,
        loading: categoriesQuery.isLoading || fandomsQuery.isLoading,
        subcategoriesLoading: subcategoriesQuery.isFetching,
    };
}
