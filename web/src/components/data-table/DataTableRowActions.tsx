import type { RowData } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface RowActionsProps<TData extends RowData> {
	row: TData;
	actions: {
		label: string;
		onClick: (row: TData) => void;
		separator?: boolean;
	}[];
}
export function RowActions<TData extends RowData>({
	row,
	actions,
}: RowActionsProps<TData>) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={<Button variant="ghost" className="h-8 w-8 p-0" />}
			>
				<span className="sr-only">Open menu</span>
				<MoreHorizontal className="h-4 w-4" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuGroup>
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					{actions.map((action) => (
						<div key={action.label}>
							{action.separator && <DropdownMenuSeparator />}

							<DropdownMenuItem onClick={() => action.onClick(row)}>
								{action.label}
							</DropdownMenuItem>
						</div>
					))}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
