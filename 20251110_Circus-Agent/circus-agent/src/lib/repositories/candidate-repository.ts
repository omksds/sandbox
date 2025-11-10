import { prisma } from "@/lib/prisma";
import type {
  Candidate,
  CandidateNote,
  CandidateStatus,
} from "@/lib/domain/types";
import type {
  Candidate as PrismaCandidate,
  CandidateNote as PrismaCandidateNote,
  Agent,
  CandidateStatus as PrismaCandidateStatus,
} from "@prisma/client";

export type CandidateFilter = {
  keyword?: string;
  statuses?: CandidateStatus[];
  owner?: string;
};

type CandidateWithOwner = PrismaCandidate & {
  owner: Agent;
};

/**
 * Prisma CandidateStatusをアプリケーション型に変換
 */
function toCandidateStatus(status: PrismaCandidateStatus): CandidateStatus {
  const mapping: Record<PrismaCandidateStatus, CandidateStatus> = {
    NEW: "new",
    SCREENING: "screening",
    SUBMITTED: "submitted",
    INTERVIEW: "interview",
    OFFER: "offer",
    PLACED: "placed",
    ARCHIVED: "archived",
  };
  return mapping[status];
}

/**
 * アプリケーションのCandidateStatusをPrisma型に変換
 */
function toPrismaCandidateStatus(
  status: CandidateStatus,
): PrismaCandidateStatus {
  const mapping: Record<CandidateStatus, PrismaCandidateStatus> = {
    new: "NEW",
    screening: "SCREENING",
    submitted: "SUBMITTED",
    interview: "INTERVIEW",
    offer: "OFFER",
    placed: "PLACED",
    archived: "ARCHIVED",
  };
  return mapping[status];
}

/**
 * PrismaのCandidateをアプリケーション型に変換
 */
function toCandidate(candidate: CandidateWithOwner): Candidate {
  return {
    id: candidate.id,
    name: `${candidate.firstName} ${candidate.lastName}`,
    kana: candidate.kana || "",
    email: candidate.email,
    phone: candidate.phone || "",
    location: candidate.location || "",
    status: toCandidateStatus(candidate.status),
    headline: candidate.currentTitle || "",
    experienceYears: candidate.experienceYears || 0,
    currentCompany: candidate.currentCompany || "",
    currentTitle: candidate.currentTitle || "",
    desiredRoles: candidate.desiredRoles,
    desiredAnnualSalary: candidate.desiredSalaryJPY || 0,
    noticePeriodDays: candidate.noticePeriodDays,
    updatedAt: candidate.updatedAt.toISOString(),
    labels: [], // TODO: implement labels
    skills: [], // TODO: implement skills from JSON field
    owner: candidate.owner.name,
    lastContactAt: candidate.updatedAt.toISOString(),
  };
}

/**
 * PrismaのCandidateNoteをアプリケーション型に変換
 */
function toCandidateNote(
  note: PrismaCandidateNote & { author: Agent },
): CandidateNote {
  return {
    id: note.id,
    candidateId: note.candidateId,
    author: note.author.name,
    createdAt: note.createdAt.toISOString(),
    body: note.body,
  };
}

export const candidateRepository = {
  /**
   * 候補者一覧を取得（フィルタ機能付き）
   */
  async findMany(filter: CandidateFilter = {}): Promise<Candidate[]> {
    const where: any = {};

    // キーワード検索
    if (filter.keyword) {
      where.OR = [
        { firstName: { contains: filter.keyword, mode: "insensitive" } },
        { lastName: { contains: filter.keyword, mode: "insensitive" } },
        { kana: { contains: filter.keyword, mode: "insensitive" } },
        { email: { contains: filter.keyword, mode: "insensitive" } },
        { currentTitle: { contains: filter.keyword, mode: "insensitive" } },
        { currentCompany: { contains: filter.keyword, mode: "insensitive" } },
      ];
    }

    // ステータスフィルター
    if (filter.statuses?.length) {
      where.status = {
        in: filter.statuses.map(toPrismaCandidateStatus),
      };
    }

    // オーナーフィルター
    if (filter.owner) {
      where.owner = {
        name: filter.owner,
      };
    }

    const candidates = await prisma.candidate.findMany({
      where,
      include: {
        owner: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return candidates.map(toCandidate);
  },

  /**
   * IDで候補者を取得
   */
  async getById(id: string): Promise<Candidate | null> {
    if (!id) {
      return null;
    }
    const candidate = (await prisma.candidate.findUnique({
      where: { id },
      include: {
        owner: true,
      },
    })) as CandidateWithOwner | null;

    if (!candidate) return null;
    return toCandidate(candidate);
  },

  /**
   * 候補者のノート一覧を取得
   */
  async getNotes(candidateId: string): Promise<CandidateNote[]> {
    if (!candidateId) {
      return [];
    }
    const notes = await prisma.candidateNote.findMany({
      where: { candidateId },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return notes.map(toCandidateNote);
  },

  /**
   * 候補者を作成
   */
  async create(data: {
    firstName: string;
    lastName: string;
    kana?: string;
    email: string;
    phone?: string;
    location?: string;
    status: CandidateStatus;
    ownerId: string;
  }): Promise<Candidate> {
    const candidate = await prisma.candidate.create({
      data: {
        ...data,
        status: toPrismaCandidateStatus(data.status),
        desiredRoles: [],
      },
      include: {
        owner: true,
      },
    });

    return toCandidate(candidate);
  },

  /**
   * 候補者を更新
   */
  async update(
    id: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      kana: string;
      email: string;
      phone: string;
      location: string;
      status: CandidateStatus;
      currentCompany: string;
      currentTitle: string;
      experienceYears: number;
      desiredRoles: string[];
      desiredSalaryJPY: number;
    }>,
  ): Promise<Candidate> {
    const updateData: any = { ...data };
    if (data.status) {
      updateData.status = toPrismaCandidateStatus(data.status);
    }

    const candidate = await prisma.candidate.update({
      where: { id },
      data: updateData,
      include: {
        owner: true,
      },
    });

    return toCandidate(candidate);
  },

  /**
   * 候補者を削除
   */
  async delete(id: string): Promise<void> {
    await prisma.candidate.delete({
      where: { id },
    });
  },
};
