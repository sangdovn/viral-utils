import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

export default function SearchInput({ value, onChange, placeholder, className }: SearchInputProps) {
  return (
    <div className={className}>
      <div className="relative max-w-md">
        <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="pr-10 pl-9"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="-translate-y-1/2 absolute top-1/2 right-1"
            aria-label="Clear search"
            title="Clear search"
            onClick={() => onChange("")}
          >
            <X />
          </Button>
        )}
      </div>
    </div>
  );
}
