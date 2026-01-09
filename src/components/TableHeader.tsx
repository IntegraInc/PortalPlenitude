import { FiltersData } from "@/app/types/filterTypes";
import { useState, useRef, useEffect } from "react";

interface TableHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedFamilia: string;
  setSelectedFamilia: (familia: string) => void;
  filters: Pick<FiltersData, "family">;
  selectedCount: number;
  clearPersistedColumnOrder: () => void;
  onOpenModal: () => void;
  columnVisibility?: { [key: string]: boolean };
  onToggleColumnVisibility?: (columnId: string) => void;
  onResetColumnVisibility?: () => void;
  availableColumns?: Array<{ id: string; header: string }>;
  onExport?: () => void;
  showApplyButton?: boolean;                // ✅ novo
  onApplyClick?: (familia: string) => void; // ✅ novo
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
  onApplyClick,
  showApplyButton = false,
  onExport,
}: TableHeaderProps) {
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [isFamiliaDropdownOpen, setIsFamiliaDropdownOpen] = useState(false);
  const [familiaSearch, setFamiliaSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const familiaDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsColumnDropdownOpen(false);
      }
      if (
        familiaDropdownRef.current &&
        !familiaDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFamiliaDropdownOpen(false);
        setFamiliaSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ CORREÇÃO DEFINITIVA: Lógica correta para visibilidade
  const isColumnVisible = (columnId: string) => {
    return columnVisibility[columnId] !== true;
  };

  // ✅ Filtro para as famílias
  const filteredFamilies = filters.family.filter((f) =>
    f.name.toLowerCase().includes(familiaSearch.toLowerCase())
  );

  // ✅ Obter o nome da família selecionada - SEM "Todas as famílias"
  const selectedFamilyName =
    filters.family.find((f) => f.code === selectedFamilia)?.name ||
    "Selecione uma família";

  const visibleColumnsCount = availableColumns.filter((col) =>
    isColumnVisible(col.id)
  ).length;

  const handleFamiliaSelect = (familiaCode: string) => {
    setSelectedFamilia(familiaCode);
    setIsFamiliaDropdownOpen(false);
    setFamiliaSearch("");
  };

  const clearFamiliaSelection = () => {
    setSelectedFamilia("");
    setIsFamiliaDropdownOpen(false);
    setFamiliaSearch("");
  };

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
      {/* Combobox Família */}
      <div className="flex flex-col relative" ref={familiaDropdownRef}>
        <label className="text-sm font-medium text-gray-700 mb-1">
          Família
        </label>
        <button
          onClick={() => setIsFamiliaDropdownOpen(!isFamiliaDropdownOpen)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64 text-left bg-white hover:bg-gray-50 flex items-center justify-between"
        >
          <span className="truncate">{selectedFamilyName}</span>
          <div className="flex items-center gap-1">
            <svg
              className={`w-4 h-4 transition-transform ${isFamiliaDropdownOpen ? "rotate-180" : ""
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
          </div>
        </button>

        {isFamiliaDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-80 overflow-hidden">
            {/* Campo de busca dentro do dropdown */}
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                value={familiaSearch}
                onChange={(e) => setFamiliaSearch(e.target.value)}
                placeholder="Buscar família..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Lista de famílias - SEM OPÇÃO "TODAS" */}
            <div className="max-h-60 overflow-y-auto">
              {filteredFamilies.length === 0 ? (
                <div className="text-sm text-gray-500 p-3 text-center">
                  Nenhuma família encontrada
                </div>
              ) : (
                filteredFamilies.map((f) => (
                  <button
                    key={f.code}
                    onClick={() => handleFamiliaSelect(f.code)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${selectedFamilia === f.code
                      ? "bg-indigo-50 text-indigo-700"
                      : ""
                      }`}
                  >
                    <span className="truncate">{f.name}</span>
                    {selectedFamilia === f.code && (
                      <svg
                        className="w-4 h-4 text-indigo-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Contador de resultados */}
            <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-500">
                {filteredFamilies.length} de {filters.family.length} famílias
              </div>
            </div>
          </div>
        )}
      </div>
      <button
        className="px-4 py-2 rounded-md text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
        onClick={() => onApplyClick?.(selectedFamilia)}
      >
        Aplicar filtro
      </button>

      {/* Botão exportar */}
      <button
        onClick={onExport}
        className="px-3 py-2 rounded-md text-sm font-medium bg-green-200 text-green-800 hover:bg-green-300 transition-colors cursor-pointer flex items-center gap-2"
        title="Exportar os dados exibidos na tabela"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v12m0 0l4-4m-4 4l-4-4M4 17v3h16v-3"
          />
        </svg>
        Exportar excel
      </button>
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
        className={`px-4 py-2 rounded-md text-sm font-medium h-10 cursor-pointer transition-colors flex items-center gap-2 ${selectedCount > 0
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
