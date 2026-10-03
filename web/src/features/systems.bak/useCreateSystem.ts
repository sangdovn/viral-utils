import { useCallback, useState } from "react";
import { createSystem as createSystemRequest } from "@/features/systems/api";
import type { CreateSystemPayload, System } from "@/features/systems/types";

export function useCreateSystem() {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createSystem = useCallback(
    async (payload: CreateSystemPayload): Promise<System | null> => {
      setIsPending(true);
      setError(null);

      try {
        return await createSystemRequest(payload);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Could not create system. Please try again.",
        );
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

  return { createSystem, isPending, error, clearError };
}
