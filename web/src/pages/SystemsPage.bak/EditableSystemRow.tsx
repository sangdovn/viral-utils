import { Check, LoaderCircle, X } from "lucide-react";
import { Fragment } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import type {
  EditableField,
  System,
  SystemDraft,
  UpdateSystemErrors,
} from "@/features/systems/types";
import { EditableSystemCell } from "@/pages/SystemsPage/EditableSystemCell";

interface Props {
  system: System;
  selected: boolean;
  disabled: boolean;
  isEditing: boolean;
  draft: SystemDraft | null;
  focusField: EditableField | null;
  errors: UpdateSystemErrors;
  apiError: string | null;
  onSelect: (selected: boolean) => void;
  onStartEdit: (field: EditableField) => void;
  onChange: (field: EditableField, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function EditableSystemRow({
  system,
  selected,
  disabled,
  isEditing,
  draft,
  focusField,
  errors,
  apiError,
  onSelect,
  onStartEdit,
  onChange,
  onSave,
  onCancel,
}: Props) {
  return (
    <Fragment>
      <TableRow
        data-state={selected ? "selected" : undefined}
        aria-busy={isEditing && disabled ? true : undefined}
      >
        <TableCell>
          <Checkbox
            checked={selected}
            disabled={disabled}
            aria-label={`Select ${system.name}`}
            onCheckedChange={(checked) => {
              onSelect(Boolean(checked));
            }}
          />
        </TableCell>

        <EditableSystemCell
          label="system name"
          displayValue={system.name}
          value={draft?.name ?? ""}
          isEditing={isEditing}
          autoFocus={focusField === "name"}
          disabled={disabled}
          error={errors.name}
          onStartEdit={() => onStartEdit("name")}
          onChange={(value) => onChange("name", value)}
          onSave={onSave}
          onCancel={onCancel}
        />

        <EditableSystemCell
          label="system description"
          displayValue={system.description || "-"}
          value={draft?.description ?? ""}
          isEditing={isEditing}
          autoFocus={focusField === "description"}
          disabled={disabled}
          error={errors.description}
          onStartEdit={() => onStartEdit("description")}
          onChange={(value) => onChange("description", value)}
          onSave={onSave}
          onCancel={onCancel}
        />

        <TableCell className="p-0 align-top">
          {isEditing && (
            <div className="flex h-14 items-center justify-end gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={disabled}
                aria-label="Save changes"
                onClick={onSave}
              >
                {disabled ? <LoaderCircle className="animate-spin" /> : <Check />}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={disabled}
                aria-label="Cancel editing"
                onClick={onCancel}
              >
                <X />
              </Button>
            </div>
          )}
        </TableCell>
      </TableRow>

      {isEditing && apiError && (
        <TableRow>
          <TableCell />
          <TableCell colSpan={3} className="py-2">
            <p role="alert" className="text-destructive text-xs">
              {apiError}
            </p>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
}
