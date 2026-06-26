import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DeleteSystemDialog from "@/pages/Systems/components/DeleteSystemDialog";
import EditSystemDialog from "@/pages/Systems/components/EditSystemDialog";
import type { System, SystemEdit } from "@/pages/Systems/types";

const SKELETON_ROW_IDS = Array.from({ length: 5 }, () => crypto.randomUUID());

interface SystemsTableProps {
  systems: System[];
  loading: boolean;
  onUpdate: (id: number, data: SystemEdit) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function SystemsTable({ systems, loading, onUpdate, onDelete }: SystemsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            SKELETON_ROW_IDS.map((key) => (
              <TableRow key={key}>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-64" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
              </TableRow>
            ))
          ) : systems.length ? (
            systems.map((system) => (
              <TableRow key={system.id}>
                <TableCell>{system.id}</TableCell>
                <TableCell className="font-medium">{system.name}</TableCell>
                <TableCell className="max-w-md truncate text-muted-foreground">
                  {system.description || "No description"}
                </TableCell>
                <TableCell className="flex flex-row gap-2" onClick={(e) => e.stopPropagation()}>
                  <EditSystemDialog system={system} onSubmit={onUpdate} />
                  <DeleteSystemDialog system={system} onDelete={onDelete} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No systems
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
