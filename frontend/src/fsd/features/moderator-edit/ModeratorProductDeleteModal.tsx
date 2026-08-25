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
    max-width: 520px;
    border-radius: 14px;
    background: #fff;
    padding: 20px;
    color: #132647;
    position: relative;
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
    padding-right: 28px;
`;

const ModalTitle = styled.h3`
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #111;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 14px;
    right: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: 1px solid #dc3545;
    border-radius: 8px;
    background: #dc3545;
    color: #fff;
    cursor: pointer;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const ModalDescription = styled.p`
    margin: 0 0 12px;
    font-size: 14px;
    line-height: 1.5;
    color: #4a5872;
`;

const CommentField = styled.textarea`
    width: 100%;
    min-height: 88px;
    border-radius: 8px;
    border: 1px solid #e6e6e6;
    padding: 10px;
    font-size: 14px;
    color: #000;
    resize: vertical;
    box-sizing: border-box;
    margin-bottom: 12px;

    &:focus {
        outline: 2px solid var(--main-color);
        outline-offset: 2px;
    }
`;

const ModalActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
`;

const SecondaryButton = styled.button`
    min-height: 34px;
    padding: 0 10px;
    border-radius: 8px;
    border: 1px solid #d7ddea;
    background: #fff;
    color: #2d3a54;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const DangerButton = styled.button`
    min-height: 34px;
    padding: 0 10px;
    border-radius: 8px;
    border: 1px solid #f3c1c1;
    background: #fff5f5;
    color: #b52121;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;

    &:hover:not(:disabled) {
        background: #ffe7e7;
        border-color: #e7aaaa;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

type ModeratorProductDeleteModalProps = {
    isOpen: boolean;
    productName: string;
    isSubmitting: boolean;
    onClose: () => void;
    onConfirm: (comment: string) => void;
};

export function ModeratorProductDeleteModal({
    isOpen,
    productName,
    isSubmitting,
    onClose,
    onConfirm,
}: ModeratorProductDeleteModalProps) {
    const [comment, setComment] = useState("");
    const commentFieldId = useId();

    useEffect(() => {
        if (!isOpen) {
            setComment("");
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <Overlay onClick={() => (!isSubmitting ? onClose() : undefined)}>
            <Modal onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
                <CloseButton
                    type="button"
                    aria-label="Закрыть модальное окно"
                    disabled={isSubmitting}
                    onClick={onClose}
                >
                    <X size={16} />
                </CloseButton>
                <ModalHeader>
                    <ModalTitle>Удалить товар?</ModalTitle>
                </ModalHeader>
                <ModalDescription>
                    Товар «{productName}» будет удалён без возможности восстановления. Автор увидит
                    сообщение об удалении в личном кабинете.
                </ModalDescription>
                <CommentField
                    id={commentFieldId}
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Комментарий для автора (необязательно)"
                    disabled={isSubmitting}
                />
                <ModalActions>
                    <SecondaryButton type="button" disabled={isSubmitting} onClick={onClose}>
                        Отмена
                    </SecondaryButton>
                    <DangerButton
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => onConfirm(comment)}
                    >
                        {isSubmitting ? "Удаляем…" : "Да, удалить"}
                    </DangerButton>
                </ModalActions>
            </Modal>
        </Overlay>
    );
}
