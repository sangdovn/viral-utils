import { Checkbox } from "@/components/ui/checkbox";

export function SelectCell({
  selected,
  toggleSelected,
}: {
  selected: boolean;
  toggleSelected: (selected: boolean) => void;
}) {
  return (
    <Checkbox
      checked={selected}
      onCheckedChange={toggleSelected}
      aria-label="Select row"
    />
  );
}
