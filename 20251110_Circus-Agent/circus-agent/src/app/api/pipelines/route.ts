import { pipelineRepository } from "@/lib/repositories/pipeline-repository";
import { NextResponse } from "next/server";

export async function GET() {
  const columns = await pipelineRepository.getColumns();
  return NextResponse.json({ columns });
}
