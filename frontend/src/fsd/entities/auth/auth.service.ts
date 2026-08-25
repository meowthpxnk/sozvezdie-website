import {
    AccessTokenResponse,
    IAuthForm,
    IRegisterForm,
    IVkAuthoriseRequest,
} from "@shared/types/auth.types";

import { axiosClassic, axiosWithAuth } from "@shared/api/interceptors";
import { saveAccessToken } from "./auth-token.service";
import {
    clearStoredAuthorInvite,
    getStoredAuthorInvite,
} from "@shared/lib/author-invite";
import {
    IChangePasswordRequest,
    IMeResponse,
    IUserProfileResponse,
    IUserProfileUpdateRequest,
} from "./auth.types";

class AuthService {
    private BASE_URL = "";

    async authorisate(data: IAuthForm) {
        const response = await axiosClassic.post<AccessTokenResponse>(
            `${this.BASE_URL}/authorisate`,
            data
        );

        saveAccessToken(response.data["Access-Token"]);
    }

    async authoriseVk(payload: IVkAuthoriseRequest) {
        const response = await axiosClassic.post<AccessTokenResponse>(
            `${this.BASE_URL}/authorise_vk`,
            {
                ...payload,
                authorInvite: payload.authorInvite ?? getStoredAuthorInvite(),
            }
        );
        saveAccessToken(response.data["Access-Token"]);
        clearStoredAuthorInvite();
    }

    async register(data: IRegisterForm) {
        await axiosClassic.post(`${this.BASE_URL}/create-user`, {
            username: data.username,
            password: data.password,
            role: "CUSTOMER",
            last_name: data.last_name,
            first_name: data.first_name,
            patronymic: data.patronymic?.trim() || null,
            email: data.email,
            phone: data.phone,
            author_invite: getStoredAuthorInvite(),
        });
        clearStoredAuthorInvite();
    }

    async refreshSession() {
        const response = await axiosClassic.post<AccessTokenResponse>(
            `${this.BASE_URL}/refresh-session`
        );
        saveAccessToken(response.data["Access-Token"]);
        return response.data["Access-Token"];
    }

    async getMe() {
        const response = await axiosWithAuth.get<IMeResponse>(
            `${this.BASE_URL}/me`
        );
        return response.data;
    }

    async updateProfile(data: IUserProfileUpdateRequest) {
        const response = await axiosWithAuth.put<IUserProfileResponse>(
            `${this.BASE_URL}/user/profile`,
            data
        );
        return response.data;
    }

    async confirmAge() {
        const response = await axiosWithAuth.post<{ age_confirmed: boolean }>(
            `${this.BASE_URL}/user/age-confirmation`
        );
        return response.data;
    }

    async changePassword(data: IChangePasswordRequest) {
        const response = await axiosWithAuth.patch<{ detail: string }>(
            `${this.BASE_URL}/change-password`,
            data
        );
        return response.data;
    }
}

const authService = new AuthService();
export default authService;
