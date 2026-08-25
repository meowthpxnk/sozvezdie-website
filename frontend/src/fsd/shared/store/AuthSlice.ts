import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@entities/user";
import { fetchMe, updateUserProfile, confirmUserAge } from "../../entities/auth/authThunk";

export interface IAuthStoreState extends User {
    loading: boolean;
    saving: boolean;
    isAuthenticated: boolean;
    /** true после первого fetchMe (успех или ошибка) в текущей сессии */
    sessionChecked: boolean;
}

export type ProfileFields = Pick<
    User,
    "lastName" | "firstName" | "patronymic" | "email" | "phone"
>;

const initialState: IAuthStoreState = {
    id: "",
    username: "",
    role: "CUSTOMER",
    lastName: null,
    firstName: null,
    patronymic: null,
    email: null,
    phone: null,
    oneCAuthorId: null,
    isBlockedWithout1c: false,
    ageConfirmed: false,
    loading: false,
    saving: false,
    isAuthenticated: false,
    sessionChecked: false,
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (_state, action: PayloadAction<User>) => {
            return {
                ...action.payload,
                loading: false,
                saving: false,
                isAuthenticated: true,
                sessionChecked: true,
            };
        },

        setProfileFields: (state, action: PayloadAction<Partial<ProfileFields>>) => {
            if (action.payload.lastName !== undefined) {
                state.lastName = action.payload.lastName;
            }
            if (action.payload.firstName !== undefined) {
                state.firstName = action.payload.firstName;
            }
            if (action.payload.patronymic !== undefined) {
                state.patronymic = action.payload.patronymic;
            }
            if (action.payload.email !== undefined) {
                state.email = action.payload.email;
            }
            if (action.payload.phone !== undefined) {
                state.phone = action.payload.phone;
            }
        },

        logout: () => initialState,

        beginSessionCheck: (state) => {
            state.sessionChecked = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMe.pending, (state) => {
                if (!state.isAuthenticated) {
                    state.loading = true;
                }
            })
            .addCase(fetchMe.fulfilled, (state, action) => {
                state.loading = false;
                state.sessionChecked = true;
                state.isAuthenticated = true;
                state.id = action.payload.id;
                state.username = action.payload.username;
                state.role = action.payload.role;
                state.lastName = action.payload.lastName;
                state.firstName = action.payload.firstName;
                state.patronymic = action.payload.patronymic;
                state.email = action.payload.email;
                state.phone = action.payload.phone;
                state.oneCAuthorId = action.payload.oneCAuthorId;
                state.isBlockedWithout1c = action.payload.isBlockedWithout1c;
                state.ageConfirmed = action.payload.ageConfirmed;
            })
            .addCase(fetchMe.rejected, (state) => {
                state.loading = false;
                state.sessionChecked = true;
                state.isAuthenticated = false;
                state.id = "";
                state.username = "";
                state.role = "CUSTOMER";
                state.lastName = null;
                state.firstName = null;
                state.patronymic = null;
                state.email = null;
                state.phone = null;
                state.oneCAuthorId = null;
                state.isBlockedWithout1c = false;
                state.ageConfirmed = false;
            })
            .addCase(updateUserProfile.pending, (state) => {
                state.saving = true;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.saving = false;
                state.id = action.payload.id;
                state.username = action.payload.username;
                state.role = action.payload.role;
                state.lastName = action.payload.lastName;
                state.firstName = action.payload.firstName;
                state.patronymic = action.payload.patronymic;
                state.email = action.payload.email;
                state.phone = action.payload.phone;
            })
            .addCase(updateUserProfile.rejected, (state) => {
                state.saving = false;
            })
            .addCase(confirmUserAge.fulfilled, (state) => {
                state.ageConfirmed = true;
            });
    },
});

export const { setUser, setProfileFields, logout, beginSessionCheck } =
    authSlice.actions;
