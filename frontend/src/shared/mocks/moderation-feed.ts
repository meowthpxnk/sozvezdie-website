import type { ModerationStatus } from "@/src/shared/types/seller";

export type ModerationActionType =
    | "create_product"
    | "update_product"
    | "delete_product"
    | "update_brand"
    | "create_shop";

export type ModerationFieldDiff = {
    label: string;
    before: string;
    after: string;
    beforeImageUrl?: string;
    afterImageUrl?: string;
};

export type ModerationProposal = {
    id: string;
    createdAt: string;
    title: string;
    type: ModerationActionType;
    status: ModerationStatus;
    submittedBy: string;
    moderatedBy?: string;
    moderationComment?: string;
    previewImageUrl?: string;
    previewBannerUrl?: string;
    previewAvatarUrl?: string;
    changes: ModerationFieldDiff[];
};

export const MODERATION_ACTION_LABELS: Record<ModerationActionType, string> = {
    create_product: "Создание товара",
    update_product: "Редакция товара",
    delete_product: "Удаление товара",
    update_brand: "Редактирование бренда",
    create_shop: "Создание магазина",
};

export const MODERATION_PROPOSALS: ModerationProposal[] = [
    {
        id: "mod-2001",
        createdAt: "30 апреля 2026, 16:35",
        title: "Товар «Кружка керамическая Ночь»",
        type: "create_product",
        status: "pending",
        submittedBy: "@alina.craft",
        previewImageUrl: "https://placeholdpicsum.dev/photo/1200/900?seed=mod-2001-preview",
        changes: [
            { label: "Название", before: "—", after: "Кружка керамическая Ночь" },
            { label: "Цена", before: "—", after: "2 190 ₽" },
            { label: "Описание", before: "—", after: "Ручная роспись, объем 320 мл, покрытие пищевой глазурью." },
            { label: "Категория", before: "—", after: "Дом и интерьер" },
        ],
    },
    {
        id: "mod-2002",
        createdAt: "30 апреля 2026, 15:22",
        title: "Товар «Колье Северный ветер»",
        type: "update_product",
        status: "approved",
        submittedBy: "@nora.jewel",
        moderatedBy: "@moderator.max",
        moderationComment: "Изменения соответствуют требованиям витрины.",
        previewImageUrl: "https://placeholdpicsum.dev/photo/1200/900?seed=mod-2002-preview",
        changes: [
            { label: "Цена", before: "4 100 ₽", after: "3 900 ₽" },
            { label: "Описание", before: "Колье из серебра 925.", after: "Колье из серебра 925 с покрытием родием." },
            {
                label: "Обложка",
                before: "old-cover.jpg",
                after: "new-cover.jpg",
                beforeImageUrl: "https://placeholdpicsum.dev/photo/1200/900?seed=mod-2002-before",
                afterImageUrl: "https://placeholdpicsum.dev/photo/1200/900?seed=mod-2002-after",
            },
        ],
    },
    {
        id: "mod-2003",
        createdAt: "30 апреля 2026, 14:50",
        title: "Товар «Открытка Морозный лес»",
        type: "delete_product",
        status: "rejected",
        submittedBy: "@paper.mila",
        moderatedBy: "@moderator.ira",
        moderationComment: "У товара есть активные заказы, удаление недоступно до завершения сделок.",
        changes: [
            { label: "Статус товара", before: "Активен", after: "Удален" },
            { label: "Причина удаления", before: "—", after: "Снят с ассортимента" },
        ],
    },
    {
        id: "mod-2004",
        createdAt: "30 апреля 2026, 13:30",
        title: "Бренд «Lina Home»",
        type: "update_brand",
        status: "pending",
        submittedBy: "@lina.home",
        previewBannerUrl: "https://placeholdpicsum.dev/photo/1400/700?seed=mod-2004-banner",
        previewAvatarUrl: "https://placeholdpicsum.dev/photo/300/300?seed=mod-2004-avatar",
        changes: [
            { label: "Название бренда", before: "Lina Decor", after: "Lina Home" },
            { label: "Описание бренда", before: "Текстиль и свечи.", after: "Домашний декор ручной работы и авторские свечи." },
            {
                label: "Баннер",
                before: "banner-v1.jpg",
                after: "banner-v2.jpg",
                beforeImageUrl: "https://placeholdpicsum.dev/photo/1400/700?seed=mod-2004-before",
                afterImageUrl: "https://placeholdpicsum.dev/photo/1400/700?seed=mod-2004-after",
            },
        ],
    },
    {
        id: "mod-2005",
        createdAt: "29 апреля 2026, 21:02",
        title: "Магазин «Forest Gifts»",
        type: "create_shop",
        status: "approved",
        submittedBy: "@forest.handmade",
        moderatedBy: "@moderator.den",
        moderationComment: "Магазин оформлен корректно, документы подтверждены.",
        previewBannerUrl: "https://placeholdpicsum.dev/photo/1400/700?seed=mod-2005-banner",
        previewAvatarUrl: "https://placeholdpicsum.dev/photo/300/300?seed=mod-2005-avatar",
        changes: [
            { label: "Название магазина", before: "—", after: "Forest Gifts" },
            { label: "Описание", before: "—", after: "Деревянные игрушки и сувениры ручной работы." },
            { label: "Город", before: "—", after: "Санкт-Петербург" },
            { label: "Контактный email", before: "—", after: "hello@forest-gifts.ru" },
        ],
    },
    {
        id: "mod-2006",
        createdAt: "30 апреля 2026, 12:48",
        title: "Товар «Шарф Туманный рассвет»",
        type: "create_product",
        status: "approved",
        submittedBy: "@wool.story",
        moderatedBy: "@moderator.nika",
        moderationComment: "Карточка заполнена корректно, публикация разрешена.",
        previewImageUrl: "https://placeholdpicsum.dev/photo/1200/900?seed=mod-2006-preview",
        changes: [
            { label: "Название", before: "—", after: "Шарф Туманный рассвет" },
            { label: "Цена", before: "—", after: "2 850 ₽" },
            { label: "Описание", before: "—", after: "Шерсть мериноса, ручная вязка, размер 180x30 см." },
            { label: "Категория", before: "—", after: "Одежда" },
        ],
    },
    {
        id: "mod-2007",
        createdAt: "30 апреля 2026, 11:36",
        title: "Товар «Подсвечник Линия»",
        type: "update_product",
        status: "pending",
        submittedBy: "@ceramica.studio",
        previewImageUrl: "https://placeholdpicsum.dev/photo/1200/900?seed=mod-2007-preview",
        changes: [
            { label: "Цена", before: "1 900 ₽", after: "1 750 ₽" },
            { label: "Описание", before: "Керамический подсвечник.", after: "Керамический подсвечник ручной лепки, матовая глазурь." },
            {
                label: "Обложка",
                before: "cover-v1.jpg",
                after: "cover-v2.jpg",
                beforeImageUrl: "https://placeholdpicsum.dev/photo/1200/900?seed=mod-2007-before",
                afterImageUrl: "https://placeholdpicsum.dev/photo/1200/900?seed=mod-2007-after",
            },
        ],
    },
    {
        id: "mod-2008",
        createdAt: "30 апреля 2026, 10:54",
        title: "Товар «Блокнот Лесная тропа»",
        type: "delete_product",
        status: "pending",
        submittedBy: "@paper.mint",
        changes: [
            { label: "Статус товара", before: "Активен", after: "Удален" },
            { label: "Причина удаления", before: "—", after: "Товар снят с производства" },
        ],
    },
    {
        id: "mod-2009",
        createdAt: "30 апреля 2026, 09:43",
        title: "Бренд «Northern Clay»",
        type: "update_brand",
        status: "approved",
        submittedBy: "@northern.clay",
        moderatedBy: "@moderator.max",
        moderationComment: "Обновление бренда прошло проверку.",
        previewBannerUrl: "https://placeholdpicsum.dev/photo/1400/700?seed=mod-2009-banner",
        previewAvatarUrl: "https://placeholdpicsum.dev/photo/300/300?seed=mod-2009-avatar",
        changes: [
            { label: "Название бренда", before: "North Clay", after: "Northern Clay" },
            { label: "Описание бренда", before: "Керамика ручной работы.", after: "Авторская керамика ручной работы для дома и сервировки." },
            {
                label: "Баннер",
                before: "north-banner-v1.jpg",
                after: "north-banner-v2.jpg",
                beforeImageUrl: "https://placeholdpicsum.dev/photo/1400/700?seed=mod-2009-before",
                afterImageUrl: "https://placeholdpicsum.dev/photo/1400/700?seed=mod-2009-after",
            },
        ],
    },
    {
        id: "mod-2010",
        createdAt: "29 апреля 2026, 19:40",
        title: "Магазин «Amber Craft»",
        type: "create_shop",
        status: "rejected",
        submittedBy: "@amber.craft",
        moderatedBy: "@moderator.ira",
        moderationComment: "Нужно дополнить описание условий доставки и возврата.",
        previewBannerUrl: "https://placeholdpicsum.dev/photo/1400/700?seed=mod-2010-banner",
        previewAvatarUrl: "https://placeholdpicsum.dev/photo/300/300?seed=mod-2010-avatar",
        changes: [
            { label: "Название магазина", before: "—", after: "Amber Craft" },
            { label: "Описание", before: "—", after: "Украшения и аксессуары из натурального янтаря." },
            { label: "Город", before: "—", after: "Калининград" },
            { label: "Контактный email", before: "—", after: "contact@amber-craft.ru" },
        ],
    },
];
