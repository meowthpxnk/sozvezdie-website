"use client";

import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import authorService from "@entities/author/author.service";
import { useCancelModerationRequest } from "@entities/author/hooks/useCancelModerationRequest";
import { getMediaImageUrl } from "@shared/lib/media-url";
import { useAuthorDashboard } from "../AuthorDashboardPage/useAuthorDashboard";

import type { ModerationStatus } from "@entities/author/seller-product.types";

export type BrandPageViewProps = {
    chromeTitle: string;
    formTitle: string;
    formDescription: string;
    submitLabel: string;
    confirmTitle: string;
    confirmText: string;
    confirmButtonLabel: string;
};

export type BrandPageController = {
    form: BrandFormState;
    setForm: Dispatch<SetStateAction<BrandFormState>>;
    loading: boolean;
    saving: boolean;
    setAvatarFromFile: (file: File, previewUrl: string) => void;
    setBannerFromFile: (file: File, previewUrl: string) => void;
    saveBrand: () => Promise<boolean>;
    cancelPendingModeration: () => Promise<boolean>;
    canCancelPendingModeration: boolean;
    isCancellingModeration: boolean;
    hasExistingCard: boolean;
    isApproved: boolean;
    isPendingReview: boolean;
    moderationStatus?: ModerationStatus;
    view: BrandPageViewProps;
};

export type BrandFormState = {
    brandName: string;
    brandDescription: string;
    avatarPreview: string;
    bannerPreview: string;
    tiktokUrl: string;
    telegramChannelUrl: string;
    vkUrl: string;
};

const EMPTY_FORM: BrandFormState = {
    brandName: "",
    brandDescription: "",
    avatarPreview: "",
    bannerPreview: "",
    tiktokUrl: "",
    telegramChannelUrl: "",
    vkUrl: "",
};

