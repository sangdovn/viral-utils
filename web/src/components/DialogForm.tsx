import { AlertCircle, LoaderCircle } from "lucide-react";
import { type ReactNode, type SubmitEvent, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type SubmitResult = boolean | undefined;

interface Props {
  triggerText?: string;
  title?: string;
  description?: string;
  children?: ReactNode;
  cancelText?: string;
  okText?: string;
  onSubmit: () => SubmitResult | Promise<SubmitResult>;
  onClose?: () => void;
}

export default function DialogForm({
  triggerText = "Open",
  title = "Dialog",
  description,
  children,
  cancelText = "Cancel",
  okText = "Save changes",
  onSubmit,
  onClose,
}: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleOpenChange = (state: boolean) => {
    if (submitting && !state) return;
    setOpen(state);
    if (!state) {
      setSubmitError("");
      onClose?.();
    }
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    try {
      const submitOk = await onSubmit();
      if (submitOk !== false) handleOpenChange(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not save changes");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>{triggerText}</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-4">
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          {submitError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
          {children}
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={submitting}>
                {cancelText}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={submitting}>
              {submitting && <LoaderCircle className="animate-spin" />}
              {okText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
