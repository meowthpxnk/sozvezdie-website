import { getMediaImageUrl } from "@shared/lib/media-url";
import type { SellerProduct } from "@entities/author/seller-product.types";

import type { AuthorProductForm } from "../AuthorProductCreatePage/AuthorProductComposer";

export function mapSellerProductToForm(product: SellerProduct): AuthorProductForm {
    const images = product.images.map((imageUuid, index) => ({
        id: `existing-${imageUuid}-${index}`,
        url: getMediaImageUrl(imageUuid) ?? "",
        existingUuid: imageUuid,
    }));

    return {
        name: product.name,
        description: product.description,
        price: String(Math.round(product.price / 100)),
        stockCount: String(product.stockCount),
        categorySlug: product.categorySlug ?? "",
        subcategorySlug: product.subcategorySlug ?? "",
        subcategoryLabel: product.subcategoryTitle ?? product.subcategorySlug ?? "",
        fandomSlug: product.fandomSlug ?? "",
        fandomLabel: product.fandomTitle ?? product.fandomSlug ?? "",
        images,
        coverImageId: images[0]?.id ?? "",
        isAdult: Boolean(product.isAdult),
    };
}
