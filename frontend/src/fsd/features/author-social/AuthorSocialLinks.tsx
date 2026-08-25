"use client";

import Image from "next/image";
import styled from "styled-components";

import { SELLER_SOCIAL_ICON_PATHS, type SellerSocialLinksInput } from "@shared/config/seller-social";

const SocialLinksOuter = styled.div<{ $placement: "inline" | "banner" }>`
    width: ${({ $placement }) => ($placement === "banner" ? "auto" : "100%")};
    margin-top: ${({ $placement }) => ($placement === "banner" ? "0" : "-8px")};

    ${({ $placement }) =>
        $placement === "banner"
            ? `
        position: absolute;
        left: 50%;
        bottom: 12px;
        transform: translateX(-50%);
        z-index: 1;
    `
            : ""}
`;

const SocialLinksRow = styled.div<{ $placement: "inline" | "banner" }>`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: ${({ $placement }) => ($placement === "banner" ? "center" : "flex-start")};
    gap: 14px;
`;

const SocialLink = styled.a`
    display: inline-flex;
    line-height: 0;
    opacity: 0.5;
    transition: opacity 0.2s ease;

    &:hover {
        opacity: 0.85;
    }

    &:focus-visible {
        outline: 2px solid rgba(255, 255, 255, 0.75);
        outline-offset: 3px;
        border-radius: 4px;
        opacity: 0.85;
    }
`;

const SocialIcon = styled(Image)`
    width: 24px;
    height: 24px;
    object-fit: contain;
    filter: brightness(0) invert(1);
    display: block;
`;

type AuthorSocialLinksProps = SellerSocialLinksInput & {
    placement?: "inline" | "banner";
};

export const AuthorSocialLinks = ({
    tiktokUrl,
    telegramChannelUrl,
    vkUrl,
    placement = "inline",
}: AuthorSocialLinksProps) => {
    const items = [
        tiktokUrl
            ? {
                  href: tiktokUrl,
                  label: "TikTok",
                  icon: SELLER_SOCIAL_ICON_PATHS.tiktok,
              }
            : null,
        telegramChannelUrl
            ? {
                  href: telegramChannelUrl,
                  label: "Telegram-канал",
                  icon: SELLER_SOCIAL_ICON_PATHS.telegram,
              }
            : null,
        vkUrl
            ? {
                  href: vkUrl,
                  label: "ВКонтакте",
                  icon: SELLER_SOCIAL_ICON_PATHS.vk,
              }
            : null,
    ].filter((item): item is NonNullable<typeof item> => item !== null);

    if (items.length === 0) {
        return null;
    }

    return (
        <SocialLinksOuter $placement={placement}>
            <SocialLinksRow $placement={placement}>
                {items.map((item) => (
                    <SocialLink
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.label}
                    >
                        <SocialIcon src={item.icon} alt="" width={24} height={24} aria-hidden />
                    </SocialLink>
                ))}
            </SocialLinksRow>
        </SocialLinksOuter>
    );
};
