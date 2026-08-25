import type {
    BackendDeliveryMethod,
    BackendOrderStatus,
    BackendPaymentMethod,
    IUserOrderResponse,
    OrderLineItem,
} from "../order/order.types";

export const BACKEND_ORDER_STATUS_LABELS: Record<BackendOrderStatus, string> = {
    PENDING: "Ожидает оплаты",
    PAID: "Оплачен",
    SHIPPED: "Отправлен",
    DELIVERED: "Доставлен",
    CANCELED: "Отменён",
};

export const MODERATOR_ORDER_STATUS_TRANSITIONS: Record<
    BackendOrderStatus,
    BackendOrderStatus[]
> = {
    PENDING: ["PAID", "CANCELED"],
    PAID: ["SHIPPED", "CANCELED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: [],
    CANCELED: [],
};

export interface IModeratorOrderCustomerApi {
    id: number;
    username: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
}

export interface IModeratorOrderListItemApi extends IUserOrderResponse {
    customer: IModeratorOrderCustomerApi;
}

export interface IModeratorOrderDetailApi extends IModeratorOrderListItemApi {
    cdek_order_uuid: string | null;
    cdek_error: string | null;
    yookassa_payment_id: string | null;
}

export interface IModeratorOrdersListApi {
    items: IModeratorOrderListItemApi[];
    total: number;
}

export interface ModeratorOrderCustomer {
    id: number;
    username: string;
    fullName: string | null;
    email: string | null;
    phone: string | null;
}

export interface ModeratorOrderListItem {
    id: number;
    status: BackendOrderStatus;
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
    customer: ModeratorOrderCustomer;
    itemCount: number;
}

export interface ModeratorOrderDetail extends ModeratorOrderListItem {
    cdekOrderUuid: string | null;
    cdekError: string | null;
    yookassaPaymentId: string | null;
    products: OrderLineItem[];
}
