import { AlertCircle, LoaderCircle } from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import VideoFields from "@/pages/Douyin/components/VideoFields";
import { buildVideoUpdate, videoInputsFromVideo } from "@/pages/Douyin/mappers";
import type { DouyinVideo, DouyinVideoUpdate } from "@/pages/Douyin/types";

interface EditVideoDialogProps {
  video: DouyinVideo;
  onSubmit: (id: number, data: DouyinVideoUpdate) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditVideoDialog({
  video,
  onSubmit,
  open,
  onOpenChange,
}: EditVideoDialogProps) {
  const [inputs, setInputs] = useState(() => videoInputsFromVideo(video));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    setInputs(videoInputsFromVideo(video));
    setSubmitError("");
  }, [video]);

  const handleOpenChange = (state: boolean) => {
    if (submitting && !state) return;
    onOpenChange(state);
    if (!state) setSubmitError("");
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      await onSubmit(video.id, buildVideoUpdate(inputs));
      handleOpenChange(false);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Could not update video");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-4">
            <DialogTitle>Edit Video</DialogTitle>
          </DialogHeader>
          {submitError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
          <VideoFields
            inputs={inputs}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
          />
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={submitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={submitting}>
              {submitting && <LoaderCircle className="animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
