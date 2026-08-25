/** Splits stored text into display paragraphs (supports `\n`, `\r\n`, `\r`). */
export function splitTextParagraphs(text: string): string[] {
    if (!text) {
        return [];
    }

    return text
        .split(/\r\n|\r|\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
}
