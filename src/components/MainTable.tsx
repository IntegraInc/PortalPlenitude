"use client";

import { FiltersData, Product } from "@/app/types/filterTypes";
import { useState, useRef, useEffect } from "react";
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

interface MainTableProps {
  filters: FiltersData;
  products: Product[];
}

const AVAILABLE_COLUMNS = [
  { id: "familyName", header: "Família" },
  { id: "familyCode", header: "Cód. Família" },
  { id: "lastPurchaseCost", header: "Último Custo" },
  { id: "availableStock", header: "Estoque Disponível" },
  { id: "physicalStock", header: "Estoque Físico" },
  { id: "stockTurnover", header: "Dias Estoque" },
  { id: "lastPurchaseDate", header: "Última Compra" },
  { id: "quantityToBuy", header: "Quantidade Sugerida" },
  { id: "totalSales", header: "Vendas Total" },
  { id: "average6Months", header: "Média venda mês" },
  { id: "monthlySales_NOV_2025", header: "NOV/2025" },
  { id: "monthlySales_OCT_2025", header: "OUT/2025" },
  { id: "monthlySales_SEP_2025", header: "SET/2025" },
  { id: "monthlySales_AUG_2025", header: "AGO/2025" },
  { id: "monthlySales_JUL_2025", header: "JUL/2025" },
  { id: "monthlySales_JUN_2025", header: "JUN/2025" },
  { id: "orderQuantity", header: "Qtd. a Comprar" },
];

export default function MainTable({ filters, products }: MainTableProps) {
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

  const { columnOrder, setColumnOrder, clearPersistedColumnOrder } =
    useLocalStorage();

  const {
    columnVisibility,
    setColumnVisibility,
    toggleColumnVisibility,
    resetColumnVisibility,
  } = useColumnVisibility();

  const { dragState, dragHandlers } = useDragAndDrop();

  const {
    table,
    selectedCount,
    toggleAllRowsSelection,
    isAllSelected,
    isSomeSelected,
    rowSelection,
    orderQuantities: tableOrderQuantities, // Recebe as quantidades do hook
  } = useTableColumns({
    filteredData,
    columnOrder,
    setColumnOrder,
    columnVisibility,
    onColumnVisibilityChange: setColumnVisibility,
    onOrderQuantitiesChange: setOrderQuantities, // ✅ Callback para atualizar as quantidades
  });

  // ✅ EFFECT para atualizar os produtos selecionados quando o rowSelection mudar
  useEffect(() => {
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedProductsData = selectedRows.map((row) => row.original);
    setSelectedProducts(selectedProductsData);

    // Log para debug (opcional)
  }, [rowSelection, table]);

  useEffect(() => {
    setIsLoading(true);
    const newSearchParams = new URLSearchParams(searchParams.toString());

    if (selectedFamilia) {
      newSearchParams.set("familia", selectedFamilia);
    } else {
      newSearchParams.delete("familia");
    }
    router.push(`?${newSearchParams.toString()}`, { scroll: false });
  }, [selectedFamilia]);

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

  console.log("products", products);

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
      />

      <div
        ref={tableContainerRef}
        className="flex-1 overflow-auto border border-gray-200 rounded-lg shadow-sm bg-white relative"
      >
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-50 backdrop-blur-sm rounded-lg">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <div
                  className="absolute inset-0 rounded-full h-12 w-12 border-t-2 border-indigo-300 animate-spin"
                  style={{
                    animationDirection: "reverse",
                    animationDuration: "1.5s",
                  }}
                ></div>
              </div>

              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  Carregando produtos...
                </p>
              </div>

              <div className="w-32 bg-gray-200 rounded-full h-1">
                <div className="bg-indigo-600 h-1 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
        <div className="min-w-full">
          {products.length === 0 ? (
            <div className="flex justify-center items-center min-h-[200px] text-gray-500">
              Nenhum produto encontrado
            </div>
          ) : (
            <table className="w-full divide-y divide-gray-200">
              <TableBody
                table={table}
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

      <TableFooterInfo
        displayedItemsCount={filteredData?.length || 0}
        selectedItemsCount={selectedCount}
        hasCustomColumnOrder={columnOrder.length > 0}
        isDragging={dragState.isDragging}
      />

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        filters={filters}
        selectedProducts={selectedProducts}
        orderQuantities={orderQuantities} // ✅ Passa as quantidades atualizadas
      />
    </div>
  );
}
