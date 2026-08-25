const FLAT_PATTERNS = [
    /(?:^|[\s,])кв\.?\s*([0-9]+[а-яА-Яa-zA-Z/-]*)/i,
    /(?:^|[\s,])квартира\s*([0-9]+[а-яА-Яa-zA-Z/-]*)/i,
    /(?:^|[\s,])apt\.?\s*([0-9]+[а-яА-Яa-zA-Z/-]*)/i,
];

export function hasFlatInAddress(text: string | null | undefined): boolean {
    if (!text?.trim()) {
        return false;
    }
    return FLAT_PATTERNS.some((pattern) => pattern.test(text));
}

/** Квартира в строке или в поле `flat` из DaData */
export function addressHasFlat(
    text: string | null | undefined,
    dadataFlat?: string | null
): boolean {
    if (dadataFlat?.trim()) {
        return true;
    }
    return hasFlatInAddress(text);
}

export function hasStreetAndHouse(
    street: string | null | undefined,
    house: string | null | undefined
): boolean {
    return Boolean(street?.trim() && house?.trim());
}
