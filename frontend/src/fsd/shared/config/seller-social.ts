export const SELLER_SOCIAL_ICON_PATHS = {
    tiktok: "/socials/tik-tok.png",
    telegram: "/socials/telegram.png",
    vk: "/socials/vk-social-network-logo.png",
} as const;

export type SellerSocialLinksInput = {
    tiktokUrl?: string | null;
    telegramChannelUrl?: string | null;
    vkUrl?: string | null;
};
