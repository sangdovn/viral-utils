import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell } from "@/components/ui/table";

interface Props {
  label: string;
  displayValue: string;
  value: string;
  isEditing: boolean;
  autoFocus: boolean;
  disabled: boolean;
  error?: string;
  onStartEdit: () => void;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function EditableSystemCell({
  label,
  displayValue,
  value,
  isEditing,
  autoFocus,
  disabled,
  error,
  onStartEdit,
  onChange,
  onSave,
  onCancel,
}: Props) {
  const errorId = useId();

  return (
    <TableCell className="p-0 align-top">
      {isEditing ? (
        <>
          <Input
            aria-label={label}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            autoFocus={autoFocus}
            disabled={disabled}
            value={value}
            className="h-14 w-full rounded-none"
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) return;
              if (event.key === "Enter") {
                event.preventDefault();
                onSave();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                onCancel();
              }
            }}
          />

          {error && (
            <p id={errorId} role="alert" className="px-2 py-1 text-destructive text-xs">
              {error}
            </p>
          )}
        </>
      ) : (
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          className="h-14 w-full justify-start rounded-none"
          aria-label={`Edit ${label}`}
          onClick={onStartEdit}
        >
          <span className="min-w-0 truncate">{displayValue}</span>
        </Button>
      )}
    </TableCell>
  );
}
