"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import Image from "next/image";
import { Type, Upload, X } from "lucide-react";
import { SELLER_SOCIAL_ICON_PATHS } from "@shared/config/seller-social";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { SetAdminChrome } from "@widgets/AdminShell";
import { IMAGE_UPLOAD_HINT, isAcceptedImageUpload } from "@shared/lib/upload-constraints";
import { type BrandPageController, useAuthorBrand } from "./useAuthorBrand";

const BrandPageLayout = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;

    @media (min-width: 960px) {
        gap: 24px;
    }
`;

const FormCard = styled.section`
    background: #fff;
    border-radius: 14px;
    padding: 20px;
    box-shadow: 0 8px 24px rgba(17, 31, 60, 0.05);

    @media (min-width: 960px) {
        padding: 24px;
        border-radius: 16px;
    }
`;

const FormTitle = styled.h3`
    margin: 0 0 6px;
    font-size: 20px;
    font-weight: 700;
    color: #000;
`;

const FormDescription = styled.p`
    margin: 0 0 18px;
    font-size: 14px;
    font-weight: 500;
    color: #666;
    line-height: 1.45;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 14px;
`;

const FieldGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const FieldLabel = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: #2d3a54;
`;

const RequiredMark = styled.span`
    color: #e74c3c;
    font-weight: 700;
`;

const InputWithIconWrap = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 42px;
    border-radius: 8px;
    border: 1px solid #e6e6e6;
    background: #fff;
    box-sizing: border-box;

    &:focus-within {
        outline: 2px solid var(--main-color);
        outline-offset: 2px;
    }

    svg {
        flex-shrink: 0;
        width: 18px;
        height: 18px;
        color: #9aa3b2;
        margin-left: 12px;
        margin-right: 8px;
    }
`;

const TextInput = styled.input`
    flex: 1;
    min-width: 0;
    height: 42px;
    border: none;
    padding: 0 12px 0 0;
    font-size: 14px;
    color: #000;
    background: transparent;
    box-sizing: border-box;

    &:focus {
        outline: none;
    }
`;

const SocialFieldIcon = styled(Image)`
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    object-fit: contain;
    margin-left: 12px;
    margin-right: 8px;
`;

const SocialHint = styled.p`
    margin: 0;
    font-size: 12px;
    color: #8a96ad;
    line-height: 1.4;
`;

const TextareaInput = styled.textarea`
    width: 100%;
    min-height: 120px;
    border-radius: 8px;
    border: 1px solid #e6e6e6;
    padding: 10px;
    font-size: 14px;
    color: #000;
    resize: vertical;

    &:focus {
        outline: 2px solid var(--main-color);
        outline-offset: 2px;
    }
`;

const UploadZone = styled.div<{ $isDragOver: boolean }>`
    border: 1px dashed ${({ $isDragOver }) => ($isDragOver ? "var(--main-color)" : "#d7ddea")};
    border-radius: 10px;
    padding: 12px;
    background: ${({ $isDragOver }) => ($isDragOver ? "#f5f9ff" : "#f8faff")};
    transition: border-color 0.2s ease, background-color 0.2s ease;
    position: relative;
    overflow: hidden;
`;

const UploadButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: 10px;
    border: 1px solid #c8d3e8;
    background: #f1f5ff;
    color: var(--main-color-accent);
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease;

    svg {
        width: 18px;
        height: 18px;
    }

    &:hover {
        background: #e6efff;
        border-color: #adc3f3;
    }
`;

const UploadPreview = styled.div`
    display: flex;
    align-items: center;
`;

const AvatarPreviewRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
`;

const AvatarUploadPreviewImage = styled.img`
    width: 42px;
    height: 42px;
    border-radius: 10px;
    object-fit: cover;
    background: #fff;
`;

const BannerUploadPreviewImage = styled.img`
    width: 100%;
    height: 120px;
    border-radius: 10px;
    object-fit: cover;
    border: 1px solid #d7ddea;
    background: #fff;
`;

const BannerPreviewWrap = styled.div`
    position: relative;
