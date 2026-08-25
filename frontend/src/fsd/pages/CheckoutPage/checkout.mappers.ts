import type {
    BackendDeliveryMethod,
    BackendPaymentMethod,
    IOrderCreateRequest,
} from "../../entities/order";
import type { IOrderDeliveryAddressPayload } from "../../entities/delivery";

import type { CheckoutDeliveryMethod, CheckoutFormState } from "./checkout.types";

export type CheckoutLinePayload = {
    productId: string;
    quantity: number;
};

const PAYMENT_METHOD_MAP: Record<
    CheckoutFormState["paymentMethod"],
    BackendPaymentMethod
> = {
    card_online: "CARD_ONLINE",
    on_receipt: "ON_RECEIPT",
};

const DELIVERY_METHOD_MAP: Record<CheckoutDeliveryMethod, BackendDeliveryMethod> = {
    pickup: "SELF_PICKUP",
    pvz: "PICKUP_POINT",
};

function buildAddressPayload(
    form: CheckoutFormState
): IOrderDeliveryAddressPayload | undefined {
    if (!form.selectedAddress) {
        return undefined;
    }
    return {
        formatted_address: form.selectedAddress.formatted_address,
        city: form.selectedAddress.city,
        street: form.selectedAddress.street,
        house: form.selectedAddress.house,
        postal_code: form.selectedAddress.postal_code,
        lat: form.selectedAddress.lat,
        lon: form.selectedAddress.lon,
        pvz_code: form.pvzCode,
        user_address_id: form.selectedAddress.user_address_id,
    };
}

export function mapCheckoutToOrderRequest(
    form: CheckoutFormState,
    lines: CheckoutLinePayload[],
    deliveryCost: number,
    checkoutSessionId: string
): IOrderCreateRequest {
    const deliveryMethod = DELIVERY_METHOD_MAP[form.deliveryMethod];
    return {
        payment_method: PAYMENT_METHOD_MAP[form.paymentMethod],
        delivery_method: deliveryMethod,
        delivery_cost: deliveryCost,
        delivery_date:
            form.deliveryMethod === "pickup" ? null : form.deliveryDate,
        address:
            form.deliveryMethod === "pickup"
                ? undefined
                : buildAddressPayload(form),
        items: lines.map((line) => ({
            product_id: Number(line.productId),
            quantity: line.quantity,
        })),
        checkout_session_id: checkoutSessionId,
    };
}

export function toBackendDeliveryMethod(
    method: CheckoutDeliveryMethod
): "PICKUP_POINT" | null {
    if (method === "pvz") {
        return "PICKUP_POINT";
    }
    return null;
}
