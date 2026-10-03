import type { Table } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import type { System } from "@/features/systems/types";
import type { DataTableFeatures } from "@/lib/table/features";

export function SelectHeader({ table }: { table: Table<DataTableFeatures, System> }) {
  return (
    <Checkbox
      checked={table.getIsAllPageRowsSelected()}
      indeterminate={
        table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
      }
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
    />
  );
}
