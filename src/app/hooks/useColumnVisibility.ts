import { useEffect, useState, useCallback } from "react";
import { VisibilityState } from "@tanstack/react-table";

// const STORAGE_KEY = "table-column-visibility";

// IMPORTANTE:
// TanStack: columnVisibility[id] === false => escondida
// Seu projeto: você vinha usando "true = oculto" (invertido).
// Pra parar a confusão: vamos padronizar no TanStack DE VERDADE:
// ✅ true = VISÍVEL
// ✅ false = OCULTA
//
// Aí no resto do código você troca o helper isColumnVisible (te passo abaixo).

export function useColumnVisibility(storageKey: string) {
 const [columnVisibility, setColumnVisibilityState] =
  useState<VisibilityState>({});

 // carrega do localStorage (se não tiver, começa vazio)
 useEffect(() => {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return;

  try {
   const parsed = JSON.parse(saved);
   if (parsed && typeof parsed === "object") {
    setColumnVisibilityState(parsed);
   }
  } catch (err) {
   console.error("Erro ao carregar visibilidade das colunas:", err);
   localStorage.removeItem(storageKey);
  }
 }, []);

 // setter compatível com TanStack
 const setColumnVisibility = useCallback(
  (updater: VisibilityState | ((old: VisibilityState) => VisibilityState)) => {
   setColumnVisibilityState((old) => {
    const next = typeof updater === "function" ? updater(old) : updater;
    localStorage.setItem(storageKey, JSON.stringify(next));
    return next;
   });
  },
  []
 );

 const toggleColumnVisibility = useCallback(
  (columnId: string) => {
   setColumnVisibility((old) => {
    const current = old[columnId];
    const nextValue = current === undefined ? false : !current; // undefined -> vira OCULTA no primeiro toggle
    return { ...old, [columnId]: nextValue };
   });
  },
  [setColumnVisibility]
 );

 // reset: limpa tudo e deixa o MainTable reconstruir/normalizar
 const resetColumnVisibility = useCallback(() => {
  setColumnVisibilityState({});
  localStorage.removeItem(storageKey);
 }, []);

 return {
  columnVisibility,
  setColumnVisibility,
  toggleColumnVisibility,
  resetColumnVisibility,
 };
}
