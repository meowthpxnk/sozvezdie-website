"use client";

import { useMemo, useState } from "react";
import styled from "styled-components";
import { AlertTriangle, Mail, TriangleAlert } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import {
    superAdminService,
    type AssignableUserRole,
    type SuperAdminUser,
} from "@entities/super-admin";
import { SetAdminChrome } from "@widgets/AdminShell";
import { IconActionButton } from "@/src/shared/ui/icon-action-button";

import {
    AssignOneCModal,
    ConfirmDeleteOneCModal,
    ConfirmDeleteShopModal,
    ConfirmDemoteModal,
} from "./AssignOneCModal";

const Card = styled.section`
    background: var(--color-bg-primary);
    border-radius: 14px;
    padding: 20px;
    box-shadow: 0 8px 24px rgb(17 31 60 / 5%);
    display: flex;
    flex-direction: column;
    gap: 14px;
`;

const SearchInput = styled.input`
    width: 100%;
    min-height: 42px;
    border-radius: 10px;
    border: 1px solid var(--color-border-secondary);
    padding: 0 12px;
    font-size: 14px;
    color: var(--color-text-primary);
    box-sizing: border-box;
    background: var(--color-bg-primary);

    &:focus {
        outline: 2px solid var(--main-color);
        outline-offset: 1px;
    }
`;

const UserRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px 0;
    border-bottom: 1px solid var(--color-border-secondary);

    &:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }

    @media (min-width: 720px) {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }
`;

const UserMeta = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
`;

const UserNameRow = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
`;

const UserName = styled.p`
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: var(--color-text-primary);
`;

const UserDetails = styled.p`
    margin: 0;
    font-size: 13px;
    color: var(--color-text-secondary);
`;

const RoleControls = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
`;

const RoleSelect = styled.select`
    min-height: 38px;
    border-radius: 8px;
    border: 1px solid var(--color-border-secondary);
    padding: 0 10px;
    font-size: 14px;
    color: var(--color-text-primary);
    background: var(--color-bg-primary);
`;

const SaveButton = styled.button`
    min-height: 38px;
    padding: 0 14px;
    border: none;
    border-radius: 8px;
    background: var(--main-color);
    color: var(--color);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const AssignOneCButton = styled.button`
    min-height: 38px;
    padding: 0 12px;
    border: 1px solid var(--alert-danger-fg);
    border-radius: 8px;
    background: var(--alert-danger-bg);
    color: var(--alert-danger-fg);
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
`;

const WarnActionButton = styled.button`
    min-height: 38px;
    padding: 0 12px;
    border: 1px solid var(--alert-warning-fg);
    border-radius: 8px;
    background: var(--alert-warning-bg);
    color: var(--alert-warning-fg);
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const EmptyState = styled.p`
    margin: 0;
    font-size: 14px;
    color: var(--color-text-secondary);
`;

const AlertBadge = styled.span<{ $tone: "danger" | "warning" }>`
    position: relative;
    width: 22px;
    height: 22px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: ${({ $tone }) =>
        $tone === "danger" ? "var(--alert-danger-bg)" : "var(--alert-warning-bg)"};
    color: ${({ $tone }) =>
        $tone === "danger" ? "var(--alert-danger-fg)" : "var(--alert-warning-fg)"};

    svg {
        width: 14px;
        height: 14px;
    }

    &:hover span,
    &:focus-visible span {
        opacity: 1;
        visibility: visible;
    }
`;

const AlertTooltip = styled.span`
    position: absolute;
    left: 50%;
    bottom: calc(100% + 8px);
    transform: translateX(-50%);
    width: max-content;
    max-width: 240px;
    padding: 6px 8px;
    border-radius: 8px;
    background: var(--ocean-color);
    color: var(--color);
    font-size: 12px;
    line-height: 1.35;
    font-weight: 600;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    z-index: 2;
`;

const InviteButton = styled(IconActionButton).attrs({ $active: true })``;

const ROLE_LABELS: Record<AssignableUserRole, string> = {
    CUSTOMER: "Покупатель",
    SELLER: "Продавец (Seller)",
    MODERATOR: "Модератор",
};

const ASSIGNABLE_ROLES: AssignableUserRole[] = ["CUSTOMER", "SELLER", "MODERATOR"];

