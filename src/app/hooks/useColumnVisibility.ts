import { useState, useEffect } from "react";
import { VisibilityState } from "@tanstack/react-table";

// ✅ Valor inicial: todas as colunas visíveis (false = visível)
const INITIAL_VISIBILITY: VisibilityState = {
  select: true,
  productCode: true,
  barcode: true,
  description: true,
  familyName: true,
  familyCode: true,
  lastPurchaseCost: true,
  availableStock: true,
  physicalStock: true,
  stockTurnover: true,
  lastPurchaseDate: true,
  quantityToBuy: true,
  totalSales: true,
  average6Months: true,
  monthlySales_NOV_2025: true,
  monthlySales_OCT_2025: true,
  monthlySales_SEP_2025: true,
  monthlySales_AUG_2025: true,
  monthlySales_JUL_2025: true,
  monthlySales_JUN_2025: true,
  orderQuantity: true,
};

export function useColumnVisibility() {
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(INITIAL_VISIBILITY);

  useEffect(() => {
    const saved = localStorage.getItem("table-column-visibility");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setColumnVisibility(parsed);
      } catch (error) {
        console.error("Erro ao carregar visibilidade das colunas:", error);
        // Salva o padrão se der erro
        localStorage.setItem(
          "table-column-visibility",
          JSON.stringify(INITIAL_VISIBILITY)
        );
      }
    } else {
      // ✅ PRIMEIRA VEZ: Salva o padrão no localStorage
      localStorage.setItem(
        "table-column-visibility",
        JSON.stringify(INITIAL_VISIBILITY)
      );
    }
  }, []);

  const handleColumnVisibilityChange = (
    updater: VisibilityState | ((old: VisibilityState) => VisibilityState)
  ) => {
    const newVisibility =
      typeof updater === "function" ? updater(columnVisibility) : updater;
    setColumnVisibility(newVisibility);
    localStorage.setItem(
      "table-column-visibility",
      JSON.stringify(newVisibility)
    );
  };

  const toggleColumnVisibility = (columnId: string) => {
    const newVisibility = {
      ...columnVisibility,
      [columnId]: !columnVisibility[columnId],
    };
    setColumnVisibility(newVisibility);
    localStorage.setItem(
      "table-column-visibility",
      JSON.stringify(newVisibility)
    );
  };

  const resetColumnVisibility = () => {
    setColumnVisibility(INITIAL_VISIBILITY);
    localStorage.setItem(
      "table-column-visibility",
      JSON.stringify(INITIAL_VISIBILITY)
    );
  };

  return {
    columnVisibility,
    setColumnVisibility: handleColumnVisibilityChange,
    toggleColumnVisibility,
    resetColumnVisibility,
  };
}
