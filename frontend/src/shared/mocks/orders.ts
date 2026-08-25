import type { ProductMock } from "./types";
import { MOCK_PRODUCTS_CATALOG } from "./static-user-session";

const PRODUCTS_LIST = MOCK_PRODUCTS_CATALOG;

export type OrderLineItem = {
    productId: string;
    name: string;
    priceText: string;
    imageSrc: string;
    imageAlt: string;
    /** Количество единиц товара в заказе */
    quantity: number;
};

/** Ключ статуса для стилизации и локализованной подписи */
export type OrderStatusKey =
    | "cancelled"
    | "delivered"
    | "received"
    | "awaiting_delivery"
    | "in_transit";

export const ORDER_STATUS_LABELS: Record<OrderStatusKey, string> = {
    cancelled: "Отменён",
    delivered: "Доставлен",
    received: "Получен",
    awaiting_delivery: "Ожидает доставки",
    in_transit: "В пути",
};

/** Заказы в работе — страница «Заказы» */
export const ACTIVE_ORDER_STATUS_KEYS = ["awaiting_delivery", "in_transit"] as const satisfies readonly OrderStatusKey[];

/** Завершённые и отменённые — архив */
export const ARCHIVE_ORDER_STATUS_KEYS = ["cancelled", "delivered", "received"] as const satisfies readonly OrderStatusKey[];

export type PreviousOrder = {
    id: string;
    statusKey: OrderStatusKey;
    dateLabel: string;
    paymentType: string;
    deliveryMethod: string;
    deliveryCostText: string;
    total: string;
    products: OrderLineItem[];
};

export function isActiveOrder(order: PreviousOrder): boolean {
    return (ACTIVE_ORDER_STATUS_KEYS as readonly OrderStatusKey[]).includes(order.statusKey);
}

const productById = (id: string) => PRODUCTS_LIST.find((p) => p.id === id);

const lineItemFromProduct = (p: ProductMock, quantity: number): OrderLineItem => {
    const imageSrc = p.imageSrc ?? p.images?.[0] ?? "";
    return {
        productId: p.id,
        name: p.nameText,
        priceText: p.priceText,
        imageSrc,
        imageAlt: p.imageAlt ?? p.nameText,
        quantity,
    };
};

type OrderLineSeed = { productId: string; quantity: number };

type OrderMockSeed = Omit<PreviousOrder, "products"> & { lines: OrderLineSeed[] };

const ORDER_MOCKS: OrderMockSeed[] = [
    {
        id: "65851",
        statusKey: "cancelled",
        dateLabel: "29 апреля 2026, 19:50",
        paymentType: "При получении",
        deliveryMethod: "Курьер",
        deliveryCostText: "от бесплатно",
        total: "600 ₽",
        lines: [
            { productId: "1", quantity: 2 },
            { productId: "2", quantity: 1 },
        ],
    },
    {
        id: "65102",
        statusKey: "delivered",
        dateLabel: "12 апреля 2026, 14:20",
        paymentType: "Карта онлайн",
        deliveryMethod: "Пункт выдачи",
        deliveryCostText: "290 ₽",
        total: "600 ₽",
        lines: [
            { productId: "3", quantity: 1 },
            { productId: "4", quantity: 3 },
        ],
    },
    {
        id: "64880",
        statusKey: "received",
        dateLabel: "3 марта 2026, 11:05",
        paymentType: "При получении",
        deliveryMethod: "Почта России",
        deliveryCostText: "от бесплатно",
        total: "300 ₽",
        lines: [{ productId: "5", quantity: 4 }],
    },
    {
        id: "64721",
        statusKey: "awaiting_delivery",
        dateLabel: "28 апреля 2026, 09:15",
        paymentType: "Карта онлайн",
        deliveryMethod: "Пункт выдачи",
        deliveryCostText: "290 ₽",
        total: "450 ₽",
        lines: [
            { productId: "6", quantity: 1 },
            { productId: "7", quantity: 2 },
        ],
    },
    {
        id: "64688",
        statusKey: "in_transit",
        dateLabel: "27 апреля 2026, 16:40",
        paymentType: "Карта онлайн",
        deliveryMethod: "Курьер",
        deliveryCostText: "350 ₽",
        total: "920 ₽",
        lines: [
            { productId: "1", quantity: 1 },
            { productId: "3", quantity: 2 },
            { productId: "5", quantity: 1 },
        ],
    },
    {
        id: "64602",
        statusKey: "in_transit",
        dateLabel: "26 апреля 2026, 08:30",
        paymentType: "При получении",
        deliveryMethod: "Доставка",
        deliveryCostText: "410 ₽",
        total: "780 ₽",
        lines: [
            { productId: "2", quantity: 5 },
            { productId: "4", quantity: 1 },
        ],
    },
    {
        id: "64540",
        statusKey: "delivered",
        dateLabel: "22 апреля 2026, 18:10",
        paymentType: "Карта онлайн",
        deliveryMethod: "Курьер",
        deliveryCostText: "от бесплатно",
        total: "1 200 ₽",
        lines: [
            { productId: "6", quantity: 2 },
            { productId: "7", quantity: 1 },
            { productId: "1", quantity: 3 },
        ],
    },
    {
        id: "64495",
        statusKey: "awaiting_delivery",
        dateLabel: "25 апреля 2026, 12:00",
        paymentType: "При получении",
        deliveryMethod: "Почта России",
        deliveryCostText: "от бесплатно",
        total: "300 ₽",
        lines: [{ productId: "5", quantity: 1 }],
    },
];

function buildOrderLines(lines: OrderLineSeed[]): OrderLineItem[] {
    return lines.flatMap(({ productId, quantity }) => {
        const p = productById(productId);
        return p ? [lineItemFromProduct(p, quantity)] : [];
    });
}

export const PREVIOUS_ORDERS: PreviousOrder[] = ORDER_MOCKS.map(({ lines, ...rest }) => ({
    ...rest,
    products: buildOrderLines(lines),
}));

export const ACTIVE_ORDERS: PreviousOrder[] = PREVIOUS_ORDERS.filter(isActiveOrder);

export const ARCHIVED_ORDERS: PreviousOrder[] = PREVIOUS_ORDERS.filter((o) => !isActiveOrder(o));
