import { redirect } from "next/navigation";

type AuthorsLegacyRouteProps = {
    params: Promise<{ id: string }>;
};

export default async function AuthorsLegacyRoute({
    params,
}: AuthorsLegacyRouteProps) {
    const { id } = await params;
    redirect(`/author/${id}`);
}
