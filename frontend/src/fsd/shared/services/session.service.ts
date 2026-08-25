import { axiosWithAuth } from "@shared/api/interceptors";
import { IUser } from "@shared/types/user.types";

class SessionService {
    private BASE_URL = "";

    async closeSession() {
        await axiosWithAuth.patch(`${this.BASE_URL}/sessions-close`);
    }
    async logout() {
        await axiosWithAuth.patch(`${this.BASE_URL}/logout`);
    }
    async getPayload() {
        const request = await axiosWithAuth.get<IUser>(
            `${this.BASE_URL}/get_payload`
        );
        return request.data;
    }
}

const sessionService = new SessionService();
export default sessionService;
