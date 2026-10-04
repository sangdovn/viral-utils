import { DataTable } from "@/components/data-table/DataTable";
import { ErrorMessage } from "@/components/ErrorMessage";
import type { System } from "@/features/systems/types";
import { useSystems } from "@/features/systems/useSystems";
import { columns } from "@/pages/SystemsPage/columns";

export function SystemsPage() {
  const {
    systems,
    rowCount,
    isLoading,
    isLoadingError,
    isRefetchError,
    error,
    refetch,
    sorting,
    onSortingChange,
    search,
    onSearchChange,
    pagination,
    onPaginationChange,
  } = useSystems();

  if (isLoadingError) {
    return (
      <ErrorMessage
        message={error?.message ?? "Could not load systems"}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-3">
      {isRefetchError && (
        <ErrorMessage
          message="Could not load the requested results. Showing the last successful results."
          onRetry={refetch}
        />
      )}

      <DataTable<System>
        getRowId={(system) => system.id}
        columns={columns}
        data={systems}
        rowCount={rowCount}
        isLoading={isLoading}
        sorting={sorting}
        onSortingChange={onSortingChange}
        search={search}
        onSearchChange={onSearchChange}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
      />
    </div>
  );
}
