"use client";

import { useState } from "react";
import styled from "styled-components";

const Panel = styled.section`
    background: #fff;
    border-radius: 14px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 8px 24px rgba(17, 31, 60, 0.05);
`;

const PanelTitle = styled.h3`
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #132647;
`;

const CommentField = styled.textarea`
    min-height: 88px;
    border-radius: 10px;
    border: 1px solid #d7ddea;
    padding: 10px 12px;
    font-size: 14px;
    resize: vertical;
    color: #132647;

    &:focus {
        outline: 2px solid var(--main-color);
        outline-offset: 1px;
    }
`;

const SaveButton = styled.button`
    min-height: 42px;
    border: none;
    border-radius: 10px;
    background: var(--main-color);
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

type ModeratorCatalogSavePanelProps = {
    saving: boolean;
    onSave: (comment: string) => Promise<boolean | void>;
};

export function ModeratorCatalogSavePanel({ saving, onSave }: ModeratorCatalogSavePanelProps) {
    const [comment, setComment] = useState("");

    return (
        <Panel>
            <PanelTitle>Сохранение изменений</PanelTitle>
            <CommentField
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Комментарий для ленты модерации (необязательно)"
            />
            <SaveButton
                type="button"
                disabled={saving}
                onClick={() => void onSave(comment.trim())}
            >
                {saving ? "Сохраняем..." : "Сохранить изменения"}
            </SaveButton>
        </Panel>
    );
}
