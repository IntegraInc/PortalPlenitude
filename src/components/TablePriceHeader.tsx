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

  tablePriceFilters: { code: string }[];
  selectedTablePrice: string;
  setSelectedTablePrice: (code: string) => void;

  marginPercent: string;
  setMarginPercent: (value: string) => void;
  markupPercent: string;
  setMarkupPercent: (value: string) => void;
}

export default function TablePriceHeader({
  searchTerm,
  setSearchTerm,
  selectedFamilia,
  setSelectedFamilia,
  filters,
  selectedCount,
  clearPersistedColumnOrder,
  onOpenModal,
  columnVisibility = {},
  tablePriceFilters,
  selectedTablePrice,
  setSelectedTablePrice,
  onToggleColumnVisibility,
  onResetColumnVisibility,
  availableColumns = [],
  marginPercent,
  setMarginPercent,
  markupPercent,
  setMarkupPercent,
}: TableHeaderProps) {
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [isFamiliaDropdownOpen, setIsFamiliaDropdownOpen] = useState(false);
  const [isTablePriceOpen, setIsTablePriceOpen] = useState(false);

  const [familiaSearch, setFamiliaSearch] = useState("");
  const [tablePriceSearch, setTablePriceSearch] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const familiaDropdownRef = useRef<HTMLDivElement>(null);
  const tablePriceDropdownRef = useRef<HTMLDivElement>(null);

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

      if (
        tablePriceDropdownRef.current &&
        !tablePriceDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTablePriceOpen(false);
        setTablePriceSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isColumnVisible = (columnId: string) => {
    return columnVisibility[columnId] !== true;
  };

  const filteredFamilies = filters.family.filter((f) =>
    f.name.toLowerCase().includes(familiaSearch.toLowerCase())
  );

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

  // 🔽 filtros para tabela de preço
  const filteredTablePrices = tablePriceFilters?.filter((t) =>
    t.code.toLowerCase().includes(tablePriceSearch.toLowerCase())
  );

  const selectedTablePriceLabel =
    tablePriceFilters?.find((t) => t.code === selectedTablePrice)?.code ||
    "Selecione uma tabela";

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

            <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-500">
                {filteredFamilies.length} de {filters.family.length} famílias
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Combobox Tabela de Preço */}
      <div className="flex flex-col relative" ref={tablePriceDropdownRef}>
        <label className="text-sm font-medium text-gray-700 mb-1">
          Tabela de Preço
        </label>
        <button
          onClick={() => setIsTablePriceOpen(!isTablePriceOpen)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-28 text-left bg-white hover:bg-gray-50 flex items-center justify-between"
        >
          <span className="truncate">{selectedTablePriceLabel}</span>
          <div className="flex items-center gap-1">
            <svg
              className={`w-4 h-4 transition-transform ${isTablePriceOpen ? "rotate-180" : ""
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

        {isTablePriceOpen && (
          <div className="absolute top-full left-0 mt-1 w-24 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-80 overflow-hidden">
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                value={tablePriceSearch}
                onChange={(e) => setTablePriceSearch(e.target.value)}
                placeholder="Buscar tabela..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="max-h-60 overflow-y-auto">
              {filteredTablePrices.length === 0 ? (
                <div className="text-sm text-gray-500 p-3 text-center">
                  Nenhuma tabela encontrada
                </div>
              ) : (
                filteredTablePrices.map((t) => (
                  <button
                    key={t.code}
                    onClick={() => {
                      setSelectedTablePrice(t.code);
                      setIsTablePriceOpen(false);
                      setTablePriceSearch("");
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${selectedTablePrice === t.code
                      ? "bg-indigo-50 text-indigo-700"
                      : ""
                      }`}
                  >
                    <span className="truncate">{t.code}</span>
                    {selectedTablePrice === t.code && (
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

            <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-500">
                {filteredTablePrices.length} de {tablePriceFilters.length}{" "}
                tabelas
              </div>
            </div>
          </div>
        )}
      </div>
      {/* 🔽 Inputs de Margem (%) e Markup (%) */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">
          Margem (%)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={marginPercent}
          onChange={(e) => setMarginPercent(e.target.value)}
          placeholder="ex: 15"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-28 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">
          Markup (%)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={markupPercent}
          onChange={(e) => setMarkupPercent(e.target.value)}
          placeholder="ex: 25"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-28 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
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
            className={`w-4 h-4 transition-transform ${isColumnDropdownOpen ? "rotate-180" : ""
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
                          onToggleColumnVisibility?.(column.id);
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 flex-1">
                        {column.header}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${!isVisible
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
<<<<<<< HEAD
        className={`px-3 py-2  rounded-md text-sm font-medium  cursor-pointer transition-colors flex items-center gap-2 ${selectedCount > 0
=======
        className={`px-4 py-2 rounded-md text-sm font-medium h-10 cursor-pointer transition-colors flex items-center gap-2 ${selectedCount > 0
>>>>>>> cac04206a31f8d28067d46f65b29789aadedd7cf
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
        Alterar Preço
      </button>
    </div>
  );
}
