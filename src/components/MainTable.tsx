"use client";

import * as XLSX from "xlsx";
import { FiltersData, Product } from "@/app/types/filterTypes";
import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "./Pagination";
import TableFooterInfo from "./TableFooterInfo";
import TableHeader from "./TableHeader";
import TableBody from "./TableBody";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { useTableColumns } from "@/app/hooks/useTableColumns";
import { useDragAndDrop } from "@/app/hooks/useDragAndDrop";
import { useTableFilters } from "@/app/hooks/useTableFilters";
import { useColumnVisibility } from "@/app/hooks/useColumnVisibility";
import OrderModal from "./OrderModal";
import ColumnsDropdown from "./ColumnsDropdown";

interface MainTableProps {
  filters: FiltersData;
  products: Product[];
  renderHeader?: boolean;           // já existe (default true)
  deferFilterApply?: boolean;       // ✅ novo: não alterar URL nem “buscar” ao trocar família
  onApplyFilters?: (familia: string) => void; // ✅ novo: o botão Filtrar chama o pai
  isFetching?: boolean;

  // ✅ paginação de front
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void; // opcional
}

// 🔧 Helpers meses dinâmicos
const monthId = (m: string) => `ms_${m.replace("/", "_")}`;

const uniqueMonthsInOrder = (products: Product[]) => {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const p of products ?? []) {
    for (const it of p.monthlySales ?? []) {
      if (!seen.has(it.month)) {
        seen.add(it.month);
        order.push(it.month);
      }
    }
  }
  return order; // mantém a ordem que aparece no backend
};

// ✅ Colunas fixas do dropdown (mantém igual seu original, sem os meses hard-coded)
const BASE_AVAILABLE_COLUMNS = [
  { id: "familyName", header: "Família" },
  { id: "familyCode", header: "Cód. Família" },
  { id: "lastPurchaseCost", header: "Último Custo" },
  { id: "availableStock", header: "Estoque Disponível" },
  { id: "physicalStock", header: "Estoque Físico" },
  { id: "stockTurnover", header: "Dias Estoque" },
  { id: "lastPurchaseDate", header: "Última Compra" },
  { id: "purchaseSuggestion", header: "Quantidade Sugerida" },
  { id: "totalSales", header: "Vendas Total" },
  { id: "average6Months", header: "Média venda mês" },
  { id: "orderQuantity", header: "Qtd. a Comprar" },
];

