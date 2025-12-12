/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  FiltersData,
  Product,
  TablePriceProduct,
} from "@/app/types/filterTypes";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TableFooterInfo from "./TableFooterInfo";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { useDragAndDrop } from "@/app/hooks/useDragAndDrop";
import { useTableFilters } from "@/app/hooks/useTableFilters";
import { useColumnVisibility } from "@/app/hooks/useColumnVisibility";
import OrderModal from "./OrderModal";
import TablePriceHeader from "./TablePriceHeader";
import { useTablePriceColumns } from "@/app/hooks/useTablePriceColumns";
import TablePriceBody from "./TablePriceBody";
import { useTablePriceFilters } from "@/app/hooks/useTablePriceFilters";
import ChangePriceModal from "./ChangePriceModal";

interface MainTablePriceProps {
  filters: FiltersData;
  tablePriceFilters: any;
  tablePriceProducts: TablePriceProduct[];
}

const AVAILABLE_COLUMNS = [
  { id: "productCode", header: "Cód. Produto" },
  { id: "barcode", header: "Código de Barras" },
  { id: "description", header: "Descrição" },
  { id: "familyName", header: "Família" },
  { id: "familyCode", header: "Cód. Família" },
  { id: "category", header: "Categoria" },
  { id: "lastPurchaseCost", header: "Último Custo" },
  { id: "capPrice", header: "Preço Capa" },
  { id: "capPercent", header: "% Capa" },
  { id: "salePrice", header: "Preço Venda" },
  { id: "markupPercent", header: "% Markup" },
  { id: "marginPercent", header: "% Margem" },
  { id: "suggestedPriceByMargin", header: "Preço Sug. (Margem)" },
  { id: "suggestedPriceByMarkup", header: "Preço Sug. (Markup)" },
  { id: "availableStock", header: "Estoque Disponível" },
  { id: "lastPurchaseDate", header: "Última Compra" },
];

export default function MainTablePrice({
  filters,
  tablePriceFilters,
  tablePriceProducts,
}: MainTablePriceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [orderQuantities, setOrderQuantities] = useState<
    Record<string, number>
  >({});

  const [selectedProducts, setSelectedProducts] = useState<TablePriceProduct[]>(
    []
  );

  const familiaFromUrl = searchParams.get("familia") || "";

  const [selectedTablePrice, setSelectedTablePrice] = useState<string>(
    () => searchParams.get("tablePrice") || ""
  );

  const [marginPercent, setMarginPercent] = useState<string>(
    () => searchParams.get("margin") || ""
  );

  const [markupPercent, setMarkupPercent] = useState<string>(
    () => searchParams.get("markup") || ""
  );

  // 🔎 Filtro usando os produtos de tabela de preço
  const {
    filteredData,
    searchTerm,
    setSearchTerm,
    selectedFamilia,
    setSelectedFamilia,
  } = useTablePriceFilters((tablePriceProducts as any) || [], familiaFromUrl);

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
    rowSelection,
    orderQuantities: tableOrderQuantities,
  } = useTablePriceColumns({
    filteredData,
    columnOrder,
    setColumnOrder,
    columnVisibility,
    onColumnVisibilityChange: setColumnVisibility,
    onOrderQuantitiesChange: setOrderQuantities,
  });

  // ✅ Atualiza produtos selecionados
  useEffect(() => {
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedProductsData = selectedRows.map(
      (row) => row.original as TablePriceProduct
    );
    setSelectedProducts(selectedProductsData);
  }, [rowSelection, table]);

  // ✅ Sincroniza filtros com a URL
  useEffect(() => {
    setIsLoading(true);
    const newSearchParams = new URLSearchParams(searchParams.toString());

    if (selectedFamilia) newSearchParams.set("familia", selectedFamilia);
    else newSearchParams.delete("familia");

    if (selectedTablePrice)
      newSearchParams.set("tablePrice", selectedTablePrice);
    else newSearchParams.delete("tablePrice");

    if (marginPercent !== "") newSearchParams.set("margin", marginPercent);
    else newSearchParams.delete("margin");

    if (markupPercent !== "") newSearchParams.set("markup", markupPercent);
    else newSearchParams.delete("markup");

    router.push(`?${newSearchParams.toString()}`, { scroll: false });
  }, [selectedFamilia, selectedTablePrice, marginPercent, markupPercent]);

  useEffect(() => {
    setIsLoading(false);
  }, [tablePriceProducts]);

  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <TablePriceHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedFamilia={selectedFamilia}
        setSelectedFamilia={setSelectedFamilia}
        filters={filters}
        tablePriceFilters={tablePriceFilters}
        selectedCount={selectedCount}
        clearPersistedColumnOrder={clearPersistedColumnOrder}
        onOpenModal={handleOpenModal}
        columnVisibility={columnVisibility}
        onToggleColumnVisibility={toggleColumnVisibility}
        onResetColumnVisibility={resetColumnVisibility}
        availableColumns={AVAILABLE_COLUMNS}
        selectedTablePrice={selectedTablePrice}
        setSelectedTablePrice={setSelectedTablePrice}
        marginPercent={marginPercent}
        setMarginPercent={setMarginPercent}
        markupPercent={markupPercent}
        setMarkupPercent={setMarkupPercent}
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
          {filteredData.length === 0 ? (
            <div className="flex justify-center items-center min-h-[200px] text-gray-500">
              Nenhum produto encontrado
            </div>
          ) : (
            <table className="w-full divide-y divide-gray-200">
              <TablePriceBody
                table={table}
                dragState={dragState}
                dragHandlers={dragHandlers}
                columnOrder={columnOrder}
                setColumnOrder={setColumnOrder}
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
      <ChangePriceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tablePrice={selectedTablePrice} // vem do header
        selectedProducts={selectedProducts} // já está no seu state
      />
    </div>
  );
}
