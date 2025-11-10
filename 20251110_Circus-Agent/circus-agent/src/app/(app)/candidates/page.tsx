import { CandidateList } from "@/components/candidates/candidate-list";

export default function CandidatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-blue-600">Talent CRM</p>
        <h1 className="text-3xl font-bold text-slate-900">求職者管理</h1>
        <p className="text-sm text-slate-500">
          候補者ステータスと直近の接触履歴を一元管理し、即時に推薦へつなげます。
        </p>
      </div>

      <CandidateList />
    </div>
  );
}
