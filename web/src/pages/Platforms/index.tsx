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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    Promise.all([
      platform_api.getAll(),
      system_api.getAll(),
      platform_api.getTypes(),
      platform_api.getStatuses(),
    ])
      .then(([platforms, systems, types, statuses]) => {
        setPlatforms(platforms);
        setSystems(systems);
        setTypes(types);
        setStatuses(statuses);
      })
      .catch(() => setLoadError("Could not load platforms"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (data: PlatformCreate) => {
    setActionError("");
    try {
      const created = await platform_api.create(data);
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
      const updated = await platform_api.update(id, data);
      setPlatforms((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not update platform";
      setActionError(message);
      throw new Error(message);
    }
  };

  const handleDelete = async (id: number) => {
    setActionError("");
    try {
      await platform_api.remove(id);
      setPlatforms((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not delete platform";
      setActionError(message);
      throw new Error(message);
    }
  };

  const displayError = loadError || actionError;

  return (
    <Page>
      <PageHeader>
        <div>
          <PageTitle>Platforms</PageTitle>
          <PageSubtitle>{loading ? "Loading..." : `${platforms.length} total`}</PageSubtitle>
        </div>
        <DialogCreate types={types} statuses={statuses} systems={systems} onSubmit={handleCreate} />
      </PageHeader>

      {displayError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{displayError}</AlertDescription>
        </Alert>
      )}

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
                    <DialogEdit
                      platform={platform}
                      types={types}
                      statuses={statuses}
                      systems={systems}
                      onSubmit={handleUpdate}
                    />
                    <AlertDialogDelete platform={platform} onDelete={handleDelete} />
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
    </Page>
  );
}
