"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { pipelineStageMeta } from "@/lib/domain/constants";
import type { PipelineColumn, PipelineCard, ApplicationStage } from "@/lib/domain/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function PipelineBoard() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<{ columns: PipelineColumn[] }>({
    queryKey: ["pipelines"],
    queryFn: async () => {
      const response = await fetch("/api/pipelines", { cache: "no-store" });
      return response.json();
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({
      applicationId,
      newStage,
    }: {
      applicationId: string;
      newStage: ApplicationStage;
    }) => {
      const response = await fetch(`/api/pipelines/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      if (!response.ok) throw new Error("Failed to update stage");
      return response.json();
    },
    onSuccess: () => {
      // データを再取得
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
    },
  });

  const [columns, setColumns] = useState<PipelineColumn[]>(data?.columns || []);

  // データが更新されたら、ローカルステートも更新
  if (data?.columns && columns.length === 0) {
    setColumns(data.columns);
  }

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // ドロップ先がない場合は何もしない
    if (!destination) return;

    // 同じ場所にドロップした場合は何もしない
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceStage = source.droppableId as ApplicationStage;
    const destStage = destination.droppableId as ApplicationStage;

    // カラムを更新
    const newColumns = [...columns];
    const sourceColumn = newColumns.find((col) => col.stage === sourceStage);
    const destColumn = newColumns.find((col) => col.stage === destStage);

    if (!sourceColumn || !destColumn) return;

    // アプリケーションを移動
    const [movedApp] = sourceColumn.applications.splice(source.index, 1);
    destColumn.applications.splice(destination.index, 0, movedApp);

    setColumns(newColumns);

    // APIでステージを更新
    updateStageMutation.mutate({
      applicationId: draggableId,
      newStage: destStage,
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        選考状況を読み込んでいます...
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div
            key={column.stage}
            className="min-w-[320px] flex-shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-600">
                {pipelineStageMeta[column.stage].label}
              </p>
              <span className="text-xs font-semibold text-slate-400">
                {column.applications.length} 件
              </span>
            </div>

            <Droppable droppableId={column.stage}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`mt-4 min-h-[200px] space-y-3 rounded-lg p-2 transition-colors ${
                    snapshot.isDraggingOver ? "bg-blue-50/50" : ""
                  }`}
                >
                  {column.applications.map((application, index) => (
                    <Draggable
                      key={application.id}
                      draggableId={application.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`rounded-xl border border-slate-100 bg-white p-4 transition-shadow ${
                            snapshot.isDragging
                              ? "shadow-lg ring-2 ring-blue-500"
                              : "hover:shadow-md"
                          }`}
                        >
                          <p className="text-sm font-semibold text-slate-900">
                            {application.candidate?.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {application.job?.title} /{" "}
                            {application.job?.companyName}
                          </p>
                          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                            <span>
                              更新:{" "}
                              {new Date(
                                application.updatedAt,
                              ).toLocaleDateString("ja-JP")}
                            </span>
                            <span className="font-semibold text-slate-900">
                              {(application.probability * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}

                  {column.applications.length === 0 && (
                    <p className="text-xs text-slate-400">
                      まだこのステージの候補者はいません。
                    </p>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
