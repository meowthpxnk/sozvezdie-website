import type { Metadata } from "next";
import { SingleAuthorPage } from "@pages";
import { createAuthorPageMetadata } from "@shared/lib/page-metadata";
import { fetchAuthorMeta } from "@shared/lib/server-metadata";

type SingleAuthorPageProps = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({
    params,
}: SingleAuthorPageProps): Promise<Metadata> {
    const { id } = await params;
    const author = await fetchAuthorMeta(id);

    return createAuthorPageMetadata(author?.name);
}

export default async function AuthorsRoutePage({ params }: SingleAuthorPageProps) {
    const { id } = await params;
    return <SingleAuthorPage authorId={id} />;
}
