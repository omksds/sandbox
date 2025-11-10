import { jobRepository } from "@/lib/repositories/job-repository";
import type { EmploymentType } from "@/lib/domain/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get("q") ?? undefined;
  const categories = searchParams.getAll("category");
  const employmentType = searchParams.get("employmentType") as
    | EmploymentType
    | null;
  const remoteOnly = searchParams.get("remoteOnly") === "true";

  const data = await jobRepository.findMany({
    keyword,
    categories: categories.length ? categories : undefined,
    employmentType: employmentType ?? undefined,
    remoteOnly,
  });

  return NextResponse.json({ data });
}
