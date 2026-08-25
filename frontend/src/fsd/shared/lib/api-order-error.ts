import { isAxiosError } from "axios";

export const INSUFFICIENT_STOCK_CODE = "insufficient_stock";
export const INSUFFICIENT_STOCK_MESSAGE =
    "Некоторые товары закончились. Проверьте корзину.";

type ApiErrorDetail =
    | string
    | {
          code?: string;
          message?: string;
      };

export function getApiErrorDetail(error: unknown): ApiErrorDetail | undefined {
    if (!isAxiosError(error)) {
        return undefined;
    }
    return error.response?.data?.detail as ApiErrorDetail | undefined;
}

export function isInsufficientStockApiError(error: unknown): boolean {
    const detail = getApiErrorDetail(error);
    if (typeof detail === "object" && detail !== null && detail.code) {
        return detail.code === INSUFFICIENT_STOCK_CODE;
    }
    if (typeof detail === "string") {
        return detail.toLowerCase().includes("insufficient stock");
    }
    return false;
}

export function getApiErrorMessage(
    error: unknown,
    fallback: string
): string {
    const detail = getApiErrorDetail(error);
    if (typeof detail === "object" && detail !== null && detail.message) {
        return detail.message;
    }
    if (typeof detail === "string") {
        return detail;
    }
    return fallback;
}
