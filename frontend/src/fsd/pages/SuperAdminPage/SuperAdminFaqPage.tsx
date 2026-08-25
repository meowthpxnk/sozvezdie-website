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
import { Eye, EyeOff, GripVertical, Pencil, Plus, Trash2, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { type FaqItem, type FaqItemPayload } from "@entities/faq";
import { superAdminService } from "@entities/super-admin";
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
    min-height: 96px;
    border-radius: 8px;
    border: 1px solid #d7ddea;
    padding: 10px 12px;
    font-size: 14px;
    color: #132647;
    resize: vertical;
`;

const SearchInput = styled(Input)`
    min-height: 42px;
    border-radius: 10px;
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

const SecondaryButton = styled.button`
    min-height: 42px;
    padding: 0 18px;
    border: 1px solid #d7ddea;
    border-radius: 10px;
    background: #fff;
    color: #2d3a54;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const EditButton = styled(IconActionButton).attrs({ $active: true })``;

const PublishButton = styled(IconActionButton).attrs({ $active: true })`
    background: #e8f5e9;
    border-color: #c8e6c9;
    color: #2e7d32;

    &:hover {
        background: #dcedc8;
        border-color: #a5d6a7;
    }
`;

const UnpublishButton = styled(IconActionButton).attrs({ $active: true })`
    background: #fff3e0;
    border-color: #ffe0b2;
    color: #ef6c00;

    &:hover {
        background: #ffe0b2;
        border-color: #ffcc80;
    }
`;

const DeleteButton = styled(IconActionButton).attrs({ $active: true })`
    background: #dc3545;
    border-color: #dc3545;
    color: #fff;

    &:hover {
        background: #c82333;
        border-color: #c82333;
    }
`;

const FaqList = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
`;

const FaqListItem = styled.li<{ $isDragging?: boolean; $isDropTarget?: boolean }>`
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

const StaticFaqList = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
`;

const StaticFaqListItem = styled.li`
    display: flex;
    align-items: center;
    gap: 10px;
    background: #f6f7f9;
    border-radius: 10px;
    padding: 12px 14px;
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

const QuestionBlock = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const QuestionText = styled.span`
    font-size: 15px;
    font-weight: 600;
    color: #1f2430;
    line-height: 1.35;
`;

const StatusBadge = styled.span<{ $published: boolean }>`
    display: inline-flex;
    align-items: center;
    width: fit-content;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: ${({ $published }) => ($published ? "#2e7d32" : "#8b5a00")};
    background: ${({ $published }) => ($published ? "#e8f5e9" : "#fff8e1")};
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
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
`;

const AddFaqButton = styled.button`
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

type FaqFormState = {
    question: string;
    answer: string;
};

const emptyForm = (): FaqFormState => ({
    question: "",
    answer: "",
});

function toPayload(form: FaqFormState, isPublished: boolean): FaqItemPayload {
    return {
        question: form.question.trim(),
        answer: form.answer.trim(),
        isPublished,
    };
}

type FaqRowProps = {
    item: FaqItem;
    draggable?: boolean;
    onDragHandleStart?: (event: DragEvent<HTMLSpanElement>) => void;
    onDragHandleEnd?: () => void;
    onEdit: (item: FaqItem) => void;
    onTogglePublish: (item: FaqItem) => void;
    onDelete: (itemId: number) => void;
    toggleDisabled: boolean;
    deleteDisabled: boolean;
};

type FaqFormModalProps = {
    isOpen: boolean;
    title: string;
    form: FaqFormState;
    isPending: boolean;
    mode: "create" | "edit";
    isPublished?: boolean;
    onClose: () => void;
    onSaveDraft: () => void;
    onPublish: () => void;
    onUnpublish?: () => void;
    onChange: (next: FaqFormState) => void;
};

function FaqFormModal({
    isOpen,
    title,
    form,
    isPending,
    mode,
    isPublished = false,
    onClose,
    onSaveDraft,
    onPublish,
    onUnpublish,
    onChange,
}: FaqFormModalProps) {
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
                    Вопрос
                    <Input
                        value={form.question}
                        onChange={(event) =>
                            onChange({ ...form, question: event.target.value })
                        }
                        placeholder="Как оформить заказ?"
                    />
                </Field>
                <Field>
                    Ответ
                    <Textarea
                        value={form.answer}
                        onChange={(event) => onChange({ ...form, answer: event.target.value })}
                    />
                </Field>
                <ModalActions>
                    {mode === "create" ? (
                        <>
                            <SecondaryButton
                                type="button"
                                disabled={isPending}
                                onClick={onSaveDraft}
                            >
                                Сохранить черновик
                            </SecondaryButton>
                            <PrimaryButton type="button" disabled={isPending} onClick={onPublish}>
                                Опубликовать
                            </PrimaryButton>
                        </>
                    ) : (
                        <>
                            {isPublished ? (
                                <SecondaryButton
                                    type="button"
                                    disabled={isPending}
                                    onClick={onUnpublish}
                                >
                                    Снять с публикации
                                </SecondaryButton>
                            ) : (
                                <SecondaryButton
                                    type="button"
                                    disabled={isPending}
                                    onClick={onSaveDraft}
                                >
                                    Сохранить черновик
                                </SecondaryButton>
                            )}
                            <PrimaryButton
                                type="button"
                                disabled={isPending}
                                onClick={isPublished ? onSaveDraft : onPublish}
                            >
                                {isPublished ? "Сохранить" : "Опубликовать"}
                            </PrimaryButton>
                        </>
                    )}
                </ModalActions>
            </ModalCard>
        </ModalOverlay>
    );
}

