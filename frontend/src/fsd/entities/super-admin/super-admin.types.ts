export type AssignableUserRole = "CUSTOMER" | "SELLER" | "MODERATOR";

export type SuperAdminUser = {
    id: number;
    username: string;
    role: "CUSTOMER" | "SELLER" | "MODERATOR";
    fullName: string | null;
    email: string | null;
    phone: string | null;
    isSuperModerator: boolean;
    oneCAuthorId: string | null;
    oneCWarning: string | null;
    hasSellerCard: boolean;
    sellerCardDisabled: boolean;
};

export interface ISuperAdminUserApiResponse {
    id: number;
    username: string;
    role: "CUSTOMER" | "SELLER" | "MODERATOR";
    full_name: string | null;
    email: string | null;
    phone: string | null;
    is_super_moderator: boolean;
    one_c_author_id?: string | null;
    one_c_warning?: string | null;
    has_seller_card?: boolean;
    seller_card_disabled?: boolean;
}

export function mapSuperAdminUser(data: ISuperAdminUserApiResponse): SuperAdminUser {
    return {
        id: data.id,
        username: data.username,
        role: data.role,
        fullName: data.full_name,
        email: data.email,
        phone: data.phone,
        isSuperModerator: data.is_super_moderator,
        oneCAuthorId: data.one_c_author_id ?? null,
        oneCWarning: data.one_c_warning ?? null,
        hasSellerCard: Boolean(data.has_seller_card),
        sellerCardDisabled: Boolean(data.seller_card_disabled),
    };
}
