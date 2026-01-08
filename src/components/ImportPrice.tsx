"use client";

import { useRef, useState } from "react";
import { parsePriceCsv } from "@/app/utils/parsePriceCsv";
import { importPrice } from "@/app/(dashboard)/tabelapreco/action";
import { toast } from "react-toastify";

type UpdatedRow = {
    productCode: string;
    barcode: number | string;
    description: string;
    familyName: string;
    familyCode: string;
    category: string;
    lastPurchaseCost: number;
    capPrice: number;
    capPercent: number;
    salePrice: number;
    markupPercent: number;
    marginPercent: number;
    suggestedPriceByMargin: number;
    suggestedPriceByMarkup: number;
    availableStock: number;
    lastPurchaseDate: string; // vem como "dd/mm/yyyy"
};


type Props = {
    selectedTablePrice: string;
    onAfterSuccess: (items: UpdatedRow[]) => void;
};

export default function ImportPrice({ selectedTablePrice, onAfterSuccess }: Props) {
    const [isImporting, setIsImporting] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    function handleImportClick() {
        if (!selectedTablePrice) {
            toast.info("Selecione uma Tabela de Preço antes de importar.");
            return;
        }
        fileRef.current?.click();
    }

    async function handleFileSelected(ev: React.ChangeEvent<HTMLInputElement>) {
        const file = ev.target.files?.[0];
        if (!file) return;

        try {
            setIsImporting(true);

            const parsed = await parsePriceCsv(file);
            if (!parsed.length) {
                toast.error("Arquivo sem linhas válidas.");
                return;
            }

            const payload = {
                tablePrice: selectedTablePrice,
                products: parsed.map(p => ({
                    productCode: p.productCode,
                    salePrice: p.salePrice,  // singular
                    capPrice: p.capPrice,
                })),
            };
            // dentro do try, depois de chamar a action
            const { responseJson } = await importPrice(payload);

            // ✅ repassa exatamente o array retornado pelo back
            const updatedRows = Array.isArray(responseJson?.data) ? responseJson.data : [];
            toast.success(responseJson?.message || "Preços atualizados com sucesso.");
            onAfterSuccess(updatedRows);

        } catch (err: unknown) {
            console.error(err);
            toast.error("Falha ao importar preços. " + (err instanceof Error ? err.message : ""));
        } finally {
            setIsImporting(false);
            if (fileRef.current) fileRef.current.value = "";
        }
    }

    return (
        <div className="flex flex-col">
            <label className="text-sm font-medium text-transparent mb-1 select-none">.</label>
            <button
                onClick={handleImportClick}
                disabled={isImporting}
                className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                title="Importar CSV para alterar preços"
            >
                {isImporting ? "Importando..." : "Importar CSV"}
            </button>
            <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileSelected}
            />
        </div>
    );
}
