"use client";

import { Dialog } from "@headlessui/react";
import { useState, useEffect } from "react";
import { TablePriceProduct } from "@/app/types/filterTypes";
import { changePrice } from "@/app/(dashboard)/tabelapreco/action";
import { toast } from "react-toastify";

type typePrice = "margem" | "markup" | "price";

interface ChangePriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  tablePrice: string;
  selectedProducts: TablePriceProduct[];
}

export default function ChangePriceModal({
  isOpen,
  onClose,
  tablePrice,
  selectedProducts,
}: ChangePriceModalProps) {
  const [typePrice, setTypePrice] = useState<typePrice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTypePrice(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isSubmitting) return;
    setTypePrice(null);
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!typePrice) {
      toast.info("Selecione o tipo de alteração antes de continuar.", {
        autoClose: 5000,
      });
      return;
    }

    if (!tablePrice) {
      toast.error("Nenhuma tabela de preço selecionada.", {
        autoClose: 5000,
      });
      return;
    }

    if (!selectedProducts || selectedProducts.length === 0) {
      toast.error("Nenhum produto selecionado para alteração.");
      return;
    }

    setIsSubmitting(true);

    try {
      const productsPayload = selectedProducts.map((p) => ({
        productCode: p.productCode,
        suggestedPriceByMarkup:
          typeof p.suggestedPriceByMarkup === "number"
            ? p.suggestedPriceByMarkup
            : p.suggestedPriceByMarkup
              ? Number(p.suggestedPriceByMarkup)
              : null,
        suggestedPriceByMargin:
          typeof p.suggestedPriceByMargin === "number"
            ? p.suggestedPriceByMargin
            : p.suggestedPriceByMargin
              ? Number(p.suggestedPriceByMargin)
              : null,
        salePrice:
          typeof p.salePrice === "number"
            ? p.salePrice
            : p.salePrice
              ? Number(p.salePrice)
              : null,
        capPrice:
          typeof p.capPrice === "number"
            ? p.capPrice
            : p.capPrice
              ? Number(p.capPrice)
              : null,
      }));

      const payload = {
        tablePrice,
        typePrice,
        products: productsPayload,
      };

      // 👇 É isso aqui que você pediu
      const { responseJson } = await changePrice(payload);

      // Se quiser algum tratamento:
      // if (!responseJson.success) { ... }
      if (responseJson.success) {
        toast.success(
          `${responseJson.message}`,
          {
            autoClose: 5000,
          }
        );
      }
      else {
        toast.error(`Erro: ${responseJson.message}`, {
          autoClose: 5000,
        });
      }

      handleClose();
    } catch (err) {
      console.error("Erro ao enviar alteração de preços:", err);
      toast.error("Erro ao alterar preços. Verifique o console.", {
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canConfirm =
    !!typePrice && !!tablePrice && selectedProducts.length > 0 && !isSubmitting;

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <Dialog.Panel className="bg-white rounded-lg shadow-lg w-[90%] max-w-md p-6 space-y-4">
        <Dialog.Title className="text-lg font-semibold text-gray-800">
          Alterar preços da tabela
        </Dialog.Title>

        <p className="text-sm text-gray-600">
          Escolha como você quer aplicar a alteração para os produtos
          selecionados.
        </p>

        <div className="space-y-2">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-xs text-blue-700">
              <strong>Tabela de preço selecionada:</strong>{" "}
              {tablePrice || "Nenhuma"}
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-xs text-green-700">
              <strong>Produtos selecionados:</strong> {selectedProducts.length}{" "}
              produto(s)
            </p>
          </div>
        </div>

        {/* radios iguais aos que você já tinha */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Tipo de alteração *
          </p>

          <div className="space-y-2">
            <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="changeType"
                value="margin"
                checked={typePrice === "margem"}
                onChange={() => setTypePrice("margem")}
                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <div>
                <span className="font-medium">Alterar por margem</span>
                <p className="text-xs text-gray-500">
                  Usa o preço sugerido pela margem (%), aplicando nos produtos
                  selecionados.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="changeType"
                value="markup"
                checked={typePrice === "markup"}
                onChange={() => setTypePrice("markup")}
                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <div>
                <span className="font-medium">Alterar por markup</span>
                <p className="text-xs text-gray-500">
                  Usa o preço sugerido pelo markup (%), aplicando nos produtos
                  selecionados.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="changeType"
                value="price"
                checked={typePrice === "price"}
                onChange={() => setTypePrice("price")}
                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <div>
                <span className="font-medium">Alterar por preço</span>
                <p className="text-xs text-gray-500">
                  Usa diretamente o preço de venda atual de cada produto como
                  base para atualização.
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canConfirm}
            className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processando...
              </>
            ) : (
              "Alterar"
            )}
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}
