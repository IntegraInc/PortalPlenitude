"use client";

interface TableFooterInfoProps {
  displayedItemsCount: number;
  selectedItemsCount: number;
  hasCustomColumnOrder?: boolean;
  isDragging?: boolean;
  showDragHint?: boolean;
  className?: string;
}

export default function TableFooterInfo({
  displayedItemsCount,
  selectedItemsCount,
  hasCustomColumnOrder = false,
  isDragging = false,
  showDragHint = true,
  className = "",
}: TableFooterInfoProps) {
  return (
    <div className={`flex justify-between items-center mt-3 ${className}`}>
      {/* Informações de contagem */}
      <p className="text-xs text-gray-500">
        {displayedItemsCount}{" "}
        {displayedItemsCount === 1 ? "produto exibido" : "produtos exibidos"} •{" "}
        {selectedItemsCount}{" "}
        {selectedItemsCount === 1 ? "selecionado" : "selecionados"}
        {hasCustomColumnOrder && " • Ordem das colunas personalizada"}
      </p>

      {/* Dica de uso - só mostra quando não está arrastando */}
      {!isDragging && showDragHint && (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <svg
            className="w-3 h-3 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Arraste os cabeçalhos para reorganizar as colunas
        </p>
      )}
    </div>
  );
}
