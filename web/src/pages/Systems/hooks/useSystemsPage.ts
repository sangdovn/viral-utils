import { useEffect, useMemo, useState } from "react";
import * as systemApi from "@/pages/Systems/api";
import type { System, SystemCreate, SystemEdit } from "@/pages/Systems/types";

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function systemMatchesSearch(system: System, query: string) {
  if (!query) return true;

  return [system.id, system.name, system.description]
    .filter((value) => value !== null && value !== undefined)
    .some((value) => String(value).toLowerCase().includes(query));
}

export default function useSystemsPage() {
  const [systems, setSystems] = useState<System[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");

  const filteredSystems = useMemo(() => {
    const query = normalizeSearch(searchQuery);
    return systems.filter((system) => systemMatchesSearch(system, query));
  }, [searchQuery, systems]);

  useEffect(() => {
    systemApi
      .getAll()
      .then(setSystems)
      .catch(() => setLoadError("Could not load systems"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (data: SystemCreate) => {
    setActionError("");
    try {
      const created = await systemApi.create(data);
      setSystems((prev) => [created, ...prev]);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not create system";
      setActionError(message);
      throw new Error(message);
    }
  };

  const handleUpdate = async (id: number, data: SystemEdit) => {
    setActionError("");
    try {
      const updated = await systemApi.update(id, data);
      setSystems((prev) => prev.map((system) => (system.id === id ? updated : system)));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not update system";
      setActionError(message);
      throw new Error(message);
    }
  };

  const handleDelete = async (id: number) => {
    setActionError("");
    try {
      await systemApi.remove(id);
      setSystems((prev) => prev.filter((system) => system.id !== id));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not delete system";
      setActionError(message);
      throw new Error(message);
    }
  };

  return {
    actionError,
    displayError: loadError || actionError,
    handleCreate,
    handleDelete,
    handleUpdate,
    filteredSystems,
    loading,
    searchQuery,
    setSearchQuery,
    systems,
  };
}
