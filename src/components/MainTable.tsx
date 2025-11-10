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
import OrderModal from "./OrderModal";

interface MainTableProps {
  filters: FiltersData;
  products: Product[];
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  currentPage: number;
}

export default function MainTable({
  filters,
  products,
  pagination = {
    currentPage: 1,
    pageSize: 50,
    totalItems: 0,
    totalPages: 0,
  },
  currentPage: initialCurrentPage,
}: MainTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Use os parâmetros da URL
  const currentPageFromUrl =
    Number(searchParams.get("page")) || initialCurrentPage;
  const pageSizeFromUrl =
    Number(searchParams.get("pageSize")) || pagination.pageSize;
  const familiaFromUrl = searchParams.get("familia") || "";

  const {
    filteredData,
    searchTerm,
    setSearchTerm,
    selectedFamilia,
    setSelectedFamilia,
  } = useTableFilters(products || [], familiaFromUrl); // ✅ Garante array vazio se products for undefined

  const { columnOrder, setColumnOrder, clearPersistedColumnOrder } =
    useLocalStorage();
  const { dragState, dragHandlers } = useDragAndDrop();

  const {
    table,
    selectedCount,
    toggleAllRowsSelection,
    isAllSelected,
    isSomeSelected,
  } = useTableColumns({
    filteredData,
    columnOrder,
    setColumnOrder,
  });

  // ✅ Atualizar URL quando família mudar
  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    if (selectedFamilia) {
      newSearchParams.set("familia", selectedFamilia);
    } else {
      newSearchParams.delete("familia");
    }

    // Reset para página 1 quando mudar a família
    newSearchParams.set("page", "1");

    router.push(`?${newSearchParams.toString()}`, { scroll: false });
  }, [selectedFamilia, router, searchParams]);

  // ✅ Resetar isLoading quando os produtos mudarem
  useEffect(() => {
    setIsLoading(false);
  }, [products]);

  // ✅ Fallback: resetar loading após 5 segundos
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  // Navegação
  const navigateToPage = (page: number) => {
    setIsLoading(true);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("page", page.toString());
    router.push(`?${newSearchParams.toString()}`, { scroll: false });
  };

  const changePageSize = (newPageSize: number) => {
    setIsLoading(true);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("pageSize", newPageSize.toString());
    newSearchParams.set("page", "1");
    router.push(`?${newSearchParams.toString()}`, { scroll: false });
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
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
      />

      <div
        ref={tableContainerRef}
        className="flex-1 overflow-auto border border-gray-200 rounded-lg shadow-sm bg-white relative"
      >
        {/* 🔄 Spinner Loading */}
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
                <p className="text-xs text-gray-500 mt-1">
                  Página {currentPageFromUrl} de {pagination.totalPages}
                </p>
              </div>

              <div className="w-32 bg-gray-200 rounded-full h-1">
                <div className="bg-indigo-600 h-1 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        <div className="min-w-full">
          <table className="w-full divide-y divide-gray-200">
            <TableBody
              table={table}
              dragState={dragState}
              dragHandlers={dragHandlers}
              columnOrder={columnOrder}
              setColumnOrder={setColumnOrder}
            />
          </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPageFromUrl}
        pageSize={pageSizeFromUrl}
        totalItems={pagination?.totalItems || 0}
        totalPages={pagination?.totalPages || 0}
        currentItemsCount={filteredData?.length || 0}
        isLoading={isLoading}
        onPageChange={navigateToPage}
        onPageSizeChange={changePageSize}
      />

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
        onSubmit={() => {}}
      />
    </div>
  );
}