function FaqRowContent({
    item,
    draggable = false,
    onDragHandleStart,
    onDragHandleEnd,
    onEdit,
    onTogglePublish,
    onDelete,
    toggleDisabled,
    deleteDisabled,
}: FaqRowProps) {
    return (
        <>
            {draggable ? (
                <DragHandle
                    aria-hidden
                    draggable
                    onDragStart={onDragHandleStart}
                    onDragEnd={onDragHandleEnd}
                >
                    <GripVertical size={18} />
                </DragHandle>
            ) : null}
            <QuestionBlock>
                <QuestionText>{item.question}</QuestionText>
                <StatusBadge $published={item.isPublished}>
                    {item.isPublished ? "Опубликован" : "Черновик"}
                </StatusBadge>
            </QuestionBlock>
            <SideActions>
                {item.isPublished ? (
                    <UnpublishButton
                        type="button"
                        aria-label={`Снять с публикации: ${item.question}`}
                        disabled={toggleDisabled}
                        onClick={(event) => {
                            event.stopPropagation();
                            onTogglePublish(item);
                        }}
                    >
                        <EyeOff size={14} />
                    </UnpublishButton>
                ) : (
                    <PublishButton
                        type="button"
                        aria-label={`Опубликовать: ${item.question}`}
                        disabled={toggleDisabled}
                        onClick={(event) => {
                            event.stopPropagation();
                            onTogglePublish(item);
                        }}
                    >
                        <Eye size={14} />
                    </PublishButton>
                )}
                <EditButton
                    type="button"
                    aria-label={`Редактировать: ${item.question}`}
                    onClick={(event) => {
                        event.stopPropagation();
                        onEdit(item);
                    }}
                >
                    <Pencil size={14} />
                </EditButton>
                <DeleteButton
                    type="button"
                    aria-label={`Удалить: ${item.question}`}
                    disabled={deleteDisabled}
                    onClick={(event) => {
                        event.stopPropagation();
                        onDelete(item.id);
                    }}
                >
                    <Trash2 size={14} />
                </DeleteButton>
            </SideActions>
        </>
    );
}

