/* eslint-disable @typescript-eslint/no-explicit-any */
import { flexRender, Table } from "@tanstack/react-table";
import { Product } from "@/app/types/filterTypes";

interface TableBodyProps {
  table: Table<Product>;
  dragState: any;
  dragHandlers: any;
  columnOrder: string[];
  setColumnOrder: (order: string[]) => void;
}

export default function TableBody({
  table,
  dragState,
  dragHandlers,
  columnOrder,
  setColumnOrder,
}: TableBodyProps) {
  const { dragOverColumn, isDragging, draggedColumn } = dragState;
  const {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = dragHandlers;

  return (
    <>
      <thead className="bg-gray-50 select-none sticky top-0 z-20">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const isBeingDragged = draggedColumn === header.id;
              const isDropTarget = dragOverColumn === header.id;
              const isSticky = (header.column.columnDef.meta as any)?.sticky;
              const stickyLeft = (header.column.columnDef.meta as any)?.left;
              const canSort = header.column.getCanSort();

              return (
                <th
                  key={header.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, header.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, header.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) =>
                    handleDrop(e, header.id, columnOrder, setColumnOrder)
                  }
                  onClick={
                    canSort
                      ? header.column.getToggleSortingHandler()
                      : undefined
                  }
                  className={`
                    text-left text-xs font-semibold text-gray-600 
                    uppercase tracking-wider transition-all duration-200 ease-in-out
                    relative group whitespace-nowrap border-r border-gray-200
                    ${isDragging ? "cursor-grabbing" : "cursor-grab"}
                    ${canSort ? "hover:bg-gray-200 cursor-pointer" : ""}
                    ${
                      isBeingDragged
                        ? "opacity-50 bg-blue-50 scale-95 shadow-inner"
                        : ""
                    }
                    ${
                      isDropTarget && !isBeingDragged
                        ? "bg-blue-100 border-l-2 border-l-blue-500 border-r-2 border-r-blue-500 transform scale-105 shadow-md"
                        : "hover:bg-gray-100"
                    }
                    ${
                      isSticky
                        ? "sticky z-30 bg-gray-50 shadow-[1px_0_2px_rgba(0,0,0,0.08)]"
                        : ""
                    }
                  `}
                  style={{
                    width: header.getSize(),
                    left: isSticky ? stickyLeft : undefined,
                    padding: isSticky ? "6px 8px" : "8px 12px",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex-1 truncate text-[11px] font-medium flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {canSort && (
                        <span className="flex flex-col ml-1">
                          <svg
                            className={`w-2 h-2 ${
                              header.column.getIsSorted() === "asc"
                                ? "text-indigo-600"
                                : "text-gray-400"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                          <svg
                            className={`w-2 h-2 ${
                              header.column.getIsSorted() === "desc"
                                ? "text-indigo-600"
                                : "text-gray-400"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </span>
                      )}
                    </span>
                    <div
                      className={`ml-1 transition-opacity duration-200 flex-shrink-0 ${
                        isDragging
                          ? "opacity-0"
                          : "opacity-0 group-hover:opacity-70"
                      }`}
                    >
                      <svg
                        className="w-3 h-3 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8h16M4 16h16"
                        />
                      </svg>
                    </div>
                  </div>
                </th>
              );
            })}
          </tr>
        ))}
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {table?.getRowModel().rows.map((row) => (
          <tr
            key={row.id}
            className={`hover:bg-gray-50 transition-colors duration-150 ${
              row.getIsSelected()
                ? "bg-blue-50 border-l-2 border-l-blue-500"
                : ""
            }`}
          >
            {row.getVisibleCells().map((cell) => {
              const isSticky = (cell.column.columnDef.meta as any)?.sticky;
              const stickyLeft = (cell.column.columnDef.meta as any)?.left;
              const isSelected = row.getIsSelected();

              return (
                <td
                  key={cell.id}
                  className={`
                    text-sm text-gray-700 whitespace-nowrap border-r border-gray-100
                    ${
                      isSticky
                        ? "sticky z-20 shadow-[1px_0_2px_rgba(0,0,0,0.08)]"
                        : ""
                    }
                    ${isSticky && isSelected ? "bg-blue-50" : ""}
                    ${isSticky && !isSelected ? "bg-white" : ""}
                  `}
                  style={{
                    width: cell.column.getSize(),
                    left: isSticky ? stickyLeft : undefined,
                    padding: isSticky ? "4px 8px" : "6px 12px",
                    height: "30px",
                    fontSize: isSticky ? "12px" : "13px",
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </>
  );
}
