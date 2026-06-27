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
} from "@/components/ui/alert-dialog";
import { getVideoDisplayTitle } from "@/pages/Douyin/display";
import type { DouyinVideo } from "@/pages/Douyin/types";

interface DeleteVideoDialogProps {
  video: DouyinVideo;
  onDelete: (id: number) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteVideoDialog({
  video,
  onDelete,
  open,
  onOpenChange,
}: DeleteVideoDialogProps) {
  const displayTitle = getVideoDisplayTitle(video);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleOpenChange = (state: boolean) => {
    if (deleting && !state) return;
    onOpenChange(state);
    if (!state) setError("");
  };

  const handleDelete = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDeleting(true);
    setError("");
    try {
      await onDelete(video.id);
      handleOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete video");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Video {displayTitle}</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
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
