import { useCallback, useState } from "react";
import { updateSystem as updateSystemRequest } from "@/features/systems/api";
import type { System, UpdateSystemPayload } from "@/features/systems/types";

const DEFAULT_ERROR = "Could not update system. Please try again.";

export function useUpdateSystem() {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateSystem = useCallback(
    async (id: string, payload: UpdateSystemPayload): Promise<System | null> => {
      setIsPending(true);
      setError(null);

      try {
        return await updateSystemRequest(id, payload);
      } catch (error) {
        setError(error instanceof Error ? error.message : DEFAULT_ERROR);
        return null;
      } finally {
        setIsPending(false);
      }
    },
    [],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isPending,
    error,
    updateSystem,
    clearError,
  };
}
