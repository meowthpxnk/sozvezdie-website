import type { Author } from "./author";
import type { ModerationStatus } from "./seller-product.types";

export interface IAuthorDashboardApiResponse {
    seller_card: {
        id: string;
        name: string;
        desc: string;
        bannerImage: string | null;
        avatarImage: string | null;
        tiktokUrl?: string | null;
        telegramChannelUrl?: string | null;
        vkUrl?: string | null;
        moderationStatus: ModerationStatus;
        createdAt?: string;
    } | null;
    products_count: number;
    stock_total: number;
    pending_count: number;
    approved_count: number;
    rejected_count: number;
}

export interface AuthorDashboard {
    sellerCard: Author | null;
    productsCount: number;
    stockTotal: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
}

export function mapAuthorDashboard(
    data: IAuthorDashboardApiResponse
): AuthorDashboard {
    return {
        sellerCard: data.seller_card
            ? {
                  id: data.seller_card.id,
                  name: data.seller_card.name,
                  description: data.seller_card.desc,
                  bannerImage: data.seller_card.bannerImage ?? undefined,
                  avatarImage: data.seller_card.avatarImage ?? undefined,
                  tiktokUrl: data.seller_card.tiktokUrl ?? undefined,
                  telegramChannelUrl: data.seller_card.telegramChannelUrl ?? undefined,
                  vkUrl: data.seller_card.vkUrl ?? undefined,
                  moderationStatus: data.seller_card.moderationStatus,
              }
            : null,
        productsCount: data.products_count,
        stockTotal: data.stock_total,
        pendingCount: data.pending_count,
        approvedCount: data.approved_count,
        rejectedCount: data.rejected_count,
    };
}
