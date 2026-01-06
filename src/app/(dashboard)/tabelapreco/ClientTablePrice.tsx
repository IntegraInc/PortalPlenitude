/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import TablePriceHeader from "@/components/TablePriceHeader";
import MainTablePrice from "@/components/MainTablePrice";
import type { TablePriceProduct } from "@/app/types/filterTypes"; // << use este tipo
// se você precisar do tipo de filters:
import type { FiltersData } from "@/app/types/filterTypes";

type Props = {
    bearerToken: string | null;
    initialProducts: TablePriceProduct[];                 // << aqui
    families: Array<{ code: string; name: string }>;
    tablePriceOptions: Array<{ code: string }>;
    initialQuery?: {
        familia?: string;
        tablePrice?: string;
        margin?: string;
        markup?: string;
        page?: number;
        pageSize?: number;
    };
};

export default function ClientTablePrice({
    bearerToken,
    initialProducts,
    families,
    tablePriceOptions,
    initialQuery,
}: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFamilia, setSelectedFamilia] = useState(initialQuery?.familia ?? "");
    const [selectedTablePrice, setSelectedTablePrice] = useState(initialQuery?.tablePrice ?? "");
    const [marginPercent, setMarginPercent] = useState(initialQuery?.margin ?? "");
    const [markupPercent, setMarkupPercent] = useState(initialQuery?.markup ?? "");

    const [page, setPage] = useState(initialQuery?.page ?? 1);
    const [pageSize, setPageSize] = useState(initialQuery?.pageSize ?? 50);

    const [data, setData] = useState<TablePriceProduct[]>(initialProducts); // << aqui
    const [loading, setLoading] = useState(false);
    const [ctrl, setCtrl] = useState<AbortController | null>(null);

    function buildApiUrl() {
        const qs = new URLSearchParams();
        if (selectedFamilia) qs.set("family", selectedFamilia);
        if (selectedTablePrice) qs.set("tablePrice", selectedTablePrice);
        if (marginPercent) qs.set("margin", marginPercent);
        if (markupPercent) qs.set("markup", markupPercent);
        qs.set("limit", "1000");
        return `https://integrainc-senior-api.vercel.app/products/all?${qs.toString()}`;
    }

    function buildPageQuery() {
        const qs = new URLSearchParams();
        if (selectedFamilia) qs.set("familia", selectedFamilia);
        if (selectedTablePrice) qs.set("tablePrice", selectedTablePrice);
        if (marginPercent) qs.set("margin", marginPercent);
        if (markupPercent) qs.set("markup", markupPercent);
        qs.set("page", String(page));
        qs.set("pageSize", String(pageSize));
        return qs;
    }

    async function onApplyFilters() {
        if (ctrl) ctrl.abort();
        const controller = new AbortController();
        setCtrl(controller);

        setLoading(true);
        try {
            const res = await fetch(buildApiUrl(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${bearerToken ?? ""}`,
                },
                cache: "no-store",
                signal: controller.signal,
            });
            if (!res.ok) throw new Error("Falha ao buscar produtos");
            const json: { data?: TablePriceProduct[] } = await res.json(); // << tipado
            setData(json?.data ?? []);

            startTransition(() => {
                router.replace(`${pathname}?${buildPageQuery().toString()}`, { scroll: false });
            });
        } catch (e) {
            // nada de "any"
            if (e instanceof DOMException && e.name === "AbortError") {
                return;
            }
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>


            <MainTablePrice
                bearerToken={bearerToken}
                filters={{ family: families }}                // << agora casa com Pick<FiltersData, "family">
                tablePriceFilters={tablePriceOptions}
                tablePriceProducts={data}
            />
        </>
    );
}
