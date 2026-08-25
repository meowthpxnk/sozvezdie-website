import type { IOrderDeliveryAddressPayload } from "../delivery";

export type OrderStatusKey =
    | "cancelled"
    | "delivered"
    | "received"
    | "awaiting_delivery"
    | "in_transit";

export type BackendOrderStatus =
    | "PENDING"
    | "PAID"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELED";

export type BackendPaymentMethod = "CARD_ONLINE" | "ON_RECEIPT";

export type BackendDeliveryMethod =
    | "SELF_PICKUP"
    | "COURIER"
    | "PICKUP_POINT"
    | "POST";

export const ORDER_STATUS_LABELS: Record<OrderStatusKey, string> = {
    cancelled: "Отменён",
    delivered: "Доставлен",
    received: "Получен",
    awaiting_delivery: "Ожидает доставки",
    in_transit: "В пути",
};

export const PAYMENT_METHOD_LABELS: Record<BackendPaymentMethod, string> = {
    CARD_ONLINE: "Карта онлайн",
    ON_RECEIPT: "При получении",
};

export const DELIVERY_METHOD_LABELS: Record<BackendDeliveryMethod, string> = {
    SELF_PICKUP: "Самовывоз",
    COURIER: "До двери (СДЭК)",
    PICKUP_POINT: "Пункт выдачи (СДЭК)",
    POST: "Почта России",
};

export interface OrderLineItem {
    productId: string;
    name: string;
    priceAtTime: number;
    lineTotal: number;
    image: string | null;
    quantity: number;
}

export interface UserOrder {
    id: string;
    statusKey: OrderStatusKey;
    paymentMethod: BackendPaymentMethod;
    deliveryMethod: BackendDeliveryMethod;
    itemsTotal: number;
    deliveryCost: number;
    total: number;
    createdAt: string;
    deliveryDate: string | null;
    deliveryAddressText: string | null;
    deliveryFlat: string | null;
    cdekPvzCode: string | null;
    cdekPvzAddress: string | null;
    products: OrderLineItem[];
}

export interface IOrderLineItemResponse {
    product_id: number;
    name: string;
    price_at_time: number;
    line_total: number;
    image: string | null;
    quantity: number;
}

export interface IUserOrderResponse {
    id: number;
    status: BackendOrderStatus;
    payment_method: BackendPaymentMethod;
    delivery_method: BackendDeliveryMethod;
    items_total: number;
    delivery_cost: number;
    total: number;
    created_at: string;
    delivery_date: string | null;
    delivery_address_text: string | null;
    delivery_flat: string | null;
    cdek_pvz_code: string | null;
    cdek_pvz_address: string | null;
    payment_confirmation_url?: string | null;
    items: IOrderLineItemResponse[];
}

export interface IOrdersListResponse {
    items: IUserOrderResponse[];
}

export interface ICancelProviderResult {
    status: "queued" | "canceled" | "refunded" | "failed" | "skipped";
    message?: string | null;
}

export interface ICancelOrderResponse {
    order: IUserOrderResponse;
    cdek: ICancelProviderResult;
    payment: ICancelProviderResult;
}

export interface IOrderCreateItemRequest {
    product_id: number;
    quantity: number;
}

export interface ICheckoutPaymentInitResponse {
    checkout_id: number;
    payment_confirmation_url: string;
    total: number;
    already_paid?: boolean;
    order?: IUserOrderResponse | null;
}

export interface IPendingPaymentSyncItem {
    checkout_id: number;
    status: "pending" | "paid" | "failed";
    cart_fingerprint?: string | null;
    order_id?: number | null;
    product_ids?: number[];
    order?: IUserOrderResponse | null;
    payment_confirmation_url?: string | null;
}

export interface ISyncPendingPaymentsResponse {
    items: IPendingPaymentSyncItem[];
}

export interface ICheckoutCompleteResponse {
    status: "paid" | "pending" | "failed";
    order: IUserOrderResponse | null;
    message: string | null;
}

export interface IOrderCreateRequest {
    payment_method: BackendPaymentMethod;
    delivery_method: BackendDeliveryMethod;
    delivery_cost?: number;
    delivery_date?: string | null;
    address?: IOrderDeliveryAddressPayload;
    items: IOrderCreateItemRequest[];
    checkout_session_id?: string;
}
