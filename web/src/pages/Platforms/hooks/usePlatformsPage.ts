import { useEffect, useMemo, useState } from "react";
import * as platformApi from "@/pages/Platforms/api";
import type { Platform, PlatformCreate, PlatformUpdate } from "@/pages/Platforms/types";
import * as systemApi from "@/pages/Systems/api";
import type { System } from "@/pages/Systems/types";

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function platformMatchesSearch(platform: Platform, query: string) {
  if (!query) return true;

  return [
    platform.id,
    platform.type,
    platform.name,
    platform.url,
    platform.status,
    platform.reason,
    platform.system?.name,
    platform.system?.description,
  ]
    .filter((value) => value !== null && value !== undefined)
    .some((value) => String(value).toLowerCase().includes(query));
}

export default function usePlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [systems, setSystems] = useState<System[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");

  const filteredPlatforms = useMemo(() => {
    const query = normalizeSearch(searchQuery);
    return platforms.filter((platform) => platformMatchesSearch(platform, query));
  }, [platforms, searchQuery]);

  useEffect(() => {
    Promise.all([
      platformApi.getAll(),
      systemApi.getAll(),
      platformApi.getTypes(),
      platformApi.getStatuses(),
    ])
      .then(([nextPlatforms, nextSystems, nextTypes, nextStatuses]) => {
        setPlatforms(nextPlatforms);
        setSystems(nextSystems);
        setTypes(nextTypes);
        setStatuses(nextStatuses);
      })
      .catch(() => setLoadError("Could not load platforms"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (data: PlatformCreate) => {
    setActionError("");
    try {
      const created = await platformApi.create(data);
      setPlatforms((prev) => [created, ...prev]);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not create platform";
      setActionError(message);
      throw new Error(message);
    }
  };

  const handleUpdate = async (id: number, data: PlatformUpdate) => {
    setActionError("");
    try {
      const updated = await platformApi.update(id, data);
      setPlatforms((prev) => prev.map((platform) => (platform.id === id ? updated : platform)));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not update platform";
      setActionError(message);
      throw new Error(message);
    }
  };

  const handleDelete = async (id: number) => {
    setActionError("");
    try {
      await platformApi.remove(id);
      setPlatforms((prev) => prev.filter((platform) => platform.id !== id));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not delete platform";
      setActionError(message);
      throw new Error(message);
    }
  };

  return {
    displayError: loadError || actionError,
    filteredPlatforms,
    handleCreate,
    handleDelete,
    handleUpdate,
    loading,
    platforms,
    searchQuery,
    setSearchQuery,
    statuses,
    systems,
    types,
  };
}
