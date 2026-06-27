import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DeleteUserDialog from "@/pages/Douyin/components/DeleteUserDialog";
import EditUserDialog from "@/pages/Douyin/components/EditUserDialog";
import { getUserDisplayName, getUserSecondaryName } from "@/pages/Douyin/display";
import { formatDateTime } from "@/pages/Douyin/format";
import type { DouyinUser, DouyinUserStatus, DouyinUserUpdate } from "@/pages/Douyin/types";
import type { System } from "@/pages/Systems/types";

interface UserTableProps {
  users: DouyinUser[];
  systems: System[];
  statuses: DouyinUserStatus[];
  systemNameById: Map<number, string>;
  loading: boolean;
  onUpdate: (id: number, data: DouyinUserUpdate) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function UserTable({
  users,
  systems,
  statuses,
  systemNameById,
  loading,
  onUpdate,
  onDelete,
}: UserTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Topic</TableHead>
            <TableHead>Niche</TableHead>
            <TableHead>System</TableHead>
            <TableHead>Last Fetched</TableHead>
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
          ) : users.length ? (
            users.map((user) => {
              const displayName = getUserDisplayName(user);
              const secondaryName = getUserSecondaryName(user);

              return (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    <div className="max-w-64 truncate font-medium" title={displayName}>
                      {displayName}
                    </div>
                    <div className="max-w-64 truncate text-muted-foreground">{secondaryName}</div>
                  </TableCell>
                  <TableCell>{user.status}</TableCell>
                  <TableCell>{user.topic}</TableCell>
                  <TableCell>{user.niche}</TableCell>
                  <TableCell>
                    {user.system_id
                      ? systemNameById.get(user.system_id) || user.system_id
                      : "No system"}
                  </TableCell>
                  <TableCell>{formatDateTime(user.last_fetched).slice(0, 10)}</TableCell>
                  <TableCell className="flex flex-row gap-2" onClick={(e) => e.stopPropagation()}>
                    <EditUserDialog
                      user={user}
                      systems={systems}
                      statuses={statuses}
                      onSubmit={onUpdate}
                    />
                    <DeleteUserDialog user={user} onDelete={onDelete} />
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                No users
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
