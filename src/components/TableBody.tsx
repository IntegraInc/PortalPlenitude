/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { flexRender, Table } from "@tanstack/react-table";
import { Product } from "@/app/types/filterTypes";

interface TableBodyProps {
  table: Table<Product>;
  dragState: any;
  dragHandlers: any;
  columnOrder: string[];
  setColumnOrder: (order: string[]) => void;

  setSelectProducts: any;
}

export default function TableBody({
  table,
  dragState,
  dragHandlers,
  columnOrder,
  setSelectProducts,
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

  const [openColumnMenu, setOpenColumnMenu] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = useState<
    Record<string, Set<string>>
  >({});

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Fecha automaticamente o menu ao clicar fora
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpenColumnMenu(null);
    };
    document.addEventListener("pointerdown", handlePointerDown, {
      capture: true,
    });
    return () =>
      document.removeEventListener("pointerdown", handlePointerDown, {
        capture: true,
      } as any);
  }, []);

  const getUniqueValues = (columnId: string) => {
    const values = new Set<string>();
    table.getRowModel().rows.forEach((row) => {
      const v = row.getValue(columnId);
      if (v !== null && v !== undefined && v !== "") values.add(String(v));
    });
    return Array.from(values);
  };

  const toggleValueVisibility = (columnId: string, value: string) => {
    setColumnFilters((prev) => {
      const next = new Set(prev[columnId] || []);
      next.has(value) ? next.delete(value) : next.add(value);
      return { ...prev, [columnId]: next };
    });
  };

  const filteredRows = table.getRowModel().rows.filter((row) =>
    Object.entries(columnFilters).every(([colId, hidden]) => {
      const val = String(row.getValue(colId) ?? "");
      return !hidden.has(val);
    })
  );

  return (
    <>
      <thead className="bg-gray-50 select-none sticky top-0 z-30">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const isBeingDragged = draggedColumn === header.id;
              const isDropTarget = dragOverColumn === header.id;
              const isSticky = (header.column.columnDef.meta as any)?.sticky;
              const stickyLeft = (header.column.columnDef.meta as any)?.left;
              const canSort = header.column.getCanSort();
              const sortHandler = header.column.getToggleSortingHandler();
              const isFiltered = columnFilters[header.id]?.size > 0;

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
                    canSort && openColumnMenu !== header.id
                      ? sortHandler
                      : undefined
                  }
                  className={`text-left text-xs font-semibold text-gray-600 uppercase tracking-wider relative group whitespace-nowrap border-r border-gray-200
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
                        ? "sticky z-40 bg-gray-50 shadow-[1px_0_2px_rgba(0,0,0,0.08)]"
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

                    {/* menu */}
                    <div
                      className="relative flex items-center"
                      ref={(el) => {
                        if (openColumnMenu === header.id) menuRef.current = el;
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenColumnMenu(
                            openColumnMenu === header.id ? null : header.id
                          );
                        }}
                        className={`p-1 rounded hover:bg-gray-200 transition ${
                          isFiltered
                            ? "bg-indigo-100 text-indigo-600"
                            : "text-gray-600"
                        }`}
                      >
                        <svg
                          className="w-3.5 h-3.5"
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
                      </button>

                      {openColumnMenu === header.id && (
                        <div
                          role="menu"
                          className="absolute right-0 top-6 bg-white border border-gray-200 rounded-md shadow-lg z-50 w-56 p-2 max-h-72 overflow-y-auto"
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-gray-600 font-semibold truncate">
                              Filtrar {header.column.columnDef.header as string}
                            </p>
                            <button
                              className="text-[11px] px-2 py-0.5 rounded hover:bg-gray-100"
                              onClick={() =>
                                setColumnFilters((prev) => {
                                  const { [header.id]: _, ...rest } = prev;
                                  return rest;
                                })
                              }
                            >
                              Limpar
                            </button>
                          </div>
                          <hr className="my-1" />

                          {getUniqueValues(header.id).map((val) => {
                            const hidden =
                              columnFilters[header.id]?.has(val) ?? false;
                            return (
                              <label
                                key={val}
                                className="flex items-center text-xs gap-2 px-1 py-0.5 hover:bg-gray-100 cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={!hidden}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    toggleValueVisibility(header.id, val);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className="truncate">{val}</span>
                              </label>
                            );
                          })}

                          {getUniqueValues(header.id).length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-2">
                              Sem valores
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </th>
              );
            })}
          </tr>
        ))}
      </thead>

      <tbody className="divide-y divide-gray-100 bg-white relative z-10">
        {filteredRows.map((row) => (
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
                  className={`text-sm text-gray-700 whitespace-nowrap border-r border-gray-100 ${
                    isSticky
                      ? "sticky z-20 shadow-[1px_0_2px_rgba(0,0,0,0.08)]"
                      : ""
                  } ${
                    isSticky && isSelected
                      ? "bg-blue-50"
                      : isSticky
                      ? "bg-white"
                      : ""
                  }`}
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
