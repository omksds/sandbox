import { dashboardRepository } from "@/lib/repositories/dashboard-repository";
import { NextResponse } from "next/server";

export async function GET() {
  const snapshot = await dashboardRepository.getSnapshot();
  return NextResponse.json({ snapshot });
}
