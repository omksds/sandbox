import { NextResponse, type NextRequest } from "next/server";
import { candidateRepository } from "@/lib/repositories/candidate-repository";
import type { CandidateStatus } from "@/lib/domain/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get("q") ?? undefined;
  const statuses = searchParams.getAll("status") as CandidateStatus[];

  const data = await candidateRepository.findMany({
    keyword,
    statuses: statuses.length ? statuses : undefined,
  });
  return NextResponse.json({ data });
}
