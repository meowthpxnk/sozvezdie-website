import { axiosClassic, axiosWithAuth } from "@shared/api/interceptors";
import { Fandom } from "./fandom";

export type FandomCreatePayload = {
    title: string;
    slug: string;
};

class FandomService {
    private BASE_URL = "/fandom";

    async getFandoms() {
        const response = await axiosClassic.get<Fandom[]>(this.BASE_URL);
        return response.data;
    }

    async createFandom(payload: FandomCreatePayload) {
        const response = await axiosWithAuth.post<Fandom>(this.BASE_URL, payload);
        return response.data;
    }
}

const fandomService = new FandomService();
export default fandomService;
