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
import { useMemo, useState, useCallback, useEffect } from "react";

// ✅ Componente separado para o input de quantidade
// ✅ Componente separado para o input de quantidade
interface OrderQuantityInputProps {
  productCode: string;

  // ✅ mantém o nome: aqui ele representa o "sugerido" vindo do backend
  initialQuantity: number;

  // ✅ valor aceito/digitado (só vale quando touched=true)
  value: number;

  // ✅ se o user já passou pelo input
  touched: boolean;

  onTouched: (productCode: string) => void;
  onQuantityChange: (productCode: string, quantity: number) => void;
}

const OrderQuantityInput: React.FC<OrderQuantityInputProps> = ({
  productCode,
  initialQuantity,
  value,
  touched,
  onTouched,
  onQuantityChange,
}) => {
  // ✅ mostra sugerido mesmo sem touched (apenas visual)
  // ✅ quando touched=true, mostra o value aceito
  const [localQuantity, setLocalQuantity] = useState<string>(() => {
    if (touched) return value > 0 ? String(value) : "";
    return initialQuantity > 0 ? String(initialQuantity) : "";
  });

  // ✅ se o backend atualizar o sugerido e o user ainda não tocou, atualiza visual
  // ✅ se já tocou, reflete o value aceito
  useEffect(() => {
    if (touched) {
      setLocalQuantity(value > 0 ? String(value) : "");
    } else {
      setLocalQuantity(initialQuantity > 0 ? String(initialQuantity) : "");
    }
  }, [touched, value, initialQuantity]);

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
      } else {
        e.currentTarget.blur();
      }
    }
  };

  const handleBlur = () => {
    // ✅ agora sim considera "aceito"
    onTouched(productCode);

    const txt = String(localQuantity ?? "").trim();
    const n = Number(txt);
    const normalized = Number.isFinite(n) ? n : 0;

    onQuantityChange(productCode, normalized);

    if (normalized === 0) setLocalQuantity("");
    else setLocalQuantity(String(normalized));
  };

  return (
    <input
      type="number"
      min="0"
      data-qty-input="true"
      value={localQuantity}
      onChange={(e) => {
        const v = e.target.value;
        if (v === "" || /^\d+$/.test(v)) setLocalQuantity(v);
      }}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500"
    />
  );
};


interface UseTableColumnsProps {
  filteredData: Product[];
  columnOrder: ColumnOrderState;
  setColumnOrder: (order: ColumnOrderState) => void;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (
    updater: VisibilityState | ((old: VisibilityState) => VisibilityState)
  ) => void;
  // ✅ Adiciona callback para enviar as quantidades modificadas
  onOrderQuantitiesChange?: (quantities: Record<string, number>) => void;
}

