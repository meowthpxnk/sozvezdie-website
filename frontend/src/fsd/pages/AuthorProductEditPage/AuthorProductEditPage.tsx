"use client";

import styled from "styled-components";

import { AuthorProductComposer } from "../AuthorProductCreatePage/AuthorProductComposer";
import { SetAdminChrome } from "@widgets/AdminShell";
import { useAuthorProductEdit } from "./useAuthorProductEdit";

const EmptyState = styled.p`
    margin: 0;
    font-size: 15px;
    color: #666;
`;

type AuthorProductEditPageProps = {
    productId: string;
};

export function AuthorProductEditPage({ productId }: AuthorProductEditPageProps) {
    const { initialForm, loading, isError, submitProduct } = useAuthorProductEdit(productId);

    if (isError) {
        return (
            <>
                <SetAdminChrome title="Редактирование товара" />
                <EmptyState>Не удалось загрузить товар.</EmptyState>
            </>
        );
    }

    return (
        <AuthorProductComposer
            key={productId}
            mode="edit"
            loading={loading || !initialForm}
            initialForm={initialForm}
            shellTitle="Редактирование товара"
            formTitle="Форма редактирования товара"
            formDescription="После сохранения изменения снова отправятся на модерацию."
            submitLabel="Сохранить изменения"
            onSubmitForm={submitProduct}
        />
    );
}
