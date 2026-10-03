import { LoaderCircle, PlusIcon } from "lucide-react";
import { type SubmitEvent, useEffect, useId, useRef, useState } from "react";
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import type {
  CreateSystemErrors,
  CreateSystemFormData,
} from "@/features/systems/types";
import { useCreateSystem } from "@/features/systems/useCreateSystem";

interface Props {
  onCreate: () => void;
}

const INITIAL_FORM_DATA: CreateSystemFormData = {
  name: "",
  description: "",
};

export function CreateSystemDialog({ onCreate }: Props) {
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const [open, setOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<CreateSystemFormData>(INITIAL_FORM_DATA);
  const [validationErrors, setValidationErrors] = useState<CreateSystemErrors>({});

  const nameId = useId();
  const nameErrorId = useId();
  const descriptionId = useId();
  const descriptionErrorId = useId();

  const {
    createSystem,
    isPending: isCreating,
    error: apiError,
    clearError: clearApiError,
  } = useCreateSystem();

  useEffect(() => {
    if (open && apiError && !isCreating) {
      nameRef.current?.focus();
    }
    if (!open) {
      setFormData(INITIAL_FORM_DATA);
      setValidationErrors({});
      clearApiError();
    }
  }, [open, apiError, isCreating, clearApiError]);

  const validateFormData = ({ name, description }: CreateSystemFormData): boolean => {
    const errors: CreateSystemErrors = {};

    if (name.length < 2) {
      errors.name = "Name must be at least 2 characters.";
    } else if (name.length > 256) {
      errors.name = "Name cannot exceed 256 characters.";
    }

    if (description.length > 10_000) {
      errors.description = "Description cannot exceed 10,000 characters.";
    }

    setValidationErrors(errors);

    if (errors.name) {
      nameRef.current?.focus();
    } else if (errors.description) {
      descriptionRef.current?.focus();
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    const name = formData.name.trim();
    const description = formData.description.trim();

    if (!validateFormData({ name, description })) return;

    const system = await createSystem({
      name,
      description: description || null,
    });

    if (!system) return;

    setOpen(false);

    toast.add({ type: "success", description: "System added" });

    onCreate();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isCreating) setOpen(nextOpen);
      }}
    >
      <DialogTrigger render={<Button type="button" />}>
        <PlusIcon />
        Add System
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" showCloseButton={!isCreating}>
        <DialogHeader>
          <DialogTitle>Add system</DialogTitle>
          <DialogDescription>
            Create a system to organize and manage related resources
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field data-invalid={Boolean(validationErrors.name)}>
              <FieldLabel htmlFor={nameId}>
                Name
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>
              </FieldLabel>
              <Input
                ref={nameRef}
                id={nameId}
                value={formData.name}
                disabled={isCreating}
                aria-required="true"
                aria-invalid={Boolean(validationErrors.name)}
                aria-describedby={validationErrors.name ? nameErrorId : undefined}
                onChange={(event) => {
                  setFormData((current) => ({ ...current, name: event.target.value }));
                  setValidationErrors((current) => ({ ...current, name: undefined }));
                  clearApiError();
                }}
                placeholder="e.g. Customer portal"
                autoFocus
              />
              <FieldError id={nameErrorId}>{validationErrors.name}</FieldError>
            </Field>

            <Field data-invalid={Boolean(validationErrors.description)}>
              <FieldLabel htmlFor={descriptionId}>
                Description
                <span className="font-normal text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Textarea
                ref={descriptionRef}
                id={descriptionId}
                value={formData.description}
                rows={4}
                aria-invalid={Boolean(validationErrors.description)}
                aria-describedby={
                  validationErrors.description ? descriptionErrorId : undefined
                }
                disabled={isCreating}
                onChange={(event) => {
                  setFormData((current) => ({
                    ...current,
                    description: event.target.value,
                  }));
                  setValidationErrors((current) => ({
                    ...current,
                    description: undefined,
                  }));
                  clearApiError();
                }}
                className="resize-y"
                placeholder="Describe what this system is used for..."
              />
              <FieldError id={descriptionErrorId}>
                {validationErrors.description}
              </FieldError>
            </Field>

            {apiError && (
              <p role="alert" className="px-2 py-1 text-destructive text-xs">
                {apiError}
              </p>
            )}

            <DialogFooter>
              <DialogClose
                render={
                  <Button type="button" variant="outline" disabled={isCreating} />
                }
              >
                Cancel
              </DialogClose>
              <Button type="submit" disabled={isCreating}>
                {isCreating && <LoaderCircle className="animate-spin" />}
                {isCreating ? "Adding..." : "Add system"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
