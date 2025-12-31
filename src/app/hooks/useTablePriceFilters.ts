import { useState, useEffect } from "react";

// Campos mínimos que o hook realmente usa:
type BasicFields = {
 description?: string | null;
 productCode?: string | null;
 familyCode?: string | null;
};

/**
 * Hook genérico para filtrar produtos por busca textual e família.
 * Funciona para Product[] e TablePriceProduct[] desde que tenham os campos básicos.
 */
export function useTablePriceFilters<T extends BasicFields>(
 products: T[],
 initialFamilia = ""
) {
 const [filteredData, setFilteredData] = useState<T[]>(products);
 const [searchTerm, setSearchTerm] = useState("");
 const [selectedFamilia, setSelectedFamilia] =
  useState<string>(initialFamilia);

 useEffect(() => {
  let filtered = [...(products ?? [])];

  if (searchTerm.trim()) {
   const term = searchTerm.toLowerCase();
   filtered = filtered.filter((p) => {
    const desc = p.description?.toString().toLowerCase() ?? "";
    const code = p.productCode?.toString().toLowerCase() ?? "";
    return desc.includes(term) || code.includes(term);
   });
  }

  if (selectedFamilia && selectedFamilia.trim() !== "") {
   filtered = filtered.filter((p) => p.familyCode === selectedFamilia);
  }

  setFilteredData(filtered);
 }, [products, searchTerm, selectedFamilia]);

 return {
  filteredData,
  searchTerm,
  setSearchTerm,
  selectedFamilia,
  setSelectedFamilia,
 };
}
