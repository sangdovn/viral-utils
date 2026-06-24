import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Page, PageHeader, PageSubtitle, PageTitle } from "@/components/Page";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AlertDialogDelete from "@/pages/Systems/AlertDialogDelete";
import * as api from "@/pages/Systems/api";
import DialogCreate from "@/pages/Systems/DialogCreate";
import DialogEdit from "@/pages/Systems/DialogEdit";
import type { System, SystemCreate, SystemEdit } from "@/pages/Systems/types";

const SKELETON_ROW_IDS = Array.from({ length: 5 }, () => crypto.randomUUID());

export default function Systems() {
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    api
      .getAll()
      .then(setSystems)
      .catch(() => setLoadError("Could not load systems"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (data: SystemCreate) => {
    setActionError("");
    try {
      const created = await api.create(data);
      setSystems((prev) => [created, ...prev]);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not create system";
      setActionError(message);
      throw new Error(message);
    }
  };

  const handleUpdate = async (id: number, data: SystemEdit) => {
    setActionError("");
    try {
      const updated = await api.update(id, data);
      setSystems((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not update system";
      setActionError(message);
      throw new Error(message);
    }
  };

  const handleDelete = async (id: number) => {
    setActionError("");
    try {
      await api.remove(id);
      setSystems((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not delete system";
      setActionError(message);
      throw new Error(message);
    }
  };

  const displayError = loadError || actionError;

  return (
    <Page>
      <PageHeader>
        <div>
          <PageTitle>Systems</PageTitle>
          <PageSubtitle>{loading ? "Loading..." : `${systems.length} total`}</PageSubtitle>
        </div>
        <DialogCreate onSubmit={handleCreate} />
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
                    <DialogEdit system={system} onSubmit={handleUpdate} />
                    <AlertDialogDelete system={system} onDelete={handleDelete} />
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
    </Page>
  );
}
