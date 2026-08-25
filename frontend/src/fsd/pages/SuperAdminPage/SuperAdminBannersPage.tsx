"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type DragEvent,
} from "react";
import styled from "styled-components";
import { GripVertical, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { type AdvertBanner } from "@entities/advert-banner";
import { superAdminService } from "@entities/super-admin";
import { MEDIA_URL } from "@shared/api/interceptors";
import { IMAGE_UPLOAD_HINT, isAcceptedImageUpload } from "@shared/lib/upload-constraints";
import { IconActionButton } from "@/src/shared/ui/icon-action-button";
import { SetAdminChrome } from "@widgets/AdminShell";

const Card = styled.section`
    background: #fff;
    border-radius: 14px;
    padding: 20px;
    box-shadow: 0 8px 24px rgba(17, 31, 60, 0.05);
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const Field = styled.label`
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: #2d3a54;
`;

const Input = styled.input`
    min-height: 40px;
    border-radius: 8px;
    border: 1px solid #d7ddea;
    padding: 0 12px;
    font-size: 14px;
    color: #132647;
`;

const Textarea = styled.textarea`
    min-height: 72px;
    border-radius: 8px;
    border: 1px solid #d7ddea;
    padding: 10px 12px;
    font-size: 14px;
    color: #132647;
    resize: vertical;
`;

const PrimaryButton = styled.button`
    min-height: 42px;
    padding: 0 18px;
    border: none;
    border-radius: 10px;
    background: var(--main-color);
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const EditButton = styled(IconActionButton).attrs({ $active: true })``;

const DeleteButton = styled(IconActionButton).attrs({ $active: true })`
    background: #dc3545;
    border-color: #dc3545;
    color: #fff;

    &:hover {
        background: #c82333;
        border-color: #c82333;
    }
`;

const BannerList = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
`;

const BannerListItem = styled.li<{ $isDragging?: boolean; $isDropTarget?: boolean }>`
    display: flex;
    align-items: center;
    gap: 10px;
    background: #f6f7f9;
    border-radius: 10px;
    padding: 12px 14px;
    user-select: none;
    list-style: none;
    opacity: ${({ $isDragging }) => ($isDragging ? 0.5 : 1)};
    outline: ${({ $isDropTarget }) =>
        $isDropTarget ? "2px dashed var(--main-color)" : "none"};
    outline-offset: 0;
    transition: opacity 0.15s ease, outline-color 0.15s ease;
`;

const DragHandle = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #8b97ab;
    flex-shrink: 0;
    cursor: grab;
    touch-action: none;

    &:active {
        cursor: grabbing;
    }
`;

const BannerThumb = styled.img`
    width: 72px;
    height: 27px;
    border-radius: 6px;
    object-fit: cover;
    background: #eef1f6;
    flex-shrink: 0;
`;

const BannerText = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const BannerTitle = styled.span`
    font-size: 15px;
    font-weight: 600;
    color: #1f2430;
    line-height: 1.35;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const BannerLink = styled.span`
    font-size: 12px;
    color: #8b97ab;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const SideActions = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
`;

const EmptyState = styled.p`
    margin: 0;
    font-size: 14px;
    color: #6b7890;
`;

const Hint = styled.p`
    margin: 0;
    font-size: 13px;
    color: #8b97ab;
`;

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
    display: ${({ $isOpen }) => ($isOpen ? "flex" : "none")};
    position: fixed;
    inset: 0;
    z-index: 1200;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(17, 31, 60, 0.45);
`;

const ModalCard = styled.div`
    width: min(560px, 100%);
    background: #fff;
    border-radius: 14px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 16px 40px rgba(17, 31, 60, 0.18);
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
`;

const ModalTitle = styled.h2`
    margin: 0;
    font-size: 18px;
    color: #132647;
`;

const ModalCloseButton = styled.button`
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    background: #eef1f6;
    color: #4a5872;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
`;

const ModalActions = styled.div`
    display: flex;
    gap: 8px;
    justify-content: flex-end;
`;

const AddBannerButton = styled.button`
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: none;
    background: var(--main-color);
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    appearance: none;

    &:hover {
        background: var(--main-color-hover);
    }

    &:focus-visible {
        outline: 2px solid var(--main-color);
        outline-offset: 2px;
    }

    svg {
        width: 14px;
        height: 14px;
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

type BannerFormState = {
    link: string;
    text: string;
    image: File | null;
    imagePreview: string | null;
};

const emptyForm = (): BannerFormState => ({
    link: "",
    text: "",
    image: null,
    imagePreview: null,
});

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

const getBannerId = (banner: AdvertBanner): number => Number(banner.id);

const getBannerImageUrl = (image?: string): string | null => {
    if (!image) {
        return null;
    }
    return `${MEDIA_URL}/images-bucket/${image}`;
};

type BannerImageUploadProps = {
    previewUrl: string | null;
    onFileSelect: (file: File, preview: string) => void;
    inputId: string;
    label: string;
};

function BannerImageUpload({
    previewUrl,
    onFileSelect,
    inputId,
    label,
}: BannerImageUploadProps) {
    const [isPageDragActive, setPageDragActive] = useState(false);
    const pageDragCounterRef = useRef(0);

    const handleFilePick = useCallback(
        async (file: File) => {
            if (!isAcceptedImageUpload(file)) {
                toast.error("Подходят только изображения до 4 МБ (JPG, PNG, WEBP, GIF)");
                return;
            }
            const dataUrl = await readFileAsDataUrl(file);
            onFileSelect(file, dataUrl);
        },
        [onFileSelect]
    );

    const {
        getRootProps,
        getInputProps,
        isDragActive: isBannerDragOver,
        open: openBannerDialog,
    } = useDropzone({
        accept: { "image/*": [] },
        multiple: false,
        noClick: true,
        onDrop: (files) => {
            const file = files[0];
            if (file) {
                void handleFilePick(file);
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

    return (
        <Field>
            {label}
            <UploadZone {...getRootProps()} $isDragOver={isBannerDragOver}>
                <input {...getInputProps()} id={inputId} />
                {isPageDragActive ? (
                    <DragOverlay $isTargeted={isBannerDragOver}>
                        <DragOverlayContent>
                            <Upload aria-hidden />
                            Перетащите файл сюда
                        </DragOverlayContent>
                    </DragOverlay>
                ) : null}
                {previewUrl ? (
                    <BannerPreviewWrap>
                        <BannerUploadPreviewImage src={previewUrl} alt="Превью баннера" />
                        <BannerOverlayUploadButton
                            type="button"
                            onClick={openBannerDialog}
                            aria-label="Загрузить изображение баннера"
                        >
                            <Upload aria-hidden />
                        </BannerOverlayUploadButton>
                    </BannerPreviewWrap>
                ) : (
                    <UploadPreview>
                        <UploadButton
                            type="button"
                            onClick={openBannerDialog}
                            aria-label="Загрузить изображение баннера"
                        >
                            <Upload aria-hidden />
                        </UploadButton>
                    </UploadPreview>
                )}
            </UploadZone>
            <Hint>{IMAGE_UPLOAD_HINT}</Hint>
        </Field>
    );
}

type BannerFormModalProps = {
    isOpen: boolean;
    title: string;
    form: BannerFormState;
    isPending: boolean;
    submitLabel: string;
    imageRequired?: boolean;
    onClose: () => void;
    onSubmit: () => void;
    onChange: (next: BannerFormState) => void;
};

function BannerFormModal({
    isOpen,
    title,
    form,
    isPending,
    submitLabel,
    imageRequired = false,
    onClose,
    onSubmit,
    onChange,
}: BannerFormModalProps) {
    const inputId = title === "Новый баннер" ? "banner-create-upload" : "banner-edit-upload";

    return (
        <ModalOverlay $isOpen={isOpen} onClick={onClose}>
            <ModalCard onClick={(event) => event.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>{title}</ModalTitle>
                    <ModalCloseButton type="button" aria-label="Закрыть" onClick={onClose}>
                        <X size={16} />
                    </ModalCloseButton>
                </ModalHeader>
                <Field>
                    Ссылка
                    <Input
                        value={form.link}
                        onChange={(event) => onChange({ ...form, link: event.target.value })}
                        placeholder="https://..."
                    />
                </Field>
                <Field>
                    Заголовок
                    <Textarea
                        value={form.text}
                        onChange={(event) => onChange({ ...form, text: event.target.value })}
                    />
                </Field>
                <BannerImageUpload
                    label={imageRequired ? "Изображение" : "Изображение (необязательно)"}
                    inputId={inputId}
                    previewUrl={form.imagePreview}
                    onFileSelect={(file, preview) =>
                        onChange({
                            ...form,
                            image: file,
                            imagePreview: preview,
                        })
                    }
                />
                <ModalActions>
                    <PrimaryButton type="button" disabled={isPending} onClick={onSubmit}>
                        {submitLabel}
                    </PrimaryButton>
                </ModalActions>
            </ModalCard>
        </ModalOverlay>
    );
}

type BannerRowProps = {
    banner: AdvertBanner;
    onDragHandleStart?: (event: DragEvent<HTMLSpanElement>) => void;
    onDragHandleEnd?: () => void;
    onEdit: (banner: AdvertBanner) => void;
    onDelete: (bannerId: number) => void;
    deleteDisabled: boolean;
};

function BannerRowContent({
    banner,
    onDragHandleStart,
    onDragHandleEnd,
    onEdit,
    onDelete,
    deleteDisabled,
}: BannerRowProps) {
    const bannerId = getBannerId(banner);
    const imageUrl = getBannerImageUrl(banner.image);

    return (
        <>
            {onDragHandleStart ? (
                <DragHandle
                    aria-hidden
                    draggable
                    onDragStart={onDragHandleStart}
                    onDragEnd={onDragHandleEnd}
                >
                    <GripVertical size={18} />
                </DragHandle>
            ) : null}
            {imageUrl ? <BannerThumb src={imageUrl} alt="" /> : null}
            <BannerText>
                <BannerTitle>{banner.title || "Без заголовка"}</BannerTitle>
                <BannerLink>{banner.href}</BannerLink>
            </BannerText>
            <SideActions>
                <EditButton
                    type="button"
                    aria-label={`Редактировать: ${banner.title}`}
                    onClick={(event) => {
                        event.stopPropagation();
                        onEdit(banner);
                    }}
                >
                    <Pencil size={14} />
                </EditButton>
                <DeleteButton
                    type="button"
                    aria-label={`Удалить: ${banner.title}`}
                    disabled={deleteDisabled}
                    onClick={(event) => {
                        event.stopPropagation();
                        onDelete(bannerId);
                    }}
                >
                    <Trash2 size={14} />
                </DeleteButton>
            </SideActions>
        </>
    );
}

export function SuperAdminBannersPage() {
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [createForm, setCreateForm] = useState<BannerFormState>(emptyForm);
    const [orderedBanners, setOrderedBanners] = useState<AdvertBanner[]>([]);
    const [editingBanner, setEditingBanner] = useState<AdvertBanner | null>(null);
    const [editForm, setEditForm] = useState<BannerFormState>(emptyForm);
    const pendingReorderRef = useRef<AdvertBanner[] | null>(null);
    const isDraggingRef = useRef(false);
    const [draggedBannerId, setDraggedBannerId] = useState<number | null>(null);
    const [dropTargetId, setDropTargetId] = useState<number | null>(null);

    const bannersQuery = useQuery({
        queryKey: ["super-admin", "banners"],
        queryFn: () => superAdminService.getBanners(),
    });

    const banners = bannersQuery.data ?? [];

    useEffect(() => {
        if (!isDraggingRef.current) {
            setOrderedBanners(banners);
        }
    }, [banners]);

    const invalidate = async () => {
        await queryClient.invalidateQueries({ queryKey: ["super-admin", "banners"] });
        await queryClient.invalidateQueries({ queryKey: ["advertBanners"] });
    };

    const createMutation = useMutation({
        mutationFn: () => {
            if (!createForm.image) {
                throw new Error("Выберите изображение");
            }

            return superAdminService.createBanner({
                image: createForm.image,
                link: createForm.link.trim(),
                text: createForm.text.trim(),
            });
        },
        onSuccess: async () => {
            setCreateModalOpen(false);
            setCreateForm(emptyForm());
            await invalidate();
            toast.success("Баннер добавлен");
        },
        onError: () => toast.error("Не удалось добавить баннер"),
    });

    const updateMutation = useMutation({
        mutationFn: () => {
            if (!editingBanner) {
                throw new Error("Баннер не выбран");
            }

            return superAdminService.updateBanner(getBannerId(editingBanner), {
                link: editForm.link.trim(),
                text: editForm.text.trim(),
                image: editForm.image,
            });
        },
        onSuccess: async () => {
            setEditingBanner(null);
            setEditForm(emptyForm());
            await invalidate();
            toast.success("Баннер обновлён");
        },
        onError: () => toast.error("Не удалось обновить баннер"),
    });

    const deleteMutation = useMutation({
        mutationFn: (bannerId: number) => superAdminService.deleteBanner(bannerId),
        onSuccess: async () => {
            await invalidate();
            toast.success("Баннер удалён");
        },
        onError: () => toast.error("Не удалось удалить баннер"),
    });

    const reorderMutation = useMutation({
        mutationFn: (orderedIds: number[]) => superAdminService.reorderBanners(orderedIds),
        onSuccess: async (updatedBanners) => {
            pendingReorderRef.current = null;
            queryClient.setQueryData(["super-admin", "banners"], updatedBanners);
            await queryClient.invalidateQueries({ queryKey: ["advertBanners"] });
        },
        onError: async () => {
            pendingReorderRef.current = null;
            toast.error("Не удалось сохранить порядок");
            await invalidate();
        },
    });

    const commitReorder = useCallback(() => {
        const pending = pendingReorderRef.current;
        if (!pending) {
            return;
        }

        const orderedIds = pending.map((banner) => getBannerId(banner));
        const unchanged =
            banners.length === orderedIds.length &&
            banners.every((banner, index) => getBannerId(banner) === orderedIds[index]);

        pendingReorderRef.current = null;

        if (unchanged || reorderMutation.isPending) {
            return;
        }

        reorderMutation.mutate(orderedIds);
    }, [banners, reorderMutation]);

    const moveBanner = useCallback((sourceId: number, targetId: number) => {
        if (sourceId === targetId) {
            return;
        }

        setOrderedBanners((current) => {
            const fromIndex = current.findIndex((banner) => getBannerId(banner) === sourceId);
            const toIndex = current.findIndex((banner) => getBannerId(banner) === targetId);
            if (fromIndex < 0 || toIndex < 0) {
                return current;
            }

            const next = [...current];
            const [moved] = next.splice(fromIndex, 1);
            next.splice(toIndex, 0, moved);
            pendingReorderRef.current = next;
            return next;
        });
    }, []);

    const handleDragHandleStart = useCallback(
        (bannerId: number) => (event: DragEvent<HTMLSpanElement>) => {
            isDraggingRef.current = true;
            setDraggedBannerId(bannerId);
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", String(bannerId));

            const row = event.currentTarget.closest("li");
            if (row instanceof HTMLElement) {
                event.dataTransfer.setDragImage(row, 24, 24);
            }
        },
        []
    );

    const handleDragHandleEnd = useCallback(() => {
        isDraggingRef.current = false;
        setDraggedBannerId(null);
        setDropTargetId(null);
        commitReorder();
    }, [commitReorder]);

    const handleItemDragOver = useCallback(
        (bannerId: number) => (event: DragEvent<HTMLLIElement>) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";

            if (draggedBannerId === null || draggedBannerId === bannerId) {
                return;
            }

            setDropTargetId(bannerId);
        },
        [draggedBannerId]
    );

    const handleItemDrop = useCallback(
        (bannerId: number) => (event: DragEvent<HTMLLIElement>) => {
            event.preventDefault();

            const sourceId =
                draggedBannerId ?? Number(event.dataTransfer.getData("text/plain"));
            if (!Number.isFinite(sourceId)) {
                return;
            }

            moveBanner(sourceId, bannerId);
            setDropTargetId(null);
        },
        [draggedBannerId, moveBanner]
    );

    const openEditModal = (banner: AdvertBanner) => {
        setEditingBanner(banner);
        setEditForm({
            link: banner.href,
            text: banner.title,
            image: null,
            imagePreview: getBannerImageUrl(banner.image),
        });
    };

    const closeEditModal = () => {
        if (updateMutation.isPending) {
            return;
        }
        setEditingBanner(null);
        setEditForm(emptyForm());
    };

    const openCreateModal = () => {
        setCreateForm(emptyForm());
        setCreateModalOpen(true);
    };

    const closeCreateModal = () => {
        if (createMutation.isPending) {
            return;
        }
        setCreateModalOpen(false);
        setCreateForm(emptyForm());
    };

    const titleRight = useMemo(
        () => (
            <AddBannerButton type="button" aria-label="Добавить баннер" onClick={openCreateModal}>
                <Plus aria-hidden />
            </AddBannerButton>
        ),
        []
    );

    return (
        <>
            <SetAdminChrome title="Баннеры лендинга" titleRight={titleRight} />
            <Card>
                {orderedBanners.length > 1 ? (
                    <Hint>Перетащите баннеры за иконку с полосками, чтобы изменить порядок.</Hint>
                ) : null}

                {bannersQuery.isLoading ? <EmptyState>Загрузка баннеров…</EmptyState> : null}
                {orderedBanners.length === 0 && !bannersQuery.isLoading ? (
                    <EmptyState>Баннеров пока нет.</EmptyState>
                ) : null}

                {orderedBanners.length > 0 ? (
                    <BannerList>
                        {orderedBanners.map((banner) => {
                            const bannerId = getBannerId(banner);

                            return (
                                <BannerListItem
                                    key={bannerId}
                                    $isDragging={draggedBannerId === bannerId}
                                    $isDropTarget={dropTargetId === bannerId}
                                    onDragOver={handleItemDragOver(bannerId)}
                                    onDrop={handleItemDrop(bannerId)}
                                >
                                    <BannerRowContent
                                        banner={banner}
                                        onDragHandleStart={handleDragHandleStart(bannerId)}
                                        onDragHandleEnd={handleDragHandleEnd}
                                        onEdit={openEditModal}
                                        onDelete={(id) => deleteMutation.mutate(id)}
                                        deleteDisabled={deleteMutation.isPending}
                                    />
                                </BannerListItem>
                            );
                        })}
                    </BannerList>
                ) : null}
            </Card>

            <BannerFormModal
                isOpen={isCreateModalOpen}
                title="Новый баннер"
                form={createForm}
                isPending={createMutation.isPending}
                submitLabel="Добавить"
                imageRequired
                onClose={closeCreateModal}
                onSubmit={() => createMutation.mutate()}
                onChange={setCreateForm}
            />

            <BannerFormModal
                isOpen={editingBanner !== null}
                title="Редактирование баннера"
                form={editForm}
                isPending={updateMutation.isPending}
                submitLabel="Сохранить"
                onClose={closeEditModal}
                onSubmit={() => updateMutation.mutate()}
                onChange={setEditForm}
            />
        </>
    );
}
