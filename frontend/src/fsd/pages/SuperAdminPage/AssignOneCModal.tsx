"use client";

import styled from "styled-components";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { superAdminService } from "@entities/super-admin";

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
    display: ${({ $isOpen }) => ($isOpen ? "flex" : "none")};
    position: fixed;
    inset: 0;
    z-index: 1200;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: var(--cart-modal-overlay-bg);
`;

const ModalCard = styled.div`
    width: min(480px, 100%);
    background: var(--color-bg-primary);
    border-radius: 14px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 16px 40px rgb(17 31 60 / 18%);
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
    color: var(--color-text-primary);
`;

const ModalCloseButton = styled.button`
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    background: var(--neutral-surface-bg);
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
`;

const ModalText = styled.p`
    margin: 0;
    font-size: 14px;
    line-height: 1.45;
    color: var(--cart-summary-text-color);
`;

const Field = styled.label`
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--cart-summary-text-color);
`;

const Input = styled.input`
    min-height: 40px;
    border-radius: 8px;
    border: 1px solid var(--color-border-secondary);
    padding: 0 12px;
    font-size: 14px;
    color: var(--color-text-primary);
    background: var(--color-bg-primary);
`;

const ModalActions = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
`;

const PrimaryButton = styled.button`
    min-height: 40px;
    padding: 0 16px;
    border: none;
    border-radius: 10px;
    background: var(--main-color);
    color: var(--color);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const SecondaryButton = styled.button`
    min-height: 40px;
    padding: 0 16px;
    border: 1px solid var(--color-border-secondary);
    border-radius: 10px;
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const DangerButton = styled(PrimaryButton)`
    background: var(--cart-confirm-danger-bg);
    color: var(--cart-confirm-danger-color);
`;

const CheckboxRow = styled.label`
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--cart-summary-text-color);
    cursor: pointer;

    input {
        margin-top: 3px;
        flex-shrink: 0;
    }
`;

type AssignOneCModalProps = {
    isOpen: boolean;
    title: string;
    description?: string;
    initialId?: string;
    submitLabel: string;
    isPending?: boolean;
    onClose: () => void;
    onSubmit: (oneCAuthorId: string) => void;
};

