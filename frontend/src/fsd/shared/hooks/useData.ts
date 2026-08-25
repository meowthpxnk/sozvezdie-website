// import { UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query";
// import { useEffect, useState } from "react";

// export const useData = <T>({
//     queryKey,
//     queryFn,
// }: Pick<UndefinedInitialDataOptions<T[]>, "queryKey" | "queryFn">) => {
//     const query = useQuery({
//         queryKey,
//         queryFn,
//     });

//     return {
//         objects: query.data,
//         isSuccess: query.isSuccess,
//         isLoading: query.isLoading,
//         error: query.error,
//     };
// };
