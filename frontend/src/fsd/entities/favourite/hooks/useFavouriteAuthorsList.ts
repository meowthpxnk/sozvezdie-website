"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Author, authorService } from "@entities/author";
import { getAccessToken } from "../../auth/auth-token.service";
import { useAppDispatch, useAppSelector } from "../../../shared/store/store";
import { fetchFavouriteAuthors } from "../favouriteThunk";

export const useFavouriteAuthorsList = () => {
    const dispatch = useAppDispatch();
    const queryClient = useQueryClient();
    const favouriteAuthors = useAppSelector((state) => state.favourite.authors);
    const storeLoading = useAppSelector((state) => state.favourite.authorsLoading);
    const [snapshotIds, setSnapshotIds] = useState<string[] | null>(null);
    const [cacheTick, setCacheTick] = useState(0);
    const [authorsHydrated, setAuthorsHydrated] = useState(false);

    useEffect(() => {
        setSnapshotIds(null);
        setAuthorsHydrated(false);
        if (!getAccessToken()) {
            return;
        }
        dispatch(fetchFavouriteAuthors());
    }, [dispatch]);

    useEffect(() => {
        if (storeLoading || snapshotIds !== null) {
            return;
        }
        setSnapshotIds(favouriteAuthors.map((item) => item.author_id));
    }, [storeLoading, favouriteAuthors, snapshotIds]);

    const authorIds = snapshotIds ?? [];

    const missingIds = useMemo(
        () =>
            authorIds.filter(
                (id) => !queryClient.getQueryData<Author>(["author", id])
            ),
        [authorIds, queryClient, cacheTick]
    );

    const {
        data: bulkAuthors,
        isFetching: isBulkFetching,
        isFetched: isBulkFetched,
    } = useQuery({
        queryKey: ["favorites-page-authors-bulk", missingIds],
        queryFn: () => authorService.getAuthorsBulk(missingIds),
        enabled: snapshotIds !== null && missingIds.length > 0,
    });

    useEffect(() => {
        if (snapshotIds === null) {
            return;
        }
        if (authorIds.length === 0 || missingIds.length === 0) {
            setAuthorsHydrated(true);
            return;
        }
        if (!isBulkFetched) {
            return;
        }

        for (const author of bulkAuthors ?? []) {
            queryClient.setQueryData(["author", author.id], author);
        }
        setCacheTick((value) => value + 1);
        setAuthorsHydrated(true);
    }, [
        authorIds.length,
        bulkAuthors,
        isBulkFetched,
        missingIds.length,
        queryClient,
        snapshotIds,
    ]);

    const authors = useMemo(() => {
        return authorIds
            .map((id) => queryClient.getQueryData<Author>(["author", id]))
            .filter((author): author is Author => Boolean(author));
    }, [authorIds, cacheTick, queryClient]);

    const loading =
        snapshotIds === null ||
        storeLoading ||
        (authorIds.length > 0 && !authorsHydrated) ||
        isBulkFetching;

    return {
        authors,
        loading,
        isEmpty: snapshotIds !== null && authorIds.length === 0,
    };
};
