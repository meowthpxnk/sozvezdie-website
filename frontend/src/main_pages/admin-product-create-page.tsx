"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { AnimatePresence, motion, Reorder, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Type, Upload, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { SetAdminChrome } from "@widgets/AdminShell";
import { FormattedParagraphs } from "@shared/ui/FormattedParagraphs";
import type { SellerProductImage } from "@/src/shared/types/seller";

const FormCard = styled.section`
    background: #fff;
    border-radius: 14px;
    padding: 20px;
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

    &:focus {
        outline: none;
    }
`;

const NumberInput = styled.input`
    width: 100%;
    min-height: 42px;
    border-radius: 8px;
    border: 1px solid #e6e6e6;
    padding: 10px 12px;
    font-size: 14px;
    color: #000;

    &:focus {
        outline: 2px solid var(--main-color);
        outline-offset: 2px;
    }
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

const UploadHint = styled.p`
    margin: 0;
    font-size: 12px;
    color: #6d7a94;
`;

const UploadPreview = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
`;

const DragOverlay = styled.div<{ $isTargeted: boolean }>`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ $isTargeted }) => ($isTargeted ? "var(--upload-drag-overlay-active)" : "var(--upload-drag-overlay)")};
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

const ImagesRailCard = styled.div`
    background: #fff;
    border-radius: 10px;
    padding: 8px;
    border: 1px solid #d7ddea;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const ProductImageContainerWrapper = styled.div`
    background-color: #f0f0f0;
    border-radius: 10px;
    overflow: hidden;
    width: 100%;
    aspect-ratio: 1 / 1;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
`;

const ProductMainImageButton = styled.button`
    width: 100%;
    height: 100%;
    border: 0;
    border-radius: inherit;
    padding: 0;
    background: transparent;
    cursor: zoom-in;
    display: block;
`;

const ProductImagesRow = styled(Reorder.Group) <{ $touchReorderActive: boolean }>`
    display: flex;
    gap: 8px;
    overflow-x: auto;
    overflow-y: hidden;
    overscroll-behavior-x: contain;
    overscroll-behavior-y: contain;
    touch-action: ${({ $touchReorderActive }) => ($touchReorderActive ? "none" : "pan-x")};
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding-bottom: 2px;

    &::-webkit-scrollbar {
        display: none;
    }
`;

const ProductImageThumbButton = styled(Reorder.Item) <{ $active: boolean }>`
    border: 0;
    border-radius: 10px;
    padding: 0;
    overflow: hidden;
    position: relative;
    width: 72px;
    height: 72px;
    min-width: 72px;
    flex-shrink: 0;
    background: #f0f0f0;
    cursor: grab;

    &::after {
        content: "";
        position: absolute;
        inset: 0;
        border: 2px solid ${({ $active }) => ($active ? "var(--main-color)" : "transparent")};
        border-radius: inherit;
        pointer-events: none;
        box-sizing: border-box;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        pointer-events: none;
        user-select: none;
        -webkit-user-drag: none;
    }
`;

const AddPhotoThumbButton = styled.button`
    border: 1px dashed #adc3f3;
    border-radius: 10px;
    padding: 0;
    width: 72px;
    min-width: 72px;
    max-width: 72px;
    height: 72px;
    min-height: 72px;
    max-height: 72px;
    flex: 0 0 72px;
    background: #f1f5ff;
    color: var(--main-color-accent);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease;

    svg {
        width: 18px;
        height: 18px;
    }

    &:hover {
        background: #e6efff;
        border-color: #8fb0f0;
    }
`;

const ThumbDeleteButton = styled.button<{ $hidden: boolean }>`
    position: absolute;
    top: 6px;
    right: 6px;
    width: 22px;
    height: 22px;
    border-radius: 7px;
    border: 0;
    background: rgba(9, 14, 24, 0.7);
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 2;
    opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
    pointer-events: ${({ $hidden }) => ($hidden ? "none" : "auto")};
    transition: opacity 0.15s ease;

    svg {
        width: 14px;
        height: 14px;
    }
`;

const ProductImagesScrollbar = styled.div<{ $coarse: boolean }>`
    position: relative;
    width: 100%;
    height: ${({ $coarse }) => ($coarse ? "12px" : "6px")};
    background: transparent;
    margin-top: ${({ $coarse }) => ($coarse ? "6px" : "-4px")};
`;

const ProductImagesScrollbarThumb = styled.div<{ $leftPercent: number; $widthPercent: number; $coarse: boolean }>`
    position: absolute;
    top: 0;
    left: ${({ $leftPercent }) => `${$leftPercent}%`};
    width: ${({ $widthPercent }) => `${$widthPercent}%`};
    height: 100%;
    background: var(--main-color);
    min-width: ${({ $coarse }) => ($coarse ? "52px" : "32px")};
    cursor: pointer;
    touch-action: none;
    border-radius: 12px;
`;

const ErrorText = styled.span`
    color: #b52121;
    font-size: 13px;
