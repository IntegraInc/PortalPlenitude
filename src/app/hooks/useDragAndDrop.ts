import { useState } from "react";

export function useDragAndDrop() {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);

  const handleDragStart = (event: React.DragEvent, columnId: string) => {
    setIsDragging(true);
    setDraggedColumn(columnId);
    event.dataTransfer.setData("text/plain", columnId);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOverColumn(null);
    setDraggedColumn(null);
  };

  const handleDragOver = (event: React.DragEvent, targetColumnId: string) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (targetColumnId !== draggedColumn) {
      setDragOverColumn(targetColumnId);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (
    event: React.DragEvent,
    targetColumnId: string,
    columnOrder: string[],
    setColumnOrder: (order: string[]) => void
  ) => {
    event.preventDefault();
    const sourceColumnId = event.dataTransfer.getData("text/plain");

    setIsDragging(false);
    setDragOverColumn(null);
    setDraggedColumn(null);

    if (sourceColumnId === targetColumnId) return;

    const newOrder = [...columnOrder];
    const fromIndex = newOrder.indexOf(sourceColumnId);
    const toIndex = newOrder.indexOf(targetColumnId);

    newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, sourceColumnId);
    setColumnOrder(newOrder);
  };

  return {
    dragState: { dragOverColumn, isDragging, draggedColumn },
    dragHandlers: {
      handleDragStart,
      handleDragEnd,
      handleDragOver,
      handleDragLeave,
      handleDrop,
    },
  };
}
