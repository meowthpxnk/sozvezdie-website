const CYRILLIC_TO_LATIN: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "e",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function translitToSlug(text: string): string {
    const normalized = text.trim().toLowerCase().replace(/ё/g, "е");
    let result = "";

    for (const char of normalized) {
        if (CYRILLIC_TO_LATIN[char]) {
            result += CYRILLIC_TO_LATIN[char];
            continue;
        }

        if (/[a-z0-9]/.test(char)) {
            result += char;
            continue;
        }

        if (char === " " || char === "-" || char === "_") {
            result += "-";
        }
    }

    return result.replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export function isValidSlug(slug: string): boolean {
    return SLUG_PATTERN.test(slug.trim().toLowerCase());
}
