import type { Metadata } from "next";
import {
    ModeratorBrandEditPage,
    ModeratorProductDeletionPage,
    ModeratorProductEditPage,
} from "@/src/fsd/pages/ModerationEditPage";
import { SetAdminChrome } from "@widgets/AdminShell";
import { createPageMetadata } from "@shared/lib/page-metadata";

type ModerationEditRouteProps = {
    params: Promise<{ proposalId: string }>;
};

function getModerationTitle(proposalId: string): string {
    if (proposalId.startsWith("brand-")) {
        return "Модерация бренда";
    }

    if (proposalId.startsWith("product-delete-")) {
        return "Удаление товара";
    }

    if (proposalId.startsWith("product-")) {
        return "Модерация товара";
    }

    return "Модерация";
}

export async function generateMetadata({
    params,
}: ModerationEditRouteProps): Promise<Metadata> {
    const { proposalId } = await params;
    return createPageMetadata(getModerationTitle(proposalId));
}

export default async function ModerationEditRoute({ params }: ModerationEditRouteProps) {
    const { proposalId } = await params;

    if (proposalId.startsWith("brand-")) {
        return <ModeratorBrandEditPage proposalId={proposalId} />;
    }

    if (proposalId.startsWith("product-delete-")) {
        return <ModeratorProductDeletionPage proposalId={proposalId} />;
    }

    if (proposalId.startsWith("product-")) {
        return <ModeratorProductEditPage proposalId={proposalId} />;
    }

    return (
        <>
            <SetAdminChrome title="Модерация" />
            <p>Некорректный идентификатор заявки.</p>
        </>
    );
}
