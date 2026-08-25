"use client";

import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { moderationService } from "@entities/moderation";
import type { AuthorProductForm } from "../AuthorProductCreatePage/AuthorProductComposer";
import { resolveProductTaxonomySlugs } from "../AuthorProductCreatePage/resolveProductTaxonomy";
import { mapSellerProductToForm } from "../AuthorProductEditPage/mapSellerProductToForm";

function buildImageSlots(form: AuthorProductForm) {
    return form.images.map((image) =>
        image.file
            ? { type: "new" as const }
            : { type: "existing" as const, uuid: image.existingUuid ?? "" }
    );
}

function collectNewFiles(form: AuthorProductForm): File[] {
    return form.images.flatMap((image) => (image.file ? [image.file] : []));
}

export function useModeratorProductEdit(proposalId: string) {
    const queryClient = useQueryClient();

    const editQuery = useQuery({
        queryKey: ["moderation", "edit", proposalId],
        queryFn: () => moderationService.getProposalEdit(proposalId),
        retry: false,
        refetchOnWindowFocus: false,
    });

    const product = editQuery.data?.product;

    const initialForm = useMemo<AuthorProductForm | undefined>(() => {
        if (!product) {
            return undefined;
        }

        return mapSellerProductToForm(product);
    }, [product]);

    const submitProduct = useCallback(
        async (form: AuthorProductForm) => {
            const name = form.name.trim();
            const desc = form.description.trim();
            const priceRub = Number(form.price);
            const quantity = Math.max(1, Math.floor(Number(form.stockCount) || 1));
            const imageSlots = buildImageSlots(form);
            const files = collectNewFiles(form);

            if (!name || !desc || !Number.isFinite(priceRub) || priceRub <= 0) {
                throw new Error("Заполните обязательные поля");
            }

            if (imageSlots.length === 0) {
                throw new Error("Добавьте хотя бы одно изображение");
            }

            if (imageSlots.some((slot) => slot.type === "existing" && !slot.uuid)) {
                throw new Error("Некорректный список изображений");
            }

            try {
                const taxonomy = await resolveProductTaxonomySlugs(form);

                await moderationService.updateProposalProduct(proposalId, {
                    name,
                    desc,
                    price: Math.round(priceRub * 100),
                    quantity,
                    imageSlots,
                    files,
                    categorySlug: form.categorySlug || undefined,
                    subcategorySlug: taxonomy.subcategorySlug,
                    fandomSlug: taxonomy.fandomSlug,
                    isAdult: Boolean(form.isAdult),
                });
                await queryClient.invalidateQueries({ queryKey: ["moderation", "proposals"] });
            } catch (error: unknown) {
                const detail =
                    typeof error === "object" &&
                    error !== null &&
                    "response" in error &&
                    typeof (error as { response?: { data?: { detail?: string } } }).response
                        ?.data?.detail === "string"
                        ? (error as { response: { data: { detail: string } } }).response.data.detail
                        : null;

                toast.error(detail ?? "Не удалось сохранить изменения");
                throw error;
            }
        },
        [proposalId, product, queryClient]
    );

    return {
        proposal: editQuery.data?.proposal,
        initialForm,
        loading: editQuery.isLoading,
        isError: editQuery.isError || editQuery.data?.kind !== "product",
        submitProduct,
    };
}
