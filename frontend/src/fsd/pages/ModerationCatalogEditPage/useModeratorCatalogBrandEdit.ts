"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { moderationService } from "@entities/moderation";
import { getMediaImageUrl } from "@shared/lib/media-url";

import type { BrandFormState, BrandPageController } from "../AuthorBrandPage/useAuthorBrand";

export function useModeratorCatalogBrandEdit(sellerCardId: string) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const commentRef = useRef("");

    const editQuery = useQuery({
        queryKey: ["moderation", "catalog", "brand", sellerCardId],
        queryFn: () => moderationService.getCatalogBrandEdit(sellerCardId),
        retry: false,
        refetchOnWindowFocus: false,
    });

    const editData = editQuery.data?.kind === "brand" ? editQuery.data : undefined;

    const [form, setForm] = useState<BrandFormState>({
        brandName: "",
        brandDescription: "",
        avatarPreview: "",
        bannerPreview: "",
        tiktokUrl: "",
        telegramChannelUrl: "",
        vkUrl: "",
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        if (!editData || hydrated) {
            return;
        }

        setForm({
            brandName: editData.brandName ?? "",
            brandDescription: editData.brandDescription ?? "",
            avatarPreview: getMediaImageUrl(editData.avatarImage) ?? "",
            bannerPreview: getMediaImageUrl(editData.bannerImage) ?? "",
            tiktokUrl: editData.tiktokUrl ?? "",
            telegramChannelUrl: editData.telegramChannelUrl ?? "",
            vkUrl: editData.vkUrl ?? "",
        });
        setHydrated(true);
    }, [editData, hydrated]);

    const setAvatarFromFile = useCallback((file: File, previewUrl: string) => {
        setAvatarFile(file);
        setForm((prev) => ({ ...prev, avatarPreview: previewUrl }));
    }, []);

    const setBannerFromFile = useCallback((file: File, previewUrl: string) => {
        setBannerFile(file);
        setForm((prev) => ({ ...prev, bannerPreview: previewUrl }));
    }, []);

    const saveBrand = useCallback(
        async (comment?: string) => {
            const name = form.brandName.trim();
            const desc = form.brandDescription.trim();

            if (!name || !desc) {
                toast.error("Заполните название и описание");
                return false;
            }

            setSaving(true);
            try {
                await moderationService.updateCatalogBrand(sellerCardId, {
                    name,
                    desc,
                    avatarFile,
                    bannerFile,
                    tiktokUrl: form.tiktokUrl,
                    telegramChannelUrl: form.telegramChannelUrl,
                    vkUrl: form.vkUrl,
                    comment: (comment ?? commentRef.current) || undefined,
                });
                await queryClient.invalidateQueries({ queryKey: ["moderation", "proposals"] });
                await queryClient.invalidateQueries({ queryKey: ["singleAuthorData", sellerCardId] });
                await queryClient.invalidateQueries({
                    queryKey: ["moderation", "catalog", "brand", sellerCardId],
                });
                toast.success("Изменения сохранены");
                router.push(`/author/${sellerCardId}`);
                return true;
            } catch (error: unknown) {
                const detail =
                    typeof error === "object" &&
                    error !== null &&
                    "response" in error &&
                    typeof (error as { response?: { data?: { detail?: string } } }).response?.data
                        ?.detail === "string"
                        ? (error as { response: { data: { detail: string } } }).response.data.detail
                        : null;

                toast.error(detail ?? "Не удалось сохранить изменения");
                return false;
            } finally {
                setSaving(false);
            }
        },
        [
            avatarFile,
            bannerFile,
            form.brandDescription,
            form.brandName,
            form.tiktokUrl,
            form.telegramChannelUrl,
            form.vkUrl,
            queryClient,
            router,
            sellerCardId,
        ]
    );

    const saveWithComment = useCallback(
        async (comment: string) => {
            commentRef.current = comment;
            return saveBrand(comment);
        },
        [saveBrand]
    );

    const view = useMemo(
        () => ({
            chromeTitle: "Редактирование бренда",
            formTitle: "Бренд автора",
            formDescription:
                "Изменения применяются сразу и попадают в ленту модерации с вашим комментарием.",
            submitLabel: "",
            confirmTitle: "",
            confirmText: "",
            confirmButtonLabel: "",
        }),
        []
    );

    const isError = editQuery.isError || (editQuery.isSuccess && editQuery.data?.kind !== "brand");

    if (isError || (!editData && !editQuery.isLoading)) {
        return {
            controller: null,
            proposal: editQuery.data?.proposal,
            loading: editQuery.isLoading,
            isError: true,
            saving,
            saveWithComment,
        };
    }

    const controller: BrandPageController = {
        form,
        setForm,
        loading: editQuery.isLoading || !hydrated,
        saving,
        setAvatarFromFile,
        setBannerFromFile,
        saveBrand: async () => saveWithComment(commentRef.current),
        hasExistingCard: true,
        isApproved: true,
        isPendingReview: false,
        moderationStatus: "APPROVED",
        view,
    };

    return {
        controller,
        proposal: editData?.proposal,
        loading: editQuery.isLoading || !hydrated,
        isError: false,
        saving,
        saveWithComment,
    };
}
