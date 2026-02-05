/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { TablePriceProduct } from "@/app/types/filterTypes";
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
  Table,
} from "@tanstack/react-table";
import { useMemo, useState, useCallback, useEffect } from "react";

// ✅ Componente separado para o input de quantidade
interface OrderQuantityInputProps {
  productCode: string;
  initialQuantity: number;
  onQuantityChange: (productCode: string, quantity: number) => void;
}

const OrderQuantityInput: React.FC<OrderQuantityInputProps> = ({
  productCode,
  initialQuantity,
  onQuantityChange,
}) => {
  const [localQuantity, setLocalQuantity] = useState<string>(
    initialQuantity > 0 ? initialQuantity.toString() : ""
  );

  // Sincroniza quando a quantidade inicial muda externamente
  useEffect(() => {
    setLocalQuantity(initialQuantity > 0 ? initialQuantity.toString() : "");
  }, [initialQuantity]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
      return;
    }

    // 👉 Captura TAB e move para o próximo input
    if (e.key === "Tab") {
      e.preventDefault();

      const inputs = Array.from(
        document.querySelectorAll("input[data-qty-input='true']")
      ) as HTMLInputElement[];

      const index = inputs.indexOf(e.currentTarget);

      if (index >= 0 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    }
  };

  const handleBlur = () => {
    const newQuantity = parseInt(localQuantity) || 0;
    onQuantityChange(productCode, newQuantity);

    // Atualiza o estado local para refletir o valor formatado
    if (newQuantity === 0) {
      setLocalQuantity("");
    }
  };

  return (
    <input
      type="number"
      min="0"
      data-qty-input="true"
      value={localQuantity}
      onChange={(e) => {
        const value = e.target.value;
        if (value === "" || /^\d+$/.test(value)) {
          setLocalQuantity(value);
        }
      }}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500"
    />
  );
};

interface UseTablePriceColumnsProps {
  filteredData: any;
  columnOrder: ColumnOrderState;
  setColumnOrder: (order: ColumnOrderState) => void;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (
    updater: VisibilityState | ((old: VisibilityState) => VisibilityState)
  ) => void;
  onOrderQuantitiesChange?: (quantities: Record<string, number>) => void;
}
// ✅ Input genérico para preços (salePrice / capPrice)
interface PriceInputProps {
  initialValue: number | null | undefined;
  onCommit?: (value: number | null, changed: boolean) => void;
}

const PriceInput: React.FC<PriceInputProps> = ({ initialValue, onCommit }) => {
  const [localValue, setLocalValue] = useState<string>(
    initialValue != null
      ? initialValue.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      : ""
  );

  // Sincroniza com valor vindo do backend
  useEffect(() => {
    setLocalValue(
      initialValue != null
        ? initialValue.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        : ""
    );
  }, [initialValue]);

  const parseToNumber = (str: string): number | null => {
    if (!str.trim()) return null;

    // remove pontos de milhar e troca vírgula por ponto
    const normalized = str.replace(/\./g, "").replace(",", ".");
    const n = Number(normalized);
    if (Number.isNaN(n)) return null;
    return n;
  };

  const handleCommit = () => {
    const newValue = parseToNumber(localValue);
    const original = initialValue ?? null;

    const changed =
      (newValue === null && original !== null) ||
      (newValue !== null && original === null) ||
      (newValue !== null && original !== null && newValue !== original);

    if (onCommit) onCommit(newValue, changed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.currentTarget as HTMLInputElement).blur();
      return;
    }

    if (e.key === "Tab") {
      handleCommit(); // garante commit antes de sair
    }
  };

  return (
    <input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleCommit}
      onKeyDown={handleKeyDown}
      className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm text-right focus:ring-1 focus:ring-indigo-500 focus:outline-none"
      placeholder="0,00"
    />
  );
};

