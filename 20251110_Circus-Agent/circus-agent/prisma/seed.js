// Seed demo data for Cube Agent
// Run: npx prisma db seed
const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function upsertAgent({ email, name, organization, role = "AGENT" }) {
  const passwordHash = await hash("password123", 12);
  const agent = await prisma.agent.upsert({
    where: { email },
    update: {
      name,
      organization,
      role,
      passwordHash,
    },
    create: {
      email,
      name,
      organization,
      role,
      passwordHash,
    },
  });
  return agent;
}

async function main() {
  // Agents (users)
  const akira = await upsertAgent({
    email: "akira@circus.agency",
    name: "Akira",
    organization: "Cube Agency",
  });
  const yuna = await upsertAgent({
    email: "yuna@circus.agency",
    name: "Yuna",
    organization: "Cube Agency",
  });

  // Company (name is not unique → emulate upsert)
  let company =
    (await prisma.company.findFirst({
      where: { name: "株式会社テックカンパニー" },
    })) ??
    (await prisma.company.create({
      data: {
        name: "株式会社テックカンパニー",
        website: "https://example.com",
        headcount: 500,
        industry: "IT/ソフトウェア",
      },
    }));

  // Job Tags
  const tagRemote = await prisma.jobTag.upsert({
    where: { name: "リモートOK" },
    update: {},
    create: { name: "リモートOK" },
  });
  const tagBeginner = await prisma.jobTag.upsert({
    where: { name: "未経験OK" },
    update: {},
    create: { name: "未経験OK" },
  });

  // Jobs
  const job1 = await prisma.job.create({
    data: {
      companyId: company.id,
      title: "シニアフロントエンドエンジニア",
      summary: "React/Next.jsでの開発をリードできる方を募集します。",
      description:
        "Next.js, TypeScript を用いた大規模フロントエンドの設計・実装・レビューを担当します。",
      location: "東京 / リモート可",
      compensationMin: 600,
      compensationMax: 1000,
      employmentType: "FULL_TIME",
      status: "OPEN",
      remoteFriendly: true,
      urgent: false,
      tags: { connect: [{ id: tagRemote.id }, { id: tagBeginner.id }] },
    },
  });

  const job2 = await prisma.job.create({
    data: {
      companyId: company.id,
      title: "バックエンドエンジニア",
      summary: "Prisma / PostgreSQL 経験者歓迎",
      description:
        "Node.js, Prisma, PostgreSQL を中心としたバックエンド開発を担当します。",
      location: "東京",
      compensationMin: 500,
      compensationMax: 900,
      employmentType: "FULL_TIME",
      status: "OPEN",
      remoteFriendly: false,
      urgent: true,
      tags: { connect: [{ id: tagRemote.id }] },
    },
  });

  // Candidates
  const c1 = await prisma.candidate.create({
    data: {
      firstName: "太郎",
      lastName: "山田",
      kana: "ヤマダ タロウ",
      email: "taro.yamada@example.com",
      phone: "090-1111-2222",
      location: "神奈川",
      status: "SCREENING",
      experienceYears: 5,
      currentCompany: "株式会社サンプル",
      currentTitle: "フロントエンドエンジニア",
      desiredRoles: ["フロントエンド", "UI開発"],
      desiredSalaryJPY: 800,
      noticePeriodDays: 30,
      ownerId: akira.id,
    },
  });
  const c2 = await prisma.candidate.create({
    data: {
      firstName: "花子",
      lastName: "佐藤",
      kana: "サトウ ハナコ",
      email: "hanako.sato@example.com",
      phone: "080-3333-4444",
      location: "東京",
      status: "SUBMITTED",
      experienceYears: 3,
      currentCompany: "株式会社デモ",
      currentTitle: "バックエンドエンジニア",
      desiredRoles: ["バックエンド"],
      desiredSalaryJPY: 700,
      noticePeriodDays: 30,
      ownerId: akira.id,
    },
  });
  const c3 = await prisma.candidate.create({
    data: {
      firstName: "一郎",
      lastName: "鈴木",
      kana: "スズキ イチロウ",
      email: "ichiro.suzuki@example.com",
      phone: "070-5555-6666",
      location: "大阪",
      status: "INTERVIEW",
      experienceYears: 8,
      currentCompany: "株式会社テスト",
      currentTitle: "フルスタックエンジニア",
      desiredRoles: ["フルスタック"],
      desiredSalaryJPY: 900,
      noticePeriodDays: 30,
      ownerId: yuna.id,
    },
  });

  // Applications (pipeline)
  await prisma.application.createMany({
    data: [
      {
        candidateId: c1.id,
        jobId: job1.id,
        stage: "SCREENING",
        status: "ACTIVE",
        probability: 0.2,
      },
      {
        candidateId: c2.id,
        jobId: job1.id,
        stage: "FIRST_INTERVIEW",
        status: "ACTIVE",
        probability: 0.5,
      },
      {
        candidateId: c3.id,
        jobId: job2.id,
        stage: "OFFER",
        status: "ACTIVE",
        probability: 0.8,
      },
    ],
  });

  // Project + relations
  const project = await prisma.project.create({
    data: {
      name: "保存案件 - Akiraさん向け",
      description: "候補者に提案予定の求人セット",
      ownerId: akira.id,
    },
  });
  // Link job to project
  await prisma.projectJob.create({
    data: {
      projectId: project.id,
      jobId: job1.id,
    },
  });
  // Link candidate to project
  await prisma.candidateOnProject.create({
    data: {
      projectId: project.id,
      candidateId: c1.id,
    },
  });

  // Candidate notes
  await prisma.candidateNote.createMany({
    data: [
      {
        candidateId: c1.id,
        authorId: akira.id,
        body: "一次接触済み。現職はリモート/フレックス、React経験5年。",
      },
      {
        candidateId: c2.id,
        authorId: akira.id,
        body: "推薦済み。一次面接の調整中（来週水曜）。",
      },
    ],
  });

  // Announcements
  await prisma.announcement.createMany({
    data: [
      {
        title: "システムメンテナンスのお知らせ",
        body: "今週金曜 22:00-24:00 に計画メンテナンスを実施します。",
        severity: "INFO",
      },
      {
        title: "重要: 個人情報の取り扱い強化",
        body: "セキュリティポリシー更新に伴い、取り扱い手順を順守してください。",
        severity: "WARNING",
      },
    ],
  });

  console.log("✅ Seed completed: agents, company, tags, jobs, candidates, applications, project, notes, announcements");
  console.log("   Demo sign-in accounts: akira@circus.agency / yuna@circus.agency (password: password123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


