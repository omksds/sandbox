import { NextResponse } from "next/server";
import { candidateRepository } from "@/lib/repositories/candidate-repository";

type Params = {
  params: { id: string };
};

export async function GET(_: Request, { params }: Params) {
  const candidate = await candidateRepository.getById(params.id);
  if (!candidate) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const notes = await candidateRepository.getNotes(params.id);
  return NextResponse.json({ candidate, notes });
}
