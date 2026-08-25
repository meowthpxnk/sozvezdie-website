"use client";

import styled from "styled-components";
import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";

import authService from "../../entities/auth/auth.service";

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 1000;
`;

const Modal = styled.div`
    width: 100%;
    max-width: 420px;
    border-radius: 14px;
    background: #fff;
    padding: 20px;
    color: #000;
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    margin: 0 0 16px;
    font-size: 14px;
    color: #666;
    line-height: 1.45;
`;

const FormStack = styled.form`
    display: flex;
    flex-direction: column;
    gap: 12px;
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

const PasswordInput = styled.input`
    width: 100%;
    min-height: 42px;
    border-radius: 8px;
    border: 1px solid #e6e6e6;
    padding: 0 12px;
    font-size: 14px;
    color: #000;
    box-sizing: border-box;

    &:focus {
        outline: 2px solid var(--main-color);
        outline-offset: 2px;
    }
`;

const ModalActions = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 4px;
`;

const Button = styled.button`
    min-height: 42px;
    border-radius: 8px;
    border: none;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;

    &:disabled {
        opacity: 0.65;
        cursor: not-allowed;
    }
`;

const CancelButton = styled(Button)`
    background: #eef1f6;
    color: #2d3a54;
`;

const SubmitButton = styled(Button)`
    background: var(--main-color);
    color: #fff;

    &:hover:not(:disabled) {
        background: var(--main-color-hover);
    }
`;

export interface ChangePasswordModalProps {
    onClose: () => void;
}

export const ChangePasswordModal = ({ onClose }: ChangePasswordModalProps) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("Новые пароли не совпадают");
            return;
        }

        setIsSubmitting(true);
        try {
            await authService.changePassword({
                current_password: currentPassword,
                new_password: newPassword,
            });
            toast.success("Пароль успешно изменён");
            onClose();
        } catch (error) {
            const message = isAxiosError(error)
                ? (error.response?.data as { detail?: string })?.detail
                : undefined;
            toast.error(message ?? "Не удалось сменить пароль");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Overlay onClick={onClose}>
            <Modal onClick={(event) => event.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>Сменить пароль</ModalTitle>
                    <CloseButton type="button" onClick={onClose} aria-label="Закрыть">
                        <X aria-hidden size={18} />
                    </CloseButton>
                </ModalHeader>
                <ModalDescription>
                    Минимум 8 символов, заглавная и строчная буква, цифра.
                </ModalDescription>
                <FormStack onSubmit={onSubmit}>
                    <FieldGroup>
                        <FieldLabel htmlFor="current-password">Текущий пароль</FieldLabel>
                        <PasswordInput
                            id="current-password"
                            type="password"
                            autoComplete="current-password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </FieldGroup>
                    <FieldGroup>
                        <FieldLabel htmlFor="new-password">Новый пароль</FieldLabel>
                        <PasswordInput
                            id="new-password"
                            type="password"
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </FieldGroup>
                    <FieldGroup>
                        <FieldLabel htmlFor="confirm-password">Повторите новый пароль</FieldLabel>
                        <PasswordInput
                            id="confirm-password"
                            type="password"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </FieldGroup>
                    <ModalActions>
                        <CancelButton type="button" onClick={onClose} disabled={isSubmitting}>
                            Отмена
                        </CancelButton>
                        <SubmitButton type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Сохранение…" : "Сохранить"}
                        </SubmitButton>
                    </ModalActions>
                </FormStack>
            </Modal>
        </Overlay>
    );
};
