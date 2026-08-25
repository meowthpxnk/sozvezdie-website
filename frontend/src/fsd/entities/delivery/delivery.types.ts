export type BackendDeliveryMethod = "PICKUP_POINT";

export interface IAddressSuggestion {
    value: string | null;
    unrestricted_value: string | null;
    city: string | null;
    street: string | null;
    house: string | null;
    flat: string | null;
    postal_code: string | null;
    geo_lat: string | null;
    geo_lon: string | null;
    fias_level: string | null;
    qc_geo: string | null;
}

export interface IAddressSuggestionsResponse {
    items: IAddressSuggestion[];
}

export interface IUserAddress {
    id: number;
    label: string | null;
    formatted_address: string;
    city: string | null;
    street: string | null;
    house: string | null;
    flat: string | null;
    lat: number | null;
    lon: number | null;
    postal_code: string | null;
    is_default: boolean;
}

export interface IUserAddressListResponse {
    items: IUserAddress[];
}

export interface IDeliveryCalculateItem {
    product_id: number;
    quantity: number;
}

export interface IDeliveryAddressInput {
    formatted_address: string;
    city?: string | null;
    street?: string | null;
    house?: string | null;
    flat?: string | null;
    postal_code?: string | null;
    lat?: number | null;
    lon?: number | null;
    cdek_city_code?: number | null;
    user_address_id?: number | null;
}

export interface IDeliveryCalculateRequest {
    delivery_method: BackendDeliveryMethod;
    address: IDeliveryAddressInput;
    items: IDeliveryCalculateItem[];
}

export interface IDeliveryCalculateResponse {
    delivery_cost: number;
    tariff_code: number;
    period_min: number;
    period_max: number;
    available_dates: string[];
    delivery_date_min: string | null;
    delivery_date_max: string | null;
    shipment_date: string | null;
    pvz_code: string | null;
    pvz_name: string | null;
    pvz_address: string | null;
    pvz_lat: number | null;
    pvz_lon: number | null;
    pvz_distance_m: number | null;
    pvz_search_city_code: number | null;
}

export interface IOrderDeliveryAddressPayload {
    formatted_address: string;
    city?: string | null;
    street?: string | null;
    house?: string | null;
    flat?: string | null;
    postal_code?: string | null;
    lat?: number | null;
    lon?: number | null;
    pvz_code?: string | null;
    user_address_id?: number | null;
}
