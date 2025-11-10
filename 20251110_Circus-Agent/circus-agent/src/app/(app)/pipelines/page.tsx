import { PipelineBoard } from "@/components/pipelines/pipeline-board";

export default function PipelinesPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-blue-600">選考管理</p>
        <h1 className="text-3xl font-bold text-slate-900">パイプライン</h1>
        <p className="text-sm text-slate-500">
          候補者と求人の最新ステージを俯瞰し、案件のボトルネックを把握できます。
        </p>
      </div>

      <PipelineBoard />
    </div>
  );
}
