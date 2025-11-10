import { ApplicationStage, CandidateStatus } from "@/lib/domain/types";

export const candidateStatusOptions: {
  value: CandidateStatus;
  label: string;
}[] = [
  { value: "new", label: "新規" },
  { value: "screening", label: "スクリーニング" },
  { value: "submitted", label: "推薦済み" },
  { value: "interview", label: "面接中" },
  { value: "offer", label: "オファー" },
  { value: "placed", label: "成約" },
  { value: "archived", label: "アーカイブ" },
];

export const pipelineStageMeta: Record<
  ApplicationStage,
  { label: string; color: string }
> = {
  screening: { label: "書類確認", color: "bg-slate-100" },
  document: { label: "書類提出", color: "bg-sky-100" },
  firstInterview: { label: "一次面接", color: "bg-amber-100" },
  secondInterview: { label: "二次面接", color: "bg-orange-100" },
  offer: { label: "オファー", color: "bg-emerald-100" },
  hired: { label: "入社", color: "bg-emerald-200" },
  rejected: { label: "不合格", color: "bg-rose-100" },
};