export function useAuthorBrand() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { dashboard, loading: dashboardLoading } = useAuthorDashboard();
    const { cancelRequest, isCancelling } = useCancelModerationRequest();
    const brandModerationsQuery = useQuery({
        queryKey: ["author", "brand-moderations"],
        queryFn: () => authorService.getMyBrandModerations(),
    });
    const sellerCard = dashboard?.sellerCard;
    const hasExistingCard = Boolean(sellerCard);
    const moderationStatus = sellerCard?.moderationStatus;
    const isApproved = moderationStatus === "APPROVED";
    const isPendingReview =
        moderationStatus === "PENDING" || moderationStatus === "REJECTED" || !hasExistingCard;

    const pendingBrandModeration = useMemo(
        () => brandModerationsQuery.data?.find((item) => item.status === "PENDING"),
        [brandModerationsQuery.data]
    );
    const canCancelPendingModeration = Boolean(pendingBrandModeration);
    const pendingBrandFeedItemId = pendingBrandModeration
        ? `brand-${pendingBrandModeration.id}`
        : null;
    const isCancellingModeration = pendingBrandFeedItemId
        ? isCancelling(pendingBrandFeedItemId)
        : false;

    const [form, setForm] = useState<BrandFormState>(EMPTY_FORM);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        if (dashboardLoading || hydrated) {
            return;
        }

        if (sellerCard) {
            setForm({
                brandName: sellerCard.name,
                brandDescription: sellerCard.description ?? "",
                avatarPreview: getMediaImageUrl(sellerCard.avatarImage) ?? "",
                bannerPreview: getMediaImageUrl(sellerCard.bannerImage) ?? "",
                tiktokUrl: sellerCard.tiktokUrl ?? "",
                telegramChannelUrl: sellerCard.telegramChannelUrl ?? "",
                vkUrl: sellerCard.vkUrl ?? "",
            });
        }

        setHydrated(true);
    }, [dashboardLoading, hydrated, sellerCard]);

    const setAvatarFromFile = useCallback((file: File, previewUrl: string) => {
        setAvatarFile(file);
        setForm((prev) => ({ ...prev, avatarPreview: previewUrl }));
    }, []);

    const setBannerFromFile = useCallback((file: File, previewUrl: string) => {
        setBannerFile(file);
        setForm((prev) => ({ ...prev, bannerPreview: previewUrl }));
    }, []);

    const cancelPendingModeration = useCallback(async () => {
        if (!pendingBrandModeration || !pendingBrandFeedItemId) {
            toast.error("Нет заявки, которую можно отменить");
            return false;
        }

        const success = await cancelRequest(pendingBrandFeedItemId, {
            kind: "brand",
            moderationId: pendingBrandModeration.id,
        });

        if (success) {
            setForm(EMPTY_FORM);
            setAvatarFile(null);
            setBannerFile(null);
            setHydrated(false);
            router.push("/admin/feed");
        }

        return success;
    }, [
        cancelRequest,
        pendingBrandFeedItemId,
        pendingBrandModeration,
        router,
    ]);

    const saveBrand = useCallback(async () => {
        const name = form.brandName.trim();
        const desc = form.brandDescription.trim();

        if (!name || !desc) {
            toast.error("Заполните название и описание бренда");
            return false;
        }

        if (!hasExistingCard) {
            if (!avatarFile || !bannerFile) {
                toast.error("Загрузите аватар и баннер бренда");
                return false;
            }
        }

        setSaving(true);
        try {
            if (hasExistingCard) {
                await authorService.updateSellerCard({
                    name,
                    desc,
                    avatarFile,
                    bannerFile,
                    tiktokUrl: form.tiktokUrl,
                    telegramChannelUrl: form.telegramChannelUrl,
                    vkUrl: form.vkUrl,
                });
                await queryClient.invalidateQueries({ queryKey: ["author", "dashboard"] });
                await queryClient.invalidateQueries({ queryKey: ["author", "brand-moderations"] });
                toast.success(
                    isApproved
                        ? "Изменения отправлены на модерацию"
                        : "Заявка обновлена и снова отправлена на модерацию"
                );
                router.push("/admin/feed");
                return true;
            }

            if (!avatarFile || !bannerFile) {
                toast.error("Загрузите аватар и баннер бренда");
                return false;
            }

            await authorService.createSellerCard({
                name,
                desc,
                avatarFile,
                bannerFile,
                tiktokUrl: form.tiktokUrl,
                telegramChannelUrl: form.telegramChannelUrl,
                vkUrl: form.vkUrl,
            });
            await queryClient.invalidateQueries({ queryKey: ["author", "dashboard"] });
            await queryClient.invalidateQueries({ queryKey: ["author", "brand-moderations"] });
            toast.success("Бренд отправлен на модерацию");
            router.push("/admin/feed");
            return true;
        } catch (error: unknown) {
            const detail =
                typeof error === "object" &&
                error !== null &&
                "response" in error &&
                typeof (error as { response?: { data?: { detail?: string } } }).response
                    ?.data?.detail === "string"
                    ? (error as { response: { data: { detail: string } } }).response.data.detail
                    : null;

            if (detail === "Seller card already exists") {
                toast.error("У вас уже есть карточка бренда");
            } else if (detail === "Brand changes are already pending moderation") {
                toast.error("Изменения бренда уже ожидают модерации");
            } else {
                toast.error(detail ?? "Не удалось сохранить бренд");
            }
            return false;
        } finally {
            setSaving(false);
        }
    }, [
        avatarFile,
        bannerFile,
        form.brandDescription,
        form.brandName,
        form.tiktokUrl,
        form.telegramChannelUrl,
        form.vkUrl,
        hasExistingCard,
        isApproved,
        queryClient,
        router,
    ]);

    const view: BrandPageViewProps = {
        chromeTitle: hasExistingCard ? "Редактирование бренда" : "Создание бренда",
        formTitle: hasExistingCard ? "Карточка бренда" : "Форма создания бренда",
        formDescription: hasExistingCard
            ? isApproved
                ? "Изменения бренда отправляются на модерацию. До одобрения на витрине останется текущая версия."
                : moderationStatus === "REJECTED"
                  ? "Заявка отклонена. Исправьте данные и отправьте повторно."
                  : "Бренд на модерации. Вы можете обновить данные до решения модератора."
            : "Заполните название, описание и загрузите изображения. После сохранения бренд отправится на модерацию.",
        submitLabel: hasExistingCard
            ? isPendingReview
                ? "Обновить заявку"
                : "Отправить изменения"
            : "Создать бренд",
        confirmTitle: hasExistingCard ? "Отправить изменения бренда?" : "Создать бренд?",
        confirmText:
            hasExistingCard && isApproved
                ? "После подтверждения изменения уйдут на модерацию."
                : "Проверьте превью перед отправкой на модерацию.",
        confirmButtonLabel: hasExistingCard ? "Да, отправить" : "Да, создать",
    };

    return {
        form,
        setForm,
        hasExistingCard,
        isApproved,
        isPendingReview,
        moderationStatus,
        loading: dashboardLoading || !hydrated || brandModerationsQuery.isLoading,
        saving,
        setAvatarFromFile,
        setBannerFromFile,
        saveBrand,
        cancelPendingModeration,
        canCancelPendingModeration,
        isCancellingModeration,
        view,
    };
}
