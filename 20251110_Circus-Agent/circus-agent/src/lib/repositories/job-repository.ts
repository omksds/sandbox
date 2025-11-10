import { prisma } from "@/lib/prisma";
import type { EmploymentType, Job, JobStatus } from "@/lib/domain/types";
import type {
  Job as PrismaJob,
  Company,
  JobStatus as PrismaJobStatus,
  EmploymentType as PrismaEmploymentType,
  JobTag,
} from "@prisma/client";

export type JobFilter = {
  keyword?: string;
  categories?: string[];
  status?: JobStatus;
  employmentType?: EmploymentType;
  remoteOnly?: boolean;
};

type JobWithCompanyAndTags = PrismaJob & {
  company: Company;
  tags: JobTag[];
};

/**
 * Prisma JobStatusをアプリケーション型に変換
 */
function toJobStatus(status: PrismaJobStatus): JobStatus {
  const mapping: Record<PrismaJobStatus, JobStatus> = {
    OPEN: "open",
    PAUSED: "paused",
    CLOSED: "closed",
  };
  return mapping[status];
}

/**
 * アプリケーションのJobStatusをPrisma型に変換
 */
function toPrismaJobStatus(status: JobStatus): PrismaJobStatus {
  const mapping: Record<JobStatus, PrismaJobStatus> = {
    open: "OPEN",
    paused: "PAUSED",
    closed: "CLOSED",
  };
  return mapping[status];
}

/**
 * Prisma EmploymentTypeをアプリケーション型に変換
 */
function toEmploymentType(
  type: PrismaEmploymentType,
): EmploymentType {
  const mapping: Record<PrismaEmploymentType, EmploymentType> = {
    FULL_TIME: "full-time",
    CONTRACT: "contract",
    TEMPORARY: "temporary",
    INTERNSHIP: "internship",
  };
  return mapping[type];
}

/**
 * アプリケーションのEmploymentTypeをPrisma型に変換
 */
function toPrismaEmploymentType(
  type: EmploymentType,
): PrismaEmploymentType {
  const mapping: Record<EmploymentType, PrismaEmploymentType> = {
    "full-time": "FULL_TIME",
    contract: "CONTRACT",
    temporary: "TEMPORARY",
    internship: "INTERNSHIP",
  };
  return mapping[type];
}

/**
 * PrismaのJobをアプリケーション型に変換
 */
function toJob(job: JobWithCompanyAndTags): Job {
  const compensationMin = job.compensationMin || 0;
  const compensationMax = job.compensationMax || 0;

  return {
    id: job.id,
    title: job.title,
    companyName: job.company.name,
    companySize: job.company.headcount
      ? `${job.company.headcount}名`
      : "非公開",
    location: job.location,
    compensationRange: `${compensationMin}万円〜${compensationMax}万円`,
    employmentType: toEmploymentType(job.employmentType),
    status: toJobStatus(job.status),
    hotScore: 0, // TODO: implement hot score calculation
    category: job.tags[0]?.name || "未分類",
    tags: job.tags.map((tag) => tag.name),
    updatedAt: job.updatedAt.toISOString(),
    description: job.description,
    remoteFriendly: job.remoteFriendly,
    urgent: job.urgent,
    openings: 1, // TODO: implement openings field
    avgTimeToOfferDays: 30, // TODO: calculate from applications
    successRate: 0.5, // TODO: calculate from applications
  };
}

export const jobRepository = {
  /**
   * 求人一覧を取得（フィルタ機能付き）
   */
  async findMany(filter: JobFilter = {}): Promise<Job[]> {
    const where: any = {};

    // キーワード検索
    if (filter.keyword) {
      where.OR = [
        { title: { contains: filter.keyword, mode: "insensitive" } },
        { description: { contains: filter.keyword, mode: "insensitive" } },
        { location: { contains: filter.keyword, mode: "insensitive" } },
        { company: { name: { contains: filter.keyword, mode: "insensitive" } } },
      ];
    }

    // カテゴリフィルター（タグで実装）
    if (filter.categories?.length) {
      where.tags = {
        some: {
          name: { in: filter.categories },
        },
      };
    }

    // ステータスフィルター
    if (filter.status) {
      where.status = toPrismaJobStatus(filter.status);
    }

    // 雇用形態フィルター
    if (filter.employmentType) {
      where.employmentType = toPrismaEmploymentType(filter.employmentType);
    }

    // リモート勤務フィルター
    if (filter.remoteOnly) {
      where.remoteFriendly = true;
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        company: true,
        tags: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return jobs.map(toJob);
  },

  /**
   * IDで求人を取得
   */
  async getById(id: string): Promise<Job | null> {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
        tags: true,
      },
    });

    if (!job) return null;
    return toJob(job);
  },

  /**
   * HOT求人を取得
   */
  async getHotJobs(limit: number = 20): Promise<Job[]> {
    const jobs = await prisma.job.findMany({
      where: {
        status: "OPEN",
        // TODO: add hot ranking filter
      },
      include: {
        company: true,
        tags: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: limit,
    });

    return jobs.map(toJob);
  },

  /**
   * 最新求人を取得
   */
  async getLatest(limit: number = 10): Promise<Job[]> {
    const jobs = await prisma.job.findMany({
      where: {
        status: "OPEN",
      },
      include: {
        company: true,
        tags: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return jobs.map(toJob);
  },
};
