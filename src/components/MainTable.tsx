"use client";

import createBuyingOrder from "@/app/(dashboard)/analisereposicao/action";
import { FiltersData, Product } from "@/app/types/filterTypes";
import { Dialog } from "@headlessui/react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  ColumnOrderState,
  RowSelectionState,
} from "@tanstack/react-table";
import { useState, useMemo, useEffect, useRef } from "react";

interface MainTableProps {
  filters: FiltersData;
  products: Product[];
}

export interface OrderData {
  paymentCondition: string;
  company: number;
  branch: number;
  supplyerCode: number;
  products: {
    productCode: string;
    orderQuantity: number;
    unityPrice: number;
  }[];
}

// 🔹 Chave para armazenar no localStorage
const COLUMN_ORDER_STORAGE_KEY = "main-table-column-order";

export default function MainTable({ filters, products }: MainTableProps) {
  const [filteredData, setFilteredData] = useState<Product[]>(products);
  const [searchTerm, setSearchTerm] = useState("");

  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFornecedor, setModalFornecedor] = useState("");
  const [modalCondicao, setModalCondicao] = useState("");
  const [modalForma, setModalForma] = useState("");

  // 🔹 Estados para melhorar o visual do drag and drop
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);

  const [selectedFamilia, setSelectedFamilia] = useState<string>("");

  // ✅ Ref para controle do scroll
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // ✅ Função para scroll ao topo
  const scrollToTop = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = 0;
    }
  };

  // ✅ Scroll automático para o topo quando os dados mudam
  useEffect(() => {
    scrollToTop();
  }, [filteredData, searchTerm, selectedFamilia, columnOrder]);

  // ✅ Persistir ordem das colunas no localStorage
  const persistColumnOrder = (newOrder: ColumnOrderState) => {
    try {
      localStorage.setItem(COLUMN_ORDER_STORAGE_KEY, JSON.stringify(newOrder));
    } catch (error) {
      console.error("Erro ao salvar ordem das colunas no localStorage:", error);
    }
  };

  // ✅ Recuperar ordem das colunas do localStorage
  const getPersistedColumnOrder = (): ColumnOrderState | null => {
    try {
      const saved = localStorage.getItem(COLUMN_ORDER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error(
        "Erro ao recuperar ordem das colunas do localStorage:",
        error
      );
      return null;
    }
  };

  // ✅ Limpar ordem salva das colunas
  const clearPersistedColumnOrder = () => {
    try {
      localStorage.removeItem(COLUMN_ORDER_STORAGE_KEY);
      setColumnOrder([]);
      alert("Ordem das colunas resetada para o padrão!");
    } catch (error) {
      console.error("Erro ao limpar ordem das colunas:", error);
    }
  };

  // ✅ Carregar ordem salva ao inicializar o componente
  useEffect(() => {
    const savedOrder = getPersistedColumnOrder();
    if (savedOrder && savedOrder.length > 0) {
      setColumnOrder(savedOrder);
    }
  }, []);

  // ✅ Atualizar localStorage quando a ordem das colunas mudar
  useEffect(() => {
    if (columnOrder.length > 0) {
      persistColumnOrder(columnOrder);
    }
  }, [columnOrder]);

  // ✅ Funções de drag and drop melhoradas
  const handleDragStart = (event: React.DragEvent, columnId: string) => {
    setIsDragging(true);
    setDraggedColumn(columnId);
    event.dataTransfer.setData("text/plain", columnId);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = (event: React.DragEvent) => {
    setIsDragging(false);
    setDragOverColumn(null);
    setDraggedColumn(null);
  };

  const handleDragOver = (event: React.DragEvent, targetColumnId: string) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (targetColumnId !== draggedColumn) {
      setDragOverColumn(targetColumnId);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (event: React.DragEvent, targetColumnId: string) => {
    event.preventDefault();
    const sourceColumnId = event.dataTransfer.getData("text/plain");

    setIsDragging(false);
    setDragOverColumn(null);
    setDraggedColumn(null);

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

  // ✅ Checkbox para selecionar/desselecionar todas as linhas
  const toggleAllRowsSelection = () => {
    if (Object.keys(rowSelection).length === filteredData.length) {
      setRowSelection({});
    } else {
      const allRowIds: RowSelectionState = {};
      filteredData.forEach((_, index) => {
        allRowIds[index] = true;
      });
      setRowSelection(allRowIds);
    }
  };

  // ✅ Verifica se todas as linhas estão selecionadas
  const isAllSelected =
    filteredData.length > 0 &&
    Object.keys(rowSelection).length === filteredData.length;

  // ✅ Verifica se algumas linhas estão selecionadas (para estado indeterminado)
  const isSomeSelected = Object.keys(rowSelection).length > 0 && !isAllSelected;

  // ✅ Função para obter as vendas do mês específico
  const getMonthlySales = (product: Product, month: string) => {
    const monthlySale = product.monthlySales?.find(
      (sale) => sale.month === month
    );
    return monthlySale?.total || 0;
  };

  // ✅ Colunas originais mantidas + colunas dos meses
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
        size: 50,
      },
      {
        accessorKey: "productCode",
        header: "Código",
        size: 120,
      },
      {
        accessorKey: "barcode",
        header: "Código de Barras",
        cell: ({ row }) => row.original.barcode || "-",
        size: 150,
      },
      {
        accessorKey: "description",
        header: "Descrição",
        size: 300,
      },
      {
        accessorKey: "familyName",
        header: "Família",
        cell: ({ row }) => row.original.familyName || "-",
        size: 120,
      },
      {
        accessorKey: "lastPurchaseCost",
        header: "Último Custo (R$)",
        cell: ({ row }) =>
          row.original.lastPurchaseCost != null
            ? `R$ ${row.original.lastPurchaseCost.toFixed(2)}`
            : "-",
        size: 140,
      },
      {
        accessorKey: "availableStock",
        header: "Estoque Disponível",
        cell: ({ row }) =>
          row.original.availableStock != null
            ? row.original.availableStock
            : "-",
        size: 140,
      },
      {
        accessorKey: "physicalStock",
        header: "Estoque Físico",
        size: 130,
      },
      {
        accessorKey: "minStock",
        header: "Estoque Mínimo",
        cell: ({ row }) =>
          row.original.minStock != null ? row.original.minStock : "-",
        size: 130,
      },
      {
        accessorKey: "lastPurchaseDate",
        header: "Última Compra",
        size: 130,
      },
      {
        accessorKey: "stockTurnover",
        header: "Turnover",
        cell: ({ row }) =>
          row.original.stockTurnover != null ? row.original.stockTurnover : "-",
        size: 120,
      },
      {
        accessorKey: "weightedAveragePrice",
        header: "Preço Médio (R$)",
        cell: ({ row }) =>
          row.original.weightedAveragePrice != null
            ? `R$ ${row.original.weightedAveragePrice.toFixed(2)}`
            : "-",
        size: 150,
      },
      {
        accessorKey: "purchaseSuggestion",
        header: "Sugestão Compra (R$)",
        cell: ({ row }) =>
          row.original.purchaseSuggestion != null
            ? `R$ ${row.original.purchaseSuggestion}`
            : "-",
        size: 160,
      },
      {
        accessorKey: "quantityToBuy",
        header: "Sugestão Compra (Qtd)",
        cell: ({ row }) =>
          row.original.quantityToBuy != null
            ? row.original.quantityToBuy.toFixed(2)
            : "-",
        size: 160,
      },
      {
        accessorKey: "totalSales",
        header: "Vendas Total",
        cell: ({ row }) =>
          row.original.totalSales != null
            ? row.original.totalSales.toFixed(2)
            : "-",
        size: 120,
      },
      {
        accessorKey: "average6Months",
        header: "Média 6 meses (R$)",
        cell: ({ row }) =>
          row.original.average6Months != null
            ? `R$ ${row.original.average6Months.toFixed(2)}`
            : "-",
        size: 150,
      },
      // 🔹 Colunas dos meses (baseado no primeiro produto como exemplo)
      {
        accessorKey: "monthlySales_SEP_2025",
        header: "SET/2025",
        cell: ({ row }) => getMonthlySales(row.original, "SEP/2025"),
        size: 100,
      },
      {
        accessorKey: "monthlySales_OCT_2025",
        header: "OUT/2025",
        cell: ({ row }) => getMonthlySales(row.original, "OCT/2025"),
        size: 100,
      },
      {
        accessorKey: "monthlySales_NOV_2025",
        header: "NOV/2025",
        cell: ({ row }) => getMonthlySales(row.original, "NOV/2025"),
        size: 100,
      },
      {
        accessorKey: "monthlySales_AUG_2025",
        header: "AGO/2025",
        cell: ({ row }) => getMonthlySales(row.original, "AUG/2025"),
        size: 100,
      },
      {
        accessorKey: "monthlySales_JUN_2025",
        header: "JUN/2025",
        cell: ({ row }) => getMonthlySales(row.original, "JUN/2025"),
        size: 100,
      },
      {
        accessorKey: "monthlySales_JUL_2025",
        header: "JUL/2025",
        cell: ({ row }) => getMonthlySales(row.original, "JUL/2025"),
        size: 100,
      },
      {
        accessorKey: "basePrice",
        header: "Preço Base (R$)",
        cell: ({ row }) => {
          const handlePriceChange = (
            e: React.ChangeEvent<HTMLInputElement>
          ) => {
            const newPrice = parseFloat(e.target.value) || 0;
            setFilteredData((prev) =>
              prev.map((p) =>
                p.productCode === row.original.productCode
                  ? { ...p, basePrice: newPrice }
                  : p
              )
            );
          };
          return (
            <input
              type="number"
              min="0"
              step="0.01"
              value={row.original.basePrice ?? ""}
              onChange={handlePriceChange}
              className="w-24 text-right border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500"
            />
          );
        },
        size: 140,
      },
      {
        accessorKey: "orderQuantity",
        header: "Qtd. Pedido",
        cell: ({ row }) => (
          <input
            type="number"
            min="0"
            defaultValue={row.original.quantityToBuy || 0}
            onChange={(e) => {
              const newQuantity = parseFloat(e.target.value) || 0;
            }}
            className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500"
          />
        ),
        size: 120,
      },
    ],
    [isAllSelected, isSomeSelected, filteredData]
  );

  // 🧠 Filtragem combinada: texto + selects
  useEffect(() => {
    let filtered = [...products];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.description?.toLowerCase().includes(term) ||
          p.productCode?.toLowerCase().includes(term)
      );
    }

    if (selectedFamilia)
      filtered = filtered.filter((p) => p.familyCode === selectedFamilia);

    setFilteredData(filtered);
  }, [products, searchTerm, selectedFamilia]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      columnOrder,
      rowSelection,
    },
    onColumnOrderChange: setColumnOrder,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
  });

  // 🔹 Contador de produtos selecionados
  const selectedCount = Object.keys(rowSelection).length;

  async function enviarOrdemDeCompra() {
    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      alert("Selecione pelo menos um produto para gerar a ordem de compra.");
      return;
    }

    if (!modalFornecedor || !modalCondicao || !modalForma) {
      alert(
        "Selecione fornecedor, condição e forma de pagamento antes de confirmar."
      );
      return;
    }

    const orderData: OrderData = {
      paymentCondition: modalCondicao,
      company: 1,
      branch: 1,
      supplyerCode: parseInt(modalFornecedor),
      products: selectedRows.map((row) => ({
        productCode: row.original.productCode,
        orderQuantity: row.original.quantityToBuy || 0,
        unityPrice: row.original.basePrice || 0,
      })),
    };

    console.log("📦 Enviando ordem de compra:", orderData);

    try {
      const { responseJson } = await createBuyingOrder(orderData);
      console.log("✅ Resposta da API:", responseJson);
      alert("Ordem de compra criada com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao enviar ordem de compra:", error);
      alert("Erro ao enviar a ordem de compra. Verifique o console.");
    }

    setRowSelection({});
    setIsModalOpen(false);
  }

  return (
    <div className="p-6 max-w mx-auto">
      {/* 🔹 Header com título, busca e botão de envio */}
      <div className="flex  items-center mb-4">
        {/* <h2 className="text-lg font-semibold text-gray-800">
          {selectedCount > 0 && (
            <span className="ml-2 text-sm text-indigo-600">
              ({selectedCount} selecionados)
            </span>
          )}
        </h2> */}
        <div className="flex items-end gap-4">
          {/* 🔍 Campo de busca */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="por código ou descrição..."
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-72"
            />
          </div>

          {/* 🧩 Select Família */}
          <div className="flex flex-col">
            <label
              htmlFor="familia"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Família
            </label>
            <select
              id="familia"
              value={selectedFamilia}
              onChange={(e) => setSelectedFamilia(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-48"
            >
              <option value="">Todas</option>
              {filters.family.map((f) => (
                <option key={f.code} value={f.code}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* 🔄 Botão para resetar ordem das colunas */}
          <button
            onClick={clearPersistedColumnOrder}
            className="self-end px-3 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors cursor-pointer flex items-center gap-2"
            title="Resetar ordem das colunas para o padrão"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Resetar Colunas
          </button>

          {/* 🚀 Botão Enviar */}
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={selectedCount === 0}
            className={`self-end px-4 py-2 rounded-md text-sm font-medium h-10 cursor-pointer transition-colors flex items-center gap-2 ${
              selectedCount > 0
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            Gerar Ordem de Compra
          </button>
        </div>
      </div>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      >
        <Dialog.Panel className="bg-white rounded-lg shadow-lg w-[90%] max-w-md p-6 space-y-4">
          <Dialog.Title className="text-lg font-semibold text-gray-800">
            Confirmar Ordem de Compra
          </Dialog.Title>
          <p className="text-sm text-gray-600">
            Selecione as informações obrigatórias antes de gerar a ordem de
            compra.
          </p>

          {/* Fornecedor */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Fornecedor
            </label>
            <select
              value={modalFornecedor}
              onChange={(e) => setModalFornecedor(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Selecione</option>
              {filters.supplyer.map((f) => (
                <option key={f.code} value={f.code}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Condição de pagamento */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Condição de Pagamento
            </label>
            <select
              value={modalCondicao}
              onChange={(e) => setModalCondicao(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Selecione</option>
              {filters.paymentCondition.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Forma de pagamento */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Forma de Pagamento
            </label>
            <select
              value={modalForma}
              onChange={(e) => setModalForma(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Selecione</option>
              {filters.paymentMethod.map((f) => (
                <option key={f.code} value={f.code}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={enviarOrdemDeCompra}
              className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Confirmar
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>

      {/* 🔹 Tabela completa com scroll horizontal */}
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 select-none sticky">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isBeingDragged = draggedColumn === header.id;
                    const isDropTarget = dragOverColumn === header.id;

                    return (
                      <th
                        key={header.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, header.id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, header.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, header.id)}
                        className={`
                          px-4 py-3 text-left text-xs font-semibold text-gray-600 
                          uppercase tracking-wider transition-all duration-200 ease-in-out
                          relative group whitespace-nowrap
                          ${isDragging ? "cursor-grabbing" : "cursor-grab"}
                          ${
                            isBeingDragged
                              ? "opacity-50 bg-blue-50 scale-95 shadow-inner"
                              : ""
                          }
                          ${
                            isDropTarget && !isBeingDragged
                              ? "bg-blue-100 border-l-4 border-l-blue-500 border-r-4 border-r-blue-500 transform scale-105 shadow-md"
                              : "hover:bg-gray-100"
                          }
                        `}
                        style={{
                          width: header.getSize(),
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex-1 truncate">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>

                          {/* Ícone de arrastar */}
                          <div
                            className={`ml-2 transition-opacity duration-200 flex-shrink-0 ${
                              isDragging
                                ? "opacity-0"
                                : "opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            <svg
                              className="w-4 h-4 text-gray-400"
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
                          </div>
                        </div>

                        {/* Linha guia durante o drag */}
                        {isDropTarget && !isBeingDragged && (
                          <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded pointer-events-none animate-pulse" />
                        )}

                        {/* Efeito de brilho no hover */}
                        <div className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 bg-white/50 transition-opacity duration-200 pointer-events-none" />
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`hover:bg-gray-50 transition-colors duration-150 ${
                    row.getIsSelected()
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : ""
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap"
                      style={{
                        width: cell.column.getSize(),
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔹 Footer informativo */}
      <div className="flex justify-between items-center mt-3">
        <p className="text-xs text-gray-500">
          {filteredData.length} produtos exibidos • {selectedCount} selecionados
          {columnOrder.length > 0 && " • Ordem das colunas personalizada"}
        </p>

        {/* Dica de uso */}
        {!isDragging && (
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Arraste os cabeçalhos para reorganizar as colunas
          </p>
        )}
      </div>
    </div>
  );
}
