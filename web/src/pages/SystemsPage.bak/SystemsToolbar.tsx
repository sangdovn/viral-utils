import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  searchInput: string;
  selectedCount: number;
  isSyncing: boolean;
  isDeleting: boolean;
  onSearchInputChange: (value: string) => void;
  onSync: () => void;
  onDeleteSelected: () => void;
}

export function SystemsToolbar({
  searchInput,
  selectedCount,
  isSyncing,
  isDeleting,
  onSearchInputChange,
  onSync,
  onDeleteSelected,
}: Props) {
  const isBusy = isSyncing || isDeleting;

  return (
    <div className="flex items-center gap-2">
      <Input
        type="search"
        aria-label="Search systems"
        placeholder="Search systems..."
        className="max-w-64"
        value={searchInput}
        onChange={(e) => onSearchInputChange(e.target.value)}
      />

      <Button type="button" disabled={isBusy} onClick={onSync}>
        {isSyncing && <Loader2Icon className="animate-spin" />}
        {isSyncing ? "Syncing..." : "Sync"}
      </Button>
      <Button
        type="button"
        variant="destructive"
        disabled={selectedCount === 0 || isBusy}
        onClick={onDeleteSelected}
      >
        {isDeleting && <Loader2Icon className="animate-spin" />}
        {isDeleting
          ? "Deleting..."
          : `Delete ${selectedCount ? ` (${selectedCount})` : ""}`}
      </Button>
    </div>
  );
}
