import { useState } from "react";
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

interface Props {
  triggerText: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  cancelText?: string;
  okText?: string;
  onSubmit: () => boolean;
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

  const handleOpenChange = (state: boolean) => {
    setOpen(state);
    if (!state) onClose?.(); // fires when dialog closes
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    const submitted = onSubmit();
    if (submitted) handleOpenChange(false);
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
          {children}
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">{cancelText}</Button>
            </DialogClose>
            <Button type="submit">{okText}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
