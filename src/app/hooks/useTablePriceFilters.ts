// useTablePriceFilters.ts
import { useMemo, useState } from "react";
import type { TablePriceProduct } from "@/app/types/filterTypes";

export function useTablePriceFilters(
 data: TablePriceProduct[],
 selectedFamilia: string // valor controlado pelo pai
) {
 const [searchTerm, setSearchTerm] = useState("");

 // ⚠️ Se o backend já filtra por família, você pode ignorar selectedFamilia aqui
 const filteredData = useMemo(() => {
  let rows = data;

  // (Opcional) aplicar família no front:
  // if (selectedFamilia) {
  //   rows = rows.filter(p => String(p.familyCode) === String(selectedFamilia));
  // }

  const term = searchTerm.trim().toLowerCase();
  if (term) {
   rows = rows.filter((p) => {
    const code = String(p.productCode ?? "").toLowerCase();
    const barcode = String(p.barcode ?? "").toLowerCase();
    const desc = String(p.description ?? "").toLowerCase();
    return (
     code.includes(term) || barcode.includes(term) || desc.includes(term)
    );
   });
  }
  return rows;
 }, [data, selectedFamilia, searchTerm]);

 return { filteredData, searchTerm, setSearchTerm };
}
