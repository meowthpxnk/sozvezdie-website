import type { ModerationStatus } from "./seller-product.types";

export interface Author {
    id: string;
    name: string;
    avatarImage?: string;
    bannerImage?: string;
    description?: string;
    tiktokUrl?: string;
    telegramChannelUrl?: string;
    vkUrl?: string;
    moderationStatus?: ModerationStatus;
}
