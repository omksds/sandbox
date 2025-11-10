import { NextResponse } from "next/server";
import { pipelineRepository } from "@/lib/repositories/pipeline-repository";
import type { ApplicationStage } from "@/lib/domain/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { stage } = body as { stage: ApplicationStage };

    if (!stage) {
      return NextResponse.json(
        { error: "Stage is required" },
        { status: 400 }
      );
    }

    // パイプラインのステージを更新
    await pipelineRepository.updateStage(id, stage);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating pipeline stage:", error);
    return NextResponse.json(
      { error: "Failed to update stage" },
      { status: 500 }
    );
  }
}

