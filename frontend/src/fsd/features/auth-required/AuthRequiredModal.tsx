"use client";

import styled from "styled-components";
import { X } from "lucide-react";
import Link from "next/link";

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
    max-width: 400px;
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

    &:hover {
        background: #f0f0f0;
    }
`;

const ModalDescription = styled.p`
    margin: 0 0 20px;
    font-size: 14px;
    line-height: 1.5;
    color: #6b7a90;
`;

const Actions = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const PrimaryLink = styled(Link)`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    border-radius: 12px;
    background: var(--main-color, var(--main-color));
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    text-decoration: none;
    transition: background-color 0.2s;

    &:hover {
        background: var(--main-color-hover, var(--main-color-hover));
    }
`;

const SecondaryButton = styled.button`
    min-height: 44px;
    border: none;
    border-radius: 12px;
    background: #eef2f8;
    color: #2d3a54;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;

    &:hover {
        background: #e3e9f2;
    }
`;

export interface AuthRequiredModalProps {
    isOpen: boolean;
    description?: string;
    onClose: () => void;
}

const DEFAULT_DESCRIPTION =
    "Чтобы добавлять товары в избранное и корзину, войдите или зарегистрируйтесь.";

export function AuthRequiredModal({
    isOpen,
    description = DEFAULT_DESCRIPTION,
    onClose,
}: AuthRequiredModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <Overlay onClick={onClose} role="presentation">
            <Modal
                role="dialog"
                aria-modal="true"
                aria-labelledby="auth-required-title"
                onClick={(event) => event.stopPropagation()}
            >
                <ModalHeader>
                    <ModalTitle id="auth-required-title">Войдите в аккаунт</ModalTitle>
                    <CloseButton type="button" aria-label="Закрыть" onClick={onClose}>
                        <X size={20} />
                    </CloseButton>
                </ModalHeader>
                <ModalDescription>
                    {description}
                </ModalDescription>
                <Actions>
                    <PrimaryLink href="/auth" onClick={onClose}>
                        Войти / зарегистрироваться
                    </PrimaryLink>
                    <SecondaryButton type="button" onClick={onClose}>
                        Отмена
                    </SecondaryButton>
                </Actions>
            </Modal>
        </Overlay>
    );
}
