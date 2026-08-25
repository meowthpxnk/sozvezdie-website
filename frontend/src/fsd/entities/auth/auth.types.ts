import { UserRole } from "@entities/user";

export interface IMeResponse {
    id: number;
    username: string;
    role: string;
    last_name: string | null;
    first_name: string | null;
    patronymic: string | null;
    email: string | null;
    phone: string | null;
    one_c_author_id?: string | null;
    is_blocked_without_1c?: boolean;
    age_confirmed?: boolean;
}

export interface IUserProfileUpdateRequest {
    last_name: string | null;
    first_name: string | null;
    patronymic: string | null;
    email: string | null;
    phone: string | null;
}

export interface IChangePasswordRequest {
    current_password: string;
    new_password: string;
}

export interface IUserProfileResponse {
    id: number;
    username: string;
    last_name: string | null;
    first_name: string | null;
    patronymic: string | null;
    email: string | null;
    phone: string | null;
}

export const mapBackendRole = (role: string): UserRole => {
    switch (role) {
        case "SELLER":
            return "AUTHOR";
        case "MODERATOR":
            return "MODERATOR";
        case "SUPER_MODERATOR":
            return "SUPER_MODERATOR";
        case "ADMIN":
            return "ADMIN";
        case "CUSTOMER":
            return "CUSTOMER";
        default:
            return "CUSTOMER";
    }
};