export function SuperAdminFaqPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [createForm, setCreateForm] = useState<FaqFormState>(emptyForm);
    const [orderedItems, setOrderedItems] = useState<FaqItem[]>([]);
    const [editingItem, setEditingItem] = useState<FaqItem | null>(null);
    const [editForm, setEditForm] = useState<FaqFormState>(emptyForm);
    const pendingReorderRef = useRef<FaqItem[] | null>(null);
    const isDraggingRef = useRef(false);
    const [draggedItemId, setDraggedItemId] = useState<number | null>(null);
    const [dropTargetId, setDropTargetId] = useState<number | null>(null);

    const trimmedSearch = search.trim();
    const isSearchActive = trimmedSearch.length > 0;

    const faqQuery = useQuery({
        queryKey: ["super-admin", "faq", trimmedSearch],
        queryFn: () => superAdminService.getFaqItems(trimmedSearch || undefined),
    });

    const items = faqQuery.data ?? [];

    useEffect(() => {
        if (!isSearchActive && !isDraggingRef.current) {
            setOrderedItems(items);
        }
    }, [items, isSearchActive]);

    const invalidate = async () => {
        await queryClient.invalidateQueries({ queryKey: ["super-admin", "faq"] });
        await queryClient.invalidateQueries({ queryKey: ["faq"] });
    };

    const createMutation = useMutation({
        mutationFn: (isPublished: boolean) =>
            superAdminService.createFaqItem(toPayload(createForm, isPublished)),
        onSuccess: async (_data, isPublished) => {
            setCreateModalOpen(false);
            setCreateForm(emptyForm());
            await invalidate();
            toast.success(isPublished ? "Вопрос опубликован" : "Черновик сохранён");
        },
        onError: () => toast.error("Не удалось сохранить вопрос"),
    });

    const updateMutation = useMutation({
        mutationFn: (isPublished: boolean) => {
            if (!editingItem) {
                throw new Error("Вопрос не выбран");
            }
            return superAdminService.updateFaqItem(
                editingItem.id,
                toPayload(editForm, isPublished)
            );
        },
        onSuccess: async (data) => {
            setEditingItem(null);
            setEditForm(emptyForm());
            await invalidate();
            toast.success(data.isPublished ? "Вопрос сохранён" : "Черновик сохранён");
        },
        onError: () => toast.error("Не удалось обновить вопрос"),
    });

    const togglePublishMutation = useMutation({
        mutationFn: (item: FaqItem) =>
            superAdminService.updateFaqItem(item.id, {
                question: item.question,
                answer: item.answer,
                isPublished: !item.isPublished,
            }),
        onSuccess: async (data) => {
            await invalidate();
            toast.success(
                data.isPublished ? "Вопрос опубликован" : "Вопрос снят с публикации"
            );
        },
        onError: () => toast.error("Не удалось изменить статус публикации"),
    });

    const deleteMutation = useMutation({
        mutationFn: (itemId: number) => superAdminService.deleteFaqItem(itemId),
        onSuccess: async () => {
            await invalidate();
            toast.success("Вопрос удалён");
        },
        onError: () => toast.error("Не удалось удалить вопрос"),
    });

    const reorderMutation = useMutation({
        mutationFn: (orderedIds: number[]) => superAdminService.reorderFaqItems(orderedIds),
        onSuccess: async (updatedItems) => {
            pendingReorderRef.current = null;
            queryClient.setQueryData(["super-admin", "faq", trimmedSearch], updatedItems);
            queryClient.setQueryData(["super-admin", "faq", ""], updatedItems);
            await queryClient.invalidateQueries({ queryKey: ["faq"] });
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

        const orderedIds = pending.map((item) => item.id);
        const unchanged =
            items.length === orderedIds.length &&
            items.every((item, index) => item.id === orderedIds[index]);

        pendingReorderRef.current = null;

        if (unchanged || reorderMutation.isPending) {
            return;
        }

        reorderMutation.mutate(orderedIds);
    }, [items, reorderMutation]);

    const moveItem = useCallback((sourceId: number, targetId: number) => {
        if (sourceId === targetId) {
            return;
        }

        setOrderedItems((current) => {
            const fromIndex = current.findIndex((item) => item.id === sourceId);
            const toIndex = current.findIndex((item) => item.id === targetId);
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
        (itemId: number) => (event: DragEvent<HTMLSpanElement>) => {
            isDraggingRef.current = true;
            setDraggedItemId(itemId);
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", String(itemId));

            const row = event.currentTarget.closest("li");
            if (row instanceof HTMLElement) {
                event.dataTransfer.setDragImage(row, 24, 24);
            }
        },
        []
    );

    const handleDragHandleEnd = useCallback(() => {
        isDraggingRef.current = false;
        setDraggedItemId(null);
        setDropTargetId(null);
        commitReorder();
    }, [commitReorder]);

    const handleItemDragOver = useCallback(
        (itemId: number) => (event: DragEvent<HTMLLIElement>) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";

            if (draggedItemId === null || draggedItemId === itemId) {
                return;
            }

            setDropTargetId(itemId);
        },
        [draggedItemId]
    );

    const handleItemDrop = useCallback(
        (itemId: number) => (event: DragEvent<HTMLLIElement>) => {
            event.preventDefault();

            const sourceId =
                draggedItemId ?? Number(event.dataTransfer.getData("text/plain"));
            if (!Number.isFinite(sourceId)) {
                return;
            }

            moveItem(sourceId, itemId);
            setDropTargetId(null);
        },
        [draggedItemId, moveItem]
    );

    const openEditModal = (item: FaqItem) => {
        setEditingItem(item);
        setEditForm({
            question: item.question,
            answer: item.answer,
        });
    };

    const closeEditModal = () => {
        if (updateMutation.isPending) {
            return;
        }
        setEditingItem(null);
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
            <AddFaqButton type="button" aria-label="Добавить вопрос" onClick={openCreateModal}>
                <Plus aria-hidden />
            </AddFaqButton>
        ),
        []
    );

    const displayItems = isSearchActive ? items : orderedItems;
    const isBusy =
        createMutation.isPending ||
        updateMutation.isPending ||
        togglePublishMutation.isPending;

    return (
        <>
            <SetAdminChrome title="Часто задаваемые вопросы" titleRight={titleRight} />
            <Card>
                <SearchInput
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Поиск по вопросам и ответам"
                />
                {!isSearchActive && displayItems.length > 1 ? (
                    <Hint>Перетащите вопросы за иконку с полосками, чтобы изменить порядок.</Hint>
                ) : null}
                {isSearchActive ? (
                    <Hint>Чтобы менять порядок, очистите поле поиска.</Hint>
                ) : null}

                {faqQuery.isLoading ? <EmptyState>Загрузка…</EmptyState> : null}
                {displayItems.length === 0 && !faqQuery.isLoading ? (
                    <EmptyState>
                        {trimmedSearch ? "Ничего не найдено." : "Вопросов пока нет."}
                    </EmptyState>
                ) : null}

                {!isSearchActive && displayItems.length > 0 ? (
                    <FaqList>
                        {orderedItems.map((item) => (
                            <FaqListItem
                                key={item.id}
                                $isDragging={draggedItemId === item.id}
                                $isDropTarget={dropTargetId === item.id}
                                onDragOver={handleItemDragOver(item.id)}
                                onDrop={handleItemDrop(item.id)}
                            >
                                <FaqRowContent
                                    item={item}
                                    draggable
                                    onDragHandleStart={handleDragHandleStart(item.id)}
                                    onDragHandleEnd={handleDragHandleEnd}
                                    onEdit={openEditModal}
                                    onTogglePublish={(faqItem) =>
                                        togglePublishMutation.mutate(faqItem)
                                    }
                                    onDelete={(itemId) => deleteMutation.mutate(itemId)}
                                    toggleDisabled={togglePublishMutation.isPending}
                                    deleteDisabled={deleteMutation.isPending}
                                />
                            </FaqListItem>
                        ))}
                    </FaqList>
                ) : null}

                {isSearchActive && displayItems.length > 0 ? (
                    <StaticFaqList>
                        {displayItems.map((item) => (
                            <StaticFaqListItem key={item.id}>
                                <FaqRowContent
                                    item={item}
                                    onEdit={openEditModal}
                                    onTogglePublish={(faqItem) =>
                                        togglePublishMutation.mutate(faqItem)
                                    }
                                    onDelete={(itemId) => deleteMutation.mutate(itemId)}
                                    toggleDisabled={togglePublishMutation.isPending}
                                    deleteDisabled={deleteMutation.isPending}
                                />
                            </StaticFaqListItem>
                        ))}
                    </StaticFaqList>
                ) : null}
            </Card>

            <FaqFormModal
                isOpen={isCreateModalOpen}
                title="Новый вопрос"
                form={createForm}
                isPending={isBusy}
                mode="create"
                onClose={closeCreateModal}
                onSaveDraft={() => createMutation.mutate(false)}
                onPublish={() => createMutation.mutate(true)}
                onChange={setCreateForm}
            />

            <FaqFormModal
                isOpen={editingItem !== null}
                title="Редактирование вопроса"
                form={editForm}
                isPending={isBusy}
                mode="edit"
                isPublished={editingItem?.isPublished ?? false}
                onClose={closeEditModal}
                onSaveDraft={() => updateMutation.mutate(editingItem?.isPublished ?? false)}
                onPublish={() => updateMutation.mutate(true)}
                onUnpublish={() => updateMutation.mutate(false)}
                onChange={setEditForm}
            />
        </>
    );
}
