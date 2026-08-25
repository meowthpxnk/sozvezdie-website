"use client";

import styled from "styled-components";
import { FormEvent, useState } from "react";
import { KeyRound, LogOut, Mail, Phone, User } from "lucide-react";
import { Header } from "@widgets/Header/ui/Header";

const MainWrapper = styled.div`
    padding: 20px;
    max-width: 560px;
`;

const SectionsStack = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const SectionCard = styled.section`
    background-color: #fff;
    border-radius: 14px;
    padding: 20px;
    color: #000;
`;

const SectionTitle = styled.h3`
    margin: 0 0 6px;
    font-size: 20px;
    font-weight: 700;
    color: #000;
`;

const SectionDescription = styled.p`
    margin: 0 0 18px;
    font-size: 14px;
    font-weight: 500;
    color: #666;
    line-height: 1.45;
`;

const FormStack = styled.form`
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

const PrimaryButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    align-self: flex-start;
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

    svg {
        flex-shrink: 0;
        width: 18px;
        height: 18px;
    }

    &:hover {
        background: var(--main-color-hover);
    }

    &:focus-visible {
        outline: 2px solid var(--main-color);
        outline-offset: 2px;
    }
`;

const ActionBarButton = styled(PrimaryButton)`
    align-self: stretch;
    width: 100%;
`;

const BottomActions = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 4px;
`;

const DangerButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 42px;
    padding: 0 20px;
    border-radius: 8px;
    border: none;
    background: #dc3545;
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.2s ease;
    width: 100%;

    svg {
        flex-shrink: 0;
        width: 18px;
        height: 18px;
    }

    &:hover {
        background: #c82333;
    }

    &:focus-visible {
        outline: 2px solid #dc3545;
        outline-offset: 2px;
    }
`;

const DEFAULT_FULL_NAME = "Лето Евгений Валентинович";
const DEFAULT_EMAIL = "gold.dragon.20002222@gmail.com";
const DEFAULT_PHONE = "+79992223333";

export const ProfilePage = () => {
    const [fullName, setFullName] = useState(DEFAULT_FULL_NAME);
    const [email, setEmail] = useState(DEFAULT_EMAIL);
    const [phone, setPhone] = useState(DEFAULT_PHONE);

    const onSaveProfile = (event: FormEvent) => {
        event.preventDefault();
    };

    const onLogout = () => { };

    const onChangePassword = () => { };

    return (
        <>
            <Header />
            <MainWrapper>
                <SectionsStack>
                    <SectionCard aria-labelledby="profile-section-title">
                        <SectionTitle id="profile-section-title">Профиль</SectionTitle>
                        <SectionDescription>
                            Обновите информацию профиля своей учетной записи и адрес электронной почты.
                        </SectionDescription>
                        <FormStack onSubmit={onSaveProfile}>
                            <FieldGroup>
                                <FieldLabel htmlFor="profile-full-name">
                                    Ваше ФИО (Используется для доставки) <RequiredMark>*</RequiredMark>
                                </FieldLabel>
                                <InputWithIconWrap>
                                    <User aria-hidden />
                                    <TextInput
                                        id="profile-full-name"
                                        name="fullName"
                                        type="text"
                                        autoComplete="name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                </InputWithIconWrap>
                            </FieldGroup>
                            <FieldGroup>
                                <FieldLabel htmlFor="profile-email">
                                    Email <RequiredMark>*</RequiredMark>
                                </FieldLabel>
                                <InputWithIconWrap>
                                    <Mail aria-hidden />
                                    <TextInput
                                        id="profile-email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </InputWithIconWrap>
                            </FieldGroup>
                            <FieldGroup>
                                <FieldLabel htmlFor="profile-phone">
                                    Номер телефона <RequiredMark>*</RequiredMark>
                                </FieldLabel>
                                <InputWithIconWrap>
                                    <Phone aria-hidden />
                                    <TextInput
                                        id="profile-phone"
                                        name="phone"
                                        type="tel"
                                        autoComplete="tel"
                                        inputMode="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                </InputWithIconWrap>
                            </FieldGroup>
                            <ActionBarButton type="submit">Сохранить</ActionBarButton>
                        </FormStack>
                    </SectionCard>

                    <BottomActions>
                        <ActionBarButton type="button" onClick={onChangePassword}>
                            <KeyRound aria-hidden />
                            Сменить пароль
                        </ActionBarButton>
                        <DangerButton type="button" onClick={onLogout}>
                            <LogOut aria-hidden />
                            Выход из профиля
                        </DangerButton>
                    </BottomActions>
                </SectionsStack>
            </MainWrapper>
        </>
    );
};
