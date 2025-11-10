import { JobSearchPanel } from "@/components/jobs/job-search-panel";

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-blue-600">求人検索</p>
        <h1 className="text-3xl font-bold text-slate-900">案件キュレーション</h1>
        <p className="text-sm text-slate-500">
          カテゴリや緊急度を踏まえ、候補者にフィットする求人を素早く探せます。
        </p>
      </div>

      <JobSearchPanel />
    </div>
  );
}
