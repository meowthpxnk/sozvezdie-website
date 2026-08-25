import type { ModerationStatus } from "@entities/author/seller-product.types";
import {
    type ISellerProductApiResponse,
    mapSellerProduct,
    type SellerProduct,
} from "@entities/author/seller-product.types";

export type ModerationActionType =
    | "CREATE_PRODUCT"
    | "CREATE_SHOP"
    | "UPDATE_BRAND"
    | "MODERATOR_PRODUCT_EDIT"
    | "DELETE_PRODUCT";

export type ModerationFieldDiff = {
    label: string;
    before: string;
    after: string;
    beforeImageUrl?: string;
    afterImageUrl?: string;
};

export type ModerationProposal = {
    id: string;
    createdAt: string;
    title: string;
    type: ModerationActionType;
    status: ModerationStatus;
    submittedBy: string;
    moderatedBy?: string;
    moderationComment?: string;
    previewImageUrl?: string;
    previewBannerUrl?: string;
    previewAvatarUrl?: string;
    changes: ModerationFieldDiff[];
};

export type ModerationFilter = ModerationStatus;

export interface IModerationProposalApiResponse {
    id: string;
    createdAt: string;
    title: string;
    type: string;
    status: ModerationStatus;
    submittedBy: string;
    moderatedBy?: string | null;
    moderationComment?: string | null;
    previewImageUrl?: string | null;
    previewBannerUrl?: string | null;
    previewAvatarUrl?: string | null;
    changes: ModerationFieldDiff[];
}

export const MODERATION_ACTION_LABELS: Record<ModerationActionType, string> = {
    CREATE_PRODUCT: "Создание товара",
    CREATE_SHOP: "Создание магазина",
    UPDATE_BRAND: "Редактирование бренда",
    MODERATOR_PRODUCT_EDIT: "Изменение товара модератором",
    DELETE_PRODUCT: "Удаление товара",
};

const MODERATION_ACTION_TYPE_SET = new Set<string>([
    "CREATE_PRODUCT",
    "CREATE_SHOP",
    "UPDATE_BRAND",
    "MODERATOR_PRODUCT_EDIT",
    "DELETE_PRODUCT",
]);

function parseModerationActionType(type: string): ModerationActionType {
    if (MODERATION_ACTION_TYPE_SET.has(type)) {
        return type as ModerationActionType;
    }

    return "CREATE_PRODUCT";
}

export const MODERATION_PROPOSAL_STATUS_LABELS: Record<ModerationStatus, string> = {
    PENDING: "На модерации",
    APPROVED: "Принято",
    REJECTED: "Отклонено",
};

export type ModerationEdit = {
    kind: "product" | "brand";
    proposal: ModerationProposal;
    product?: SellerProduct;
    brandName?: string;
    brandDescription?: string;
    avatarImage?: string;
    bannerImage?: string;
    tiktokUrl?: string;
    telegramChannelUrl?: string;
    vkUrl?: string;
    actionType?: string;
};

export interface IModerationEditApiResponse {
    kind: string;
    proposal: IModerationProposalApiResponse;
    product?: ISellerProductApiResponse | null;
    brandName?: string | null;
    brandDescription?: string | null;
    avatarImage?: string | null;
    bannerImage?: string | null;
    tiktokUrl?: string | null;
    telegramChannelUrl?: string | null;
    vkUrl?: string | null;
    actionType?: string | null;
}

export function mapModerationEdit(data: IModerationEditApiResponse): ModerationEdit {
    return {
        kind: data.kind === "brand" ? "brand" : "product",
        proposal: mapModerationProposal(data.proposal),
        product: data.product ? mapSellerProduct(data.product) : undefined,
        brandName: data.brandName ?? undefined,
        brandDescription: data.brandDescription ?? undefined,
        avatarImage: data.avatarImage ?? undefined,
        bannerImage: data.bannerImage ?? undefined,
        tiktokUrl: data.tiktokUrl ?? undefined,
        telegramChannelUrl: data.telegramChannelUrl ?? undefined,
        vkUrl: data.vkUrl ?? undefined,
        actionType: data.actionType ?? undefined,
    };
}

export function mapModerationProposal(
    data: IModerationProposalApiResponse
): ModerationProposal {
    return {
        id: data.id,
        createdAt: data.createdAt,
        title: data.title,
        type: parseModerationActionType(data.type),
        status: data.status,
        submittedBy: data.submittedBy,
        moderatedBy: data.moderatedBy ?? undefined,
        moderationComment: data.moderationComment ?? undefined,
        previewImageUrl: data.previewImageUrl ?? undefined,
        previewBannerUrl: data.previewBannerUrl ?? undefined,
        previewAvatarUrl: data.previewAvatarUrl ?? undefined,
        changes: data.changes,
    };
}
