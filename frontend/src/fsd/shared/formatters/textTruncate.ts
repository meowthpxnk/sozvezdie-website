const ELLIPSIS = "...";

/** Обрезает строку: при длине > maxLength показывает (maxLength − 3) символов и «...». */
export function truncateText(text: string, maxLength = 18): string {
    const chars = [...text];

    if (chars.length <= maxLength) {
        return text;
    }

    return `${chars.slice(0, maxLength - ELLIPSIS.length).join("")}${ELLIPSIS}`;
}