export function AssignOneCModal({
    isOpen,
    title,
    description,
    initialId = "",
    submitLabel,
    isPending = false,
    onClose,
    onSubmit,
}: AssignOneCModalProps) {
    const [oneCAuthorId, setOneCAuthorId] = useState(initialId);

    useEffect(() => {
        if (isOpen) {
            setOneCAuthorId(initialId);
        }
    }, [initialId, isOpen]);

    const generateMutation = useMutation({
        mutationFn: () => superAdminService.generateOneCAuthor(),
    });

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    const canSubmit = oneCAuthorId.trim().length > 0 && !isPending;

    if (!isOpen) {
        return null;
    }

    return (
        <ModalOverlay $isOpen={isOpen} onClick={onClose}>
            <ModalCard onClick={(event) => event.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>{title}</ModalTitle>
                    <ModalCloseButton type="button" onClick={onClose} aria-label="Закрыть">
                        <X size={16} />
                    </ModalCloseButton>
                </ModalHeader>
                {description ? <ModalText>{description}</ModalText> : null}
                <Field>
                    ID автора 1C
                    <Input
                        value={oneCAuthorId}
                        onChange={(event) => setOneCAuthorId(event.target.value)}
                        placeholder="Введите код автора"
                    />
                </Field>
                <ModalActions>
                    <SecondaryButton
                        type="button"
                        disabled={generateMutation.isPending || isPending}
                        onClick={() => generateMutation.mutate()}
                    >
                        {generateMutation.isPending ? "Генерация…" : "Сгенерировать через 1C"}
                    </SecondaryButton>
                    <PrimaryButton
                        type="button"
                        disabled={!canSubmit}
                        onClick={() => onSubmit(oneCAuthorId.trim())}
                    >
                        {submitLabel}
                    </PrimaryButton>
                </ModalActions>
            </ModalCard>
        </ModalOverlay>
    );
}

type ConfirmDemoteModalProps = {
    isOpen: boolean;
    isPending?: boolean;
    hasOneC: boolean;
    hasShop: boolean;
    onClose: () => void;
    onConfirm: (options: { deleteFrom1c: boolean; deleteShop: boolean }) => void;
};

export function ConfirmDemoteModal({
    isOpen,
    isPending = false,
    hasOneC,
    hasShop,
    onClose,
    onConfirm,
}: ConfirmDemoteModalProps) {
    const [deleteFrom1c, setDeleteFrom1c] = useState(false);
    const [deleteShop, setDeleteShop] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setDeleteFrom1c(false);
            setDeleteShop(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <ModalOverlay $isOpen={isOpen} onClick={onClose}>
            <ModalCard onClick={(event) => event.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>Смена роли продавца</ModalTitle>
                    <ModalCloseButton type="button" onClick={onClose} aria-label="Закрыть">
                        <X size={16} />
                    </ModalCloseButton>
                </ModalHeader>
                {hasShop ? (
                    <ModalText>
                        Магазин автора будет отключён и скрыт из каталога. Отметьте, если
                        нужно сразу удалить кабинет 1C или товары и бренд.
                    </ModalText>
                ) : (
                    <ModalText>
                        Роль продавца будет снята. Отметьте, если нужно удалить кабинет
                        автора в 1C.
                    </ModalText>
                )}
                {hasOneC ? (
                    <CheckboxRow>
                        <input
                            type="checkbox"
                            checked={deleteFrom1c}
                            onChange={(event) => setDeleteFrom1c(event.target.checked)}
                        />
                        Удалить аккаунт 1C
                    </CheckboxRow>
                ) : null}
                {hasShop ? (
                    <CheckboxRow>
                        <input
                            type="checkbox"
                            checked={deleteShop}
                            onChange={(event) => setDeleteShop(event.target.checked)}
                        />
                        Удалить товары и бренд автора
                    </CheckboxRow>
                ) : null}
                <ModalActions>
                    <SecondaryButton type="button" disabled={isPending} onClick={onClose}>
                        Отмена
                    </SecondaryButton>
                    <PrimaryButton
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                            onConfirm({
                                deleteFrom1c: hasOneC && deleteFrom1c,
                                deleteShop: hasShop && deleteShop,
                            })
                        }
                    >
                        Сохранить
                    </PrimaryButton>
                </ModalActions>
            </ModalCard>
        </ModalOverlay>
    );
}

type ConfirmDeleteOneCModalProps = {
    isOpen: boolean;
    isPending?: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

export function ConfirmDeleteOneCModal({
    isOpen,
    isPending = false,
    onClose,
    onConfirm,
}: ConfirmDeleteOneCModalProps) {
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <ModalOverlay $isOpen={isOpen} onClick={onClose}>
            <ModalCard onClick={(event) => event.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>Удалить аккаунт из 1C?</ModalTitle>
                    <ModalCloseButton type="button" onClick={onClose} aria-label="Закрыть">
                        <X size={16} />
                    </ModalCloseButton>
                </ModalHeader>
                <ModalText>
                    Попробуем удалить кабинет автора в 1C и отвязать ID от этого аккаунта.
                </ModalText>
                <ModalActions>
                    <SecondaryButton type="button" disabled={isPending} onClick={onClose}>
                        Отмена
                    </SecondaryButton>
                    <DangerButton type="button" disabled={isPending} onClick={onConfirm}>
                        Удалить из 1C
                    </DangerButton>
                </ModalActions>
            </ModalCard>
        </ModalOverlay>
    );
}

type ConfirmDeleteShopModalProps = {
    isOpen: boolean;
    isPending?: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

export function ConfirmDeleteShopModal({
    isOpen,
    isPending = false,
    onClose,
    onConfirm,
}: ConfirmDeleteShopModalProps) {
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <ModalOverlay $isOpen={isOpen} onClick={onClose}>
            <ModalCard onClick={(event) => event.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>Удалить магазин и бренд?</ModalTitle>
                    <ModalCloseButton type="button" onClick={onClose} aria-label="Закрыть">
                        <X size={16} />
                    </ModalCloseButton>
                </ModalHeader>
                <ModalText>
                    Будут удалены бренд автора и все его товары. Это действие нельзя
                    отменить.
                </ModalText>
                <ModalActions>
                    <SecondaryButton type="button" disabled={isPending} onClick={onClose}>
                        Отмена
                    </SecondaryButton>
                    <DangerButton type="button" disabled={isPending} onClick={onConfirm}>
                        Удалить магазин и бренд
                    </DangerButton>
                </ModalActions>
            </ModalCard>
        </ModalOverlay>
    );
}