export function useTableColumns({
  filteredData,
  columnOrder,
  setColumnOrder,
  columnVisibility = {},
  onColumnVisibilityChange,
  onOrderQuantitiesChange,
}: UseTableColumnsProps) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  // ✅ State para armazenar as quantidades modificadas
  const [orderQuantities, setOrderQuantities] = useState<
    Record<string, number>
  >({});
  // ✅ State para armazenar quais inputs o usuário "passou" (tab/blur)
  const [orderQtyTouched, setOrderQtyTouched] = useState<Record<string, boolean>>({});


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

  // ✅ Função para atualizar a quantidade de um produto
  const updateOrderQuantity = useCallback(
    (productCode: string, quantity: number) => {
      setOrderQuantities((prev) => {
        const newQuantities = {
          ...prev,
          [productCode]: quantity,
        };

        // ✅ Notifica o componente pai sobre a mudança
        if (onOrderQuantitiesChange) {
          onOrderQuantitiesChange(newQuantities);
        }

        return newQuantities;
      });
    },
    [onOrderQuantitiesChange]
  );
  const markOrderQtyTouched = useCallback((productCode: string) => {
    setOrderQtyTouched((prev) => ({ ...prev, [productCode]: true }));
  }, []);


  // ✅ Inicializa as quantidades com os valores padrão
  // ✅ Inicializa: NÃO espelha sugerido. Começa vazio (0) e touched=false.
  useEffect(() => {
    setOrderQuantities({});       // só entra aqui quando o user tocar
    setOrderQtyTouched({});       // ninguém tocou ainda

    if (onOrderQuantitiesChange) {
      onOrderQuantitiesChange({}); // pai fica sabendo que não tem nada "aceito" ainda
    }
  }, [filteredData, onOrderQuantitiesChange]);


  // ✅ Helper: pega total do mês no produto
  const getMonthlySales = useCallback((product: Product, month: string) => {
    const monthlySale = product.monthlySales?.find(
      (sale) => sale.month === month
    );
    return Number(monthlySale?.total ?? 0);
  }, []);

  // ✅ 1) Descobrir os meses vindos do backend, na ordem em que aparecem
  const monthKeys = useMemo(() => {
    const seen = new Set<string>();
    const order: string[] = [];
    for (const p of filteredData ?? []) {
      for (const it of p.monthlySales ?? []) {
        if (!seen.has(it.month)) {
          seen.add(it.month);
          order.push(it.month);
        }
      }
    }
    return order; // Mantém a ordem da API
  }, [filteredData]);

  // ✅ 2) Gerar colunas dinâmicas de meses (ordenáveis)
  const monthColumns = useMemo<ColumnDef<Product>[]>(() => {
    return monthKeys.map((mKey) => ({
      id: `ms_${mKey.replace("/", "_")}`, // ex.: ms_DEC_2025
      header: mKey,                       // mostra exatamente como veio do back
      size: 100,
      enableSorting: true,
      accessorFn: (row) => getMonthlySales(row, mKey), // ordenar funciona
      cell: ({ getValue }) => getValue() as number,
    }));
  }, [monthKeys, getMonthlySales]);

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

  // ✅ 3) Colunas da tabela + meses dinâmicos (substitui as hard-coded)
  const columns = useMemo<ColumnDef<Product>[]>(() => {
    return [
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
        size: 120,
        meta: { sticky: true, left: 110 },
        enableSorting: true,
      },
      {
        accessorKey: "description",
        id: "description",
        header: "Descrição",
        size: 300,
        meta: { sticky: true, left: 240 },
        enableSorting: true,
        cell: ({ row }) => (
          <div className="relative">
            <div className="truncate max-w-[500px]" title={row.original.description}>
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
        size: 120,
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
        size: 120,
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
        cell: ({ row }) => row.original.lastPurchaseCost,
        size: 140,
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
          row.original.availableStock != null &&
          row.original.availableStock.toString(),
        size: 140,
        enableSorting: true,
      },
      {
        accessorKey: "physicalStock",
        id: "physicalStock",
        header: () => (
          <span className="whitespace-nowrap">
            Est. <br /> Físico
          </span>
        ),
        cell: ({ row }) =>
          row.original.physicalStock != null &&
          row.original.physicalStock.toString(),
        size: 130,
        enableSorting: true,
      },
      {
        accessorKey: "stockTurnover",
        id: "stockTurnover",
        header: () => (
          <span className="whitespace-nowrap">
            Dias <br /> Estoque
          </span>
        ),
        cell: ({ row }) =>
          row.original.stockTurnover != null &&
          row.original.stockTurnover.toString(),
        size: 120,
        enableSorting: true,
      },
      {
        accessorKey: "lastPurchaseDate",
        id: "lastPurchaseDate",
        header: () => (
          <span className="whitespace-nowrap">
            últ. <br /> Compra
          </span>
        ),
        cell: ({ row }) => row.original.lastPurchaseDate,
        size: 130,
        enableSorting: true,
      },
      {
        accessorKey: "purchaseSuggestion",
        id: "purchaseSuggestion",
        header: () => (
          <span className="whitespace-nowrap">
            Qtd. <br /> Sugerida
          </span>
        ),
        cell: ({ row }) =>
          row.original.purchaseSuggestion != null &&
          row.original.purchaseSuggestion.toString(),
        size: 160,
        enableSorting: true,
      },
      {
        accessorKey: "totalSales",
        id: "totalSales",
        header: () => (
          <span className="whitespace-nowrap">
            Vendas <br /> Total
          </span>
        ),
        cell: ({ row }) =>
          row.original.totalSales != null && row.original.totalSales.toString(),
        size: 120,
        enableSorting: true,
      },
      {
        accessorKey: "average6Months",
        id: "average6Months",
        header: () => (
          <span className="whitespace-nowrap">
            Média <br /> Venda Mês
          </span>
        ),
        cell: ({ row }) => {
          const value = row.original.average6Months;
          return value && `${value}`;
        },
        size: 150,
        enableSorting: true,
      },

      // ✅ Meses dinâmicos vindos do backend (ordenáveis)
      ...monthColumns,

      {
        accessorKey: "orderQuantity",
        id: "orderQuantity",
        header: "Qtd. a Comprar",
        cell: ({ row }) => {
          const productCode = row.original.productCode;

          // sugerido sempre vem da linha
          //por solicitação do Diogo, o quantidade a comprar sempre tem que vir zerado.
          const suggested = 0;

          const touched = !!orderQtyTouched[productCode];

          // se tocou, usa o que está salvo; se não tocou, passa o sugerido pro blur aceitar
          const currentQuantity = touched
            ? (orderQuantities[productCode] ?? 0)
            : (suggested ?? 0);

          return (
            <OrderQuantityInput
              productCode={productCode}
              initialQuantity={currentQuantity}
              value={currentQuantity}
              touched={touched}
              onTouched={markOrderQtyTouched}
              onQuantityChange={updateOrderQuantity}
            />
          );
        },
        size: 120,
        enableSorting: false,
      },

    ];
  }, [
    isAllSelected,
    isSomeSelected,
    toggleAllRowsSelection,
    orderQuantities,
    orderQtyTouched,
    markOrderQtyTouched,
    updateOrderQuantity,
    monthColumns,
  ]);

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
    orderQuantities, // ✅ Retorna as quantidades para o componente pai
    orderQtyTouched, // ✅ Retorna também quem foi "passado" no input
  };
}
