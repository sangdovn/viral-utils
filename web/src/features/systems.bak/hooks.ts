import { useEffect, useState } from "react";
import { listSystems } from "@/features/systems/api";
import type { ListSystemsParams, System } from "@/features/systems/types";

type SystesmQueryState = {
  data: System[];
  total: number;
  isLoading: boolean;
  error: Error | null;
};

export function useSystems(params: ListSystemsParams): SystesmQueryState {
  const { pageIndex: page, pageSize: limit, search, sortBy, sortOrder } = params;

  const [state, setState] = useState<SystesmQueryState>({
    data: [],
    total: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setState((current) => ({
      ...current,
      isLoading: true,
      error: null,
    }));

    void listSystems(
      {
        pageIndex: page,
        pageSize: limit,
        search,
        sortBy,
        sortOrder,
      },
      controller.signal,
    )
      .then((result) => {
        if (!active) return;

        setState({
          data: result.items,
          total: result.total,
          isLoading: false,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (!active) return;

        if (error instanceof Error && error.name === "AbortError") return;

        setState((current) => ({
          ...current,
          isLoading: false,
          error: error instanceof Error ? error : new Error("Failed to load systems"),
        }));
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  ]);

  return state;
}
