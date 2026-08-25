function trimEnv(value: string | undefined, fallback: string): string {
    const trimmed = value?.trim();
    return trimmed || fallback;
}

/** Backend API base URL (browser-accessible). */
export const API_URL = trimEnv(
    process.env.NEXT_PUBLIC_API_URL,
    "https://constellationshop.ru/api",
);

/** MinIO / media server base URL (browser-accessible). */
export const MEDIA_URL = trimEnv(
    process.env.NEXT_PUBLIC_MEDIA_URL,
    "https://constellationshop.ru/minio",
);

/** Full public URL to the images bucket, e.g. http://localhost:4003/images-bucket */
export const MEDIA_BUCKET_URL = trimEnv(
    process.env.NEXT_PUBLIC_MEDIA_BUCKET_URL,
    `${MEDIA_URL}/images-bucket`,
);

export const VKID_APP_ID = Number(
    trimEnv(process.env.NEXT_PUBLIC_VKID_APP_ID, "54614063"),
);

export const VKID_REDIRECT_URL = trimEnv(
    process.env.NEXT_PUBLIC_VKID_REDIRECT_URL,
    "https://constellationshop.ru",
);
