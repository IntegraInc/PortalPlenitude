import { ColumnOrderState } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

// const COLUMN_ORDER_STORAGE_KEY = "main-table-column-order";

export function useLocalStorage(storageKey: string) {
 const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() => {
  if (typeof window === "undefined") return [];
  try {
   const saved = localStorage.getItem(storageKey);
   const parsed = saved ? JSON.parse(saved) : [];
   return Array.isArray(parsed) ? parsed : [];
  } catch {
   return [];
  }
 });

 const persistColumnOrder = (newOrder: ColumnOrderState) => {
  try {
   localStorage.setItem(storageKey, JSON.stringify(newOrder));
  } catch (error) {
   console.error("Erro ao salvar ordem das colunas no localStorage:", error);
  }
 };

 const getPersistedColumnOrder = (): ColumnOrderState | null => {
  try {
   const saved = localStorage.getItem(storageKey);
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
   localStorage.removeItem(storageKey);
   setColumnOrder([]); // <<< deixa o MainTable normalizar e reconstruir com meses atuais
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
