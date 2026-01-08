/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Product, FiltersData } from "@/app/types/filterTypes";
import MainTable from "@/components/MainTable";

type Props = {
    bearerToken: string;
    initialProducts: Product[];   // passe [] ao entrar na tela
    filters: FiltersData;         // completo: family, supplyer, paymentCondition, paymentMethod...
    initialQuery?: {
        familia?: string;
        page?: number;
        pageSize?: number;
    };
};

export default function ClientAnalysis({
    bearerToken,
    initialProducts,
    filters,
    initialQuery,
}: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const [page, setPage] = useState(initialQuery?.page ?? 1);
    const [pageSize, setPageSize] = useState(initialQuery?.pageSize ?? 50);

    const [data, setData] = useState<Product[]>(initialProducts);
    const [loading, setLoading] = useState(false);
    const [ctrl, setCtrl] = useState<AbortController | null>(null);

    // ✅ agora recebe a família do header interno
    async function onApplyFilters(familia: string) {
        if (ctrl) ctrl.abort();
        const controller = new AbortController();
        setCtrl(controller);

        setLoading(true);
        try {
            const qs = new URLSearchParams();
            if (familia) qs.set("family", familia);
            qs.set("limit", "1000");

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}analisys/all?${qs.toString()}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${bearerToken ?? ""}`,
                },
                cache: "no-store",
                signal: controller.signal,
            });
            if (!res.ok) throw new Error("Falha ao buscar produtos");
            const json: { data?: Product[] } = await res.json();
            setData(json?.data ?? []);

            startTransition(() => {
                const uri = new URLSearchParams();
                if (familia) uri.set("familia", familia);  // URL do front
                uri.set("page", String(page));
                uri.set("pageSize", String(pageSize));
                router.replace(`${pathname}?${uri.toString()}`, { scroll: false });
            });
        } catch (e) {
            if (e instanceof DOMException && e.name === "AbortError") return;
            console.error(e);
        } finally {
            setLoading(false);
        }
    }
    function handlePageChange(p: number) {
        setPage(p);
        const qp = new URLSearchParams();

        qp.set("page", String(p));
        qp.set("pageSize", String(pageSize));
        router.replace(`${pathname}?${qp.toString()}`, { scroll: false });
    }

    function handlePageSizeChange(size: number) {
        setPageSize(size);
        setPage(1);
        const qp = new URLSearchParams();
        // idem preservar familia
        qp.set("page", "1");
        qp.set("pageSize", String(size));
        router.replace(`${pathname}?${qp.toString()}`, { scroll: false });
    }

    return (
        <>
            <MainTable
                filters={filters}
                products={data}            // começa vazio, só preenche após Filtrar
                renderHeader               // ✅ header visível
                deferFilterApply           // ✅ troca família NÃO dispara; só no botão Filtrar
                onApplyFilters={onApplyFilters}
                isFetching={loading}
                page={page}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
            />
        </>
    );
}
