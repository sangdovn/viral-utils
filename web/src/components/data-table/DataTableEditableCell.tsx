import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

export function EditableCell({
  value,
  onSave,
}: {
  value: string;
  onSave: (value: string) => void;
}) {
  const [editing, setEditing] = useState<boolean>(false);
  const [draft, setDraft] = useState<string>(value);
  const [saving, setSaving] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [
    editing,
  ]);

  async function handleSave() {
    if (draft === value) {
      setEditing(false);
      return;
    }

    setSaving(true);

    try {
      await onSave(draft);

      setEditing(false);
    } catch {
      setDraft(value);
      setEditing(false);

      toast.add({
        title: "Failed to update",
      });
    } finally {
      setSaving(false);
    }
  }

  return editing ? (
    <Input
      ref={inputRef}
      disabled={saving}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={handleSave}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
        if (e.key === "Escape") {
          setDraft(value);
          setEditing(false);
        }
      }}
      className="h-8 w-full min-w-0 rounded-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:outline-none focus-visible:ring-0"
    />
  ) : (
    <button
      type="button"
      onDoubleClick={() => setEditing(true)}
      className="block h-8 w-full min-w-0 truncate p-0 text-left text-sm"
    >
      {value}
    </button>
  );
}