export default function MainTable({ filters,
  products,
  renderHeader = true,
  deferFilterApply = false,
  isFetching,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onApplyFilters, }: MainTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectProducts, setSelectProducts] = useState(false);
  const [orderQuantities, setOrderQuantities] = useState<
    Record<string, number>
  >({});
  // ✅ STATE para salvar os produtos selecionados
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const familiaFromUrl = searchParams.get("familia") || "";

  const {
    filteredData,
    searchTerm,
    setSearchTerm,
    selectedFamilia,
    setSelectedFamilia,
  } = useTableFilters(products || [], familiaFromUrl);
  const monthKeys = useMemo(() => uniqueMonthsInOrder(products), [products]);

  const AVAILABLE_COLUMNS = useMemo(() => {
    const monthCols = monthKeys.map((m) => ({
      id: monthId(m),   // ✅ precisa bater com o hook: ms_DEC_2025 etc
      header: m,        // ✅ mostra exatamente como vem do backend (SEP/2025, JAN/2026...)
    }));


    // mantém o "orderQuantity" por último (igual seu layout mental)
    const baseWithoutOrderQty = BASE_AVAILABLE_COLUMNS.filter(c => c.id !== "orderQuantity");
    const orderQty = BASE_AVAILABLE_COLUMNS.find(c => c.id === "orderQuantity")!;

    return [...baseWithoutOrderQty, ...monthCols, orderQty];
  }, [monthKeys]);




  const { columnOrder, setColumnOrder, clearPersistedColumnOrder } =
    useLocalStorage("plenitude:analysys:columnOrder");
  const hasMonths = monthKeys.length > 0;

  useEffect(() => {
    // 🚫 enquanto não tiver meses, NÃO inicializa/normaliza order
    // isso evita "fase A" sobrescrever o estado salvo
    if (!hasMonths) return;

    const baseIds = ["select", "productCode", "barcode", "description"];
    const dynamicIds = AVAILABLE_COLUMNS.map((c) => c.id);
    const allIds = Array.from(new Set([...baseIds, ...dynamicIds]));

    setColumnOrder((prev: string[]) => {
      const prevArr = Array.isArray(prev) ? prev : [];

      // se tiver salvo, apenas saneia
      if (prevArr.length > 0) {
        const kept = prevArr.filter((id) => allIds.includes(id));
        const missing = allIds.filter((id) => !kept.includes(id));
        return [
          "select",
          ...kept.filter((i) => i !== "select"),
          ...missing.filter((i) => i !== "select"),
        ];
      }

      // se não tiver salvo, usa default (com meses)
      return ["select", ...allIds.filter((id) => id !== "select")];
    });
  }, [hasMonths, AVAILABLE_COLUMNS, setColumnOrder]);



  const {
    columnVisibility,
    setColumnVisibility,
    toggleColumnVisibility,
    resetColumnVisibility,
  } = useColumnVisibility("plenitude:analysys:columnsVisibility");

  useEffect(() => {
    const ids = Array.from(
      new Set([
        "select",
        "productCode",
        "barcode",
        "description",
        ...AVAILABLE_COLUMNS.map((c) => c.id),
      ])
    );

    setColumnVisibility((old) => {
      const prev = old ?? {};
      const next: Record<string, boolean> = {};

      // mantém ids atuais
      for (const id of ids) next[id] = prev[id];

      // ✅ mantém meses antigos mesmo quando ainda não existem na tela
      for (const key of Object.keys(prev)) {
        if (key.startsWith("ms_")) next[key] = prev[key];
      }

      // travas
      next.select = true;
      next.description = true;

      return next;
    });
  }, [AVAILABLE_COLUMNS, setColumnVisibility]);



  const { dragState, dragHandlers } = useDragAndDrop();
  const isColumnVisible = (columnId: string) => {
    return columnVisibility[columnId] !== true;
  };
  const visibleColumnsCount = AVAILABLE_COLUMNS.filter((col) =>
    isColumnVisible(col.id)
  ).length;

  // depois de obter filteredData, searchTerm, selectedFamilia, etc.
  const dataForTable = useMemo(() => {
    if (!deferFilterApply) {
      // fluxo normal: usa o que o hook já filtrou (família + busca)
      return filteredData;
    }

    // no modo "aplicar depois": ignora a família e filtra apenas por searchTerm
    const term = (searchTerm || "").trim().toLowerCase();
    if (!term) return products ?? [];

    const contains = (v?: unknown) =>
      (v ?? "").toString().toLowerCase().includes(term);

    return (products ?? []).filter((p) =>
      contains(p.productCode) ||
      contains(p.barcode) ||
      contains(p.description)
    );
  }, [deferFilterApply, filteredData, products, searchTerm]);

  const {
    table,
    selectedCount,
    toggleAllRowsSelection,
    isAllSelected,
    isSomeSelected,
    rowSelection,
    orderQuantities: tableOrderQuantities,
    orderQtyTouched, // ✅ novo
  } = useTableColumns({
    filteredData: dataForTable,
    columnOrder,
    setColumnOrder,
    columnVisibility,
    onColumnVisibilityChange: setColumnVisibility,
    onOrderQuantitiesChange: setOrderQuantities,
  });



  // ✅ EFFECT para atualizar os produtos selecionados quando o rowSelection mudar
  useEffect(() => {
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedProductsData = selectedRows.map((row) => row.original);
    setSelectedProducts(selectedProductsData);

    // Log para debug (opcional)
  }, [rowSelection, table]);

  useEffect(() => {
    if (deferFilterApply) return; // ✅ não faz nada até clicar no Filtrar
    setIsLoading(true);
    const newSearchParams = new URLSearchParams(searchParams.toString());

    if (selectedFamilia) {
      newSearchParams.set("familia", selectedFamilia);
    } else {
      newSearchParams.delete("familia");
    }
    router.push(`?${newSearchParams.toString()}`, { scroll: false });
  }, [selectedFamilia, deferFilterApply]);

  useEffect(() => {
    setIsLoading(false);
  }, [products]);

  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  // const navigateToPage = (page: number) => {
  //   setIsLoading(true);
  //   const newSearchParams = new URLSearchParams(searchParams.toString());
  //   newSearchParams.set("page", page.toString());
  //   router.push(`?${newSearchParams.toString()}`, { scroll: false });
  // };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    // ✅ Agora você tem acesso aos produtos selecionados no modal
  };
  const handleExport = () => {
    // garante que o último input confirme o valor (onBlur)
    (document.activeElement as HTMLElement | null)?.blur();

    const rows = table.getRowModel().rows;

    const visibleCols = table
      .getAllLeafColumns()
      .filter((c) => c.getIsVisible())
      .map((c) => {
        const header =
          typeof c.columnDef.header === "string"
            ? c.columnDef.header
            : c.id;

        return { id: c.id, header };
      });

    const dataToExport = rows.map((row) => {
      const obj: Record<string, unknown> = {};

      visibleCols.forEach((col) => {
        let value: unknown = row.getValue(col.id);

        // ✅ caso especial: Qtd. a Comprar (input)
        const isOrderQty =
          col.id === "orderQuantity" || col.header === "Qtd. a Comprar";

        if (isOrderQty) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const key = String((row.original as any).productCode ?? "").trim();

          const touched = !!orderQtyTouched?.[key];

          if (!touched) {
            // ✅ regra do cliente: se não passou no input, não exporta o espelho -> manda 0
            value = 0;
          } else {
            // ✅ passou no input: exporta o valor aceito/digitado (se inválido -> 0)
            const raw = orderQuantities?.[key] ?? 0;
            const n = Number(raw);
            value = Number.isFinite(n) ? n : 0;
          }
        }

        obj[col.header] = value ?? "";
      });

      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tabela");
    XLSX.writeFile(wb, "analise.xlsx");
  };



  // adicione logo antes do return:
  // usa o loading do pai se vier, senão o local
  const showOverlay = (typeof isFetching === "boolean") ? isFetching : isLoading;

  // dataset final a ser exibido (se aplicou o patch do "ignorar família" no modo defer, use o mesmo dataForTable aqui)
  // Se você já tem `dataForTable` (que ignora família quando deferFilterApply=true), use-o. 
  // Se não, use o que o hook já deu:
  const allRows = table.getRowModel().rows; // ou use a saída correspondente ao seu dataForTable

  const totalItems = allRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pagedRows = allRows.slice(start, end);
  const currentItemsCount = pagedRows.length;     // ✅ o que falta pro Pagination
  const firstItemIndex = totalItems === 0 ? 0 : start + 1;
  const lastItemIndex = totalItems === 0 ? 0 : Math.min(end, totalItems);

  const hasAnyRow = pagedRows.length > 0;
  const emptyText = deferFilterApply
    ? "Selecione uma família e clique em aplicar filtro"
    : "Nenhum produto encontrado";

  // antes do return:
  const handlePageChangeWrap = (p: number) => {
    onPageChange(p); // é obrigatório, então chama direto
  };

  const handlePageSizeChangeWrap = (size: number) => {
    onPageSizeChange?.(size); // só chama se veio do pai
  };
  return (
    <div className="w-full h-full flex flex-col">
      <TableHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedFamilia={selectedFamilia}
        setSelectedFamilia={setSelectedFamilia}
        filters={filters}
        selectedCount={selectedCount}
        clearPersistedColumnOrder={clearPersistedColumnOrder}
        onOpenModal={handleOpenModal}
        columnVisibility={columnVisibility}
        onToggleColumnVisibility={toggleColumnVisibility}
        onResetColumnVisibility={resetColumnVisibility}
        availableColumns={AVAILABLE_COLUMNS}
        onExport={handleExport}
        showApplyButton={deferFilterApply}
        onApplyClick={(fam) => onApplyFilters?.(fam)}
      // applyDisabled={showOverlay} // opcional
      />

      <div
        ref={tableContainerRef}
        className="flex-1 overflow-auto border border-gray-200 rounded-lg shadow-sm bg-white relative"
      >
        {showOverlay && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-50 backdrop-blur-sm rounded-lg">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <div
                  className="absolute inset-0 rounded-full h-12 w-12 border-t-2 border-indigo-300 animate-spin"
                  style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Carregando produtos...</p>
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-1">
                <div className="bg-indigo-600 h-1 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        )}

        <div className="min-w-full">
          {!showOverlay && !hasAnyRow ? (
            <div className="flex justify-center items-center min-h-[200px] text-gray-500">
              {emptyText}
            </div>
          ) : (
            <table className="w-full divide-y divide-gray-200">
              <TableBody
                table={table}
                rows={pagedRows}  // ✅ só as linhas da página atual
                dragState={dragState}
                dragHandlers={dragHandlers}
                columnOrder={columnOrder}
                setColumnOrder={setColumnOrder}
                setSelectProducts={setSelectProducts}
              />
            </table>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">

        {/* Info de rodapé com números da página atual */}
        <TableFooterInfo
          displayedItemsCount={pagedRows.length}      // ✅ itens exibidos nesta página
          selectedItemsCount={selectedCount}
          hasCustomColumnOrder={columnOrder.length > 0}
          isDragging={dragState.isDragging}
        />

        {/* Paginação (ajuste as props conforme seu componente Pagination) */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChangeWrap}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChangeWrap}
          totalItems={totalItems}
          currentItemsCount={currentItemsCount}
        />

        <ColumnsDropdown
          availableColumns={AVAILABLE_COLUMNS}
          columnVisibility={columnVisibility}
          setColumnVisibility={setColumnVisibility}
          resetColumnVisibility={resetColumnVisibility}
        />
      </div>

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        filters={filters}
        selectedProducts={selectedProducts}
        orderQuantities={orderQuantities}
      />
    </div>
  );


}