export function useTablePriceColumns({
  filteredData,
  columnOrder,
  setColumnOrder,
  columnVisibility = {},
  onColumnVisibilityChange,
  onOrderQuantitiesChange,
}: UseTablePriceColumnsProps) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [orderQuantities, setOrderQuantities] = useState<
    Record<string, number>
  >({});

  const handleColumnOrderChange: OnChangeFn<ColumnOrderState> = useCallback(
    (updaterOrValue) => {
      if (typeof updaterOrValue === "function") {
        // ✅ pega o estado REAL atual da tabela (não do closure)
        const current = table.getState().columnOrder;
        const next = updaterOrValue(current);
        setColumnOrder(next);
      } else {
        setColumnOrder(updaterOrValue);
      }
    },
    [setColumnOrder]
  );


  // ✅ Atualiza a quantidade de um produto
  const updateOrderQuantity = useCallback(
    (productCode: string, quantity: number) => {
      setOrderQuantities((prev) => {
        const newQuantities = {
          ...prev,
          [productCode]: quantity,
        };

        if (onOrderQuantitiesChange) {
          onOrderQuantitiesChange(newQuantities);
        }

        return newQuantities;
      });
    },
    [onOrderQuantitiesChange]
  );

  // ✅ Inicializa as quantidades (aqui começa tudo em 0, pois não vem quantity do backend)
  useEffect(() => {
    const initialQuantities: Record<string, number> = {};
    filteredData.forEach((product: any) => {
      initialQuantities[product.productCode] = 0;
    });
    setOrderQuantities(initialQuantities);

    if (onOrderQuantitiesChange) {
      onOrderQuantitiesChange(initialQuantities);
    }
  }, [filteredData, onOrderQuantitiesChange]);

  const toggleAllRowsSelection = useCallback(() => {
    if (Object.keys(rowSelection).length === filteredData.length) {
      setRowSelection({});
    } else {
      const allRowIds: RowSelectionState = {};
      filteredData.forEach((_: any, index: any) => {
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

  const columns = useMemo<ColumnDef<TablePriceProduct>[]>(
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
        header: "Cod.Barras",
        cell: ({ row }) => row.original.barcode,
        size: 130,
        meta: { sticky: true, left: 110 },
        enableSorting: true,
      },
      {
        accessorKey: "description",
        id: "description",
        header: "Descrição",
        size: 320,
        meta: { sticky: true, left: 250 },
        enableSorting: true,
        cell: ({ row }) => (
          <div className="relative">
            <div
              className="truncate max-w-[500px]"
              title={row.original.description}
            >
              {row.original.description}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "familyName",
        id: "familyName",
        header: "Família",
        cell: ({ row }) => row.original.familyName,
        size: 140,
        enableSorting: true,
      },
      {
        accessorKey: "familyCode",
        id: "familyCode",
        header: () => (
          <span className="whitespace-nowrap">
            Cód. <br /> Família
          </span>
        ),
        cell: ({ row }) => row.original.familyCode,
        size: 110,
        enableSorting: true,
      },
      {
        accessorKey: "category",
        id: "category",
        header: "Categoria",
        cell: ({ row }) => row.original.category,
        size: 130,
        enableSorting: true,
      },
      {
        accessorKey: "lastPurchaseCost",
        id: "lastPurchaseCost",
        header: () => (
          <span className="whitespace-nowrap">
            Últ. <br /> Custo
          </span>
        ),
        cell: ({ row }) => row.original.lastPurchaseCost || "-",
        size: 110,
        enableSorting: true,
      },
      {
        accessorKey: "capPrice",
        id: "capPrice",
        header: "Preço Capa",
        cell: ({ row }) => {
          const originalValue = row.original.capPrice as
            | number
            | null
            | undefined;

          return (
            <PriceInput
              initialValue={originalValue}
              onCommit={(value, changed) => {
                // Atualiza o valor em memória
                (row.original as any).capPrice = value;

                // Se mudou, seleciona checkbox automaticamente
                if (changed && !row.getIsSelected()) {
                  row.toggleSelected(true);
                }
              }}
            />
          );
        },
        size: 120,
        enableSorting: true,
      },
      {
        accessorKey: "venCapPercent",
        id: "venCapPercent",
        header: "% Desc editora",
        cell: ({ row }) =>
          row.original.venCapPercent != null
            ? `${row.original.venCapPercent.toFixed(2)} %`
            : "-",
        size: 90,
        enableSorting: true,
      },
      {
        accessorKey: "publisherPercentDiscount",
        id: "publisherPercentDiscount",
        header: "% Venda sobre Custo",
        cell: ({ row }) =>
          row.original.publisherPercentDiscount != null
            ? `${row.original.publisherPercentDiscount.toFixed(2)} %`
            : "-",
        size: 90,
        enableSorting: true,
      },
      {
        accessorKey: "salePrice",
        id: "salePrice",
        header: "Preço Venda",
        cell: ({ row }) => {
          const originalValue = row.original.salePrice as
            | number
            | null
            | undefined;
          return (
            <PriceInput
              initialValue={originalValue}
              onCommit={(value, changed) => {
                (row.original as any).salePrice = value;

                if (changed && !row.getIsSelected()) {
                  row.toggleSelected(true);
                }
              }}
            />
          );
        },
        size: 130,
        enableSorting: true,
      },

      {
        accessorKey: "marginPercent",
        id: "marginPercent",
        header: "% Margem",
        cell: ({ row }) =>
          row.original.marginPercent != null
            ? `${row.original.marginPercent.toFixed(2)} %`
            : "-",
        size: 100,
        enableSorting: true,
      },
      {
        accessorKey: "markupPercent",
        id: "markupPercent",
        header: "% Markup",
        cell: ({ row }) =>
          row.original.markupPercent != null
            ? `${row.original.markupPercent.toFixed(2)} %`
            : "-",
        size: 100,
        enableSorting: true,
      },
      {
        accessorKey: "suggestedPriceByMargin",
        id: "suggestedPriceByMargin",
        header: "Sug. Margem",
        cell: ({ row }) => {
          const value = row.original.suggestedPriceByMargin;
          return value
            ? value.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
            : "-";
        },
        size: 130,
        enableSorting: true,
      },
      {
        accessorKey: "suggestedPriceByMarkup",
        id: "suggestedPriceByMarkup",
        header: "Sug. Markup",
        cell: ({ row }) => {
          const value = row.original.suggestedPriceByMarkup;
          return value
            ? value.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
            : "-";
        },
        size: 130,
        enableSorting: true,
      },
      {
        accessorKey: "availableStock",
        id: "availableStock",
        header: () => (
          <span className="whitespace-nowrap">
            Est. <br /> Disp
          </span>
        ),
        cell: ({ row }) =>
          row.original.availableStock != null
            ? row.original.availableStock.toString()
            : "-",
        size: 100,
        enableSorting: true,
      },
      {
        accessorKey: "lastPurchaseDate",
        id: "lastPurchaseDate",
        header: () => (
          <span className="whitespace-nowrap">
            Últ. <br /> Compra
          </span>
        ),
        cell: ({ row }) => row.original.lastPurchaseDate || "-",
        size: 120,
        enableSorting: true,
      },
    ],
    [
      isAllSelected,
      isSomeSelected,
      toggleAllRowsSelection,
      orderQuantities,
      updateOrderQuantity,
    ]
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
    onColumnVisibilityChange,
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
    orderQuantities,
  };
}
