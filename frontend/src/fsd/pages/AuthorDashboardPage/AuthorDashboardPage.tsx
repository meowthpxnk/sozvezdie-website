"use client";

import Link from "next/link";
import styled from "styled-components";
import { toast } from "sonner";

import { AdminShell } from "@widgets/AdminShell";
import { useAuth } from "@entities/auth";
import { useAuthorDashboard } from "./useAuthorDashboard";

const DashboardLayout = styled.section`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const HeroCard = styled.section`
    background: linear-gradient(135deg, #1e2f56 0%, #355ea7 45%, var(--main-color) 100%);
    border-radius: 16px;
    padding: 18px;
    color: #fff;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const HeroTitle = styled.h2`
    margin: 0;
    font-size: 22px;
    font-weight: 700;
`;

const HeroText = styled.p`
    margin: 0;
    font-size: 14px;
    line-height: 1.45;
    color: rgba(255, 255, 255, 0.9);
`;

const QuickActions = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
`;

const ActionButton = styled(Link)`
    text-decoration: none;
    border-radius: 10px;
    padding: 9px 14px;
    font-size: 14px;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.28);
    transition: background-color 0.2s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.24);
    }
`;

const StatsGrid = styled.section`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    @media (min-width: 720px) {
        grid-template-columns: repeat(4, 1fr);
    }
`;

const Card = styled(Link)`
    background: #fff;
    border: 1px solid #e8ecf5;
    border-radius: 14px;
    padding: 14px;
    box-shadow: 0 8px 24px rgba(17, 31, 60, 0.05);
    text-decoration: none;
    color: inherit;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;

    &:hover {
        border-color: #c5d0e6;
        box-shadow: 0 10px 28px rgba(17, 31, 60, 0.08);
        transform: translateY(-1px);
    }

    &:focus-visible {
        outline: 2px solid var(--main-color);
        outline-offset: 2px;
    }
`;

const Label = styled.div`
    color: #5d6b84;
    font-size: 13px;
`;

const Value = styled.div`
    margin-top: 6px;
    font-size: 24px;
    font-weight: 700;
    color: #132647;
`;

const EmptyState = styled.p`
    margin: 0;
    font-size: 15px;
    color: var(--cart-summary-text-color, #666);
`;

const BlockedBanner = styled.div`
    border-radius: 12px;
    padding: 14px 16px;
    background: var(--blocked-banner-bg);
    border: 1px solid var(--blocked-banner-border);
    color: var(--blocked-banner-fg);
    font-size: 14px;
    font-weight: 700;
    line-height: 1.45;
`;

const BLOCKED_TOAST = "Нет доступа, обратитесь в поддержку";
const BLOCKED_BANNER =
    "К вам не подключен аккаунт 1C, пожалуйста обратитесь в поддержку для решения проблемы";

export const AuthorDashboardPage = () => {
    const { dashboard, loading, isError } = useAuthorDashboard();
    const { isBlockedWithout1c } = useAuth();

    const handleBlockedNavigate = (
        event: { preventDefault: () => void }
    ) => {
        if (!isBlockedWithout1c) {
            return;
        }
        event.preventDefault();
        toast.error(BLOCKED_TOAST);
    };

    if (loading) {
        return (
            <AdminShell title="Дашборд">
                {isBlockedWithout1c ? (
                    <BlockedBanner>{BLOCKED_BANNER}</BlockedBanner>
                ) : null}
                <EmptyState>Загрузка данных кабинета…</EmptyState>
            </AdminShell>
        );
    }

    if (isError || !dashboard) {
        return (
            <AdminShell title="Дашборд">
                {isBlockedWithout1c ? (
                    <BlockedBanner>{BLOCKED_BANNER}</BlockedBanner>
                ) : null}
                <EmptyState>Не удалось загрузить данные кабинета.</EmptyState>
            </AdminShell>
        );
    }

    const { sellerCard } = dashboard;

    if (!sellerCard) {
        return (
            <AdminShell title="Дашборд">
                <DashboardLayout>
                    {isBlockedWithout1c ? (
                        <BlockedBanner>{BLOCKED_BANNER}</BlockedBanner>
                    ) : null}
                    <HeroCard>
                        <HeroTitle>Кабинет автора</HeroTitle>
                        <HeroText>
                            Сначала создайте карточку бренда — после этого здесь
                            появится статистика по товарам.
                        </HeroText>
                        <QuickActions>
                            <ActionButton
                                href="/admin/brand"
                                onClick={handleBlockedNavigate}
                            >
                                Создать бренд
                            </ActionButton>
                        </QuickActions>
                    </HeroCard>
                </DashboardLayout>
            </AdminShell>
        );
    }

    return (
        <AdminShell title="Дашборд">
            <DashboardLayout>
                {isBlockedWithout1c ? (
                    <BlockedBanner>{BLOCKED_BANNER}</BlockedBanner>
                ) : null}
                <HeroCard>
                    <HeroTitle>{sellerCard.name}</HeroTitle>
                    <HeroText>
                        {sellerCard.description ||
                            "Управляйте каталогом, отслеживайте модерацию и обновляйте карточки товаров в едином кабинете."}
                    </HeroText>
                    <QuickActions>
                        <ActionButton
                            href="/admin/products/new"
                            onClick={handleBlockedNavigate}
                        >
                            Создать товар
                        </ActionButton>
                        <ActionButton
                            href="/admin/brand"
                            onClick={handleBlockedNavigate}
                        >
                            Редактировать бренд
                        </ActionButton>
                        <ActionButton
                            href="/admin/products"
                            onClick={handleBlockedNavigate}
                        >
                            Все товары
                        </ActionButton>
                    </QuickActions>
                </HeroCard>

                <StatsGrid>
                    <Card
                        href="/admin/products"
                        aria-label="Смотреть все товары"
                        onClick={handleBlockedNavigate}
                    >
                        <Label>Товаров</Label>
                        <Value>{dashboard.productsCount}</Value>
                    </Card>
                    <Card
                        href="/admin/products"
                        aria-label="Смотреть остатки товаров"
                        onClick={handleBlockedNavigate}
                    >
                        <Label>Остаток (шт.)</Label>
                        <Value>{dashboard.stockTotal}</Value>
                    </Card>
                    <Card
                        href="/admin/products?status=PENDING"
                        aria-label="Смотреть товары на модерации"
                        onClick={handleBlockedNavigate}
                    >
                        <Label>На модерации</Label>
                        <Value>{dashboard.pendingCount}</Value>
                    </Card>
                    <Card
                        href="/admin/products?status=APPROVED"
                        aria-label="Смотреть одобренные товары"
                        onClick={handleBlockedNavigate}
                    >
                        <Label>Одобрено</Label>
                        <Value>{dashboard.approvedCount}</Value>
                    </Card>
                </StatsGrid>
            </DashboardLayout>
        </AdminShell>
    );
};
