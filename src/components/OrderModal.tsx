"use client";

import { Dialog } from "@headlessui/react";
import { FiltersData, Product } from "@/app/types/filterTypes";
import { useState } from "react";
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
      // ✅ Monta o objeto OrderData conforme solicitado
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

      console.log("OrderData gerado:", orderData);

      // ✅ Faz a requisição usando a action
      const result = await createBuyingOrder(orderData);

      console.log("Resposta da API:", result);

      if (result.responseJson) {
        toast.success("Ordem de compra criada com sucesso!", {
          autoClose: 2000,
        });
        setModalData({ fornecedor: "", condicao: "", forma: "" });
        onClose();
      } else {
        throw new Error("Erro ao criar ordem de compra");
      }
    } catch (error) {
      console.error("Erro ao criar ordem de compra:", error);
      alert("Erro ao criar ordem de compra. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setModalData({ fornecedor: "", condicao: "", forma: "" });
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

        {/* Fornecedor */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Fornecedor *
          </label>
          <select
            value={modalData.fornecedor}
            onChange={(e) =>
              setModalData((prev) => ({ ...prev, fornecedor: e.target.value }))
            }
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isLoading}
          >
            <option value="">Selecione um fornecedor</option>
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
            Condição de Pagamento *
          </label>
          <select
            value={modalData.condicao}
            onChange={(e) =>
              setModalData((prev) => ({ ...prev, condicao: e.target.value }))
            }
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isLoading}
          >
            <option value="">Selecione uma condição</option>
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
            Forma de Pagamento *
          </label>
          <select
            value={modalData.forma}
            onChange={(e) =>
              setModalData((prev) => ({ ...prev, forma: e.target.value }))
            }
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isLoading}
          >
            <option value="">Selecione uma forma</option>
            {filters.paymentMethod.map((f) => (
              <option key={f.code} value={f.code}>
                {f.name}
              </option>
            ))}
          </select>
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
