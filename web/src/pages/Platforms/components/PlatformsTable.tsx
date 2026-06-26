import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DeletePlatformDialog from "@/pages/Platforms/components/DeletePlatformDialog";
import EditPlatformDialog from "@/pages/Platforms/components/EditPlatformDialog";
import type { Platform, PlatformUpdate } from "@/pages/Platforms/types";
import type { System } from "@/pages/Systems/types";

interface PlatformsTableProps {
  platforms: Platform[];
  types: string[];
  statuses: string[];
  systems: System[];
  loading: boolean;
  onUpdate: (id: number, data: PlatformUpdate) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function PlatformsTable({
  platforms,
  types,
  statuses,
  systems,
  loading,
  onUpdate,
  onDelete,
}: PlatformsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>System</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                Loading...
              </TableCell>
            </TableRow>
          ) : platforms.length ? (
            platforms.map((platform) => (
              <TableRow key={platform.id}>
                <TableCell>{platform.id}</TableCell>
                <TableCell>{platform.type}</TableCell>
                <TableCell className="font-medium">{platform.name}</TableCell>
                <TableCell className="max-w-64 truncate text-muted-foreground">
                  {platform.url || "No URL"}
                </TableCell>
                <TableCell>{platform.status}</TableCell>
                <TableCell className="max-w-72 truncate text-muted-foreground">
                  {platform.reason || "No reason"}
                </TableCell>
                <TableCell>{platform.system?.name || "No system"}</TableCell>
                <TableCell className="flex flex-row gap-2" onClick={(e) => e.stopPropagation()}>
                  <EditPlatformDialog
                    platform={platform}
                    types={types}
                    statuses={statuses}
                    systems={systems}
                    onSubmit={onUpdate}
                  />
                  <DeletePlatformDialog platform={platform} onDelete={onDelete} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                No platforms
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
