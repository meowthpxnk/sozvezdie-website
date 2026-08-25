import authorService from "./author.service";

export type ModerationRequestTarget =
    | { kind: "product"; productId: string }
    | { kind: "product-deletion"; productId: string }
    | { kind: "brand"; moderationId: string };

export function parseModerationRequestTarget(
    feedItemId: string
): ModerationRequestTarget | null {
    if (feedItemId.startsWith("product-delete-")) {
        const productId = feedItemId.slice("product-delete-".length);
        return productId ? { kind: "product-deletion", productId } : null;
    }

    if (feedItemId.startsWith("product-")) {
        const productId = feedItemId.slice("product-".length);
        return productId ? { kind: "product", productId } : null;
    }

    if (feedItemId.startsWith("brand-")) {
        const moderationId = feedItemId.slice("brand-".length);
        return moderationId ? { kind: "brand", moderationId } : null;
    }

    return null;
}

export async function cancelModerationRequest(
    target: ModerationRequestTarget
): Promise<void> {
    if (target.kind === "product") {
        await authorService.cancelProductModerationRequest(target.productId);
        return;
    }

    if (target.kind === "product-deletion") {
        await authorService.cancelProductDeletionRequest(target.productId);
        return;
    }

    await authorService.cancelBrandModerationRequest(target.moderationId);
}