`;

const PrimaryButton = styled.button`
    width: 100%;
    min-height: 42px;
    border-radius: 8px;
    border: none;
    background: var(--main-color);
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
        background: var(--main-color-hover);
    }
`;

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
    -webkit-overflow-scrolling: touch;
    padding: 20px;
    padding-bottom: max(20px, env(safe-area-inset-bottom));
    box-sizing: border-box;

    @media (min-width: 960px) {
        align-items: center;
        padding: 32px;
    }
`;

const ModalLayout = styled.div`
    width: min(100%, 680px);
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

const ModalProductPreviewCard = styled.section`
    background-color: #fff;
    border-radius: 14px;
    padding: 14px;
    color: #000;
`;

const ModalProductLayout = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
`;

const ModalProductImageContainer = styled.div`
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 10px;
    overflow: hidden;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
`;

const ModalProductImagesRow = styled.div`
    display: flex;
    gap: 8px;
    overflow-x: auto;
    overflow-y: hidden;
    overscroll-behavior-x: contain;
    touch-action: pan-x;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding-bottom: 2px;

    &::-webkit-scrollbar {
        display: none;
    }
`;

const ModalProductImagesScrollbar = styled.div`
    position: relative;
    width: 100%;
    height: 6px;
    background: transparent;
    margin-top: -4px;
`;

const ModalProductImagesScrollbarThumb = styled.div<{ $leftPercent: number; $widthPercent: number }>`
    position: absolute;
    top: 0;
    left: ${({ $leftPercent }) => `${$leftPercent}%`};
    width: ${({ $widthPercent }) => `${$widthPercent}%`};
    height: 100%;
    background: var(--main-color);
    min-width: 32px;
    cursor: pointer;
    touch-action: none;
    border-radius: 12px;
`;

const ModalProductThumbButton = styled.button<{ $active: boolean }>`
    border: 0;
    border-radius: 10px;
    padding: 0;
    overflow: hidden;
    position: relative;
    width: 52px;
    height: 52px;
    min-width: 52px;
    flex-shrink: 0;
    background: #f0f0f0;
    cursor: pointer;

    &::after {
        content: "";
        position: absolute;
        inset: 0;
        border: 2px solid ${({ $active }) => ($active ? "var(--main-color)" : "transparent")};
        border-radius: inherit;
        pointer-events: none;
        box-sizing: border-box;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
`;

const ModalProductInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const ModalProductPrice = styled.strong`
    font-size: 32px;
    line-height: 1.1;
    color: var(--main-color);
`;

const ModalProductTitle = styled.h4`
    margin: 0;
    font-size: 24px;
    line-height: 1.1;
    color: #111;
`;

const ModalProductDescription = styled(FormattedParagraphs)`
    font-size: 14px;
    line-height: 1.45;
    color: #444;
`;

const ModalActions = styled.div`
    display: flex;
    justify-content: flex-end;
`;

const ModalConfirmButton = styled(PrimaryButton)`
    width: auto;
    padding: 0 20px;
`;

const LightboxOverlay = styled(motion.div)`
    position: fixed;
    inset: 0;
    z-index: 1200;
    background: rgba(9, 14, 24, 0.57);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    overscroll-behavior: none;
`;

const LightboxContent = styled(motion.div)`
    position: relative;
    width: min(1100px, 100%);
    height: calc(100vh - 32px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 72px 0 18px;
`;

const LightboxMediaWrapper = styled.div`
    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
    touch-action: none;
    overscroll-behavior: none;
`;

const LightboxImage = styled(motion.img)`
    width: min(760px, 100%);
    min-width: min(320px, 100%);
    max-width: 100%;
    max-height: calc(100vh - 120px);
    object-fit: contain;
    user-select: none;
    border-radius: 14px;
    touch-action: none;
`;

const LightboxButton = styled.button`
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 0;
    background: rgba(9, 14, 24, 0.58);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 4px;
    cursor: pointer;
`;

const LightboxBottomControls = styled.div`
    width: fit-content;
    display: grid;
    grid-template-columns: 28px auto 28px;
    align-items: center;
    justify-content: center;
    gap: 14px;
    min-height: 28px;
`;

const LightboxDotsWrapper = styled.div<{ $width: number }>`
    width: ${({ $width }) => `${$width}px`};
    overflow: hidden;
    pointer-events: none;
`;

const LightboxDotsTrack = styled.div<{ $offset: number }>`
    display: flex;
    align-items: center;
    gap: 8px;
    transform: translateX(${({ $offset }) => `${$offset}px`});
    transition: transform 0.2s ease;
`;

const LightboxDot = styled.span<{ $active: boolean }>`
    width: 10px;
    height: 10px;
    min-width: 10px;
    border-radius: 999px;
    background: ${({ $active }) => ($active ? "#fff" : "rgba(255, 255, 255, 0.45)")};
`;

