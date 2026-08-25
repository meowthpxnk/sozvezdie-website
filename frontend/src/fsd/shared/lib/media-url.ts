import { MEDIA_BUCKET_URL } from "@shared/config/public-env";

const MEDIA_BUCKET_BASE = MEDIA_BUCKET_URL;

export function getMediaImageUrl(imageId?: string | null): string | undefined {
    if (!imageId) {
        return undefined;
    }

    if (imageId.startsWith("http://") || imageId.startsWith("https://") || imageId.startsWith("data:")) {
        return imageId;
    }

    return `${MEDIA_BUCKET_BASE}/${imageId}`;
}
