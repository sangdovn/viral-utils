import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Page, PageHeader, PageSubtitle, PageTitle } from "@/components/Page";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AlertDialogDelete from "@/pages/Platforms/AlertDialogDelete";
import * as platform_api from "@/pages/Platforms/api";
import DialogCreate from "@/pages/Platforms/DialogCreate";
import DialogEdit from "@/pages/Platforms/DialogEdit";
import type { Platform, PlatformCreate, PlatformUpdate } from "@/pages/Platforms/types";
import * as system_api from "@/pages/Systems/api";
import type { System } from "@/pages/Systems/types";

export default function Platforms() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      platform_api
        .getAll()
        .then(setPlatforms)
        .catch(() => setError("Could not load platforms"))
        .finally(() => setLoading(false)),
      system_api.getAll().then(setSystems),
      platform_api.getTypes().then(setTypes),
      platform_api.getStatuses().then(setStatuses),
    ]);
  }, []);

  const handleCreate = async (data: PlatformCreate) => {
    const created = await platform_api.create(data);
    setPlatforms((prev) => [created, ...prev]);
  };

  const handleUpdate = async (id: number, data: PlatformUpdate) => {
    const updated = await platform_api.update(id, data);
    console.log(updated);
    setPlatforms((prev) => prev.map((s) => (s.id === id ? updated : s)));
  };

  const handleDelete = async (id: number) => {
    await platform_api.remove(id);
    setPlatforms((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <Page>
      <PageHeader>
        <div>
          <PageTitle>Platforms</PageTitle>
          <PageSubtitle>{loading ? "Loading..." : `${platforms.length} total`}</PageSubtitle>
        </div>
        <DialogCreate types={types} statuses={statuses} systems={systems} onSubmit={handleCreate} />
      </PageHeader>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Url</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>System</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : (
            platforms.map((platform) => (
              <TableRow key={platform.id}>
                <TableCell>{platform.id}</TableCell>
                <TableCell>{platform.type}</TableCell>
                <TableCell>{platform.name}</TableCell>
                <TableCell>{platform.url}</TableCell>
                <TableCell>{platform.status}</TableCell>
                <TableCell>{platform.reason}</TableCell>
                <TableCell>{platform.system?.name}</TableCell>
                <TableCell className="flex flex-row" onClick={(e) => e.stopPropagation()}>
                  <DialogEdit
                    platform={platform}
                    types={types}
                    statuses={statuses}
                    systems={systems}
                    onSubmit={handleUpdate}
                  />
                  <AlertDialogDelete platform={platform} onCancel={handleDelete} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Page>
  );
}
