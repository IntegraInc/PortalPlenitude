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
import { useState, useMemo, useEffect } from "react";

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

export default function MainTable({ filters, products }: MainTableProps) {
  const [filteredData, setFilteredData] = useState<Product[]>(products);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedValue, setEditedValue] = useState<number>(0);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFornecedor, setModalFornecedor] = useState("");
  const [modalCondicao, setModalCondicao] = useState("");
  const [modalForma, setModalForma] = useState("");

  // 🔹 Filtros selecionados
  const [selectedFornecedor, setSelectedFornecedor] = useState<string>("");
  const [selectedCondicao, setSelectedCondicao] = useState<string>("");
  const [selectedForma, setSelectedForma] = useState<string>("");
  const [selectedFamilia, setSelectedFamilia] = useState<string>("");

  // ✅ Colunas originais mantidas
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
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
        ),
      },
      { accessorKey: "productCode", header: "Código" },
      { accessorKey: "description", header: "Descrição" },
      { accessorKey: "family", header: "Família" },
      {
        accessorKey: "lastPurchaseCost",
        header: "Último Custo de Compra (R$)",
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
        accessorKey: "physicalStock",
        header: "Estoque Físico",
      },
      {
        accessorKey: "minStock",
        header: "Estoque Mínimo",
        cell: ({ row }) =>
          row.original.minStock != null ? row.original.minStock : "-",
      },
      {
        accessorKey: "lastPurchaseDate",
        header: "Última Compra",
      },
      {
        accessorKey: "stockTurnover",
        header: "Turnover de Estoque",
        cell: ({ row }) =>
          row.original.stockTurnover != null ? row.original.stockTurnover : "-",
      },
      {
        accessorKey: "weightedAveragePrice",
        header: "Preço Médio por Peso",
        cell: ({ row }) =>
          row.original.weightedAveragePrice != null
            ? row.original.weightedAveragePrice
            : "-",
      },
      {
        accessorKey: "purchaseSuggestion",
        header: "Sugestão de Compra (R$)",
        cell: ({ row }) =>
          row.original.purchaseSuggestion != null
            ? row.original.purchaseSuggestion
            : "-",
      },
      {
        accessorKey: "quantityToBuy",
        header: "Sugestão de Compra (Qtd)",
        cell: ({ row }) =>
          row.original.quantityToBuy != null
            ? row.original.quantityToBuy.toFixed(2)
            : "-",
      },
      {
        accessorKey: "totalSales",
        header: "Vendas Total",
        cell: ({ row }) =>
          row.original.totalSales != null
            ? row.original.totalSales.toFixed(2)
            : "-",
      },
      {
        accessorKey: "average6Months",
        header: "Média 6 meses (R$)",
        cell: ({ row }) =>
          row.original.average6Months != null
            ? row.original.average6Months.toFixed(2)
            : "-",
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
      },
      // 🔹 Nova coluna para quantidade do pedido
      {
        accessorKey: "orderQuantity",
        header: "Quantidade do Pedido",
        cell: ({ row }) => (
          <input
            type="number"
            min="0"
            defaultValue={row.original.quantityToBuy || 0}
            onChange={(e) => {
              // Atualiza a quantidade no produto
              const newQuantity = parseFloat(e.target.value) || 0;
              // Você pode armazenar isso em um estado separado se necessário
            }}
            className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500"
          />
        ),
      },
    ],
    [editingId, editedValue]
  );

  // 🧠 Filtragem combinada: texto + selects
  useEffect(() => {
    let filtered = [...products];

    // 🔍 Busca por código ou descrição
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.description?.toLowerCase().includes(term) ||
          p.productCode?.toLowerCase().includes(term)
      );
    }
    //#TODO: Adicionar os demais filtros aqui
    // 🔹 Filtros complementares
    if (selectedFamilia)
      filtered = filtered.filter((p) => p.familyCode === selectedFamilia);

    setFilteredData(filtered);
  }, [
    products,
    searchTerm,
    selectedFornecedor,
    selectedCondicao,
    selectedForma,
    selectedFamilia,
  ]);

  // 🔹 Método para enviar os dados selecionados
  const enviarPedido = () => {
    const selectedRows = table.getSelectedRowModel().rows;

    if (selectedRows.length === 0) {
      alert("Selecione pelo menos um produto para enviar o pedido.");
      return;
    }

    // 🔹 Montar o objeto no formato exigido
    const orderData: OrderData = {
      paymentCondition: selectedCondicao || "001", // Usa o filtro ou valor padrão
      company: 1, // Fixo
      branch: 1, // Fixo
      supplyerCode: parseInt(selectedFornecedor) || 25, // Usa o filtro ou valor padrão
      products: selectedRows.map((row) => ({
        productCode: row.original.productCode,
        orderQuantity: row.original.quantityToBuy || 0, // Aqui você pode ajustar para pegar da coluna de quantidade
        unityPrice: row.original.basePrice || 0,
      })),
    };

    // 🔹 Aqui você chama o método para enviar os dados
    console.log("Dados da ordem de compra:", orderData);

    // Exemplo de como enviar para uma API:
    // enviarParaAPI(orderData);

    alert(`Pedido enviado com ${selectedRows.length} produtos selecionados!`);

    // 🔹 Limpar seleção após envio (opcional)
    setRowSelection({});
  };

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
      <div className=" justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Lista de Produtos
          {selectedCount > 0 && (
            <span className="ml-2 text-sm text-indigo-600">
              ({selectedCount} selecionados)
            </span>
          )}
        </h2>

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

          {/* 🚀 Botão Enviar */}
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={selectedCount === 0}
            className={`self-end px-4 py-2 rounded-md text-sm font-medium h-10 cursor-pointer ${
              selectedCount > 0
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
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
              className="px-4 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={enviarOrdemDeCompra}
              className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
            >
              Confirmar
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>

      {/* 🔹 Tabela completa */}
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
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-grab hover:bg-gray-100 transition-colors"
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
              <tr
                key={row.id}
                className={`hover:bg-gray-50 transition ${
                  row.getIsSelected()
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : ""
                }`}
              >
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
        {filteredData.length} produtos exibidos • {selectedCount} selecionados
      </p>
    </div>
  );
}
