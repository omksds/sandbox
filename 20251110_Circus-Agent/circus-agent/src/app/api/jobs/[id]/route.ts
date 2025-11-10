import { NextResponse } from "next/server";
import { jobRepository } from "@/lib/repositories/job-repository";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const job = await jobRepository.getById(id);

  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ job });
}

