import {
  type ColumnDef,
  type ColumnVisibilityState,
  type OnChangeFn,
  type PaginationState,
  type RowData,
  type RowSelectionState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { Pagination } from "@/components/data-table/DataTablePagination";
import { ViewOptions } from "@/components/data-table/DataTableViewOptions";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type DataTableFeatures, features } from "@/lib/table/features";

interface DataTableProps<TData extends RowData> {
  getRowId?: (row: TData) => string;
  columns: ColumnDef<DataTableFeatures, TData>[];
  data: TData[];
  rowCount: number;
  isLoading: boolean;
  sorting: SortingState;
  search: string;
  pagination: PaginationState;
  onSortingChange: OnChangeFn<SortingState>;
  onSearchChange: (value: string) => void;
  onPaginationChange: OnChangeFn<PaginationState>;
}

export function DataTable<TData extends RowData>({
  getRowId,
  columns,
  data,
  rowCount,
  isLoading,
  sorting,
  onSortingChange,
  search,
  onSearchChange,
  pagination,
  onPaginationChange,
}: DataTableProps<TData>) {
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useTable({
    getRowId,
    features,
    data,
    columns,
    rowCount,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onSortingChange,
    onPaginationChange,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
  });

  const rows = table.getRowModel().rows;

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
        <ViewOptions table={table} />
      </div>

      {/* Table */}
      <div className="relative overflow-hidden rounded-md border">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={
                      header.id === "select" || header.id === "actions"
                        ? "w-10 whitespace-nowrap"
                        : undefined
                    }
                  >
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {/* Existing rows */}
            {rows.length > 0 ? (
              rows.map((row) => {
                return (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : isLoading ? (
              /* First load */
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              /* Loaded but empty */
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <Pagination table={table} />
    </>
  );
}
