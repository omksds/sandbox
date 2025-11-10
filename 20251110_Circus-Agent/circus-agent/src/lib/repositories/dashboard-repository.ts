import { prisma } from "@/lib/prisma";
import { candidateRepository } from "@/lib/repositories/candidate-repository";
import { jobRepository } from "@/lib/repositories/job-repository";
import type { DashboardSnapshot, Announcement, Project } from "@/lib/domain/types";

export const dashboardRepository = {
  /**
   * ダッシュボードのスナップショットを取得
   */
  async getSnapshot(): Promise<DashboardSnapshot> {
    // 並列でデータを取得して高速化
    const [
      candidates,
      applicationsCount,
      interviewsCount,
      offersCount,
      placementsCount,
      screeningCount,
      documentCount,
      newJobs,
      announcements,
      projects,
    ] = await Promise.all([
      candidateRepository.findMany(),
      prisma.application.count(),
      prisma.application.count({
        where: {
          stage: {
            in: ["FIRST_INTERVIEW", "SECOND_INTERVIEW"],
          },
        },
      }),
      prisma.application.count({
        where: { stage: "OFFER" },
      }),
      prisma.application.count({
        where: { stage: "HIRED" },
      }),
      prisma.application.count({
        where: { stage: "SCREENING" },
      }),
      prisma.application.count({
        where: { stage: "DOCUMENT" },
      }),
      jobRepository.getLatest(3),
      // アナウンスメントを取得
      prisma.announcement.findMany({
        orderBy: { publishedAt: "desc" },
        take: 5,
      }),
      // プロジェクトを取得
      prisma.project.findMany({
        include: {
          jobs: true,
          candidates: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
    ]);

    // アナウンスメントを変換
    const formattedAnnouncements: Announcement[] = announcements.map((a) => ({
      id: a.id,
      title: a.title,
      body: a.body,
      severity: a.severity.toLowerCase() as "info" | "warning",
      publishedAt: a.publishedAt.toISOString(),
    }));

    // プロジェクトを変換
    const formattedProjects: Project[] = projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || "",
      jobCount: p.jobs.length,
      candidateCount: p.candidates.length,
      updatedAt: p.updatedAt.toISOString(),
    }));

    return {
      kpis: {
        activeCandidates: candidates.length,
        interviewsThisWeek: interviewsCount,
        offersPending: offersCount,
        placements: placementsCount,
      },
      funnel: [
        {
          label: "スクリーニング",
          value: screeningCount,
          trend: 0, // TODO: 前週比を計算
        },
        {
          label: "推薦済み",
          value: documentCount,
          trend: 0, // TODO: 前週比を計算
        },
        {
          label: "面接中",
          value: interviewsCount,
          trend: 0, // TODO: 前週比を計算
        },
        { label: "オファー", value: offersCount, trend: 0 },
      ],
      newJobs,
      announcements: formattedAnnouncements,
      projects: formattedProjects,
      categoryShortcuts: [
        "ハイクラス",
        "コンサルティング",
        "地方×リモート",
        "即戦力CS",
        "デザイン/UX",
      ],
    };
  },
};
