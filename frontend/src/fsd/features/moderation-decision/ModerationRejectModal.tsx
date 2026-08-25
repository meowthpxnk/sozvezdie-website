"use client";

import { useEffect, useId, useState } from "react";
import styled from "styled-components";
import { X } from "lucide-react";

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgb(0 0 0 / 45%);
`;

const Modal = styled.div`
    width: 100%;
    max-width: 460px;
    border-radius: 14px;
    background: #fff;
    padding: 20px;
    color: #132647;
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
`;

const ModalTitle = styled.h3`
    margin: 0;
    font-size: 18px;
    font-weight: 700;
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: #666;
    cursor: pointer;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    &:hover:not(:disabled) {
        background: #f0f0f0;
    }
`;

const ModalDescription = styled.p`
    margin: 0 0 16px;
    font-size: 14px;
    line-height: 1.5;
    color: #6b7a90;
`;

const FieldGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
`;

const FieldLabel = styled.label`
    font-size: 13px;
    font-weight: 600;
    color: #2d3a54;
`;

const CommentField = styled.textarea`
    min-height: 110px;
    border-radius: 10px;
    border: 1px solid #d7ddea;
    padding: 10px 12px;
    font-size: 14px;
    resize: vertical;
    color: #132647;

    &:focus {
        outline: 2px solid var(--main-color);
        outline-offset: 1px;
    }

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;

const FieldError = styled.p`
    margin: 0;
    font-size: 12px;
    color: #c0392b;
`;

const Actions = styled.div`
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
`;

const CancelButton = styled.button`
    flex: 1;
    min-width: 120px;
    min-height: 42px;
    border: 1px solid #d7ddea;
    border-radius: 10px;
    background: #fff;
    color: #2d3a54;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const ConfirmButton = styled.button`
    flex: 1;
    min-width: 140px;
    min-height: 42px;
    border: none;
    border-radius: 10px;
    background: #c0392b;
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

type ModerationRejectModalProps = {
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    submitting: boolean;
    onClose: () => void;
    onConfirm: (comment: string) => Promise<void>;
};

export function ModerationRejectModal({
    isOpen,
    title,
    description,
    confirmLabel,
    submitting,
    onClose,
    onConfirm,
}: ModerationRejectModalProps) {
    const fieldId = useId();
    const [comment, setComment] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setComment("");
            setError(null);
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !submitting) {
                onClose();
            }
        };

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [isOpen, onClose, submitting]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async () => {
        const trimmedComment = comment.trim();
        if (!trimmedComment) {
            setError("Укажите комментарий для автора");
            return;
        }

        setError(null);
        await onConfirm(trimmedComment);
    };

    return (
        <Overlay onClick={submitting ? undefined : onClose} role="presentation">
            <Modal
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${fieldId}-title`}
                onClick={(event) => event.stopPropagation()}
            >
                <ModalHeader>
                    <ModalTitle id={`${fieldId}-title`}>{title}</ModalTitle>
                    <CloseButton
                        type="button"
                        aria-label="Закрыть"
                        disabled={submitting}
                        onClick={onClose}
                    >
                        <X size={20} />
                    </CloseButton>
                </ModalHeader>
                <ModalDescription>{description}</ModalDescription>
                <FieldGroup>
                    <FieldLabel htmlFor={`${fieldId}-comment`}>
                        Комментарий для автора
                    </FieldLabel>
                    <CommentField
                        id={`${fieldId}-comment`}
                        value={comment}
                        disabled={submitting}
                        placeholder="Опишите, что нужно исправить или почему заявка отклонена"
                        onChange={(event) => {
                            setComment(event.target.value);
                            if (error) {
                                setError(null);
                            }
                        }}
                    />
                    {error ? <FieldError>{error}</FieldError> : null}
                </FieldGroup>
                <Actions>
                    <CancelButton type="button" disabled={submitting} onClick={onClose}>
                        Отмена
                    </CancelButton>
                    <ConfirmButton
                        type="button"
                        disabled={submitting}
                        onClick={() => void handleSubmit()}
                    >
                        {submitting ? "Отклоняем..." : confirmLabel}
                    </ConfirmButton>
                </Actions>
            </Modal>
        </Overlay>
    );
}
