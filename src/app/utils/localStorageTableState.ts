import { ColumnOrderState } from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

// const COLUMN_ORDER_STORAGE_KEY = "main-table-column-order";

// export function useLocalStorage() {
//  // ✅ Lê do localStorage ANTES do primeiro render (evita sobrescrever)
//  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() => {
//   if (typeof window === "undefined") return [];
//   try {
//    const saved = window.localStorage.getItem(COLUMN_ORDER_STORAGE_KEY);
//    const parsed = saved ? JSON.parse(saved) : [];
//    return Array.isArray(parsed) ? parsed : [];
//   } catch {
//    return [];
//   }
//  });

//  // ✅ Evita persistir no primeiro render (bootstrap)
//  const didMountRef = useRef(false);

//  useEffect(() => {
//   if (!didMountRef.current) {
//    didMountRef.current = true;
//    return;
//   }
//   try {
//    window.localStorage.setItem(
//     COLUMN_ORDER_STORAGE_KEY,
//     JSON.stringify(columnOrder)
//    );
//   } catch (error) {
//    console.error("Erro ao salvar ordem das colunas no localStorage:", error);
//   }
//  }, [columnOrder]);

//  const clearPersistedColumnOrder = () => {
//   try {
//    window.localStorage.removeItem(COLUMN_ORDER_STORAGE_KEY);
//    setColumnOrder([]);
//    toast.success("Ordem das colunas resetada para o padrão!", {
//     autoClose: 2000,
//    });
//   } catch (error) {
//    console.error("Erro ao limpar ordem das colunas:", error);
//   }
//  };

//  return {
//   columnOrder,
//   setColumnOrder,
//   clearPersistedColumnOrder,
//  };
// }

const COLUMN_ORDER_STORAGE_KEY = "main-table-column-order";

export function useLocalStorage() {
 const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() => {
  if (typeof window === "undefined") return [];
  try {
   const raw = localStorage.getItem(COLUMN_ORDER_STORAGE_KEY);
   const parsed = raw ? JSON.parse(raw) : [];
   return Array.isArray(parsed) ? parsed : [];
  } catch {
   return [];
  }
 });

 const didMount = useRef(false);

 useEffect(() => {
  if (!didMount.current) {
   didMount.current = true;
   return;
  }
  localStorage.setItem(COLUMN_ORDER_STORAGE_KEY, JSON.stringify(columnOrder));
 }, [columnOrder]);

 const clearPersistedColumnOrder = () => {
  try {
   window.localStorage.removeItem(COLUMN_ORDER_STORAGE_KEY);
   setColumnOrder([]);
   toast.success("Ordem das colunas resetada para o padrão!", {
    autoClose: 2000,
   });
  } catch (error) {
   console.error("Erro ao limpar ordem das colunas:", error);
  }
 };

 return { columnOrder, setColumnOrder, clearPersistedColumnOrder };
}
