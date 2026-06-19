import { Fragment } from "react";

interface Column<T> {
  label: string;
  render: (row: T) => React.ReactNode;
  align?: "left" | "right";
  width?: string;
}

interface TableProps<T extends { id: number }> {
  columns: Column<T>[];
  data: T[];
  expanded?: (row: T) => React.ReactNode;
  expandedId?: number | null;
}

export default function Table<T extends { id: number }>({
  columns,
  data,
  expanded,
  expandedId,
}: TableProps<T>) {
  if (data.length === 0) {
    return <p className="text-center text-gray-400 py-8">No data found.</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-xs text-gray-400 uppercase tracking-wide">
          {columns.map((col) => (
            <th
              key={col.label}
              style={{ width: col.width }}
              className={`pb-2 px-3 font-medium ${col.align === "right" ? "text-right" : "text-left"}`}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <Fragment key={row.id}>
            <tr className="border-b border-gray-50 hover:bg-gray-50">
              {columns.map((col) => (
                <td
                  key={col.label}
                  className={`py-3 px-3 ${col.align === "right" ? "text-right" : "text-left"}`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
            {expanded && expandedId === row.id && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-3 bg-gray-50">
                  {expanded(row)}
                </td>
              </tr>
            )}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}
