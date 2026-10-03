const DEFAULT_SORT_BY: SystemSortBy = "created_at";
const DEFAULT_SORT_ORDER: SystemSortOrder = "desc";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { SystemSortBy, SystemSortOrder } from "@/features/systems/types";
import { useSystems } from "@/features/systems/useSystems";
import { CreateSystemDialog } from "@/pages/SystemsPage/CreateSystemDialog";
import { SystemsPageHeader } from "@/pages/SystemsPage/SystemsPageHeader";
import { SystemsPagination } from "@/pages/SystemsPage/SystemsPagination";
import { SystemsTable } from "@/pages/SystemsPage/SystemsTable";
import { SystemsToolbar } from "@/pages/SystemsPage/SystemsToolbar";

export function SystemsPage() {
  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);

  const [sortBy, setSortBy] = useState<SystemSortBy>(DEFAULT_SORT_BY);
  const [sortOrder, setSortOrder] = useState<SystemSortOrder>(DEFAULT_SORT_ORDER);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, total, isLoading, error, refetch } = useSystems({
    pageIndex,
    pageSize,
    search,
    sortBy: sortOrder === "default" ? DEFAULT_SORT_BY : sortBy,
    sortOrder: sortOrder === "default" ? DEFAULT_SORT_ORDER : sortOrder,
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPageIndex(0);
      setSelectedIds([]);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const handleSort = (field: SystemSortBy) => {
    if (sortBy !== field) {
      setSortBy(field);
      setSortOrder("asc");
    } else {
      setSortOrder((current) => {
        if (current === "default") return "asc";
        if (current === "asc") return "desc";
        return "default";
      });
    }

    setPageIndex(0);
    setSelectedIds([]);
  };

  const handlePageIndexChange = (pageIndex: number) => {
    setPageIndex(pageIndex);
    setSelectedIds([]);
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPageSize(pageSize);
    setPageIndex(0);
    setSelectedIds([]);
  };

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds((current) => {
      if (selected) {
        return current.includes(id) ? current : [...current, id];
      }

      return current.filter((currentId) => currentId !== id);
    });
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedIds(selected ? data.map((system) => system.id) : []);
  };

  const handleCreateSystem = () => {
    if (pageIndex === 0) {
      refetch();
    } else {
      setPageIndex(0);
    }
  };

  const handleSync = async () => {};

  const handleDeleteSelected = async () => {};

  return (
    <div className="flex flex-col gap-5">
      <SystemsPageHeader
        action={<CreateSystemDialog onCreate={handleCreateSystem} />}
      />

      <SystemsToolbar
        searchInput={searchInput}
        selectedCount={selectedIds.length}
        isSyncing={isSyncing}
        isDeleting={isDeleting}
        onSearchInputChange={setSearchInput}
        onSync={handleSync}
        onDeleteSelected={handleDeleteSelected}
      />

      {error && data.length === 0 ? (
        <div
          role="alert"
          className="flex items-center justify-between rounded-md border border-destructive/40 p-4"
        >
          <p className="text-destructive text-sm">{error.message}</p>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={refetch}
          >
            Retry
          </Button>
        </div>
      ) : (
        <SystemsTable
          systems={data}
          isLoading={isLoading}
          selectedIds={selectedIds}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          onUpdated={refetch}
          onUpdatingChange={setIsUpdating}
        />
      )}

      <SystemsPagination
        pageIndex={pageIndex}
        pageSize={pageSize}
        total={total}
        disabled={isLoading}
        onPageIndexChange={handlePageIndexChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
