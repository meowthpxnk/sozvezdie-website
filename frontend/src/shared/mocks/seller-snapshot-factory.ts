import type { SellerSnapshot } from "@/src/shared/types/seller";
import sellerAdminSnapshotJson from "./json/seller-admin-snapshot.json";

/** Независимая копия снимка админки из JSON — без записи и без localStorage */
export function createDefaultSellerSnapshot(): SellerSnapshot {
    return structuredClone(sellerAdminSnapshotJson as SellerSnapshot);
}
