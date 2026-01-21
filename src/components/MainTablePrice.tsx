/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import * as XLSX from "xlsx";
import { FiltersData, TablePriceProduct } from "@/app/types/filterTypes";
import { useState, useRef, useEffect, useMemo, useTransition, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import TableFooterInfo from "./TableFooterInfo";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { useDragAndDrop } from "@/app/hooks/useDragAndDrop";
import { useColumnVisibility } from "@/app/hooks/useColumnVisibility";
import TablePriceHeader from "./TablePriceHeader";
import { useTablePriceColumns } from "@/app/hooks/useTablePriceColumns";
import TablePriceBody from "./TablePriceBody";
import { useTablePriceFilters } from "@/app/hooks/useTablePriceFilters";
import ChangePriceModal from "./ChangePriceModal";
import ColumnsDropdown from "./ColumnsDropdown";
import Pagination from "@/components/Pagination";
import { toast } from "react-toastify";

interface MainTablePriceProps {
  bearerToken: string | null;                // << NOVO: pra autorizar o fetch
  filters: Pick<FiltersData, "family">;
  tablePriceFilters: { code: string }[];
  tablePriceProducts: TablePriceProduct[];   // carga inicial (server)
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
  bearerToken,
  filters,
  tablePriceFilters,
  tablePriceProducts,
}: MainTablePriceProps) {
  const router = useRouter();
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);


  function mergeImportedIntoTable(rowsFromBackend: TablePriceProduct[]) {
    if (!rowsFromBackend?.length) return;

    setData(prev => {
      const indexByCode = new Map(prev.map((r, i) => [String(r.productCode).trim(), i]));
      const next = [...prev];

      for (const row of rowsFromBackend) {
        const code = String(row.productCode).trim();
        const idx = indexByCode.get(code);

        if (idx != null) {
          // ✅ atualiza a linha existente com todos os campos retornados
          next[idx] = { ...next[idx], ...row };
        } else {
          // ✅ não existia na grade atual? adiciona
          next.push(row);
        }
      }

      return next;
    });
  }





  // ✅ dados da tabela em ESTADO LOCAL (começa com o que veio do server)
  const [data, setData] = useState<TablePriceProduct[]>(tablePriceProducts);

  // se o server mandar nova carga (navegação real), atualiza o estado
  useEffect(() => {
    setData(tablePriceProducts);
  }, [tablePriceProducts]);

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>(
    {}
  );
  const [selectedProducts, setSelectedProducts] = useState<TablePriceProduct[]>(
    []
  );

  // valores iniciais vindos da URL
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

  // 🔢 Paginação no front
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const pageFromUrl = Number(searchParams.get("page") || "1");
    return pageFromUrl > 0 ? pageFromUrl : 1;
  });
  const [pageSize, setPageSize] = useState<number>(() => {
    const sizeFromUrl = Number(searchParams.get("pageSize") || "50");
    return sizeFromUrl > 0 ? sizeFromUrl : 50;
  });

  const [bodyMetrics, setBodyMetrics] = useState({
    totalItems: 0,
    totalPages: 1,
    currentItemsCount: 0,
    firstItemIndex: 0,
    lastItemIndex: 0,
    safePage: currentPage,
    safePageSize: pageSize,
  });
  // 🔎 Filtro no FRONT em cima de `data` (não do prop diretamente)
  const [selectedFamilia, setSelectedFamilia] = useState<string>(familiaFromUrl || "");
  const {
    filteredData,
    searchTerm,
    setSearchTerm,


  } = useTablePriceFilters(data, selectedFamilia);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Garante que a página atual nunca passe do total
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const fromItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const toItem = totalItems === 0 ? 0 : Math.min(currentPage * pageSize, totalItems);

  const { columnOrder, setColumnOrder, clearPersistedColumnOrder } = useLocalStorage();
  const {
    columnVisibility,
    setColumnVisibility,
    toggleColumnVisibility,
    resetColumnVisibility,
  } = useColumnVisibility();

  const isColumnVisible = (columnId: string) => {
    return columnVisibility[columnId] !== true;
  };
  const visibleColumnsCount = AVAILABLE_COLUMNS.filter((col) =>
    isColumnVisible(col.id)
  ).length;

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

  // ✅ Quando filtros mudam, volta para página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFamilia, selectedTablePrice, marginPercent, markupPercent, searchTerm]);

  // -------- APLICAÇÃO DE FILTROS (CLIENT-SIDE FETCH) --------
  function buildApiUrl() {
    const qs = new URLSearchParams();
    if (selectedFamilia) qs.set("family", selectedFamilia);
    if (selectedTablePrice) qs.set("tablePrice", selectedTablePrice);
    if (marginPercent) qs.set("margin", marginPercent);
    if (markupPercent) qs.set("markup", markupPercent);
    qs.set("limit", "1000");
    return `${process.env.NEXT_PUBLIC_API_URL}products/all?${qs.toString()}`;
  }

  function buildPageQuery() {
    const qs = new URLSearchParams();
    if (selectedFamilia) qs.set("familia", selectedFamilia);
    if (selectedTablePrice) qs.set("tablePrice", selectedTablePrice);
    if (marginPercent) qs.set("margin", marginPercent);
    if (markupPercent) qs.set("markup", markupPercent);
    qs.set("page", String(currentPage));
    qs.set("pageSize", String(pageSize));
    return qs;
  }

  // async function handleApplyFilters() {
  //   setIsLoading(true);
  //   try {
  //     const res = await fetch(buildApiUrl(), {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${bearerToken ?? ""}`,
  //       },
  //       cache: "no-store",
  //     });
  //     if (!res.ok) throw new Error("Falha ao buscar produtos");
  //     const json: { data?: TablePriceProduct[] } = await res.json();
  //     setData(json?.data ?? []);

  //     // sincroniza a URL sem navegação pesada
  //     startTransition(() => {
  //       router.replace(`${pathname}?${buildPageQuery().toString()}`, {
  //         scroll: false,
  //       });
  //     });
  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }
  // ----------------------------------------------------------
  async function handleApplyFilters() {
    setIsLoading(true);
    try {
      const qs = new URLSearchParams();
      if (selectedFamilia) qs.set("family", selectedFamilia);
      if (selectedTablePrice) qs.set("tablePrice", selectedTablePrice);
      if (marginPercent) qs.set("margin", marginPercent);
      if (markupPercent) qs.set("markup", markupPercent);
      qs.set("limit", "1000");

      const url = `${process.env.NEXT_PUBLIC_API_URL}products/all?${qs.toString()}`;
      console.log("➡️ Fetching:", url); // 👈 debug

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bearerToken ?? ""}`,
        },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Falha ao buscar produtos");
      const json: { data?: TablePriceProduct[] } = await res.json();
      setData(json?.data ?? []);

      startTransition(() => {
        const qp = new URLSearchParams();
        if (selectedFamilia) qp.set("familia", selectedFamilia);
        if (selectedTablePrice) qp.set("tablePrice", selectedTablePrice);
        if (marginPercent) qp.set("margin", marginPercent);
        if (markupPercent) qp.set("markup", markupPercent);
        qp.set("page", String(currentPage));
        qp.set("pageSize", String(pageSize));
        router.replace(`${pathname}?${qp.toString()}`, { scroll: false });
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleOpenModal = () => setIsModalOpen(true);

  const handleChangePage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setCurrentPage(nextPage);
  };

  const handleChangePageSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };



  const handleExport = async () => {
    try {
      const tablePrice = selectedTablePrice; // ex: "TII"
      const family = selectedFamilia;         // ex: "904" opcional
      setIsExporting(true);

      if (!tablePrice) {
        toast.error("Selecione a Tabela de Preço antes de exportar.");
        return;
      }

      const params = new URLSearchParams();
      params.set("tablePrice", tablePrice);
      if (family) params.set("family", family);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}products/export-price?${params.toString()}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${bearerToken}` },
        }
      );
      if (!res.ok) {
        let errMsg = `Erro ao exportar (HTTP ${res.status}).`;
        try {
          const err = await res.json();
          errMsg = err?.message || err?.error || errMsg;
        } catch { }
        toast.error(errMsg);
        return;
      }

      // 🔥 pega CSV como TEXTO
      let csvText = await res.text();

      // remove BOM
      csvText = csvText.replace(/^\uFEFF/, "").trim();

      if (!csvText || csvText.length < 5) {
        toast.error("CSV vazio retornado pelo servidor.");
        return;
      }

      // tenta detectar separador
      const commaCount = (csvText.match(/,/g) || []).length;
      const semiCount = (csvText.match(/;/g) || []).length;
      const FS = semiCount > commaCount ? ";" : ",";

      // ⚠️ parse CSV -> workbook
      const wb = XLSX.read(csvText, {
        type: "string",
        FS,          // separador
        raw: true,
      });

      // força nome da planilha
      const firstSheetName = wb.SheetNames[0];
      const ws = wb.Sheets[firstSheetName];

      if (!ws) {
        toast.error("Falha ao converter CSV em planilha.");
        return;
      }

      const outWb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(outWb, ws, "Tabela");

      const filename =
        `export-precos-${tablePrice}` +
        (family ? `-fam-${family}` : "") +
        `.xlsx`;

      XLSX.writeFile(outWb, filename);
      toast.success("XLSX exportado com sucesso.");
    } catch (e: unknown) {
      console.error(e);
      toast.error("Falha ao exportar XLSX.");
    }
    finally {
      setIsExporting(false);
    }
  };



  //eslint-disable-next-line
  const handleMetricsChange = useCallback((m: any) => {
    setBodyMetrics(m);
  }, []);
  return (
    <div className="w-full h-full flex flex-col">
      <TablePriceHeader
        isExporting={isExporting}
        onImportMerge={mergeImportedIntoTable}
        onExport={handleExport}
        onApplyFilters={handleApplyFilters}                 // << usa o handler novo
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
        {(isLoading || isPending) && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-50 backdrop-blur-sm rounded-lg">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <div
                  className="absolute inset-0 rounded-full h-12 w-12 border-t-2 border-indigo-300 animate-spin"
                  style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
                />
              </div>
              <p className="text-sm font-medium text-gray-700">Carregando produtos...</p>
              <div className="w-32 bg-gray-200 rounded-full h-1">
                <div className="bg-indigo-600 h-1 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        )}

        <div className="min-w-full">
          {filteredData.length === 0 ? (
            <div className="flex justify-center items-center min-h-[200px] text-gray-500">
              Nenhum produto encontrado.
            </div>
          ) : (
            <table className="w-full divide-y divide-gray-200">
              <TablePriceBody
                table={table}
                dragState={dragState}
                dragHandlers={dragHandlers}
                columnOrder={columnOrder}
                setColumnOrder={setColumnOrder}
                currentPage={currentPage}
                pageSize={pageSize}
                onMetricsChange={handleMetricsChange}   // << NOVO
              />
            </table>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <TableFooterInfo
          displayedItemsCount={filteredData?.length || 0}
          selectedItemsCount={selectedCount}
          hasCustomColumnOrder={columnOrder.length > 0}
          isDragging={dragState.isDragging}
        />
        <Pagination
          currentPage={bodyMetrics.safePage}
          totalPages={bodyMetrics.totalPages}
          onPageChange={(p) => setCurrentPage(p)}
          pageSize={bodyMetrics.safePageSize}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setCurrentPage(1);
          }}
          totalItems={bodyMetrics.totalItems}
          currentItemsCount={bodyMetrics.currentItemsCount}
        // se seu Pagination aceitar range, pode passar também:
        // firstItemIndex={bodyMetrics.firstItemIndex}
        // lastItemIndex={bodyMetrics.lastItemIndex}
        />
        <ColumnsDropdown
          availableColumns={AVAILABLE_COLUMNS}
          columnVisibility={columnVisibility}
          setColumnVisibility={setColumnVisibility}
          resetColumnVisibility={resetColumnVisibility}
        />
      </div>



      <ChangePriceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tablePrice={selectedTablePrice}
        selectedProducts={selectedProducts}
      />
    </div>
  );
}
