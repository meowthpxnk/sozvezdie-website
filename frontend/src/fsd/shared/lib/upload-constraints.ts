/** Client-side limits for image uploads across author / moderator / admin forms. */
export const IMAGE_UPLOAD_MAX_BYTES = 4 * 1024 * 1024;

export const IMAGE_UPLOAD_HINT =
    "Форматы: JPG, PNG, WEBP, GIF. Максимальный размер файла — 4 МБ.";

export function isAcceptedImageUpload(file: File): boolean {
    return file.type.startsWith("image/") && file.size <= IMAGE_UPLOAD_MAX_BYTES;
}
