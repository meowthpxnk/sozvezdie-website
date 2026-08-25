"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { moderationService } from "@entities/moderation";
import { getMediaImageUrl } from "@shared/lib/media-url";

import type { BrandFormState, BrandPageController } from "../AuthorBrandPage/useAuthorBrand";

export function useModeratorBrandEdit(proposalId: string) {
    const queryClient = useQueryClient();
    const editQuery = useQuery({
        queryKey: ["moderation", "edit", proposalId],
        queryFn: () => moderationService.getProposalEdit(proposalId),
        retry: false,
        refetchOnWindowFocus: false,
    });

    const editData = editQuery.data?.kind === "brand" ? editQuery.data : undefined;
    const isUpdateBrand = editData?.actionType === "UPDATE_BRAND";

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

    const saveBrand = useCallback(async () => {
        const name = form.brandName.trim();
        const desc = form.brandDescription.trim();

        if (!name || !desc) {
            toast.error("Заполните название и описание");
            return false;
        }

        if (!isUpdateBrand && !form.avatarPreview && !avatarFile) {
            toast.error("Загрузите аватар бренда");
            return false;
        }

        if (!isUpdateBrand && !form.bannerPreview && !bannerFile) {
            toast.error("Загрузите баннер бренда");
            return false;
        }

        setSaving(true);
        try {
            await moderationService.updateProposalBrand(proposalId, {
                name,
                desc,
                avatarFile,
                bannerFile,
                tiktokUrl: form.tiktokUrl,
                telegramChannelUrl: form.telegramChannelUrl,
                vkUrl: form.vkUrl,
            });
            await queryClient.invalidateQueries({ queryKey: ["moderation", "proposals"] });
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
    }, [
        avatarFile,
        bannerFile,
        form.avatarPreview,
        form.bannerPreview,
        form.brandDescription,
        form.brandName,
        form.tiktokUrl,
        form.telegramChannelUrl,
        form.vkUrl,
        isUpdateBrand,
        proposalId,
        queryClient,
    ]);

    const view = useMemo(
        () => ({
            chromeTitle: isUpdateBrand ? "Модерация бренда" : "Модерация магазина",
            formTitle: isUpdateBrand ? "Редактирование бренда" : "Создание магазина",
            formDescription:
                "Отредактируйте данные заявки при необходимости и нажмите «Принять» или «Отклонить».",
            submitLabel: "",
            confirmTitle: "Сохранить изменения заявки?",
            confirmText: "Изменения будут применены к заявке на модерацию.",
            confirmButtonLabel: "Да, сохранить",
        }),
        [isUpdateBrand]
    );

    const isError = editQuery.isError || (editQuery.isSuccess && editQuery.data?.kind !== "brand");

    if (isError || (!editData && !editQuery.isLoading)) {
        return {
            controller: null,
            proposal: editQuery.data?.proposal,
            loading: editQuery.isLoading,
            isError: true,
        };
    }

    const controller: BrandPageController = {
        form,
        setForm,
        loading: editQuery.isLoading || !hydrated,
        saving,
        setAvatarFromFile,
        setBannerFromFile,
        saveBrand,
        hasExistingCard: isUpdateBrand,
        isApproved: false,
        isPendingReview: true,
        moderationStatus: "PENDING",
        view,
    };

    return {
        controller,
        proposal: editData?.proposal,
        loading: editQuery.isLoading || !hydrated,
        isError: false,
    };
}
