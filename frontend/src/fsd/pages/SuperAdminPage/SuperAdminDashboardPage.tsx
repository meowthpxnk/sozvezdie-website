"use client";

import Link from "next/link";
import styled from "styled-components";

import { SetAdminChrome } from "@widgets/AdminShell";

const Grid = styled.div`
    display: grid;
    gap: 14px;

    @media (min-width: 720px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
`;

const Tile = styled(Link)`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 20px;
    border-radius: 14px;
    background: #fff;
    box-shadow: 0 8px 24px rgba(17, 31, 60, 0.05);
    text-decoration: none;
    color: inherit;
    transition: transform 0.15s ease, box-shadow 0.15s ease;

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 12px 28px rgba(17, 31, 60, 0.08);
    }
`;

const TileTitle = styled.h2`
    margin: 0;
    font-size: 18px;
    color: #132647;
`;

const TileText = styled.p`
    margin: 0;
    font-size: 14px;
    line-height: 1.45;
    color: #6b7890;
`;

export function SuperAdminDashboardPage() {
    return (
        <>
            <SetAdminChrome title="Управление сайтом" />
            <Grid>
                <Tile href="/moderation">
                    <TileTitle>Модерация</TileTitle>
                    <TileText>Просматривайте и обрабатывайте входящие заявки.</TileText>
                </Tile>
                <Tile href="/super-admin/banners">
                    <TileTitle>Баннеры</TileTitle>
                    <TileText>Управляйте каруселью на главной странице.</TileText>
                </Tile>
                <Tile href="/super-admin/users">
                    <TileTitle>Пользователи</TileTitle>
                    <TileText>Назначайте роли Покупатель, Seller и Moderator.</TileText>
                </Tile>
                <Tile href="/moderation/orders">
                    <TileTitle>Заказы</TileTitle>
                    <TileText>Информация о заказах.</TileText>
                </Tile>
                <Tile href="/super-admin/catalog">
                    <TileTitle>Каталог</TileTitle>
                    <TileText>
                        Создавайте и редактируйте фандомы, категории и подкатегории.
                    </TileText>
                </Tile>
                <Tile href="/super-admin/faq">
                    <TileTitle>FAQ</TileTitle>
                    <TileText>Добавляйте вопросы и ответы для страницы помощи.</TileText>
                </Tile>
            </Grid>
        </>
    );
}
