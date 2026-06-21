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
import type { FormData, System } from "@/pages/Systems/types";

const SKELETON_ROW_IDS = Array.from({ length: 5 }, () => crypto.randomUUID());

export default function Systems() {
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getAll()
      .then(setSystems)
      .catch(() => setError("Could not load systems"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (data: FormData) => {
    const created = await api.create(data);
    setSystems((prev) => [created, ...prev]);
  };

  const handleUpdate = async (id: number, data: FormData) => {
    const updated = await api.update(id, data);
    setSystems((prev) => prev.map((s) => (s.id === id ? updated : s)));
  };

  const handleDelete = async (id: number) => {
    await api.remove(id);
    setSystems((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <Page>
      <PageHeader>
        <div>
          <PageTitle>Systems</PageTitle>
          <PageSubtitle>{loading ? "Loading..." : `${systems.length} total`}</PageSubtitle>
        </div>
        <DialogCreate onSubmit={handleCreate} />
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
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? SKELETON_ROW_IDS.map((key) => (
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
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                </TableRow>
              ))
            : systems.map((system) => (
                <TableRow key={system.id}>
                  <TableCell>{system.id}</TableCell>
                  <TableCell>{system.name}</TableCell>
                  <TableCell>{system.description}</TableCell>
                  <TableCell className="flex flex-row" onClick={(e) => e.stopPropagation()}>
                    <DialogEdit system={system} onSubmit={handleUpdate} />
                    <AlertDialogDelete system={system} onCancel={handleDelete} />
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </Page>
  );
}
