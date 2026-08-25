import type { Metadata } from "next";
import { ModerationOrderDetailPage } from "@/src/fsd/pages/ModerationOrderDetailPage";
import { createPageMetadata } from "@shared/lib/page-metadata";

type ModerationOrderDetailRouteProps = {
    params: Promise<{ orderId: string }>;
};

export async function generateMetadata({
    params,
}: ModerationOrderDetailRouteProps): Promise<Metadata> {
    const { orderId } = await params;
    return createPageMetadata(`Заказ №${orderId}`);
}

export default function ModerationOrderDetailRoute() {
    return <ModerationOrderDetailPage />;
}
