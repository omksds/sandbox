import { prisma } from "@/lib/prisma";
import {
  ApplicationStage,
  PipelineCard,
  PipelineColumn,
  Candidate,
  Job,
} from "@/lib/domain/types";
import { pipelineStageMeta } from "@/lib/domain/constants";
import type {
  Application as PrismaApplication,
  ApplicationStage as PrismaApplicationStage,
  Candidate as PrismaCandidate,
  Agent,
  Job as PrismaJob,
  Company,
  JobTag,
} from "@prisma/client";
import { candidateRepository } from "./candidate-repository";
import { jobRepository } from "./job-repository";

/**
 * Prisma ApplicationStageをアプリケーション型に変換
 */
function toApplicationStage(
  stage: PrismaApplicationStage,
): ApplicationStage {
  const mapping: Record<PrismaApplicationStage, ApplicationStage> = {
    SCREENING: "screening",
    DOCUMENT: "document",
    FIRST_INTERVIEW: "firstInterview",
    SECOND_INTERVIEW: "secondInterview",
    OFFER: "offer",
    HIRED: "hired",
    REJECTED: "rejected",
  };
  return mapping[stage];
}

/**
 * アプリケーションのApplicationStageをPrisma型に変換
 */
function toPrismaApplicationStage(
  stage: ApplicationStage,
): PrismaApplicationStage {
  const mapping: Record<ApplicationStage, PrismaApplicationStage> = {
    screening: "SCREENING",
    document: "DOCUMENT",
    firstInterview: "FIRST_INTERVIEW",
    secondInterview: "SECOND_INTERVIEW",
    offer: "OFFER",
    hired: "HIRED",
    rejected: "REJECTED",
  };
  return mapping[stage];
}

export const pipelineRepository = {
  /**
   * パイプラインのカラム（ステージ別）とそのアプリケーションを取得
   */
  async getColumns(): Promise<PipelineColumn[]> {
    // 初期化：全ステージのカラムを作成
    const grouped: Record<ApplicationStage, PipelineColumn> = Object.keys(
      pipelineStageMeta,
    ).reduce((acc, stageKey) => {
      const stage = stageKey as ApplicationStage;
      acc[stage] = {
        stage,
        label: pipelineStageMeta[stage].label,
        applications: [],
      };
      return acc;
    }, {} as Record<ApplicationStage, PipelineColumn>);

    // アプリケーションを取得
    const applications = await prisma.application.findMany({
      include: {
        candidate: {
          include: {
            owner: true,
          },
        },
        job: {
          include: {
            company: true,
            tags: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // 各アプリケーションをパイプラインカードに変換して配置
    for (const app of applications) {
      const stage = toApplicationStage(app.stage);

      // Candidateを変換
      const candidate: Candidate = {
        id: app.candidate.id,
        name: `${app.candidate.firstName} ${app.candidate.lastName}`,
        kana: app.candidate.kana || "",
        email: app.candidate.email,
        phone: app.candidate.phone || "",
        location: app.candidate.location || "",
        status: app.candidate.status.toLowerCase() as any,
        headline: app.candidate.currentTitle || "",
        experienceYears: app.candidate.experienceYears || 0,
        currentCompany: app.candidate.currentCompany || "",
        currentTitle: app.candidate.currentTitle || "",
        desiredRoles: app.candidate.desiredRoles,
        desiredAnnualSalary: app.candidate.desiredSalaryJPY || 0,
        noticePeriodDays: app.candidate.noticePeriodDays,
        updatedAt: app.candidate.updatedAt.toISOString(),
        labels: [],
        skills: [],
        owner: app.candidate.owner.name,
        lastContactAt: app.candidate.updatedAt.toISOString(),
      };

      // Jobを変換
      const job: Job = {
        id: app.job.id,
        title: app.job.title,
        companyName: app.job.company.name,
        companySize: app.job.company.headcount
          ? `${app.job.company.headcount}名`
          : "非公開",
        location: app.job.location,
        compensationRange: `${app.job.compensationMin || 0}万円〜${app.job.compensationMax || 0}万円`,
        employmentType: app.job.employmentType.toLowerCase().replace("_", "-") as any,
        status: app.job.status.toLowerCase() as any,
        hotScore: 0,
        category: app.job.tags[0]?.name || "未分類",
        tags: app.job.tags.map((tag) => tag.name),
        updatedAt: app.job.updatedAt.toISOString(),
        description: app.job.description,
        remoteFriendly: app.job.remoteFriendly,
        urgent: app.job.urgent,
        openings: 1,
        avgTimeToOfferDays: 30,
        successRate: 0.5,
      };

      // PipelineCardを作成
      const card: PipelineCard = {
        id: app.id,
        candidateId: app.candidateId,
        jobId: app.jobId,
        stage,
        status: app.status.toLowerCase() as any,
        lastActionAt: app.updatedAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
        probability: Number(app.probability),
        candidate,
        job,
      };

      grouped[stage]?.applications.push(card);
    }

    return Object.values(grouped);
  },

  /**
   * アプリケーションIDから詳細情報を取得
   */
  async enrichApplication(
    applicationId: string,
  ): Promise<PipelineCard | null> {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        candidate: {
          include: {
            owner: true,
          },
        },
        job: {
          include: {
            company: true,
            tags: true,
          },
        },
      },
    });

    if (!app) return null;

    const stage = toApplicationStage(app.stage);

    const candidate = await candidateRepository.getById(app.candidateId);
    const job = await jobRepository.getById(app.jobId);

    return {
      id: app.id,
      candidateId: app.candidateId,
      jobId: app.jobId,
      stage,
      status: app.status.toLowerCase() as any,
      lastActionAt: app.updatedAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
      probability: Number(app.probability),
      candidate: candidate || undefined,
      job: job || undefined,
    };
  },

  /**
   * アプリケーションのステージを更新
   */
  async updateStage(
    applicationId: string,
    newStage: ApplicationStage,
  ): Promise<void> {
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        stage: toPrismaApplicationStage(newStage),
      },
    });
  },
};
