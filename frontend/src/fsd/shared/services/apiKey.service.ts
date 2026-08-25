import { axiosWithAuth } from "@/shared/api/interceptors";
import { IApiKey, TypeApiKeyName } from "@/shared/types/apiKey.types";

class ApiKeyService {
    private BASE_URL = "/api_key";

    async getApiKeys() {
        const response = await axiosWithAuth.get<IApiKey[]>(`${this.BASE_URL}`);
        return response.data;
    }

    async deleteApiKey(name: TypeApiKeyName) {
        await axiosWithAuth.delete(`${this.BASE_URL}/${name}`);
    }

    async createApiKey(api_key: IApiKey) {
        await axiosWithAuth.post(`${this.BASE_URL}/create`, api_key);
    }

    async getApiKey(name: TypeApiKeyName) {
        const request = await axiosWithAuth.get(`${this.BASE_URL}/${name}`);
        return request.data;
    }
}

const apiKeyService = new ApiKeyService();
export default apiKeyService;
