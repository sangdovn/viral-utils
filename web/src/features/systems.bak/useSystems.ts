import { useCallback, useEffect, useState } from "react";
import { listSystems } from "@/features/systems/api";
import type { ListSystemsParams, System } from "@/features/systems/types";

interface State {
  data: System[];
  total: number;
  isLoading: boolean;
  error: Error | null;
}

export function useSystems(params: ListSystemsParams) {
  const { pageIndex, pageSize, search, sortBy, sortOrder } = params;
  const [refreshKey, setRefreshKey] = useState(0);

  const [state, setState] = useState<State>({
    data: [],
    total: 0,
    isLoading: false,
    error: null,
  });

  const refetch = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    void refreshKey; // for ignore biome linting

    const controller = new AbortController();

    setState((current) => ({ ...current, isLoading: true, error: null }));

    void listSystems(
      { pageIndex: pageIndex + 1, pageSize, search, sortBy, sortOrder },
      controller.signal,
    )
      .then((result) => {
        setState({
          data: result.data,
          total: result.total,
          isLoading: false,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        setState((current) => ({
          ...current,
          isLoading: false,
          error: error instanceof Error ? error : new Error("Could not load systems"),
        }));
      });

    return () => controller.abort();
  }, [pageIndex, pageSize, search, sortBy, sortOrder, refreshKey]);

  return {
    ...state,
    refetch,
  };
}