`;

const BannerOverlayUploadButton = styled(UploadButton)`
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(241, 245, 255, 0.95);
`;

const DragOverlay = styled.div<{ $isTargeted: boolean }>`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ $isTargeted }) =>
        $isTargeted ? "var(--upload-drag-overlay-active)" : "var(--upload-drag-overlay)"};
    color: #fff;
    pointer-events: none;
    z-index: 3;
    transition: background-color 0.2s ease;
`;

const DragOverlayContent = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;

    svg {
        width: 18px;
        height: 18px;
    }
`;

const CancelModerationButton = styled.button<{ $disabled?: boolean }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    align-self: stretch;
    width: 100%;
    min-height: 42px;
    padding: 0 20px;
    border-radius: 8px;
    border: 1px solid #d7ddea;
    background: #fff;
    color: #2d3a54;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease;
    opacity: ${({ $disabled }) => ($disabled ? 0.65 : 1)};
    pointer-events: ${({ $disabled }) => ($disabled ? "none" : "auto")};

    &:hover {
        background: #f5f7fb;
        border-color: #b8c4da;
    }
`;

const PrimaryButton = styled.button<{ $disabled?: boolean }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    align-self: stretch;
    width: 100%;
    min-height: 42px;
    padding: 0 20px;
    border-radius: 8px;
    border: none;
    background: var(--main-color);
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.2s ease;
    opacity: ${({ $disabled }) => ($disabled ? 0.65 : 1)};
    pointer-events: ${({ $disabled }) => ($disabled ? "none" : "auto")};

    &:hover {
        background: var(--main-color-hover);
    }

    &:focus-visible {
        outline: 2px solid var(--main-color);
        outline-offset: 2px;
    }
`;

const PAGE_CONTENT_MAX_WIDTH = 1200;

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
    position: fixed;
    inset: 0;
    z-index: 1200;
    background: rgba(6, 10, 18, 0.63);
    backdrop-filter: blur(10px);
    opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
    pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};
    transition: opacity 0.2s ease;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    overflow-y: auto;
    padding: 20px;
    box-sizing: border-box;

    @media (min-width: 960px) {
        align-items: center;
        padding: 32px;
    }
`;

const ModalLayout = styled.div`
    width: 100%;
    max-width: ${PAGE_CONTENT_MAX_WIDTH}px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-sizing: border-box;
`;

const ModalCard = styled.section`
    width: 100%;
    background: #fff;
    border-radius: 14px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    position: relative;
    box-sizing: border-box;

    @media (min-width: 960px) {
        padding: 24px;
        border-radius: 16px;
    }
`;

const ModalTitle = styled.h3`
    margin: 0;
    font-size: 22px;
    color: #111;
`;

const ModalText = styled.p`
    margin: 0;
    font-size: 14px;
    color: #4a5872;
`;

const ModalPreviewRow = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const ModalName = styled.strong`
    font-size: 18px;
    color: #111;
    line-height: 1.2;
`;

const ModalAvatarPreview = styled.img`
    width: 64px;
    height: 64px;
    border-radius: 14px;
    object-fit: cover;
    border: 1px solid #d7ddea;
`;

const ModalBannerPreview = styled.img`
    width: 100%;
    height: 180px;
    border-radius: 12px;
    object-fit: cover;
    border: 1px solid #d7ddea;
`;

const ModalActions = styled.div`
    width: 100%;
    display: flex;
    justify-content: stretch;
`;

const ModalBannerBlock = styled.div`
    width: 100%;
`;

const ModalCloseButton = styled.button`
    position: absolute;
    top: 14px;
    right: 14px;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 1px solid #dc3545;
    background: #dc3545;
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease;

    &:hover {
        background: #c82333;
        border-color: #c82333;
    }
`;

const PreviewTitle = styled.h2`
    margin: 0;
    font-size: 20px;
    color: #000;
