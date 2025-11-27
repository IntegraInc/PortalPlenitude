"use client";

import { Dialog } from "@headlessui/react";
import { FiltersData, Product } from "@/app/types/filterTypes";
import { useState, useRef, useEffect } from "react";
import createBuyingOrder from "@/app/(dashboard)/analisereposicao/action";
import { toast } from "react-toastify";

// Interface para o OrderData
interface OrderData {
  paymentCondition: string;
  company: number;
  branch: number;
  supplyerCode: number;
  products: Array<{
    productCode: string;
    orderQuantity: number;
    unityPrice: number;
  }>;
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FiltersData;
  selectedProducts: Product[];
  orderQuantities: Record<string, number>;
}

export default function OrderModal({
  isOpen,
  onClose,
  filters,
  selectedProducts,
  orderQuantities,
}: OrderModalProps) {
  const [modalData, setModalData] = useState({
    fornecedor: "",
    condicao: "",
    forma: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Estados para os dropdowns
  const [isFornecedorDropdownOpen, setIsFornecedorDropdownOpen] =
    useState(false);
  const [isCondicaoDropdownOpen, setIsCondicaoDropdownOpen] = useState(false);
  const [isFormaDropdownOpen, setIsFormaDropdownOpen] = useState(false);

  // Estados para busca
  const [fornecedorSearch, setFornecedorSearch] = useState("");
  const [condicaoSearch, setCondicaoSearch] = useState("");
  const [formaSearch, setFormaSearch] = useState("");

  // Refs para fechar dropdown ao clicar fora
  const fornecedorDropdownRef = useRef<HTMLDivElement>(null);
  const condicaoDropdownRef = useRef<HTMLDivElement>(null);
  const formaDropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        fornecedorDropdownRef.current &&
        !fornecedorDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFornecedorDropdownOpen(false);
      }
      if (
        condicaoDropdownRef.current &&
        !condicaoDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCondicaoDropdownOpen(false);
      }
      if (
        formaDropdownRef.current &&
        !formaDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFormaDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Funções para selecionar valores
  const handleFornecedorSelect = (code: string) => {
    setModalData((prev) => ({ ...prev, fornecedor: code }));
    setIsFornecedorDropdownOpen(false);
    setFornecedorSearch("");
  };

  const handleCondicaoSelect = (code: string) => {
    setModalData((prev) => ({ ...prev, condicao: code }));
    setIsCondicaoDropdownOpen(false);
    setCondicaoSearch("");
  };

  const handleFormaSelect = (code: string) => {
    setModalData((prev) => ({ ...prev, forma: code }));
    setIsFormaDropdownOpen(false);
    setFormaSearch("");
  };

  // Funções para obter nomes selecionados
  const getSelectedFornecedorName = () => {
    const fornecedor = filters.supplyer.find(
      (f) => f.code.toString() === modalData.fornecedor
    );
    return fornecedor ? fornecedor.name : "Selecione um fornecedor";
  };

  const getSelectedCondicaoName = () => {
    const condicao = filters.paymentCondition.find(
      (c) => c.code === modalData.condicao
    );
    return condicao ? condicao.name : "Selecione uma condição";
  };

  const getSelectedFormaName = () => {
    const forma = filters.paymentMethod.find((f) => f.code === modalData.forma);
    return forma ? forma.name : "Selecione uma forma";
  };

  // Filtrar opções baseado na busca
  const filteredFornecedores = filters.supplyer.filter((f) =>
    f.name.toLowerCase().includes(fornecedorSearch.toLowerCase())
  );

  const filteredCondicoes = filters.paymentCondition.filter((c) =>
    c.name.toLowerCase().includes(condicaoSearch.toLowerCase())
  );

  const filteredFormas = filters.paymentMethod.filter((f) =>
    f.name.toLowerCase().includes(formaSearch.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!modalData.fornecedor || !modalData.condicao || !modalData.forma) {
      alert(
        "Selecione fornecedor, condição e forma de pagamento antes de confirmar."
      );
      return;
    }

    if (selectedProducts.length === 0) {
      alert("Nenhum produto selecionado.");
      return;
    }

    setIsLoading(true);

    try {
      const orderData: OrderData = {
        paymentCondition: modalData.condicao,
        company: 1,
        branch: 1,
        supplyerCode: parseInt(modalData.fornecedor),
        products: selectedProducts.map((product) => ({
          productCode: product.productCode,
          orderQuantity:
            orderQuantities[product.productCode] || product.quantityToBuy || 0,
          unityPrice: product.lastPurchaseCost
            ? parseFloat(
                product.lastPurchaseCost
                  .replace("R$", "")
                  .replace(/\./g, "")
                  .replace(",", ".")
                  .trim()
              )
            : 0,
        })),
      };

      const result = await createBuyingOrder(orderData);

      if (result.responseJson.success) {
        toast.success(
          `${result.responseJson.message} OC: ${result.responseJson.data.orderNumber}`,
          {
            autoClose: 5000,
          }
        );
        setModalData({ fornecedor: "", condicao: "", forma: "" });
        onClose();
      } else {
        toast.error(result.responseJson.message, {
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error("Erro ao criar ordem de compra:", error);
      toast.error(
        "Ocorreu um erro inesperado ao gerar orderm de compra. Contate o administrador do sistema.",
        {
          autoClose: 2000,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setModalData({ fornecedor: "", condicao: "", forma: "" });
    setIsFornecedorDropdownOpen(false);
    setIsCondicaoDropdownOpen(false);
    setIsFormaDropdownOpen(false);
    setFornecedorSearch("");
    setCondicaoSearch("");
    setFormaSearch("");
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
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

        {/* Informação sobre produtos selecionados */}
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-xs text-green-700">
            <strong>Produtos selecionados:</strong> {selectedProducts.length}{" "}
            produto(s)
          </p>
        </div>

        {/* Fornecedor - Combobox */}
        <div className="flex flex-col relative" ref={fornecedorDropdownRef}>
          <label className="text-sm font-medium text-gray-700 mb-1">
            Fornecedor *
          </label>
          <button
            onClick={() =>
              setIsFornecedorDropdownOpen(!isFornecedorDropdownOpen)
            }
            disabled={isLoading}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full text-left bg-white hover:bg-gray-50 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="truncate">{getSelectedFornecedorName()}</span>
            <div className="flex items-center gap-1">
              <svg
                className={`w-4 h-4 transition-transform ${
                  isFornecedorDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>

          {isFornecedorDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-80 overflow-hidden">
              {/* Campo de busca dentro do dropdown */}
              <div className="p-2 border-b border-gray-200">
                <input
                  type="text"
                  value={fornecedorSearch}
                  onChange={(e) => setFornecedorSearch(e.target.value)}
                  placeholder="Buscar fornecedor..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Lista de fornecedores */}
              <div className="max-h-60 overflow-y-auto">
                {filteredFornecedores.length === 0 ? (
                  <div className="text-sm text-gray-500 p-3 text-center">
                    Nenhum fornecedor encontrado
                  </div>
                ) : (
                  filteredFornecedores.map((f) => (
                    <button
                      key={f.code}
                      onClick={() => handleFornecedorSelect(f.code.toString())}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                        modalData.fornecedor === f.code.toString()
                          ? "bg-indigo-50 text-indigo-700"
                          : ""
                      }`}
                    >
                      <span className="truncate">{f.name}</span>
                      {modalData.fornecedor === f.code.toString() && (
                        <svg
                          className="w-4 h-4 text-indigo-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Contador de resultados */}
              <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
                <div className="text-xs text-gray-500">
                  {filteredFornecedores.length} de {filters.supplyer.length}{" "}
                  fornecedores
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Condição de pagamento - Combobox */}
        <div className="flex flex-col relative" ref={condicaoDropdownRef}>
          <label className="text-sm font-medium text-gray-700 mb-1">
            Condição de Pagamento *
          </label>
          <button
            onClick={() => setIsCondicaoDropdownOpen(!isCondicaoDropdownOpen)}
            disabled={isLoading}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full text-left bg-white hover:bg-gray-50 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="truncate">{getSelectedCondicaoName()}</span>
            <div className="flex items-center gap-1">
              <svg
                className={`w-4 h-4 transition-transform ${
                  isCondicaoDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>

          {isCondicaoDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-80 overflow-hidden">
              {/* Campo de busca dentro do dropdown */}
              <div className="p-2 border-b border-gray-200">
                <input
                  type="text"
                  value={condicaoSearch}
                  onChange={(e) => setCondicaoSearch(e.target.value)}
                  placeholder="Buscar condição..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Lista de condições */}
              <div className="max-h-60 overflow-y-auto">
                {filteredCondicoes.length === 0 ? (
                  <div className="text-sm text-gray-500 p-3 text-center">
                    Nenhuma condição encontrada
                  </div>
                ) : (
                  filteredCondicoes.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => handleCondicaoSelect(c.code)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                        modalData.condicao === c.code
                          ? "bg-indigo-50 text-indigo-700"
                          : ""
                      }`}
                    >
                      <span className="truncate">{c.name}</span>
                      {modalData.condicao === c.code && (
                        <svg
                          className="w-4 h-4 text-indigo-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Contador de resultados */}
              <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
                <div className="text-xs text-gray-500">
                  {filteredCondicoes.length} de{" "}
                  {filters.paymentCondition.length} condições
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Forma de pagamento - Combobox */}
        <div className="flex flex-col relative" ref={formaDropdownRef}>
          <label className="text-sm font-medium text-gray-700 mb-1">
            Forma de Pagamento *
          </label>
          <button
            onClick={() => setIsFormaDropdownOpen(!isFormaDropdownOpen)}
            disabled={isLoading}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full text-left bg-white hover:bg-gray-50 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="truncate">{getSelectedFormaName()}</span>
            <div className="flex items-center gap-1">
              <svg
                className={`w-4 h-4 transition-transform ${
                  isFormaDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>

          {isFormaDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-80 overflow-hidden">
              {/* Campo de busca dentro do dropdown */}
              <div className="p-2 border-b border-gray-200">
                <input
                  type="text"
                  value={formaSearch}
                  onChange={(e) => setFormaSearch(e.target.value)}
                  placeholder="Buscar forma..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Lista de formas */}
              <div className="max-h-60 overflow-y-auto">
                {filteredFormas.length === 0 ? (
                  <div className="text-sm text-gray-500 p-3 text-center">
                    Nenhuma forma encontrada
                  </div>
                ) : (
                  filteredFormas.map((f) => (
                    <button
                      key={f.code}
                      onClick={() => handleFormaSelect(f.code)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                        modalData.forma === f.code
                          ? "bg-indigo-50 text-indigo-700"
                          : ""
                      }`}
                    >
                      <span className="truncate">{f.name}</span>
                      {modalData.forma === f.code && (
                        <svg
                          className="w-4 h-4 text-indigo-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Contador de resultados */}
              <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
                <div className="text-xs text-gray-500">
                  {filteredFormas.length} de {filters.paymentMethod.length}{" "}
                  formas
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Informações adicionais */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-xs text-blue-700">
            <strong>Atenção:</strong> Todos os campos marcados com * são
            obrigatórios. A ordem de compra será gerada com os produtos
            selecionados na tabela.
          </p>
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processando...
              </>
            ) : (
              "Confirmar Ordem"
            )}
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}
