import styled from "styled-components";

import type { UserRole } from "@entities/user";
import { canAccessModeration, isAuthorRole, isSuperModeratorRole } from "@shared/lib/roles";

import {
    AuthorManagementButtonsMap,
    AuthorManagementEntryButton,
    ModeratorManagementButtonsMap,
    ModeratorManagementEntryButton,
    SuperAdminManagementButtonsMap,
    SuperAdminManagementEntryButton,
    UserButtonMap,
} from "./LinkMaps";
import type { HeaderNavMode } from "./header-nav";

export type HeaderActionsRole = UserRole | "USER";

export interface HeaderActionsProps {
    mode: HeaderNavMode;
    role?: UserRole;
    pathname: string;
}

const ManagementTile = styled.div`
    display: flex;
    align-items: center;
    height: 34px;
    margin-right: 8px;
    padding: 0 3px;
    border-radius: 999px;
    background: var(--header-management-tile-bg);

    @media (max-width: 639px) {
        height: 18px;
        margin-right: 4px;
        padding: 0 2px;
        border-radius: 5px;
    }
`;

function ManagementTileButtons({
    mode,
    role,
    pathname,
}: HeaderActionsProps) {
    switch (mode) {
        case "author-management":
            return <AuthorManagementButtonsMap pathname={pathname} />;

        case "moderator-management":
            return <ModeratorManagementButtonsMap pathname={pathname} />;

        case "super-admin-management":
            return <SuperAdminManagementButtonsMap pathname={pathname} />;

        case "storefront":
        default:
            return (
                <>
                    {isAuthorRole(role) ? (
                        <AuthorManagementEntryButton pathname={pathname} />
                    ) : null}
                    {canAccessModeration(role) && !isSuperModeratorRole(role) ? (
                        <ModeratorManagementEntryButton pathname={pathname} />
                    ) : null}
                    {isSuperModeratorRole(role) ? (
                        <SuperAdminManagementEntryButton pathname={pathname} />
                    ) : null}
                </>
            );
    }
}

export const HeaderActions = ({ mode, role, pathname }: HeaderActionsProps) => {
    const showManagementTile =
        isAuthorRole(role) || canAccessModeration(role) || isSuperModeratorRole(role);

    return (
        <>
            {showManagementTile ? (
                <ManagementTile>
                    <ManagementTileButtons
                        mode={mode}
                        role={role}
                        pathname={pathname}
                    />
                </ManagementTile>
            ) : null}
            <UserButtonMap pathname={pathname} />
        </>
    );
};

export default HeaderActions;
