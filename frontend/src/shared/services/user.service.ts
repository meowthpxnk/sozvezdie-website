import { axiosWithAuth } from "@/shared/api/interceptors";
import { IUser, IUserForm, TypeUserUsername } from "@/shared/types/user.types";

class UserService {
    private BASE_URL = "/user";

    async getUsers() {
        const response = await axiosWithAuth.get<IUser[]>(`${this.BASE_URL}`);
        return response.data;
    }
    async getUser(username: TypeUserUsername) {
        const response = await axiosWithAuth.get<IUser>(
            `${this.BASE_URL}/${username}`
        );
        return response.data;
    }
    async updateUser(user: IUserForm) {
        await axiosWithAuth.put(`${this.BASE_URL}/${user.username}`, user);
    }
    async deleteUser(username: TypeUserUsername) {
        await axiosWithAuth.delete(`${this.BASE_URL}/${username}`);
    }
    async createUser(user: IUserForm) {
        await axiosWithAuth.post(`${this.BASE_URL}/create`, user);
    }
}

const userService = new UserService();
export default userService;
