import { Product } from "@/app/types/filterTypes";
import { useState, useEffect } from "react";

export function useTableFilters(products: Product[], initialFamilia = "") {
  const [filteredData, setFilteredData] = useState<Product[]>(products);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFamilia, setSelectedFamilia] =
    useState<string>(initialFamilia);

  useEffect(() => {
    let filtered = [...products];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.description?.toLowerCase().includes(term) ||
          p.productCode?.toLowerCase().includes(term)
      );
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
