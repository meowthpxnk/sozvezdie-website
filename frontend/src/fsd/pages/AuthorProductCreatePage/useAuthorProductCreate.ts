"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { productService } from "@entities/product";
import { useAuthorDashboard } from "../AuthorDashboardPage/useAuthorDashboard";
import type { AuthorProductForm } from "./AuthorProductComposer";
import { resolveProductTaxonomySlugs } from "./resolveProductTaxonomy";

function orderImageFiles(form: AuthorProductForm): File[] {
    const { images, coverImageId } = form;
    if (images.length === 0) {
        return [];
    }

    const coverIndex = images.findIndex((image) => image.id === coverImageId);
    const files = images
        .map((image) => image.file)
        .filter((file): file is File => Boolean(file));

    if (coverIndex <= 0) {
        return files;
    }

    const orderedImages = [...images];
    const [cover] = orderedImages.splice(coverIndex, 1);
    orderedImages.unshift(cover);
    return orderedImages
        .map((image) => image.file)
        .filter((file): file is File => Boolean(file));
}

export function useAuthorProductCreate() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { dashboard, loading } = useAuthorDashboard();

    useEffect(() => {
        if (loading) {
            return;
        }

        if (!dashboard?.sellerCard) {
            toast.error("Сначала создайте карточку бренда");
            router.replace("/admin/brand");
        }
    }, [dashboard?.sellerCard, loading, router]);

    const submitProduct = useCallback(
        async (form: AuthorProductForm) => {
            const name = form.name.trim();
            const desc = form.description.trim();
            const priceRub = Number(form.price);
            const quantity = Math.max(1, Math.floor(Number(form.stockCount) || 1));
            const files = orderImageFiles(form);

            if (!name || !desc || !Number.isFinite(priceRub) || priceRub <= 0) {
                throw new Error("Заполните обязательные поля");
            }

            if (files.length === 0) {
                throw new Error("Добавьте хотя бы одно изображение");
            }

            try {
                const taxonomy = await resolveProductTaxonomySlugs(form);

                await productService.createProduct({
                    name,
                    desc,
                    price: Math.round(priceRub * 100),
                    quantity,
                    files,
                    categorySlug: form.categorySlug || undefined,
                    subcategorySlug: taxonomy.subcategorySlug,
                    fandomSlug: taxonomy.fandomSlug,
                    isAdult: Boolean(form.isAdult),
                });
                await queryClient.invalidateQueries({ queryKey: ["author", "products"] });
                await queryClient.invalidateQueries({ queryKey: ["author", "dashboard"] });
                toast.success("Товар отправлен на модерацию");
            } catch (error: unknown) {
                const detail =
                    typeof error === "object" &&
                    error !== null &&
                    "response" in error &&
                    typeof (error as { response?: { data?: { detail?: string } } }).response
                        ?.data?.detail === "string"
                        ? (error as { response: { data: { detail: string } } }).response.data
                              .detail
                        : null;

                toast.error(detail ?? "Не удалось создать товар");
                throw error;
            }
        },
        [queryClient]
    );

    return {
        submitProduct,
        checkingSeller: loading,
    };
}
