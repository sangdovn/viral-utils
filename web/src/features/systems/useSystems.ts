import { useQuery } from "@tanstack/react-query";
import type { OnChangeFn, PaginationState, SortingState } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { fetchSystems } from "@/features/systems/api";
import type { SystemsQuery } from "@/features/systems/types";
import { useDebounce } from "@/hooks/useDebounce";

const initialQuery: SystemsQuery = {
  sorting: [],
  search: "",
  pagination: {
    pageIndex: 0,
    pageSize: 10,
  },
};

export function useSystems() {
  const [query, setQuery] = useState<SystemsQuery>(initialQuery);
  const [searchInput, setSearchInput] = useState<string>("");
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    setQuery((current) => {
      if (current.search === debouncedSearch) {
        return current;
      }

      return {
        ...current,
        search: debouncedSearch,
        pagination: {
          ...current.pagination,
          pageIndex: 0,
        },
      };
    });
  }, [debouncedSearch]);

  const {
    data,
    isLoading,
    isFetching,
    isRefetching,
    isLoadingError,
    isRefetchError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["systems"],
    queryFn: ({ signal }) => fetchSystems(query, signal),
  });

  const onSortingChange: OnChangeFn<SortingState> = (updater) => {
    setQuery((current) => {
      const sorting =
        typeof updater === "function" ? updater(current.sorting) : updater;

      return {
        ...current,
        sorting: sorting.slice(0, 1),
        pagination: {
          ...current.pagination,
          pageIndex: 0,
        },
      };
    });
  };

  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    setQuery((current) => ({
      ...current,
      pagination: typeof updater === "function" ? updater(current.pagination) : updater,
    }));
  };

  return {
    systems: [],
    rowCount: 0,

    isLoading,
    isFetching,
    isLoadingError,
    isRefetchError,
    isRefetching,
    error,
    refetch: () => refetch(),

    sorting: query.sorting,
    onSortingChange,

    search: searchInput,
    onSearchChange: setSearchInput,

    pagination: query.pagination,
    onPaginationChange,
  };
}