type AssignModalState =
    | { type: "invite" }
    | { type: "promote"; user: SuperAdminUser; role: AssignableUserRole }
    | { type: "assign"; user: SuperAdminUser };

type DemoteModalState = {
    user: SuperAdminUser;
    role: AssignableUserRole;
};

type CleanupModalState =
    | { type: "one-c"; user: SuperAdminUser }
    | { type: "shop"; user: SuperAdminUser };

function isAssignableRole(role: SuperAdminUser["role"]): role is AssignableUserRole {
    return role === "CUSTOMER" || role === "SELLER" || role === "MODERATOR";
}

export function SuperAdminUsersPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [draftRoles, setDraftRoles] = useState<Record<number, AssignableUserRole>>({});
    const [assignModal, setAssignModal] = useState<AssignModalState | null>(null);
    const [demoteModal, setDemoteModal] = useState<DemoteModalState | null>(null);
    const [cleanupModal, setCleanupModal] = useState<CleanupModalState | null>(null);

    const usersQuery = useQuery({
        queryKey: ["super-admin", "users", search],
        queryFn: () => superAdminService.getUsers(search.trim() || undefined),
    });

    const invalidateUsers = async () => {
        await queryClient.invalidateQueries({ queryKey: ["super-admin", "users"] });
    };

    const assignMutation = useMutation({
        mutationFn: ({
            userId,
            role,
            oneCAuthorId,
            deleteFrom1c,
            deleteShop,
        }: {
            userId: number;
            role: AssignableUserRole;
            oneCAuthorId?: string;
            deleteFrom1c?: boolean;
            deleteShop?: boolean;
        }) =>
            superAdminService.assignRole(userId, role, {
                oneCAuthorId,
                deleteFrom1c,
                deleteShop,
            }),
        onSuccess: async (user) => {
            await invalidateUsers();
            toast.success("Роль обновлена");
            if (user.oneCWarning) {
                toast.error(user.oneCWarning);
            }
            setDraftRoles((prev) => {
                const next = { ...prev };
                delete next[user.id];
                return next;
            });
            setAssignModal(null);
            setDemoteModal(null);
        },
        onError: (error) => {
            if (isAxiosError(error) && error.response?.status === 400) {
                return;
            }
            toast.error("Не удалось обновить роль");
        },
    });

    const assignOneCMutation = useMutation({
        mutationFn: ({ userId, oneCAuthorId }: { userId: number; oneCAuthorId: string }) =>
            superAdminService.assignOneCAuthorId(userId, oneCAuthorId),
        onSuccess: async () => {
            await invalidateUsers();
            toast.success("ID 1C присвоен");
            setAssignModal(null);
        },
        onError: (error) => {
            if (isAxiosError(error) && error.response?.status === 400) {
                return;
            }
            toast.error("Не удалось присвоить ID 1C");
        },
    });

    const inviteMutation = useMutation({
        mutationFn: (oneCAuthorId: string) => superAdminService.createAuthorInvite(oneCAuthorId),
        onSuccess: async ({ token }) => {
            const url = `${window.location.origin}/auth?mode=register&authorInvite=${encodeURIComponent(token)}`;
            try {
                await navigator.clipboard.writeText(url);
                toast.success("Ссылка скопирована");
            } catch {
                toast.success("Ссылка создана", { description: url });
            }
            setAssignModal(null);
        },
        onError: (error) => {
            if (isAxiosError(error) && error.response?.status === 400) {
                return;
            }
            toast.error("Не удалось создать реферальную ссылку");
        },
    });

    const deleteFrom1cMutation = useMutation({
        mutationFn: (userId: number) => superAdminService.deleteFrom1c(userId),
        onSuccess: async (user) => {
            await invalidateUsers();
            toast.success("ID 1C отвязан");
            if (user.oneCWarning) {
                toast.error(user.oneCWarning);
            }
            setCleanupModal(null);
        },
        onError: (error) => {
            if (isAxiosError(error) && error.response?.status === 400) {
                return;
            }
            toast.error("Не удалось удалить аккаунт из 1C");
        },
    });

    const deleteShopMutation = useMutation({
        mutationFn: (userId: number) => superAdminService.deleteShop(userId),
        onSuccess: async () => {
            await invalidateUsers();
            toast.success("Магазин и бренд удалены");
            setCleanupModal(null);
        },
        onError: (error) => {
            if (isAxiosError(error) && error.response?.status === 400) {
                return;
            }
            toast.error("Не удалось удалить магазин");
        },
    });

    const users = usersQuery.data ?? [];

    const editableUsers = useMemo(
        () => users.filter((user) => !user.isSuperModerator),
        [users]
    );

    const titleRight = useMemo(
        () => (
            <InviteButton
                type="button"
                aria-label="Отправить реферальную ссылку для регистрации автора"
                title="Отправить реферальную ссылку для регистрации автора"
                onClick={() => setAssignModal({ type: "invite" })}
            >
                <Mail aria-hidden />
            </InviteButton>
        ),
        []
    );

    const handleSaveRole = (user: SuperAdminUser, nextRole: AssignableUserRole) => {
        if (nextRole === "SELLER") {
            setAssignModal({ type: "promote", user, role: nextRole });
            return;
        }
        if (user.role === "SELLER") {
            setDemoteModal({ user, role: nextRole });
            return;
        }
        assignMutation.mutate({ userId: user.id, role: nextRole });
    };

    const assignModalTitle =
        assignModal?.type === "invite"
            ? "Реферальная ссылка автора"
            : assignModal?.type === "promote"
              ? "Присвоить ID 1C"
              : "Подключить ID 1C";

    const assignModalDescription =
        assignModal?.type === "invite"
            ? "Введите ID автора 1C или сгенерируйте его, затем скопируйте ссылку для регистрации."
            : "У каждого автора должен быть уникальный ID 1C.";

    return (
        <>
            <SetAdminChrome title="Пользователи" titleRight={titleRight} />
            <Card>
                <SearchInput
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Поиск по логину, имени или email"
                />
                {usersQuery.isLoading ? <EmptyState>Загрузка…</EmptyState> : null}
                {usersQuery.isError ? (
                    <EmptyState>Не удалось загрузить список пользователей.</EmptyState>
                ) : null}
                {!usersQuery.isLoading && editableUsers.length === 0 ? (
                    <EmptyState>Пользователи не найдены.</EmptyState>
                ) : null}
                {editableUsers.map((user) => {
                    const currentRole =
                        draftRoles[user.id] ??
                        (isAssignableRole(user.role) ? user.role : "CUSTOMER");
                    const canSave = !user.isSuperModerator && currentRole !== user.role;
                    const missingOneC = user.role === "SELLER" && !user.oneCAuthorId;
                    const leftoverOneC = user.role !== "SELLER" && Boolean(user.oneCAuthorId);
                    const leftoverShop = user.role !== "SELLER" && user.hasSellerCard;

                    return (
                        <UserRow key={user.id}>
                            <UserMeta>
                                <UserNameRow>
                                    <UserName>@{user.username}</UserName>
                                    {missingOneC ? (
                                        <AlertBadge
                                            $tone="danger"
                                            tabIndex={0}
                                            aria-label="Не подключен 1C"
                                        >
                                            <AlertTriangle aria-hidden />
                                            <AlertTooltip>Не подключен 1C</AlertTooltip>
                                        </AlertBadge>
                                    ) : null}
                                    {leftoverOneC ? (
                                        <AlertBadge
                                            $tone="warning"
                                            tabIndex={0}
                                            aria-label="К аккаунту привязан личный кабинет автора в 1C"
                                        >
                                            <TriangleAlert aria-hidden />
                                            <AlertTooltip>
                                                К аккаунту привязан личный кабинет автора в 1C
                                            </AlertTooltip>
                                        </AlertBadge>
                                    ) : null}
                                    {leftoverShop ? (
                                        <AlertBadge
                                            $tone="warning"
                                            tabIndex={0}
                                            aria-label="У пользователя есть бренд и товары"
                                        >
                                            <TriangleAlert aria-hidden />
                                            <AlertTooltip>
                                                У пользователя есть бренд и товары
                                            </AlertTooltip>
                                        </AlertBadge>
                                    ) : null}
                                </UserNameRow>
                                <UserDetails>
                                    {user.fullName || "—"} ·{" "}
                                    {isAssignableRole(user.role)
                                        ? ROLE_LABELS[user.role]
                                        : user.role}
                                    {user.oneCAuthorId ? ` · 1C: ${user.oneCAuthorId}` : ""}
                                </UserDetails>
                                {user.email ? <UserDetails>{user.email}</UserDetails> : null}
                            </UserMeta>
                            <RoleControls>
                                {missingOneC ? (
                                    <AssignOneCButton
                                        type="button"
                                        onClick={() => setAssignModal({ type: "assign", user })}
                                    >
                                        Присвоить ID 1C
                                    </AssignOneCButton>
                                ) : null}
                                {leftoverOneC ? (
                                    <WarnActionButton
                                        type="button"
                                        disabled={deleteFrom1cMutation.isPending}
                                        onClick={() => setCleanupModal({ type: "one-c", user })}
                                    >
                                        Удалить из 1C
                                    </WarnActionButton>
                                ) : null}
                                {leftoverShop ? (
                                    <WarnActionButton
                                        type="button"
                                        disabled={deleteShopMutation.isPending}
                                        onClick={() => setCleanupModal({ type: "shop", user })}
                                    >
                                        Удалить магазин и бренд
                                    </WarnActionButton>
                                ) : null}
                                <RoleSelect
                                    value={currentRole}
                                    onChange={(event) =>
                                        setDraftRoles((prev) => ({
                                            ...prev,
                                            [user.id]: event.target.value as AssignableUserRole,
                                        }))
                                    }
                                >
                                    {ASSIGNABLE_ROLES.map((role) => (
                                        <option key={role} value={role}>
                                            {ROLE_LABELS[role]}
                                        </option>
                                    ))}
                                </RoleSelect>
                                <SaveButton
                                    type="button"
                                    disabled={!canSave || assignMutation.isPending}
                                    onClick={() => handleSaveRole(user, currentRole)}
                                >
                                    Сохранить
                                </SaveButton>
                            </RoleControls>
                        </UserRow>
                    );
                })}
            </Card>
            <AssignOneCModal
                isOpen={assignModal !== null}
                title={assignModalTitle}
                description={assignModalDescription}
                initialId={
                    assignModal && assignModal.type !== "invite"
                        ? assignModal.user.oneCAuthorId ?? ""
                        : ""
                }
                submitLabel={assignModal?.type === "invite" ? "Создать ссылку" : "Сохранить"}
                isPending={
                    assignMutation.isPending ||
                    assignOneCMutation.isPending ||
                    inviteMutation.isPending
                }
                onClose={() => setAssignModal(null)}
                onSubmit={(oneCAuthorId) => {
                    if (assignModal?.type === "invite") {
                        inviteMutation.mutate(oneCAuthorId);
                        return;
                    }
                    if (assignModal?.type === "promote") {
                        assignMutation.mutate({
                            userId: assignModal.user.id,
                            role: assignModal.role,
                            oneCAuthorId,
                        });
                        return;
                    }
                    if (assignModal?.type === "assign") {
                        assignOneCMutation.mutate({
                            userId: assignModal.user.id,
                            oneCAuthorId,
                        });
                    }
                }}
            />
            <ConfirmDemoteModal
                isOpen={demoteModal !== null}
                isPending={assignMutation.isPending}
                hasOneC={Boolean(demoteModal?.user.oneCAuthorId)}
                hasShop={Boolean(demoteModal?.user.hasSellerCard)}
                onClose={() => setDemoteModal(null)}
                onConfirm={({ deleteFrom1c, deleteShop }) => {
                    if (!demoteModal) {
                        return;
                    }
                    assignMutation.mutate({
                        userId: demoteModal.user.id,
                        role: demoteModal.role,
                        deleteFrom1c,
                        deleteShop,
                    });
                }}
            />
            <ConfirmDeleteOneCModal
                isOpen={cleanupModal?.type === "one-c"}
                isPending={deleteFrom1cMutation.isPending}
                onClose={() => setCleanupModal(null)}
                onConfirm={() => {
                    if (cleanupModal?.type !== "one-c") {
                        return;
                    }
                    deleteFrom1cMutation.mutate(cleanupModal.user.id);
                }}
            />
            <ConfirmDeleteShopModal
                isOpen={cleanupModal?.type === "shop"}
                isPending={deleteShopMutation.isPending}
                onClose={() => setCleanupModal(null)}
                onConfirm={() => {
                    if (cleanupModal?.type !== "shop") {
                        return;
                    }
                    deleteShopMutation.mutate(cleanupModal.user.id);
                }}
            />
        </>
    );
}
