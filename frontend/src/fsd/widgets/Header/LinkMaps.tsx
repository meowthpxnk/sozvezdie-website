"use client";

import HeaderLinkButton from "@shared/ui/buttons/HeaderLinkButton";
import { useAppSelector } from "@shared/store/store";
import { toast } from "sonner";
import {
    Boxes,
    CircleHelp,
    Image,
    LayoutDashboard,
    Layers,
    Newspaper,
    Package,
    Shield,
    ShieldCheck,
    ShoppingBag,
    Star,
    Store,
    Truck,
    User,
    Users,
} from "lucide-react";

import { isNavLinkActive } from "./header-nav";

type NavMapProps = {
    pathname: string;
};

function useCartItemCount() {
    const cart = useAppSelector((state) => state.cart.cart);
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

const ProfileButton = ({ pathname }: NavMapProps) => (
    <HeaderLinkButton
        href="/profile"
        Icon={User}
        label="Профиль"
        active={isNavLinkActive(pathname, "/profile")}
    />
);

/** Кнопки витрины: профиль, заказы, избранное, корзина. */
export const UserButtonMap = ({ pathname }: NavMapProps) => {
    const cartCount = useCartItemCount();

    return (
        <>
            <ProfileButton pathname={pathname} />
            <HeaderLinkButton
                href="/orders"
                Icon={Package}
                label="Заказы"
                active={isNavLinkActive(pathname, "/orders")}
            />
            <HeaderLinkButton
                href="/favorites"
                Icon={Star}
                label="Избранное"
                active={isNavLinkActive(pathname, "/favorites")}
            />
            <HeaderLinkButton
                href="/cart"
                Icon={ShoppingBag}
                label="Корзина"
                badgeCount={cartCount}
                active={isNavLinkActive(pathname, "/cart")}
            />
        </>
    );
};

/** Переход в кабинет автора (продавца). */
export const AuthorManagementEntryButton = ({ pathname }: NavMapProps) => (
    <HeaderLinkButton
        href="/admin"
        Icon={Store}
        label="Кабинет"
        tone="dark"
        active={isNavLinkActive(pathname, "/admin")}
    />
);

/** Переход в кабинет модератора. */
export const ModeratorManagementEntryButton = ({ pathname }: NavMapProps) => (
    <HeaderLinkButton
        href="/moderation"
        Icon={Shield}
        label="Модерация"
        tone="dark"
        active={isNavLinkActive(pathname, "/moderation")}
    />
);

/** Переход в кабинет SuperAdmin. */
export const SuperAdminManagementEntryButton = ({ pathname }: NavMapProps) => (
    <HeaderLinkButton
        href="/super-admin"
        Icon={ShieldCheck}
        label="Админ"
        tone="dark"
        active={isNavLinkActive(pathname, "/super-admin")}
    />
);

/** Меню управления на маршрутах /admin. */
export const AuthorManagementButtonsMap = ({ pathname }: NavMapProps) => {
    const isBlockedWithout1c = useAppSelector((state) => state.auth.isBlockedWithout1c);

    const blockTab = (event: { preventDefault: () => void }) => {
        if (!isBlockedWithout1c) {
            return;
        }
        event.preventDefault();
        toast.error("Нет доступа, обратитесь в поддержку");
    };

    return (
        <>
            <HeaderLinkButton
                href="/admin"
                Icon={LayoutDashboard}
                label="Обзор"
                tone="dark"
                active={isNavLinkActive(pathname, "/admin", { exact: true })}
            />
            <HeaderLinkButton
                href="/admin/products"
                Icon={Boxes}
                label="Товары"
                tone="dark"
                active={isNavLinkActive(pathname, "/admin/products")}
                onClick={blockTab}
            />
            <HeaderLinkButton
                href="/admin/feed"
                Icon={Newspaper}
                label="Лента"
                tone="dark"
                active={isNavLinkActive(pathname, "/admin/feed")}
                onClick={blockTab}
            />
            <HeaderLinkButton
                href="/admin/brand"
                Icon={Store}
                label="Бренд"
                tone="dark"
                active={isNavLinkActive(pathname, "/admin/brand")}
                onClick={blockTab}
            />
        </>
    );
};

/** Меню управления на маршрутах /moderation. */
export const ModeratorManagementButtonsMap = ({ pathname }: NavMapProps) => (
    <>
        <HeaderLinkButton
            href="/moderation"
            Icon={Shield}
            label="Модерация"
            tone="dark"
            active={isNavLinkActive(pathname, "/moderation", {
                excludePrefixes: ["/moderation/orders"],
            })}
        />
        <HeaderLinkButton
            href="/moderation/orders"
            Icon={Truck}
            label="Заказы"
            tone="dark"
            active={isNavLinkActive(pathname, "/moderation/orders")}
        />
    </>
);

/** Меню управления на маршрутах /super-admin. */
export const SuperAdminManagementButtonsMap = ({ pathname }: NavMapProps) => (
    <>
        <HeaderLinkButton
            href="/super-admin"
            Icon={LayoutDashboard}
            label="Управл."
            tone="dark"
            active={isNavLinkActive(pathname, "/super-admin", { exact: true })}
        />
        <HeaderLinkButton
            href="/moderation"
            Icon={Shield}
            label="Модерация"
            tone="dark"
            active={isNavLinkActive(pathname, "/moderation", {
                excludePrefixes: ["/moderation/orders"],
            })}
        />
        <HeaderLinkButton
            href="/super-admin/banners"
            Icon={Image}
            label="Баннеры"
            tone="dark"
            active={isNavLinkActive(pathname, "/super-admin/banners")}
        />
        <HeaderLinkButton
            href="/super-admin/users"
            Icon={Users}
            label="Пользователи"
            tone="dark"
            active={isNavLinkActive(pathname, "/super-admin/users")}
        />
        <HeaderLinkButton
            href="/moderation/orders"
            Icon={Truck}
            label="Заказы"
            tone="dark"
            active={isNavLinkActive(pathname, "/moderation/orders")}
        />
        <HeaderLinkButton
            href="/super-admin/catalog"
            Icon={Layers}
            label="Каталог"
            tone="dark"
            active={isNavLinkActive(pathname, "/super-admin/catalog")}
        />
        <HeaderLinkButton
            href="/super-admin/faq"
            Icon={CircleHelp}
            label="FAQ"
            tone="dark"
            active={isNavLinkActive(pathname, "/super-admin/faq")}
        />
    </>
);
