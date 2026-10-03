import { createColumnHelper } from "@tanstack/react-table";
import { SelectCell } from "@/components/data-table/DataTableSelectCell";
import { Checkbox } from "@/components/ui/checkbox";
import type { System } from "@/features/systems/types";
import type { DataTableFeatures } from "@/lib/table/features";

const columnHelper = createColumnHelper<DataTableFeatures, System>();

export const columns = columnHelper.columns([
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <SelectCell
        toggleSelected={(value) => row.toggleSelected(value)}
        selected={row.getIsSelected()}
      />
    ),
  }),
  columnHelper.accessor("name", {
    header: "Name",
  }),
  columnHelper.accessor("description", {
    header: "Description",
  }),
]);
