import { axiosWithAuth } from "@/shared/api/interceptors";
import { IServer, TypeServerShortname } from "@/shared/types/server.types";

class ServerService {
    private BASE_URL = "/server";

    async getServers() {
        const response = await axiosWithAuth.get<IServer[]>(`${this.BASE_URL}`);
        return response.data;
    }

    async deleteServer(name: TypeServerShortname) {
        await axiosWithAuth.delete(`${this.BASE_URL}/${name}`);
    }

    async createServer(api_key: IServer) {
        await axiosWithAuth.post(`${this.BASE_URL}/create`, api_key);
    }
}

const serverService = new ServerService();
export default serverService;
