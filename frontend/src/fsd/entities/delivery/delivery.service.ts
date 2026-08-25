import { axiosWithAuth } from "@shared/api/interceptors";

import type {
    IAddressSuggestionsResponse,
    IDeliveryCalculateRequest,
    IDeliveryCalculateResponse,
    IUserAddressListResponse,
} from "./delivery.types";

class DeliveryService {
    async suggestAddress(
        query: string,
        options: { restrictToHouse?: boolean; allowFlat?: boolean } = {}
    ) {
        const response = await axiosWithAuth.get<IAddressSuggestionsResponse>(
            "/delivery/address/suggest",
            {
                params: {
                    q: query,
                    restrict_to_house: options.restrictToHouse ?? false,
                    allow_flat: options.allowFlat ?? false,
                },
            }
        );
        return response.data.items;
    }

    async geolocateAddress(lat: number, lon: number) {
        const response = await axiosWithAuth.get<IAddressSuggestionsResponse>(
            "/delivery/address/geolocate",
            { params: { lat, lon } }
        );
        return response.data.items;
    }

    async calculateDelivery(data: IDeliveryCalculateRequest) {
        const response = await axiosWithAuth.post<IDeliveryCalculateResponse>(
            "/delivery/calculate",
            data
        );
        return response.data;
    }

    async listSavedAddresses() {
        const response = await axiosWithAuth.get<IUserAddressListResponse>(
            "/addresses"
        );
        return response.data.items;
    }
}

const deliveryService = new DeliveryService();
export default deliveryService;
