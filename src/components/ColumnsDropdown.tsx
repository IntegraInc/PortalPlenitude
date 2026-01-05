import { useState, useEffect, useMemo, useRef } from "react";

type Col = { id: string; header: string };
type VisibilityMap = Record<string, boolean>; // true = OCULTA, false/undefined = visível

function ColumnsDropdown({
    availableColumns,
    columnVisibility,
    setColumnVisibility,
    resetColumnVisibility,
}: {
    availableColumns: Col[];
    columnVisibility: VisibilityMap;
    setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityMap>>;
    resetColumnVisibility: () => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const isVisible = (id: string) => columnVisibility?.[id] !== true;

    // contador consistente com a lista
    const visibleCount = useMemo(
        () => availableColumns.reduce((n, c) => n + (isVisible(c.id) ? 1 : 0), 0),
        [availableColumns, columnVisibility]
    );

    // apply helpers respeitando true=OCULTA
    const setHidden = (id: string, hidden: boolean) =>
        setColumnVisibility((prev) => ({ ...prev, [id]: hidden }));

    const handleCheckbox = (id: string, checked: boolean) => {
        // checked=true significa "OCULTA" (marca para ocultar)
        setHidden(id, checked);
    };

    const handleSelectAll = () => {
        // “Selecionar tudo” no seu antigo significava deixar tudo VISÍVEL
        setColumnVisibility((prev) => {
            const next = { ...prev };
            availableColumns.forEach((c) => { next[c.id] = false; }); // visível
            return next;
        });
    };

    const handleHideAll = () => {
        setColumnVisibility((prev) => {
            const next = { ...prev };
            availableColumns.forEach((c) => { next[c.id] = true; }); // oculta
            return next;
        });
    };

    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, []);

    return (
        <div className="relative inline-block text-left" ref={ref}>
            <button
                onClick={() => setOpen((s) => !s)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white hover:bg-gray-50 flex items-center justify-between min-w-[150px]"
            >
                Colunas ({visibleCount}/{availableColumns.length})
                <svg className={`w-4 h-4 ml-2 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute bottom-full right-0 mb-2 w-72 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto p-2">
                    <div className="flex items-center justify-between px-2 py-1 border-b text-xs text-gray-500">
                        <span>Colunas ({visibleCount}/{availableColumns.length})</span>
                        <button className="text-indigo-600 hover:underline" onClick={resetColumnVisibility}>Resetar</button>
                    </div>

                    <div className="flex items-center justify-between text-xs p-2">
                        <button onClick={handleHideAll} className="text-green-600 hover:underline">Selecionar tudo</button>
                        <button onClick={handleSelectAll} className="text-red-600 hover:underline">Ocultar tudo</button>
                    </div>

                    {availableColumns.map((col) => {
                        const visible = isVisible(col.id);
                        const hidden = !visible; // para bater com “checked = oculto”
                        return (
                            <label key={col.id} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={hidden}                               // ✅ marcado = OCULTA
                                    onChange={(e) => handleCheckbox(col.id, e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700 flex-1">{col.header}</span>
                                <span className={`text-xs px-2 py-1 rounded ${!visible ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                    {visible ? "Oculta" : "Visível"}
                                </span>
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default ColumnsDropdown;