`;

const BannerPreview = styled.section<{ $backgroundImage: string }>`
    width: 100%;
    min-height: 192px;
    border-radius: 14px;
    padding: 24px;
    background-image:
        var(--author-banner-gradient),
        url(${({ $backgroundImage }) => $backgroundImage});
    background-size: cover;
    background-position: center;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 18px;
    margin-bottom: 16px;
`;

const AvatarPreview = styled.div`
    width: 88px;
    height: 88px;
    border-radius: 18px;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.18);
    display: grid;
    place-items: center;
    font-size: 28px;
    font-weight: 700;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
`;

const BannerContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
    flex-grow: 1;
`;

const BannerTitle = styled.h3`
    margin: 0;
    font-size: 28px;
    line-height: 1.1;
`;

const BannerDescription = styled.p`
    margin: 0;
    color: rgba(255, 255, 255, 0.92);
    line-height: 1.45;
    max-width: 720px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
`;

const ModalBannerPreviewCard = styled(BannerPreview)`
    min-height: 180px;
    margin-bottom: 0;
`;

const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result);
                return;
            }
            reject(new Error("Не удалось прочитать файл."));
        };
        reader.onerror = () => reject(new Error("Ошибка чтения файла."));
        reader.readAsDataURL(file);
    });

const EmptyState = styled.p`
    margin: 0;
    font-size: 15px;
    color: #666;
`;

type AuthorBrandPageProps = {
    controller?: BrandPageController;
    footer?: React.ReactNode;
    hideSubmit?: boolean;
};

type AuthorBrandPageContentProps = {
    controller: BrandPageController;
    footer?: React.ReactNode;
    hideSubmit?: boolean;
};

