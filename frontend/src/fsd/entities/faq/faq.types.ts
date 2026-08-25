export type FaqItemApiResponse = {
    id: number;
    question: string;
    answer: string;
    isPublished: boolean;
    sortOrder: number;
};

export type FaqItem = {
    id: number;
    question: string;
    answer: string;
    isPublished: boolean;
    sortOrder: number;
};

export function mapFaqItem(item: FaqItemApiResponse): FaqItem {
    return {
        id: item.id,
        question: item.question,
        answer: item.answer,
        isPublished: Boolean(item.isPublished),
        sortOrder: item.sortOrder,
    };
}

export type FaqItemPayload = {
    question: string;
    answer: string;
    isPublished: boolean;
};
