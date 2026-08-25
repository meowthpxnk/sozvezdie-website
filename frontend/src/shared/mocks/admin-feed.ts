import type { ModerationStatus } from "@/src/shared/types/seller";

export type AdminOperationType = "create_product" | "update_product" | "delete_product" | "update_profile";

export type AdminFeedOperation = {
    id: string;
    createdAt: string;
    type: AdminOperationType;
    title: string;
    status: ModerationStatus;
    details: string[];
    moderatorMessage?: string;
    hasExtendedModeratorCard?: boolean;
};

export const ADMIN_OPERATION_LABELS: Record<AdminOperationType, string> = {
    create_product: "Новый товар",
    update_product: "Изменение товара",
    delete_product: "Удаление товара",
    update_profile: "Изменение профиля",
};

export const ADMIN_FEED_OPERATIONS: AdminFeedOperation[] = [
    {
        id: "op-1001",
        createdAt: "30 апреля 2026, 16:22",
        type: "create_product",
        title: "Свеча из соевого воска «Теплый лен»",
        status: "pending",
        details: ["Цена: 1 250 ₽", "Категория: Дом и интерьер"],
    },
    {
        id: "op-1002",
        createdAt: "30 апреля 2026, 15:48",
        type: "update_product",
        title: "Колье «Северный свет»",
        status: "approved",
        details: ["Обновлены фото и описание", "Цена: 3 400 ₽"],
    },
    {
        id: "op-1003",
        createdAt: "30 апреля 2026, 14:37",
        type: "delete_product",
        title: "Открытка «Сирень»",
        status: "approved",
        details: ["Товар снят с витрины", "Удаление подтверждено модератором"],
    },
    {
        id: "op-1004",
        createdAt: "30 апреля 2026, 13:56",
        type: "update_profile",
        title: "Профиль бренда KERE",
        status: "rejected",
        details: ["Изменено описание бренда", "Обновлен баннер профиля"],
        moderatorMessage:
            "Описание содержит рекламные формулировки и внешние ссылки. Уберите призывы к покупке и оставьте нейтральное описание бренда.",
        hasExtendedModeratorCard: true,
    },
    {
        id: "op-1005",
        createdAt: "29 апреля 2026, 20:11",
        type: "update_product",
        title: "Набор стикеров «Летний сад»",
        status: "rejected",
        details: ["Обновлена цена: 590 ₽", "Заменена обложка"],
        moderatorMessage:
            "На обложке присутствует водяной знак стороннего сервиса. Загрузите оригинальное изображение без водяных знаков.",
    },
];
