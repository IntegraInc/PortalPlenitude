"use client";

import { Product } from "@/app/types/filterTypes";
import {
  ColumnDef,
  useReactTable,
  ColumnOrderState,
  RowSelectionState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  OnChangeFn,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { useMemo, useState, useCallback } from "react";

interface UseTableColumnsProps {
  filteredData: Product[];
  columnOrder: ColumnOrderState;
  setColumnOrder: (order: ColumnOrderState) => void;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (
    updater: VisibilityState | ((old: VisibilityState) => VisibilityState)
  ) => void;
}

export function useTableColumns({
  filteredData,
  columnOrder,
  setColumnOrder,
  columnVisibility = {},
  onColumnVisibilityChange,
}: UseTableColumnsProps) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const handleColumnOrderChange: OnChangeFn<ColumnOrderState> = useCallback(
    (updaterOrValue) => {
      if (typeof updaterOrValue === "function") {
        setColumnOrder(updaterOrValue(columnOrder));
      } else {
        setColumnOrder(updaterOrValue);
      }
    },
    [columnOrder, setColumnOrder]
  );

  const getMonthlySales = useCallback((product: Product, month: string) => {
    const monthlySale = product.monthlySales?.find(
      (sale) => sale.month === month
    );
    return monthlySale?.total || 0;
  }, []);

  const toggleAllRowsSelection = useCallback(() => {
    if (Object.keys(rowSelection).length === filteredData.length) {
      setRowSelection({});
    } else {
      const allRowIds: RowSelectionState = {};
      filteredData.forEach((_, index) => {
        allRowIds[index] = true;
      });
      setRowSelection(allRowIds);
    }
  }, [rowSelection, filteredData]);

  const isAllSelected = useMemo(
    () =>
      filteredData?.length > 0 &&
      Object.keys(rowSelection).length === filteredData.length,
    [rowSelection, filteredData]
  );

  const isSomeSelected = useMemo(
    () => Object.keys(rowSelection).length > 0 && !isAllSelected,
    [rowSelection, isAllSelected]
  );

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        header: () => (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(input) => {
                if (input) {
                  input.indeterminate = isSomeSelected;
                }
              }}
              onChange={toggleAllRowsSelection}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>
        ),
        id: "select",
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
        ),
        size: 40,
        meta: { sticky: true, left: 0 },
        enableSorting: false,
      },
      {
        accessorKey: "productCode",
        id: "productCode",
        header: "SKU",
        size: 100,
        meta: { sticky: true, left: 45 },
        enableSorting: true,
      },
      {
        accessorKey: "barcode",
        id: "barcode",
        header: "Código de Barras",
        cell: ({ row }) => row.original.barcode || "-",
        size: 120,
        meta: { sticky: true, left: 110 },
        enableSorting: true,
      },
      {
        accessorKey: "description",
        id: "description",
        header: "Descrição",
        size: 180, // antes era 250
        meta: { sticky: true, left: 240 },
        enableSorting: true,
        cell: ({ row }) => (
          <div
            className="truncate max-w-[250px]" // ✅ aplica largura real e corta texto
            title={row.original.description}
          >
            {row.original.description || "-"}
          </div>
        ),
      },

      {
        accessorKey: "familyName",
        id: "familyName",
        header: "Família",
        cell: ({ row }) => row.original.familyName || "-",
        size: 120,
        enableSorting: true,
      },
      {
        accessorKey: "familyCode",
        id: "familyCode",
        header: "Cód. Família",
        cell: ({ row }) => row.original.familyCode || "-",
        size: 120,
        enableSorting: true,
      },
      {
        accessorKey: "lastPurchaseCost",
        id: "lastPurchaseCost",
        header: "Último Custo (R$)",
        cell: ({ row }) => {
          const value = row.original.lastPurchaseCost;
          if (!value || value === "R$0,01") return "-";
          return value;
        },
        size: 140,
        enableSorting: true,
      },
      {
        accessorKey: "availableStock",
        id: "availableStock",
        header: "Estoque Disponível",
        cell: ({ row }) =>
          row.original.availableStock != null
            ? row.original.availableStock.toString()
            : "-",
        size: 140,
        enableSorting: true,
      },
      {
        accessorKey: "physicalStock",
        id: "physicalStock",
        header: "Estoque Físico",
        cell: ({ row }) =>
          row.original.physicalStock != null
            ? row.original.physicalStock.toString()
            : "-",
        size: 130,
        enableSorting: true,
      },
      {
        accessorKey: "stockTurnover",
        id: "stockTurnover",
        header: "Dias Estoque",
        cell: ({ row }) =>
          row.original.stockTurnover != null
            ? row.original.stockTurnover.toString()
            : "-",
        size: 120,
        enableSorting: true,
      },
      {
        accessorKey: "lastPurchaseDate",
        id: "lastPurchaseDate",
        header: "Última Compra",
        cell: ({ row }) => row.original.lastPurchaseDate || "-",
        size: 130,
        enableSorting: true,
      },
      {
        accessorKey: "quantityToBuy",
        id: "quantityToBuy",
        header: "Quantidade Sugerida",
        cell: ({ row }) =>
          row.original.quantityToBuy != null
            ? row.original.quantityToBuy.toString()
            : "-",
        size: 160,
        enableSorting: true,
      },
      {
        accessorKey: "totalSales",
        id: "totalSales",
        header: "Vendas Total",
        cell: ({ row }) =>
          row.original.totalSales != null
            ? row.original.totalSales.toString()
            : "-",
        size: 120,
        enableSorting: true,
      },
      {
        accessorKey: "average6Months",
        id: "average6Months",
        header: "Média venda mês",
        cell: ({ row }) => {
          const value = row.original.average6Months;
          return !value ? "-" : `${value.toFixed(2)}`;
        },
        size: 150,
        enableSorting: true,
      },
      {
        accessorKey: "monthlySales_NOV_2025",
        id: "monthlySales_NOV_2025",
        header: "NOV/2025",
        cell: ({ row }) => getMonthlySales(row.original, "NOV/2025"),
        size: 100,
        enableSorting: true,
      },
      {
        accessorKey: "monthlySales_OCT_2025",
        id: "monthlySales_OCT_2025",
        header: "OUT/2025",
        cell: ({ row }) => getMonthlySales(row.original, "OCT/2025"),
        size: 100,
        enableSorting: true,
      },
      {
        accessorKey: "monthlySales_SEP_2025",
        id: "monthlySales_SEP_2025",
        header: "SET/2025",
        cell: ({ row }) => getMonthlySales(row.original, "SEP/2025"),
        size: 100,
        enableSorting: true,
      },
      {
        accessorKey: "monthlySales_AUG_2025",
        id: "monthlySales_AUG_2025",
        header: "AGO/2025",
        cell: ({ row }) => getMonthlySales(row.original, "AUG/2025"),
        size: 100,
        enableSorting: true,
      },
      {
        accessorKey: "monthlySales_JUL_2025",
        id: "monthlySales_JUL_2025",
        header: "JUL/2025",
        cell: ({ row }) => getMonthlySales(row.original, "JUL/2025"),
        size: 100,
        enableSorting: true,
      },
      {
        accessorKey: "monthlySales_JUN_2025",
        id: "monthlySales_JUN_2025",
        header: "JUN/2025",
        cell: ({ row }) => getMonthlySales(row.original, "JUN/2025"),
        size: 100,
        enableSorting: true,
      },
      {
        accessorKey: "orderQuantity",
        id: "orderQuantity",
        header: "Qtd. a Comprar",
        cell: ({ row }) => (
          <input
            type="number"
            min="0"
            defaultValue={row.original.quantityToBuy || 0}
            className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500"
          />
        ),
        size: 120,
        enableSorting: false,
      },
    ],
    [isAllSelected, isSomeSelected, toggleAllRowsSelection, getMonthlySales]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      columnOrder,
      rowSelection,
      sorting,
      columnVisibility,
    },
    onColumnOrderChange: handleColumnOrderChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: onColumnVisibilityChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
  });

  const selectedCount = Object.keys(rowSelection).length;

  return {
    columns,
    table,
    selectedCount,
    rowSelection,
    setRowSelection,
    toggleAllRowsSelection,
    isAllSelected,
    isSomeSelected,
    sorting,
    setSorting,
  };
}
