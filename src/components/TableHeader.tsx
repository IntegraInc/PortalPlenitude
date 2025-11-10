import { FiltersData } from "@/app/types/filterTypes";

interface TableHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedFamilia: string;
  setSelectedFamilia: (familia: string) => void;
  filters: FiltersData;
  selectedCount: number;
  clearPersistedColumnOrder: () => void;
  onOpenModal: () => void;
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
}: TableHeaderProps) {
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
          <option value="">Todas</option>
          {filters.family.map((f) => (
            <option key={f.code} value={f.code}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {/* Botão resetar colunas */}
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
        Resetar Colunas
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
