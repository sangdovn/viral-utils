import { AlertCircle, LoaderCircle } from "lucide-react";
import type { MouseEvent } from "react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { getUserDisplayName } from "@/pages/Douyin/display";
import type { DouyinUser } from "@/pages/Douyin/types";

interface DeleteUserDialogProps {
  user: DouyinUser;
  onDelete: (id: number) => Promise<void>;
}

export default function DeleteUserDialog({ user, onDelete }: DeleteUserDialogProps) {
  const displayName = getUserDisplayName(user);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleOpenChange = (state: boolean) => {
    if (deleting && !state) return;
    setOpen(state);
    if (!state) setError("");
  };

  const handleDelete = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDeleting(true);
    setError("");
    try {
      await onDelete(user.id);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete user");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline">
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User {displayName}</AlertDialogTitle>
          <AlertDialogDescription>
            This will also delete this user's saved videos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deleting}>
            {deleting && <LoaderCircle className="animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
