import { ColumnOrderState } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const COLUMN_ORDER_STORAGE_KEY = "main-table-column-order";

export function useLocalStorage() {
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);

  const persistColumnOrder = (newOrder: ColumnOrderState) => {
    try {
      localStorage.setItem(COLUMN_ORDER_STORAGE_KEY, JSON.stringify(newOrder));
    } catch (error) {
      console.error("Erro ao salvar ordem das colunas no localStorage:", error);
    }
  };

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

  const clearPersistedColumnOrder = () => {
    try {
      localStorage.removeItem(COLUMN_ORDER_STORAGE_KEY);
      setColumnOrder([
        "select",
        "productCode",
        "barcode",
        "description",
        "familyName",
        "familyCode",
        "lastPurchaseCost",
        "availableStock",
        "physicalStock",
        "stockTurnover",
        "lastPurchaseDate",
        "quantityToBuy",
        "totalSales",
        "average6Months",
        "monthlySales_NOV_2025",
        "monthlySales_OCT_2025",
        "monthlySales_SEP_2025",
        "monthlySales_AUG_2025",
        "monthlySales_JUL_2025",
        "monthlySales_JUN_2025",
        "orderQuantity",
      ]);
      toast.success("Ordem das colunas resetada para o padrão!", {
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Erro ao limpar ordem das colunas:", error);
    }
  };

  useEffect(() => {
    const savedOrder = getPersistedColumnOrder();
    if (savedOrder && savedOrder.length > 0) {
      setColumnOrder(savedOrder);
    }
  }, []);

  useEffect(() => {
    if (columnOrder.length > 0) {
      persistColumnOrder(columnOrder);
    }
  }, [columnOrder]);

  return {
    columnOrder,
    setColumnOrder,
    clearPersistedColumnOrder,
  };
}
