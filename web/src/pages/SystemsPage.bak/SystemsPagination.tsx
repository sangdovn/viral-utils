import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

interface Props {
  pageIndex: number;
  pageSize: number;
  total: number;
  disabled: boolean;
  onPageIndexChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function SystemsPagination({
  pageIndex,
  pageSize,
  total,
  disabled,
  onPageIndexChange,
  onPageSizeChange,
}: Props) {
  if (total === 0) return null;

  const pageCount = Math.ceil(total / pageSize);

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-muted-foreground text-sm">
        Page {pageIndex + 1} of {pageCount}
      </p>

      <div className="flex items-center gap-2">
        <label htmlFor="row-select" className="flex items-center gap-2 text-sm">
          Rows
        </label>
        <NativeSelect
          id="row-select"
          value={pageSize}
          disabled={disabled}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {[10, 30, 50].map((value) => (
            <NativeSelectOption key={value} value={value}>
              {value}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <Button
          type="button"
          variant="outline"
          disabled={disabled || pageIndex === 0}
          onClick={() => onPageIndexChange(pageIndex - 1)}
        >
          Previous
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={disabled || pageIndex + 1 >= pageCount}
          onClick={() => onPageIndexChange(pageIndex + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
