import { axiosClassic } from "@shared/api/interceptors";

import {
    type FaqItemApiResponse,
    mapFaqItem,
    type FaqItem,
} from "./faq.types";

class FaqService {
    private BASE_URL = "/faq";

    async getItems(search?: string): Promise<FaqItem[]> {
        const response = await axiosClassic.get<FaqItemApiResponse[]>(this.BASE_URL, {
            params: search ? { search } : undefined,
        });

        return response.data.map(mapFaqItem);
    }
}

export const faqService = new FaqService();
