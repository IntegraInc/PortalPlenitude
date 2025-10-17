"use client";

import { FiltersData, Product } from "@/app/types/filterTypes";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  ColumnOrderState,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";

interface MainTableProps {
  filters: FiltersData;
  products: Product[];
}

export default function MainTable({ filters, products }: MainTableProps) {
  const [data, setData] = useState<Product[]>(products);
  const [globalFilter, setGlobalFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedValue, setEditedValue] = useState<number>(0);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);

  // ✅ Colunas da tabela (seguras contra null)
  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        header: "",
        id: "select",
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        ),
      },
      { accessorKey: "productCode", header: "Código" },
      { accessorKey: "description", header: "Descrição" },
      { accessorKey: "family", header: "Família" },
      {
        accessorKey: "basePrice",
        header: "Preço Base (R$)",
        cell: ({ row }) => {
          const price = row.original.basePrice;
          return editingId === row.original.productCode ? (
            <input
              type="number"
              value={editedValue}
              onChange={(e) => setEditedValue(parseFloat(e.target.value) || 0)}
              className="w-24 text-right border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500"
            />
          ) : (
            <span className="text-gray-700">
              {price != null ? price.toFixed(2) : "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "availableStock",
        header: "Estoque Disponível",
        cell: ({ row }) =>
          row.original.availableStock != null
            ? row.original.availableStock
            : "-",
      },
      {
        accessorKey: "minStock",
        header: "Estoque Mínimo",
        cell: ({ row }) =>
          row.original.minStock != null ? row.original.minStock : "-",
      },
      {
        accessorKey: "quantityToBuy",
        header: "Sugestão de Compra",
        cell: ({ row }) =>
          row.original.quantityToBuy != null
            ? row.original.quantityToBuy.toFixed(2)
            : "-",
      },
      {
        header: "Ações",
        cell: ({ row }) =>
          editingId === row.original.productCode ? (
            <button
              className="text-green-600 font-medium hover:text-green-700 transition"
              onClick={() => {
                setData((prev) =>
                  prev.map((p) =>
                    p.productCode === row.original.productCode
                      ? { ...p, basePrice: editedValue }
                      : p
                  )
                );
                setEditingId(null);
              }}
            >
              Salvar
            </button>
          ) : (
            <button
              className="text-indigo-600 font-medium hover:text-indigo-700 transition"
              onClick={() => {
                setEditingId(row.original.productCode);
                setEditedValue(row.original.basePrice ?? 0);
              }}
            >
              Editar
            </button>
          ),
      },
    ],
    [editingId, editedValue]
  );

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, columnOrder },
    onGlobalFilterChange: setGlobalFilter,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleDragStart = (event: React.DragEvent, columnId: string) => {
    event.dataTransfer.setData("text/plain", columnId);
  };

  const handleDrop = (event: React.DragEvent, targetColumnId: string) => {
    const sourceColumnId = event.dataTransfer.getData("text/plain");
    if (sourceColumnId === targetColumnId) return;

    const newOrder = [
      ...(columnOrder.length
        ? columnOrder
        : table.getAllLeafColumns().map((c) => c.id)),
    ];
    const fromIndex = newOrder.indexOf(sourceColumnId);
    const toIndex = newOrder.indexOf(targetColumnId);

    newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, sourceColumnId);
    setColumnOrder(newOrder);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Lista de Produtos
        </h2>
        <input
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Filtrar..."
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 select-none">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, header.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, header.id)}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-grab active:cursor-grabbing hover:bg-gray-100 transition-colors"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm text-gray-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        {table.getRowModel().rows.length} produtos exibidos
      </p>
    </div>
  );
}