const LightboxCloseButton = styled.button`
    position: fixed;
    top: 16px;
    right: 16px;
    width: 52px;
    height: 52px;
    border-radius: 12px;
    border: 0;
    background: rgba(9, 14, 24, 0.58);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 1220;
    pointer-events: auto;
    transition: background-color 0.2s ease;

    &:hover {
        background: rgba(9, 14, 24, 0.72);
    }

    svg {
        width: 20px;
        height: 20px;
    }
`;

type ProductForm = {
    name: string;
    description: string;
    price: string;
    images: SellerProductImage[];
    coverImageId: string;
};

type AdminProductComposerProps = {
    initialForm?: ProductForm;
    shellTitle?: string;
    formTitle?: string;
    formDescription?: string;
    submitLabel?: string;
    onSubmitForm?: (form: ProductForm) => Promise<void>;
};

type UploadZoneDragEvent = {
    dataTransfer?: DataTransfer | null;
};

const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });

const lightboxImageVariants = {
    enter: (direction: 1 | -1) => ({ opacity: 0, x: direction > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (direction: 1 | -1) => ({ opacity: 0, x: direction > 0 ? -60 : 60 }),
};

export const AdminProductCreatePage = ({
    initialForm,
    shellTitle = "Новый товар",
    formTitle = "Форма создания товара",
    formDescription = "Заполните карточку товара. После сохранения он автоматически отправится на модерацию.",
    submitLabel = "Создать товар",
    onSubmitForm,
}: AdminProductComposerProps = {}) => {
    const router = useRouter();
    const createProduct = async () => { };
    const [form, setForm] = useState<ProductForm>({
        name: "",
        description: "",
        price: "",
        images: [],
        coverImageId: "",
    });
    const [error, setError] = useState("");
    const [pageActiveImageIndex, setPageActiveImageIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxActiveImageIndex, setLightboxActiveImageIndex] = useState(0);
    const [lightboxDirection, setLightboxDirection] = useState<1 | -1>(1);
    const imagesRowRef = useRef<HTMLDivElement | null>(null);
    const scrollbarTrackRef = useRef<HTMLDivElement | null>(null);
    const dragStateRef = useRef({ dragging: false, startX: 0, startScrollLeft: 0 });
    const suppressNextImageSelectRef = useRef(false);
    const suppressResetTimeoutRef = useRef<number | null>(null);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [scrollMetrics, setScrollMetrics] = useState({ clientWidth: 1, scrollWidth: 1 });
    const [isReorderDragging, setReorderDragging] = useState(false);
    const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
    const [isCoarsePointer, setCoarsePointer] = useState(false);
    const [isUploadZoneFileDragOver, setUploadZoneFileDragOver] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isSaving, setSaving] = useState(false);
    const [confirmPreviewImageIndex, setConfirmPreviewImageIndex] = useState(0);
    const confirmImagesRowRef = useRef<HTMLDivElement | null>(null);
    const confirmScrollbarTrackRef = useRef<HTMLDivElement | null>(null);
    const confirmScrollbarDragRef = useRef({ dragging: false, startX: 0, startScrollLeft: 0 });
    const [confirmScrollLeft, setConfirmScrollLeft] = useState(0);
    const [confirmScrollMetrics, setConfirmScrollMetrics] = useState({ clientWidth: 1, scrollWidth: 1 });
    const uploadZoneDragCounterRef = useRef(0);

    useEffect(() => {
        if (!initialForm) {
            return;
        }
        setForm(initialForm);
    }, [initialForm]);

    const appendImages = async (files: File[]) => {
        const accepted = files.filter((file) => file.type.startsWith("image/") && file.size <= 4 * 1024 * 1024);
        if (accepted.length === 0) {
            return;
        }
        const converted = await Promise.all(
            accepted.map(async (file, index) => ({
                id: `${Date.now()}-${index}`,
                url: await readFileAsDataUrl(file),
            }))
        );
        setForm((prev) => ({
            ...prev,
            images: [...prev.images, ...converted],
            coverImageId: prev.coverImageId || converted[0]?.id || "",
        }));
    };

    const reorderImages = (from: number, to: number) => {
        if (from === to || from < 0 || to < 0 || from >= form.images.length || to >= form.images.length) {
            return;
        }
        setForm((prev) => {
            const nextImages = [...prev.images];
            const [moved] = nextImages.splice(from, 1);
            nextImages.splice(to, 0, moved);
            return {
                ...prev,
                images: nextImages,
            };
        });
        setPageActiveImageIndex((prevActive) => {
            if (prevActive === from) {
                return to;
            }
            if (from < to && prevActive > from && prevActive <= to) {
                return prevActive - 1;
            }
            if (from > to && prevActive >= to && prevActive < from) {
                return prevActive + 1;
            }
            return prevActive;
        });
    };

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        accept: { "image/*": [] },
        multiple: true,
        noClick: true,
        noDragEventsBubbling: true,
        onDrop: (files) => {
            if (files.length === 0) {
                return;
            }
            void appendImages(files);
            setUploadZoneFileDragOver(false);
            uploadZoneDragCounterRef.current = 0;
        },
    });

    const validationError = useMemo(() => {
        if (!form.name.trim()) {
            return "Название обязательно";
        }
        if (!form.description.trim()) {
            return "Описание обязательно";
        }
        if (!Number.isFinite(Number(form.price)) || Number(form.price) <= 0) {
            return "Цена должна быть больше 0";
        }
        if (form.images.length === 0) {
            return "Добавьте хотя бы одно изображение";
        }
        return "";
    }, [form]);

    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) {
            return;
        }
        const mediaQuery = window.matchMedia("(pointer: coarse)");
        const syncPointerMode = () => {
            setCoarsePointer(mediaQuery.matches);
        };
        syncPointerMode();
        mediaQuery.addEventListener("change", syncPointerMode);
        return () => mediaQuery.removeEventListener("change", syncPointerMode);
    }, []);

    useEffect(() => {
        const resetDrag = () => {
            setReorderDragging(false);
            setDraggedImageId(null);
            setUploadZoneFileDragOver(false);
            uploadZoneDragCounterRef.current = 0;
        };
        window.addEventListener("drop", resetDrag);
        window.addEventListener("dragend", resetDrag);
        return () => {
            window.removeEventListener("drop", resetDrag);
            window.removeEventListener("dragend", resetDrag);
        };
    }, []);

    useEffect(() => {
        return () => {
            if (suppressResetTimeoutRef.current !== null) {
                window.clearTimeout(suppressResetTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (pageActiveImageIndex > form.images.length - 1) {
            setPageActiveImageIndex(Math.max(0, form.images.length - 1));
        }
    }, [form.images.length, pageActiveImageIndex]);

    useEffect(() => {
        const node = imagesRowRef.current;
        if (!node) {
            return;
        }
        const syncMetrics = () => {
            setScrollLeft(node.scrollLeft);
            setScrollMetrics({ clientWidth: node.clientWidth || 1, scrollWidth: node.scrollWidth || 1 });
        };
        syncMetrics();
        node.addEventListener("scroll", syncMetrics);
        window.addEventListener("resize", syncMetrics);
        return () => {
            node.removeEventListener("scroll", syncMetrics);
            window.removeEventListener("resize", syncMetrics);
        };
    }, [form.images.length]);

    useEffect(() => {
        const node = imagesRowRef.current;
        if (!node) {
            return;
        }

        const onWheel = (event: WheelEvent) => {
            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
                return;
            }
            event.preventDefault();
            node.scrollLeft += event.deltaY;
        };

        node.addEventListener("wheel", onWheel, { passive: false });
        return () => {
            node.removeEventListener("wheel", onWheel);
        };
    }, [form.images.length]);

    const thumbWidthPercent = Math.min(100, (scrollMetrics.clientWidth / scrollMetrics.scrollWidth) * 100);
    const maxScrollLeft = Math.max(0, scrollMetrics.scrollWidth - scrollMetrics.clientWidth);
    const hasHorizontalOverflow = maxScrollLeft > 0;
    const thumbLeftPercent = maxScrollLeft > 0 ? (scrollLeft / maxScrollLeft) * (100 - thumbWidthPercent) : 0;
    const hasMultipleImages = form.images.length > 1;
    const activeImage = form.images[pageActiveImageIndex]?.url ?? "";

    useEffect(() => {
        const onPointerMove = (event: PointerEvent) => {
            if (!dragStateRef.current.dragging) {
                return;
            }
            const trackNode = scrollbarTrackRef.current;
            const imagesNode = imagesRowRef.current;
            if (!trackNode || !imagesNode) {
                return;
            }
            const deltaX = event.clientX - dragStateRef.current.startX;
            const trackWidth = trackNode.getBoundingClientRect().width;
            const thumbWidthPx = Math.max(32, (thumbWidthPercent / 100) * trackWidth);
            const maxThumbLeft = Math.max(1, trackWidth - thumbWidthPx);
            const scrollPerPx = maxScrollLeft / maxThumbLeft;
            const nextScrollLeft = dragStateRef.current.startScrollLeft + deltaX * scrollPerPx;
            imagesNode.scrollLeft = Math.min(Math.max(nextScrollLeft, 0), maxScrollLeft);
        };
        const onPointerUp = () => {
            dragStateRef.current.dragging = false;
        };
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
        return () => {
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
        };
    }, [maxScrollLeft, thumbWidthPercent]);

    const onPrevImage = () => {
        if (!hasMultipleImages) {
            return;
        }
        setLightboxDirection(-1);
        setLightboxActiveImageIndex((prev) => (prev - 1 + form.images.length) % form.images.length);
    };

    const onNextImage = () => {
        if (!hasMultipleImages) {
            return;
        }
        setLightboxDirection(1);
        setLightboxActiveImageIndex((prev) => (prev + 1) % form.images.length);
    };

    const onLightboxDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (!hasMultipleImages) {
            return;
        }
        if (info.offset.x <= -60 || info.velocity.x <= -500) {
            onNextImage();
            return;
        }
        if (info.offset.x >= 60 || info.velocity.x >= 500) {
            onPrevImage();
        }
    };

    const visibleDotsCount = Math.min(5, form.images.length);
    const dotStep = 18;
    const maxWindowStart = Math.max(0, form.images.length - visibleDotsCount);
    const centeredStart = lightboxActiveImageIndex - Math.floor(visibleDotsCount / 2);
    const visibleStartIndex = Math.min(Math.max(centeredStart, 0), maxWindowStart);
    const dotsOffset = -(visibleStartIndex * dotStep);
    const dotsViewportWidth = visibleDotsCount * 10 + Math.max(0, visibleDotsCount - 1) * 8;
    const isExternalFileDragActive = isDragActive || isUploadZoneFileDragOver;
    const previewImages = form.images.map((image) => image.url);
    const previewTitle = form.name.trim() || "Товар без названия";
    const previewDescription = form.description.trim() || "Добавьте описание, чтобы покупатель лучше понял преимущества товара.";
    const previewPrice = Number.isFinite(Number(form.price)) && Number(form.price) > 0 ? `${Math.round(Number(form.price))} ₽` : "Цена не указана";
    const previewImage =
        previewImages[confirmPreviewImageIndex] ??
        form.images.find((image) => image.id === form.coverImageId)?.url ??
        previewImages[0] ??
        "https://placeholdpicsum.dev/photo/720/720?seed=admin-product-preview";
    const confirmThumbWidthPercent = Math.min(100, (confirmScrollMetrics.clientWidth / confirmScrollMetrics.scrollWidth) * 100);
    const confirmMaxScrollLeft = Math.max(0, confirmScrollMetrics.scrollWidth - confirmScrollMetrics.clientWidth);
    const confirmHasHorizontalOverflow = confirmMaxScrollLeft > 0;
    const confirmThumbLeftPercent =
        confirmMaxScrollLeft > 0 ? (confirmScrollLeft / confirmMaxScrollLeft) * (100 - confirmThumbWidthPercent) : 0;

    const handleUploadZoneDragEnter = (event: UploadZoneDragEvent) => {
        if (!event.dataTransfer?.types.includes("Files")) {
            return;
        }
        uploadZoneDragCounterRef.current += 1;
        if (!isUploadZoneFileDragOver) {
            setUploadZoneFileDragOver(true);
        }
    };

    useEffect(() => {
        if (!lightboxOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        const previousOverscrollBehavior = document.body.style.overscrollBehavior;
        document.body.style.overflow = "hidden";
        document.body.style.overscrollBehavior = "none";

        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.style.overscrollBehavior = previousOverscrollBehavior;
        };
    }, [lightboxOpen]);

    useEffect(() => {
        if (!isConfirmModalOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        const previousOverscrollBehavior = document.body.style.overscrollBehavior;
        document.body.style.overflow = "hidden";
        document.body.style.overscrollBehavior = "none";

        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.style.overscrollBehavior = previousOverscrollBehavior;
        };
    }, [isConfirmModalOpen]);

    useEffect(() => {
        const node = confirmImagesRowRef.current;
        if (!node) {
            return;
        }

        const onWheel = (event: WheelEvent) => {
            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
                return;
            }
            event.preventDefault();
            node.scrollLeft += event.deltaY;
        };

        node.addEventListener("wheel", onWheel, { passive: false });
        return () => {
            node.removeEventListener("wheel", onWheel);
        };
    }, [previewImages.length, isConfirmModalOpen]);

    useEffect(() => {
        const node = confirmImagesRowRef.current;
        if (!node) {
            return;
        }
        const syncMetrics = () => {
            setConfirmScrollLeft(node.scrollLeft);
            setConfirmScrollMetrics({
                clientWidth: node.clientWidth || 1,
                scrollWidth: node.scrollWidth || 1,
            });
        };
        syncMetrics();
        node.addEventListener("scroll", syncMetrics);
        window.addEventListener("resize", syncMetrics);
        return () => {
            node.removeEventListener("scroll", syncMetrics);
            window.removeEventListener("resize", syncMetrics);
        };
    }, [previewImages.length, isConfirmModalOpen]);

    useEffect(() => {
        const onPointerMove = (event: PointerEvent) => {
            if (!confirmScrollbarDragRef.current.dragging) {
                return;
            }
            const trackNode = confirmScrollbarTrackRef.current;
            const imagesNode = confirmImagesRowRef.current;
            if (!trackNode || !imagesNode) {
                return;
            }
            const maxScrollLeft = Math.max(0, confirmScrollMetrics.scrollWidth - confirmScrollMetrics.clientWidth);
            const deltaX = event.clientX - confirmScrollbarDragRef.current.startX;
            const trackWidth = trackNode.getBoundingClientRect().width;
            const thumbWidthPercent = Math.min(100, (confirmScrollMetrics.clientWidth / confirmScrollMetrics.scrollWidth) * 100);
            const thumbWidthPx = Math.max(32, (thumbWidthPercent / 100) * trackWidth);
            const maxThumbLeft = Math.max(1, trackWidth - thumbWidthPx);
            const scrollPerPx = maxScrollLeft / maxThumbLeft;
            const nextScrollLeft = confirmScrollbarDragRef.current.startScrollLeft + deltaX * scrollPerPx;
            imagesNode.scrollLeft = Math.min(Math.max(nextScrollLeft, 0), maxScrollLeft);
        };
        const onPointerUp = () => {
            confirmScrollbarDragRef.current.dragging = false;
        };
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
        return () => {
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
        };
    }, [confirmScrollMetrics.clientWidth, confirmScrollMetrics.scrollWidth]);

    return (
        <>
            <SetAdminChrome title={shellTitle} />
            <FormCard>
                <FormTitle>{formTitle}</FormTitle>
                <FormDescription>{formDescription}</FormDescription>
                <Form
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (validationError) {
                            setError(validationError);
                            return;
                        }
                        setError("");
                        setConfirmPreviewImageIndex(
                            Math.max(
                                0,
                                form.images.findIndex((image) => image.id === form.coverImageId)
                            )
                        );
                        setConfirmModalOpen(true);
                    }}
                >
                    <FieldGroup>
                        <FieldLabel htmlFor="product-name">
                            Название товара <RequiredMark>*</RequiredMark>
                        </FieldLabel>
                        <InputWithIconWrap>
                            <Type aria-hidden />
                            <TextInput
                                id="product-name"
                                value={form.name}
                                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                                placeholder="Введите название товара"
                                required
                            />
                        </InputWithIconWrap>
                    </FieldGroup>

                    <FieldGroup>
                        <FieldLabel htmlFor="product-description">
                            Описание товара <RequiredMark>*</RequiredMark>
                        </FieldLabel>
                        <TextareaInput
                            id="product-description"
                            value={form.description}
                            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                            placeholder="Расскажите о составе, размерах и особенностях. Enter — новый абзац."
                            required
                        />
                    </FieldGroup>

                    <FieldGroup>
                        <FieldLabel htmlFor="product-price">
                            Цена, ₽ <RequiredMark>*</RequiredMark>
                        </FieldLabel>
                        <NumberInput
                            id="product-price"
                            type="number"
                            min={1}
                            value={form.price}
                            onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                            placeholder="Например, 3200"
                            required
                        />
                    </FieldGroup>

                    <FieldGroup>
                        <FieldLabel htmlFor="product-upload">
                            Изображения товара <RequiredMark>*</RequiredMark>
                        </FieldLabel>
                        <UploadZone
                            {...getRootProps({
                                onDragEnter: handleUploadZoneDragEnter,
                                onDragLeave: () => {
                                    uploadZoneDragCounterRef.current = Math.max(0, uploadZoneDragCounterRef.current - 1);
                                    if (uploadZoneDragCounterRef.current === 0) {
                                        setUploadZoneFileDragOver(false);
                                    }
                                },
                                onDrop: () => {
                                    setUploadZoneFileDragOver(false);
                                    uploadZoneDragCounterRef.current = 0;
                                },
                            })}
                            $isDragOver={isExternalFileDragActive}
                        >
                            <input {...getInputProps()} id="product-upload" />
                            {isUploadZoneFileDragOver ? (
                                <DragOverlay $isTargeted={isExternalFileDragActive}>
                                    <DragOverlayContent>
                                        <Upload aria-hidden />
                                        Перетащите изображения сюда
                                    </DragOverlayContent>
                                </DragOverlay>
                            ) : null}
                            {form.images.length === 0 ? (
                                <UploadPreview>
                                    <AddPhotoThumbButton type="button" onClick={open} aria-label="Загрузить изображения товара">
                                        <Upload aria-hidden />
                                    </AddPhotoThumbButton>
                                </UploadPreview>
                            ) : null}
                            {form.images.length > 0 ? (
                                <ImagesRailCard>
                                    <ProductImageContainerWrapper>
                                        <ProductMainImageButton
                                            type="button"
                                            onClick={() => {
                                                setLightboxActiveImageIndex(pageActiveImageIndex);
                                                setLightboxOpen(true);
                                            }}
                                            aria-label="Открыть фото в полном размере"
                                        >
                                            <img src={activeImage} alt={form.name || "Изображение товара"} />
                                        </ProductMainImageButton>
                                    </ProductImageContainerWrapper>
                                    <ProductImagesRow
                                        ref={imagesRowRef}
                                        axis="x"
                                        values={form.images}
                                        onReorder={(nextImages) => {
                                            const typedNextImages = nextImages as SellerProductImage[];
                                            const activeImageId = form.images[pageActiveImageIndex]?.id;
                                            setForm((prev) => ({ ...prev, images: typedNextImages }));
                                            suppressNextImageSelectRef.current = true;
                                            if (suppressResetTimeoutRef.current !== null) {
                                                window.clearTimeout(suppressResetTimeoutRef.current);
                                            }
                                            suppressResetTimeoutRef.current = window.setTimeout(() => {
                                                suppressNextImageSelectRef.current = false;
                                                suppressResetTimeoutRef.current = null;
                                            }, 450);
                                            if (!activeImageId) {
                                                return;
                                            }
                                            const nextActiveIndex = typedNextImages.findIndex((image) => image.id === activeImageId);
                                            if (nextActiveIndex >= 0) {
                                                setPageActiveImageIndex(nextActiveIndex);
                                            }
                                        }}
                                        $touchReorderActive={isReorderDragging}
                                    >
                                        {form.images.map((image, index) => (
                                            <ProductImageThumbButton
                                                key={image.id}
                                                value={image}
                                                drag="x"
                                                $active={index === pageActiveImageIndex}
                                                onDragStart={() => {
                                                    setReorderDragging(true);
                                                    setDraggedImageId(image.id);
                                                    suppressNextImageSelectRef.current = true;
                                                }}
                                                onDragEnd={() => {
                                                    setReorderDragging(false);
                                                    setDraggedImageId(null);
                                                }}
                                                animate={{
                                                    scale: draggedImageId === image.id ? 1 : 1,
                                                    boxShadow: draggedImageId === image.id ? "0 0 0 rgba(0, 0, 0, 0)" : "0 0 0 rgba(0, 0, 0, 0)",
                                                }}
                                                whileDrag={{
                                                    scale: 1.06,
                                                    zIndex: 30,
                                                    boxShadow: "0 12px 28px rgba(9, 14, 24, 0.28)",
                                                }}
                                                onClick={() => {
                                                    if (suppressNextImageSelectRef.current) {
                                                        suppressNextImageSelectRef.current = false;
                                                        return;
                                                    }
                                                    setPageActiveImageIndex(index);
                                                    setForm((prev) => ({ ...prev, coverImageId: image.id }));
                                                }}
                                                aria-label={`Показать изображение ${index + 1}`}
                                            >
                                                <img src={image.url} alt={`Фото ${index + 1}`} />
                                                <ThumbDeleteButton
                                                    $hidden={isReorderDragging}
                                                    type="button"
                                                    aria-label="Удалить изображение"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        return setForm((prev) => {
                                                            const next = prev.images.filter((item) => item.id !== image.id);
                                                            return {
                                                                ...prev,
                                                                images: next,
                                                                coverImageId: prev.coverImageId === image.id ? next[0]?.id ?? "" : prev.coverImageId,
                                                            };
                                                        });
                                                    }}
                                                >
                                                    <X />
                                                </ThumbDeleteButton>
                                            </ProductImageThumbButton>
                                        ))}
                                        <AddPhotoThumbButton type="button" onClick={open} aria-label="Добавить фотографии">
                                            <Upload aria-hidden />
                                        </AddPhotoThumbButton>
                                    </ProductImagesRow>
                                    {hasHorizontalOverflow ? (
                                        <ProductImagesScrollbar ref={scrollbarTrackRef} $coarse={isCoarsePointer}>
                                            <ProductImagesScrollbarThumb
                                                $leftPercent={thumbLeftPercent}
                                                $widthPercent={thumbWidthPercent}
                                                $coarse={isCoarsePointer}
                                                onPointerDown={(event) => {
                                                    event.preventDefault();
                                                    dragStateRef.current = {
                                                        dragging: true,
                                                        startX: event.clientX,
                                                        startScrollLeft: scrollLeft,
                                                    };
                                                }}
                                            />
                                        </ProductImagesScrollbar>
                                    ) : null}
                                </ImagesRailCard>
                            ) : null}
                        </UploadZone>
                    </FieldGroup>

                    {(error || validationError) ? <ErrorText>{error || validationError}</ErrorText> : null}
                    <PrimaryButton type="submit">{submitLabel}</PrimaryButton>
                </Form>
            </FormCard>
            <ModalOverlay $isOpen={isConfirmModalOpen} onClick={() => (!isSaving ? setConfirmModalOpen(false) : undefined)}>
                <ModalLayout onClick={(event) => event.stopPropagation()}>
                    <ModalCard>
                        <ModalCloseButton
                            type="button"
                            aria-label="Закрыть модальное окно"
                            onClick={() => {
                                if (!isSaving) {
                                    setConfirmModalOpen(false);
                                }
                            }}
                        >
                            <X size={16} />
                        </ModalCloseButton>
                        <ModalTitle>Сохранить товар?</ModalTitle>
                        <ModalText>Проверьте превью карточки товара перед сохранением.</ModalText>
                        <ModalProductPreviewCard>
                            <ModalProductLayout>
                                <ModalProductImageContainer>
                                    <img src={previewImage} alt={`Превью товара ${previewTitle}`} />
                                </ModalProductImageContainer>
                                {previewImages.length > 1 ? (
                                    <>
                                        <ModalProductImagesRow ref={confirmImagesRowRef}>
                                            {previewImages.map((image, index) => (
                                                <ModalProductThumbButton
                                                    key={`confirm-preview-${index}`}
                                                    type="button"
                                                    $active={index === confirmPreviewImageIndex}
                                                    onClick={() => setConfirmPreviewImageIndex(index)}
                                                    aria-label={`Показать изображение ${index + 1}`}
                                                >
                                                    <img src={image} alt={`Миниатюра ${index + 1}`} />
                                                </ModalProductThumbButton>
                                            ))}
                                        </ModalProductImagesRow>
                                        {confirmHasHorizontalOverflow ? (
                                            <ModalProductImagesScrollbar ref={confirmScrollbarTrackRef}>
                                                <ModalProductImagesScrollbarThumb
                                                    $leftPercent={confirmThumbLeftPercent}
                                                    $widthPercent={confirmThumbWidthPercent}
                                                    onPointerDown={(event) => {
                                                        event.preventDefault();
                                                        confirmScrollbarDragRef.current = {
                                                            dragging: true,
                                                            startX: event.clientX,
                                                            startScrollLeft: confirmScrollLeft,
                                                        };
                                                    }}
                                                />
                                            </ModalProductImagesScrollbar>
                                        ) : null}
                                    </>
                                ) : null}
                                <ModalProductInfo>
                                    <ModalProductPrice>{previewPrice}</ModalProductPrice>
                                    <ModalProductTitle>{previewTitle}</ModalProductTitle>
                                    <ModalProductDescription text={previewDescription} />
                                </ModalProductInfo>
                            </ModalProductLayout>
                        </ModalProductPreviewCard>
                        <ModalActions>
                            <ModalConfirmButton
                                type="button"
                                disabled={isSaving}
                                onClick={() => {
                                    if (validationError) {
                                        setError(validationError);
                                        setConfirmModalOpen(false);
                                        return;
                                    }
                                    setSaving(true);
                                    const submitPromise = onSubmitForm
                                        ? onSubmitForm(form)
                                        : createProduct({
                                            name: form.name.trim(),
                                            description: form.description.trim(),
                                            price: Number(form.price),
                                            images: form.images,
                                            coverImageId: form.coverImageId,
                                        });
                                    void submitPromise
                                        .then(() => {
                                            setConfirmModalOpen(false);
                                            router.push("/admin/products");
                                        })
                                        .finally(() => setSaving(false));
                                }}
                            >
                                {isSaving ? "Сохраняем..." : "Да, сохранить"}
                            </ModalConfirmButton>
                        </ModalActions>
                    </ModalCard>
                </ModalLayout>
            </ModalOverlay>
            <AnimatePresence>
                {lightboxOpen ? (
                    <LightboxOverlay
                        role="dialog"
                        aria-modal="true"
                        aria-label="Просмотр изображений товара"
                        onClick={() => setLightboxOpen(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <LightboxContent
                            onClick={(event) => event.stopPropagation()}
                            initial={{ opacity: 0, y: 14, scale: 0.985 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.985 }}
                            transition={{ duration: 0.24, ease: "easeOut" }}
                        >
                            <LightboxMediaWrapper onClick={() => setLightboxOpen(false)}>
                                <AnimatePresence mode="wait" initial={false} custom={lightboxDirection}>
                                    <LightboxImage
                                        key={`create-lightbox-${lightboxActiveImageIndex}`}
                                        src={form.images[lightboxActiveImageIndex]?.url ?? ""}
                                        alt={form.name || "Изображение товара"}
                                        onClick={(event) => event.stopPropagation()}
                                        drag={hasMultipleImages ? "x" : false}
                                        dragConstraints={{ left: 0, right: 0 }}
                                        dragElastic={0.16}
                                        onDragEnd={onLightboxDragEnd}
                                        variants={lightboxImageVariants}
                                        custom={lightboxDirection}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ duration: 0.26, ease: "easeOut" }}
                                    />
                                </AnimatePresence>
                            </LightboxMediaWrapper>
                            {hasMultipleImages ? (
                                <LightboxBottomControls>
                                    <LightboxButton type="button" aria-label="Предыдущее изображение" onClick={onPrevImage}>
                                        <ChevronLeft />
                                    </LightboxButton>
                                    <LightboxDotsWrapper $width={dotsViewportWidth} aria-hidden="true">
                                        <LightboxDotsTrack $offset={dotsOffset}>
                                            {form.images.map((image, index) => (
                                                <LightboxDot key={`create-lightbox-dot-${image.id}`} $active={index === lightboxActiveImageIndex} />
                                            ))}
                                        </LightboxDotsTrack>
                                    </LightboxDotsWrapper>
                                    <LightboxButton type="button" aria-label="Следующее изображение" onClick={onNextImage}>
                                        <ChevronRight />
                                    </LightboxButton>
                                </LightboxBottomControls>
                            ) : null}
                        </LightboxContent>
                    </LightboxOverlay>
                ) : null}
            </AnimatePresence>
            {lightboxOpen ? (
                <LightboxCloseButton
                    type="button"
                    aria-label="Закрыть просмотр"
                    onClick={(event) => {
                        event.stopPropagation();
                        setLightboxOpen(false);
                    }}
                >
                    <X />
                </LightboxCloseButton>
            ) : null}
        </>
    );
};
