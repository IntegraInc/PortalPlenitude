import { FiltersData } from "@/app/types/filterTypes";
import { useState, useRef, useEffect } from "react";

interface TableHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedFamilia: string;
  setSelectedFamilia: (familia: string) => void;
  filters: FiltersData;
  selectedCount: number;
  clearPersistedColumnOrder: () => void;
  onOpenModal: () => void;
  columnVisibility?: { [key: string]: boolean };
  onToggleColumnVisibility?: (columnId: string) => void;
  onResetColumnVisibility?: () => void;
  availableColumns?: Array<{ id: string; header: string }>;
}

export default function TableHeader({
  searchTerm,
  setSearchTerm,
  selectedFamilia,
  setSelectedFamilia,
  filters,
  selectedCount,
  clearPersistedColumnOrder,
  onOpenModal,
  columnVisibility = {},
  onToggleColumnVisibility,
  onResetColumnVisibility,
  availableColumns = [],
}: TableHeaderProps) {
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsColumnDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ CORREÇÃO DEFINITIVA: Lógica correta para visibilidade
  // No React Table:
  // - true = coluna OCULTA
  // - false = coluna VISÍVEL
  // - undefined = coluna VISÍVEL (padrão)
  const isColumnVisible = (columnId: string) => {
    // Se columnVisibility[columnId] é true, a coluna está OCULTA
    // Se é false ou undefined, a coluna está VISÍVEL
    return columnVisibility[columnId] !== true;
  };

  // ✅ Contador de colunas visíveis para debug
  const visibleColumnsCount = availableColumns.filter((col) =>
    isColumnVisible(col.id)
  ).length;

  return (
    <div className="flex flex-wrap items-end gap-4 mb-4">
      {/* Campo de busca */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">Buscar</label>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="por código ou descrição..."
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-72"
        />
      </div>

      {/* Select Família */}
      <div className="flex flex-col">
        <label
          htmlFor="familia"
          className="text-sm font-medium text-gray-700 mb-1"
        >
          Família
        </label>
        <select
          id="familia"
          value={selectedFamilia}
          onChange={(e) => setSelectedFamilia(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-48"
        >
          {/* <option value="">Todas</option> */}
          {filters.family.map((f) => (
            <option key={f.code} value={f.code}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {/* Dropdown Colunas */}
      <div className="flex flex-col relative" ref={dropdownRef}>
        <label className="text-sm font-medium text-gray-700 mb-1">
          Colunas ({visibleColumnsCount}/{availableColumns.length})
        </label>
        <button
          onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-48 text-left bg-white hover:bg-gray-50 flex items-center justify-between"
        >
          <span>Opções</span>
          <svg
            className={`w-4 h-4 transition-transform ${
              isColumnDropdownOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isColumnDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                Colunas ({visibleColumnsCount}/{availableColumns.length}{" "}
                visíveis)
              </div>

              {availableColumns.length === 0 ? (
                <div className="text-sm text-gray-500 p-2 text-center">
                  Nenhuma coluna disponível
                </div>
              ) : (
                availableColumns.map((column) => {
                  const isVisible = isColumnVisible(column.id);

                  return (
                    <label
                      key={column.id}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!isVisible}
                        onChange={() => {
                          console.log(
                            `Toggling ${
                              column.id
                            } from ${isVisible} to ${!isVisible}`
                          );
                          onToggleColumnVisibility?.(column.id);
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 flex-1">
                        {column.header}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          !isVisible
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {!isVisible ? "Visível" : "Oculta"}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Botão resetar ordem das colunas */}
      <button
        onClick={clearPersistedColumnOrder}
        className="px-3 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors cursor-pointer flex items-center gap-2"
        title="Resetar ordem das colunas para o padrão"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Resetar Ordem
      </button>

      {/* Botão resetar visibilidade das colunas */}
      <button
        onClick={onResetColumnVisibility}
        className="px-3 py-2 rounded-md text-sm font-medium bg-orange-200 text-orange-700 hover:bg-orange-300 transition-colors cursor-pointer flex items-center gap-2"
        title="Resetar visibilidade das colunas"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Resetar Visibilidade
      </button>

      {/* Botão enviar */}
      <button
        onClick={onOpenModal}
        disabled={selectedCount === 0}
        className={`px-4 py-2 rounded-md text-sm font-medium h-10 cursor-pointer transition-colors flex items-center gap-2 ${
          selectedCount > 0
            ? "bg-indigo-600 text-white hover:bg-indigo-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
        Gerar Ordem de Compra
      </button>
    </div>
  );
}
