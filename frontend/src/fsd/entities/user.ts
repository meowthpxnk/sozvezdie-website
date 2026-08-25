export interface User {
    id: string;
    role: UserRole;
    username: string;
    lastName: string | null;
    firstName: string | null;
    patronymic: string | null;
    email: string | null;
    phone: string | null;
    oneCAuthorId: string | null;
    isBlockedWithout1c: boolean;
    ageConfirmed: boolean;
}

export type UserRole = "AUTHOR" | "CUSTOMER" | "MODERATOR" | "ADMIN" | "SUPER_MODERATOR";

export function formatPersonName(parts: {
    lastName?: string | null;
    firstName?: string | null;
    patronymic?: string | null;
}): string {
    return [parts.lastName, parts.firstName, parts.patronymic]
        .map((part) => part?.trim())
        .filter(Boolean)
        .join(" ");
}
