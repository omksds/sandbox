import { dashboardRepository } from "@/lib/repositories/dashboard-repository";
import { productIdentity } from "@/config/product";
import { Sparkles, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { KpiTrendChart } from "@/components/dashboard/kpi-trend-chart";
import { SuccessRateChart } from "@/components/dashboard/success-rate-chart";

export default async function DashboardPage() {
  const snapshot = await dashboardRepository.getSnapshot();

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-10 text-white shadow-lg">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-300">
          Overview
        </p>
        <h1 className="mt-2 text-3xl font-bold">
          {productIdentity.shortName} ワークスペース
        </h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          新着求人、HOTカテゴリ、事務局のお知らせをまとめて確認し、エージェント業務を最短距離で進められます。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {Object.entries(snapshot.kpis).map(([key, value]) => (
          <div
            key={key}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">
              {kpiLabel[key as keyof typeof snapshot.kpis]}
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400">今週</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              ファネル進捗
            </h2>
            <Sparkles className="h-5 w-5 text-amber-500" />
          </div>
          <div className="mt-6">
            <FunnelChart data={snapshot.funnel} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">成約率</h2>
          <div className="mt-4">
            <SuccessRateChart />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            KPIトレンド（過去5週間）
          </h2>
          <span className="text-sm text-slate-500">週次推移</span>
        </div>
        <div className="mt-6">
          <KpiTrendChart />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">カテゴリ特集</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {snapshot.categoryShortcuts.map((category) => (
            <button
              key={category}
              className="rounded-full border border-slate-200 px-4 py-1.5 text-sm text-slate-600 transition hover:border-blue-500 hover:text-blue-600"
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              新着・注目求人
            </h2>
            <span className="text-sm text-slate-500">更新: 今日</span>
          </div>
          <div className="mt-6 space-y-4">
            {snapshot.newJobs.map((job) => (
              <div
                key={job.id}
                className="rounded-xl border border-slate-100 p-4 transition hover:border-blue-200 hover:bg-blue-50/30"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-blue-600">
                      {job.companyName}
                    </p>
                    <h3 className="text-lg font-bold text-slate-900">
                      {job.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.compensationRange}</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-600">{job.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              事務局からのお知らせ
            </h2>
            <div className="mt-4 space-y-4">
              {snapshot.announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
                >
                  <p className="text-xs uppercase tracking-widest text-slate-400">
                    {new Date(announcement.publishedAt).toLocaleDateString(
                      "ja-JP",
                    )}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-slate-900">
                    {announcement.title}
                  </h3>
                  <p className="text-sm text-slate-600">{announcement.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              保存したプロジェクト
            </h2>
            <div className="mt-4 space-y-4">
              {snapshot.projects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-xl border border-slate-100 p-4"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {project.name}
                  </p>
                  <p className="text-xs text-slate-500">{project.description}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                    <span>求人 {project.jobCount} 件</span>
                    <span>候補者 {project.candidateCount} 名</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const kpiLabel: Record<string, string> = {
  activeCandidates: "アクティブ候補者",
  interviewsThisWeek: "今週の面接",
  offersPending: "オファー待ち",
  placements: "成約",
};
