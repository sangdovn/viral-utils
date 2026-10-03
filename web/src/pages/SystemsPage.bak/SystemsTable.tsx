import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import {
  normalizeSystemDraft,
  validateSystemDraft,
} from "@/features/systems/systemForm";
import type {
  EditableField,
  System,
  SystemDraft,
  SystemSortBy,
  SystemSortOrder,
  UpdateSystemErrors,
} from "@/features/systems/types";
import { useUpdateSystem } from "@/features/systems/useUpdateSystem";
import { EditableSystemRow } from "@/pages/SystemsPage/EditableSystemRow";

interface EditSession {
  systemId: string;
  focusField: EditableField;
  draft: SystemDraft;
  errors: UpdateSystemErrors;
}

interface Props {
  systems: System[];
  isLoading: boolean;
  selectedIds: string[];
  sortBy: SystemSortBy;
  sortOrder: SystemSortOrder;
  onSort: (field: SystemSortBy) => void;
  onSelect: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onUpdated: () => void;
  onUpdatingChange: (isUpdating: boolean) => void;
}

export function SystemsTable({
  systems,
  isLoading,
  selectedIds,
  sortBy,
  sortOrder,
  onSort,
  onSelect,
  onSelectAll,
  onUpdated,
  onUpdatingChange,
}: Props) {
  const [edit, setEdit] = useState<EditSession | null>(null);

  const {
    updateSystem,
    isPending,
    error,
    clearError: clearUpdateError,
  } = useUpdateSystem();

  const selectedCount = systems.filter((system) =>
    selectedIds.includes(system.id),
  ).length;

  const allSelected = systems.length > 0 && selectedCount === systems.length;

  const someSelected = selectedCount > 0 && !allSelected;

  useEffect(() => {
    setEdit((current) => {
      if (!current) return current;

      const systemStillExists = systems.some(
        (system) => system.id === current.systemId,
      );

      return systemStillExists ? current : null;
    });
  }, [systems]);

  useEffect(() => {
    onUpdatingChange(isPending);
  }, [isPending, onUpdatingChange]);

  const startEdit = (system: System, field: EditableField) => {
    if (isPending) return;

    clearUpdateError();

    setEdit({
      systemId: system.id,
      focusField: field,
      draft: {
        name: system.name,
        description: system.description ?? "",
      },
      errors: {},
    });
  };

  const updateDraft = (field: EditableField, value: string) => {
    if (isPending) return;

    clearUpdateError();

    setEdit((current) => {
      if (!current) return current;

      return {
        ...current,
        draft: {
          ...current.draft,
          [field]: value,
        },
        errors: {
          ...current.errors,
          [field]: undefined,
        },
      };
    });
  };

  const cancelEdit = () => {
    if (isPending) return;

    clearUpdateError();
    setEdit(null);
  };

  const saveEdit = async () => {
    if (!edit || isPending) return;

    const draft = normalizeSystemDraft(edit.draft);
    const errors = validateSystemDraft(draft);

    if (Object.keys(errors).length > 0) {
      setEdit((current) => (current ? { ...current, errors } : current));
      return;
    }

    const updatedSystem = await updateSystem(edit.systemId, {
      name: draft.name,
      description: draft.description || null,
    });

    if (!updatedSystem) return;

    setEdit(null);

    toast.add({
      type: "success",
      description: "System updated",
    });

    onUpdated();
  };

  const renderSortIcon = (field: SystemSortBy) => {
    if (sortBy !== field || sortOrder === "default") {
      return <ArrowUpDown />;
    }

    return sortOrder === "asc" ? <ArrowUp /> : <ArrowDown />;
  };

  return (
    <Table className="table-fixed" aria-busy={isPending || undefined}>
      <colgroup>
        <col className="w-10" />
        <col className="w-1/3" />
        <col />
        <col className="w-20" />
      </colgroup>

      <TableHeader>
        <TableRow>
          <TableHead>
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              disabled={isPending}
              aria-label="Select all systems"
              onCheckedChange={(checked) => onSelectAll(Boolean(checked))}
            />
          </TableHead>

          <TableHead>
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => onSort("name")}
            >
              Name {renderSortIcon("name")}
            </Button>
          </TableHead>

          <TableHead>
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => onSort("description")}
            >
              Description {renderSortIcon("description")}
            </Button>
          </TableHead>

          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody className="[&>tr]:h-14">
        {isLoading && systems.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              Loading systems...
            </TableCell>
          </TableRow>
        ) : systems.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              No systems found.
            </TableCell>
          </TableRow>
        ) : (
          systems.map((system) => {
            const isEditing = edit?.systemId === system.id;

            return (
              <EditableSystemRow
                key={system.id}
                system={system}
                selected={selectedIds.includes(system.id)}
                disabled={isPending}
                isEditing={isEditing}
                draft={isEditing ? edit.draft : null}
                focusField={isEditing ? edit.focusField : null}
                errors={isEditing ? edit.errors : {}}
                apiError={isEditing ? error : null}
                onSelect={(selected) => {
                  onSelect(system.id, selected);
                }}
                onStartEdit={(field: EditableField) => startEdit(system, field)}
                onChange={updateDraft}
                onSave={() => void saveEdit()}
                onCancel={cancelEdit}
              />
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
