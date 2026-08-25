import { createAsyncThunk } from "@reduxjs/toolkit";
import { User } from "@entities/user";

import authService from "./auth.service";
import {
    IUserProfileResponse,
    mapBackendRole,
} from "./auth.types";

type AuthProfileState = Pick<
    User,
    "lastName" | "firstName" | "patronymic" | "email" | "phone" | "role"
>;

const mapMeToUser = (
    me: Awaited<ReturnType<typeof authService.getMe>>
): User => ({
    id: String(me.id),
    username: me.username,
    role: mapBackendRole(me.role),
    lastName: me.last_name,
    firstName: me.first_name,
    patronymic: me.patronymic,
    email: me.email,
    phone: me.phone,
    oneCAuthorId: me.one_c_author_id ?? null,
    isBlockedWithout1c: Boolean(me.is_blocked_without_1c),
    ageConfirmed: Boolean(me.age_confirmed),
});

const mapProfileResponseToUser = (
    profile: IUserProfileResponse,
    role: User["role"]
): User => ({
    id: String(profile.id),
    username: profile.username,
    role,
    lastName: profile.last_name,
    firstName: profile.first_name,
    patronymic: profile.patronymic,
    email: profile.email,
    phone: profile.phone,
    oneCAuthorId: null,
    isBlockedWithout1c: false,
    ageConfirmed: false,
});

export const fetchMe = createAsyncThunk(
    "auth/fetchMe",
    async (_, thunkAPI) => {
        try {
            const me = await authService.getMe();
            return mapMeToUser(me);
        } catch {
            return thunkAPI.rejectWithValue("Failed to fetch user profile");
        }
    },
    {
        condition: (_, { getState }) => {
            const { auth } = getState() as { auth: { loading: boolean } };
            return !auth.loading;
        },
    }
);

export const confirmUserAge = createAsyncThunk(
    "auth/confirmUserAge",
    async (_, thunkAPI) => {
        try {
            await authService.confirmAge();
            return true;
        } catch {
            return thunkAPI.rejectWithValue("Failed to confirm age");
        }
    }
);

export const updateUserProfile = createAsyncThunk(
    "auth/updateUserProfile",
    async (_, { getState, rejectWithValue }) => {
        const { auth } = getState() as { auth: AuthProfileState };

        try {
            const profile = await authService.updateProfile({
                last_name: auth.lastName?.trim() || null,
                first_name: auth.firstName?.trim() || null,
                patronymic: auth.patronymic?.trim() || null,
                email: auth.email?.trim() || null,
                phone: auth.phone?.trim() || null,
            });
            return mapProfileResponseToUser(profile, auth.role);
        } catch {
            return rejectWithValue("Failed to update user profile");
        }
    }
);