const AuthorBrandPageContent = ({ controller, footer, hideSubmit = false }: AuthorBrandPageContentProps) => {
    const {
        form,
        setForm,
        hasExistingCard,
        isApproved,
        isPendingReview,
        moderationStatus,
        loading: dashboardLoading,
        saving,
        setAvatarFromFile,
        setBannerFromFile,
        saveBrand,
        cancelPendingModeration,
        canCancelPendingModeration,
        isCancellingModeration,
        view,
    } = controller;

    const previewTitle = form.brandName || "Без названия";
    const previewDescription =
        form.brandDescription || "Добавьте описание бренда, чтобы оно отображалось в баннере для покупателей.";
    const avatarFallback = previewTitle.slice(0, 1).toUpperCase();
    const previewBanner =
        form.bannerPreview || "https://placeholdpicsum.dev/photo/1280/500?seed=admin-brand-preview";
    const [isPageDragActive, setPageDragActive] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const pageDragCounterRef = useRef(0);

    const handleFilePick = useCallback(
        async (file: File, key: "avatar" | "banner") => {
            if (!isAcceptedImageUpload(file)) {
                toast.error("Подходят только изображения до 4 МБ (JPG, PNG, WEBP, GIF)");
                return;
            }
            const dataUrl = await readFileAsDataUrl(file);
            if (key === "avatar") {
                setAvatarFromFile(file, dataUrl);
                return;
            }
            setBannerFromFile(file, dataUrl);
        },
        [setAvatarFromFile, setBannerFromFile]
    );

    const {
        getRootProps: getAvatarRootProps,
        getInputProps: getAvatarInputProps,
        isDragActive: isAvatarDragOver,
        open: openAvatarDialog,
    } = useDropzone({
        accept: { "image/*": [] },
        multiple: false,
        noClick: true,
        onDrop: (files) => {
            const file = files[0];
            if (file) {
                void handleFilePick(file, "avatar");
            }
        },
    });

    const {
        getRootProps: getBannerRootProps,
        getInputProps: getBannerInputProps,
        isDragActive: isBannerDragOver,
        open: openBannerDialog,
    } = useDropzone({
        accept: { "image/*": [] },
        multiple: false,
        noClick: true,
        onDrop: (files) => {
            const file = files[0];
            if (file) {
                void handleFilePick(file, "banner");
            }
        },
    });

    useEffect(() => {
        const onDragEnter = (event: globalThis.DragEvent) => {
            if (!event.dataTransfer?.types.includes("Files")) {
                return;
            }
            pageDragCounterRef.current += 1;
            setPageDragActive(true);
        };

        const onDragLeave = () => {
            pageDragCounterRef.current = Math.max(0, pageDragCounterRef.current - 1);
            if (pageDragCounterRef.current === 0) {
                setPageDragActive(false);
            }
        };

        const resetDrag = () => {
            pageDragCounterRef.current = 0;
            setPageDragActive(false);
        };

        window.addEventListener("dragenter", onDragEnter);
        window.addEventListener("dragleave", onDragLeave);
        window.addEventListener("drop", resetDrag);
        window.addEventListener("dragend", resetDrag);

        return () => {
            window.removeEventListener("dragenter", onDragEnter);
            window.removeEventListener("dragleave", onDragLeave);
            window.removeEventListener("drop", resetDrag);
            window.removeEventListener("dragend", resetDrag);
        };
    }, []);

    if (dashboardLoading) {
        return (
            <>
                <SetAdminChrome title={view.chromeTitle} />
                <EmptyState>Загрузка данных бренда…</EmptyState>
            </>
        );
    }

    return (
        <>
            <SetAdminChrome title={view.chromeTitle} />
            <BrandPageLayout>
            <PreviewTitle>Превью</PreviewTitle>
            <BannerPreview $backgroundImage={previewBanner}>
                <AvatarPreview>
                    {form.avatarPreview ? (
                        <img src={form.avatarPreview} alt={`Аватар бренда ${previewTitle}`} />
                    ) : (
                        avatarFallback
                    )}
                </AvatarPreview>
                <BannerContent>
                    <BannerTitle>{previewTitle}</BannerTitle>
                    <BannerDescription>{previewDescription}</BannerDescription>
                </BannerContent>
            </BannerPreview>
            <FormCard>
                <FormTitle>{view.formTitle}</FormTitle>
                <FormDescription>{view.formDescription}</FormDescription>
                <Form
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (hideSubmit || saving) {
                            return;
                        }
                        setConfirmModalOpen(true);
                    }}
                >
                    <FieldGroup>
                        <FieldLabel htmlFor="brand-name">
                            Название бренда <RequiredMark>*</RequiredMark>
                        </FieldLabel>
                        <InputWithIconWrap>
                            <Type aria-hidden />
                            <TextInput
                                id="brand-name"
                                value={form.brandName}
                                onChange={(event) => setForm((prev) => ({ ...prev, brandName: event.target.value }))}
                                placeholder="Введите название бренда"
                                required
                            />
                        </InputWithIconWrap>
                    </FieldGroup>
                    <FieldGroup>
                        <FieldLabel htmlFor="brand-description">
                            Описание бренда <RequiredMark>*</RequiredMark>
                        </FieldLabel>
                        <TextareaInput
                            id="brand-description"
                            value={form.brandDescription}
                            onChange={(event) => setForm((prev) => ({ ...prev, brandDescription: event.target.value }))}
                            placeholder="Введите описание бренда"
                            required
                        />
                    </FieldGroup>
                    <FieldGroup>
                        <FieldLabel htmlFor="brand-tiktok-url">TikTok</FieldLabel>
                        <InputWithIconWrap>
                            <SocialFieldIcon
                                src={SELLER_SOCIAL_ICON_PATHS.tiktok}
                                alt=""
                                width={18}
                                height={18}
                                aria-hidden
                            />
                            <TextInput
                                id="brand-tiktok-url"
                                type="url"
                                value={form.tiktokUrl}
                                onChange={(event) =>
                                    setForm((prev) => ({ ...prev, tiktokUrl: event.target.value }))
                                }
                                placeholder="https://www.tiktok.com/@username"
                            />
                        </InputWithIconWrap>
                        <SocialHint>Ссылка на профиль TikTok. Поле необязательное.</SocialHint>
                    </FieldGroup>
                    <FieldGroup>
                        <FieldLabel htmlFor="brand-telegram-url">Telegram-канал</FieldLabel>
                        <InputWithIconWrap>
                            <SocialFieldIcon
                                src={SELLER_SOCIAL_ICON_PATHS.telegram}
                                alt=""
                                width={18}
                                height={18}
                                aria-hidden
                            />
                            <TextInput
                                id="brand-telegram-url"
                                type="url"
                                value={form.telegramChannelUrl}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        telegramChannelUrl: event.target.value,
                                    }))
                                }
                                placeholder="https://t.me/your_channel"
                            />
                        </InputWithIconWrap>
                        <SocialHint>Ссылка на Telegram-канал. Поле необязательное.</SocialHint>
                    </FieldGroup>
                    <FieldGroup>
                        <FieldLabel htmlFor="brand-vk-url">ВКонтакте</FieldLabel>
                        <InputWithIconWrap>
                            <SocialFieldIcon
                                src={SELLER_SOCIAL_ICON_PATHS.vk}
                                alt=""
                                width={18}
                                height={18}
                                aria-hidden
                            />
                            <TextInput
                                id="brand-vk-url"
                                type="url"
                                value={form.vkUrl}
                                onChange={(event) =>
                                    setForm((prev) => ({ ...prev, vkUrl: event.target.value }))
                                }
                                placeholder="https://vk.com/your_page"
                            />
                        </InputWithIconWrap>
                        <SocialHint>Ссылка на страницу или сообщество ВКонтакте. Поле необязательное.</SocialHint>
                    </FieldGroup>
                    <FieldGroup>
                        <FieldLabel htmlFor="brand-avatar-upload">
                            Аватар бренда <RequiredMark>*</RequiredMark>
                        </FieldLabel>
                        <UploadZone {...getAvatarRootProps()} $isDragOver={isAvatarDragOver}>
                            <input {...getAvatarInputProps()} id="brand-avatar-upload" />
                            {isPageDragActive ? (
                                <DragOverlay $isTargeted={isAvatarDragOver}>
                                    <DragOverlayContent>
                                        <Upload aria-hidden />
                                        Перетащите файл сюда
                                    </DragOverlayContent>
                                </DragOverlay>
                            ) : null}
                            {form.avatarPreview ? (
                                <AvatarPreviewRow>
                                    <UploadPreview>
                                        <AvatarUploadPreviewImage
                                            src={form.avatarPreview}
                                            alt="Превью аватара бренда"
                                        />
                                    </UploadPreview>
                                    <UploadButton type="button" onClick={openAvatarDialog} aria-label="Загрузить аватар бренда">
                                        <Upload aria-hidden />
                                    </UploadButton>
                                </AvatarPreviewRow>
                            ) : (
                                <UploadPreview>
                                    <UploadButton type="button" onClick={openAvatarDialog} aria-label="Загрузить аватар бренда">
                                        <Upload aria-hidden />
                                    </UploadButton>
                                </UploadPreview>
                            )}
                        </UploadZone>
                        <SocialHint>{IMAGE_UPLOAD_HINT}</SocialHint>
                    </FieldGroup>
                    <FieldGroup>
                        <FieldLabel htmlFor="brand-banner-upload">
                            Баннер бренда <RequiredMark>*</RequiredMark>
                        </FieldLabel>
                        <UploadZone {...getBannerRootProps()} $isDragOver={isBannerDragOver}>
                            <input {...getBannerInputProps()} id="brand-banner-upload" />
                            {isPageDragActive ? (
                                <DragOverlay $isTargeted={isBannerDragOver}>
                                    <DragOverlayContent>
                                        <Upload aria-hidden />
                                        Перетащите файл сюда
                                    </DragOverlayContent>
                                </DragOverlay>
                            ) : null}
                            {form.bannerPreview ? (
                                <BannerPreviewWrap>
                                    <BannerUploadPreviewImage
                                        src={form.bannerPreview}
                                        alt="Превью баннера бренда"
                                    />
                                    <BannerOverlayUploadButton
                                        type="button"
                                        onClick={openBannerDialog}
                                        aria-label="Загрузить баннер бренда"
                                    >
                                        <Upload aria-hidden />
                                    </BannerOverlayUploadButton>
                                </BannerPreviewWrap>
                            ) : (
                                <UploadPreview>
                                    <UploadButton type="button" onClick={openBannerDialog} aria-label="Загрузить баннер бренда">
                                        <Upload aria-hidden />
                                    </UploadButton>
                                </UploadPreview>
                            )}
                        </UploadZone>
                        <SocialHint>{IMAGE_UPLOAD_HINT}</SocialHint>
                    </FieldGroup>
                    {hideSubmit ? null : (
                        <>
                            <PrimaryButton type="submit" $disabled={saving || isCancellingModeration}>
                                {saving ? "Сохранение…" : view.submitLabel}
                            </PrimaryButton>
                            {canCancelPendingModeration ? (
                                <CancelModerationButton
                                    type="button"
                                    $disabled={saving || isCancellingModeration}
                                    onClick={() => {
                                        void cancelPendingModeration();
                                    }}
                                >
                                    {isCancellingModeration
                                        ? "Отмена заявки…"
                                        : "Отменить заявку на модерацию"}
                                </CancelModerationButton>
                            ) : null}
                        </>
                    )}
                </Form>
            </FormCard>
            {footer}
            </BrandPageLayout>
            {typeof document !== "undefined" && isConfirmModalOpen
                ? createPortal(
                      <ModalOverlay
                          $isOpen={isConfirmModalOpen}
                          onClick={() => setConfirmModalOpen(false)}
                      >
                          <ModalLayout onClick={(event) => event.stopPropagation()}>
                              <ModalCard>
                                  <ModalCloseButton
                                      type="button"
                                      aria-label="Закрыть модальное окно"
                                      onClick={() => setConfirmModalOpen(false)}
                                  >
                                      <X size={16} />
                                  </ModalCloseButton>
                                  <ModalTitle>{view.confirmTitle}</ModalTitle>
                                  <ModalText>{view.confirmText}</ModalText>
                                  <ModalBannerBlock>
                                      <ModalBannerPreviewCard
                                          $backgroundImage={previewBanner}
                                      >
                                          <AvatarPreview>
                                              {form.avatarPreview ? (
                                                  <img
                                                      src={form.avatarPreview}
                                                      alt={`Аватар бренда ${previewTitle}`}
                                                  />
                                              ) : (
                                                  avatarFallback
                                              )}
                                          </AvatarPreview>
                                          <BannerContent>
                                              <BannerTitle>{previewTitle}</BannerTitle>
                                              <BannerDescription>
                                                  {previewDescription}
                                              </BannerDescription>
                                          </BannerContent>
                                      </ModalBannerPreviewCard>
                                  </ModalBannerBlock>
                                  <ModalActions>
                                      <PrimaryButton
                                          type="button"
                                          $disabled={saving}
                                          onClick={() => {
                                              void saveBrand().then((success) => {
                                                  if (success) {
                                                      setConfirmModalOpen(false);
                                                  }
                                              });
                                          }}
                                      >
                                          {saving ? "Отправка…" : view.confirmButtonLabel}
                                      </PrimaryButton>
                                  </ModalActions>
                              </ModalCard>
                          </ModalLayout>
                      </ModalOverlay>,
                      document.body
                  )
                : null}
        </>
    );
};

const AuthorBrandPageWithHook = ({
    footer,
    hideSubmit,
}: {
    footer?: React.ReactNode;
    hideSubmit?: boolean;
}) => {
    const controller = useAuthorBrand();
    return (
        <AuthorBrandPageContent controller={controller} footer={footer} hideSubmit={hideSubmit} />
    );
};

export const AuthorBrandPage = ({
    controller,
    footer,
    hideSubmit,
}: AuthorBrandPageProps = {}) => {
    if (controller) {
        return (
            <AuthorBrandPageContent
                controller={controller}
                footer={footer}
                hideSubmit={hideSubmit}
            />
        );
    }

    return <AuthorBrandPageWithHook footer={footer} hideSubmit={hideSubmit} />;
};
