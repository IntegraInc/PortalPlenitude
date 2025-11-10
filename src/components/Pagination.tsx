"use client";

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  currentItemsCount: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export default function Pagination({
  currentPage,
  pageSize,
  totalItems,
  totalPages,
  currentItemsCount,
  isLoading = false,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  // ✅ Geração de números de página CORRIGIDA
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 1) return [1];

    // Sempre mostra primeira página
    pages.push(1);

    // Lógica para páginas intermediárias
    if (currentPage > 3) {
      pages.push("...");
    }

    // Páginas ao redor da atual
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    // Adiciona "..." se necessário
    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    // Sempre mostra última página (se houver mais de 1 página)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages.filter(
      (page, index, array) => page === "..." || array.indexOf(page) === index
    );
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      {/* Informações da página */}
      <div className="text-sm text-gray-600">
        Mostrando {currentItemsCount} de {totalItems} produtos • Página{" "}
        {currentPage} de {totalPages}
      </div>

      {/* Controles de paginação */}
      <div className="flex items-center gap-2">
        {/* Seletor de itens por página */}
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          disabled={isLoading}
        >
          <option value="20">20 por página</option>
          <option value="50">50 por página</option>
          <option value="100">100 por página</option>
          <option value="200">200 por página</option>
        </select>

        {/* Botões de navegação */}
        <div className="flex items-center gap-1">
          {/* Primeira página */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1 || isLoading}
            className="px-3 py-1 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Primeira página"
          >
            «
          </button>

          {/* Página anterior */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="px-3 py-1 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Página anterior"
          >
            ‹
          </button>

          {/* Números de página */}
          {generatePageNumbers().map((page, index) => {
            const isCurrentPage = page === currentPage;
            const isNumber = typeof page === "number";

            return (
              <button
                key={index}
                onClick={() => isNumber && onPageChange(page)}
                disabled={!isNumber || isLoading}
                className={`px-3 py-1 rounded-md text-sm font-medium min-w-[40px] transition-colors ${
                  isCurrentPage
                    ? "bg-indigo-600 text-white border border-indigo-600 shadow-md font-semibold"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                } ${!isNumber ? "cursor-default hover:bg-white" : ""}`}
                title={isNumber ? `Ir para página ${page}` : "Mais páginas"}
              >
                {page}
              </button>
            );
          })}

          {/* Próxima página */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            className="px-3 py-1 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Próxima página"
          >
            ›
          </button>

          {/* Última página */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages || isLoading}
            className="px-3 py-1 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Última página"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}
