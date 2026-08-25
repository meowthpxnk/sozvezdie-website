import type { UserRole } from "@entities/user";

export function isAuthorRole(role?: UserRole): boolean {
    return role === "AUTHOR" || role === "ADMIN";
}

export function isModeratorRole(role?: UserRole): boolean {
    return role === "MODERATOR";
}

export function isSuperModeratorRole(role?: UserRole): boolean {
    return role === "SUPER_MODERATOR";
}

export function canAccessModeration(role?: UserRole): boolean {
    return isModeratorRole(role) || isSuperModeratorRole(role);
}
