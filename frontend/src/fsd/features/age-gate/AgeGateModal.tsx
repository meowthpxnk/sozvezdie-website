"use client";

import styled from "styled-components";

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: var(--cart-modal-overlay-bg);
`;

const Modal = styled.div`
    width: 100%;
    max-width: 400px;
    border-radius: 14px;
    background: var(--color-bg-primary, #fff);
    padding: 20px;
    color: var(--title-color);
`;

const ModalTitle = styled.h3`
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 700;
`;

const ModalDescription = styled.p`
    margin: 0 0 20px;
    font-size: 14px;
    line-height: 1.5;
    color: var(--cart-modal-caption-color);
`;

const Actions = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const PrimaryButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    border: none;
    border-radius: 12px;
    background: var(--main-color);
    color: var(--color);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;

    &:hover:not(:disabled) {
        background: var(--main-color-hover);
    }

    &:disabled {
        background: var(--main-color-disabled);
        cursor: wait;
    }
`;

const SecondaryButton = styled.button`
    min-height: 44px;
    border: none;
    border-radius: 12px;
    background: var(--neutral-surface-bg);
    color: var(--title-color);
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;

    &:hover:not(:disabled) {
        background: var(--main-color-tint-hover);
    }

    &:disabled {
        cursor: wait;
        opacity: 0.7;
    }
`;

export interface AgeGateModalProps {
    isOpen: boolean;
    confirming?: boolean;
    onConfirm: () => void;
    onDecline: () => void;
}

export function AgeGateModal({
    isOpen,
    confirming = false,
    onConfirm,
    onDecline,
}: AgeGateModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <Overlay
            onClick={confirming ? undefined : onDecline}
            role="presentation"
        >
            <Modal
                role="dialog"
                aria-modal="true"
                aria-labelledby="age-gate-title"
                onClick={(event) => event.stopPropagation()}
            >
                <ModalTitle id="age-gate-title">Вам есть 18 лет?</ModalTitle>
                <ModalDescription>
                    Этот товар содержит материалы 18+. Чтобы увидеть фотографии,
                    подтвердите свой возраст.
                </ModalDescription>
                <Actions>
                    <PrimaryButton
                        type="button"
                        disabled={confirming}
                        onClick={onConfirm}
                    >
                        Да
                    </PrimaryButton>
                    <SecondaryButton
                        type="button"
                        disabled={confirming}
                        onClick={onDecline}
                    >
                        Нет
                    </SecondaryButton>
                </Actions>
            </Modal>
        </Overlay>
    );
}
