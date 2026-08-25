import styled from "styled-components";

import { splitTextParagraphs } from "@shared/formatters/splitTextParagraphs";

const Paragraphs = styled.div<{ $gap: string }>`
    display: flex;
    flex-direction: column;
    gap: ${({ $gap }) => $gap};
`;

const Paragraph = styled.p`
    margin: 0;
`;

export interface FormattedParagraphsProps {
    text: string;
    className?: string;
    paragraphClassName?: string;
    gap?: string;
}

export function FormattedParagraphs({
    text,
    className,
    paragraphClassName,
    gap = "8px",
}: FormattedParagraphsProps) {
    const paragraphs = splitTextParagraphs(text);

    if (paragraphs.length === 0) {
        return null;
    }

    return (
        <Paragraphs className={className} $gap={gap}>
            {paragraphs.map((paragraph, index) => (
                <Paragraph key={index} className={paragraphClassName}>
                    {paragraph}
                </Paragraph>
            ))}
        </Paragraphs>
    );
}
