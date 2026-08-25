import type { IAddressSuggestion } from "../../entities/delivery";

export type CheckoutDeliveryMethod = "pickup" | "pvz";

export type CheckoutPaymentMethod = "card_online" | "on_receipt";

export type CheckoutSelectedAddress = {
    formatted_address: string;
    city: string | null;
    street: string | null;
    house: string | null;
    postal_code: string | null;
    lat: number;
    lon: number;
    user_address_id: number | null;
    suggestion?: IAddressSuggestion;
};

export type CheckoutFormState = {
    deliveryMethod: CheckoutDeliveryMethod;
    pickupAddressText: string;
    orderStoragePeriodText: string;
    paymentMethod: CheckoutPaymentMethod;
    orderComment: string;
    selectedAddress: CheckoutSelectedAddress | null;
    deliveryDate: string | null;
    pvzCode: string | null;
    pvzAddress: string | null;
};

export type CheckoutLine = {
    productId: string;
    title: string;
    imageSrc?: string;
    unitPrice: number;
    quantity: number;
    stockCount: number;
    isAdult?: boolean;
};

export type DeliveryCalcState = {
    deliveryCost: number;
    availableDates: string[];
    isCalculating: boolean;
};
