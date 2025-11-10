import { candidateRepository } from "@/lib/repositories/candidate-repository";
import { candidateStatusOptions } from "@/lib/domain/constants";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Params = { params: Promise<{ id: string }> };

export default async function CandidateDetailPage({ params }: Params) {
  const { id } = await params;
  const candidate = await candidateRepository.getById(id);
  if (!candidate) {
    notFound();
  }
  const notes = await candidateRepository.getNotes(id);

  const statusLabel =
    candidateStatusOptions.find((option) => option.value === candidate.status)
      ?.label ?? candidate.status;

  return (
    <div className="space-y-6">
      <Link
        href="/candidates"
        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" />
        一覧に戻る
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              {candidate.currentTitle} @ {candidate.currentCompany}
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              {candidate.name}
            </h1>
            <p className="text-sm text-slate-500">{candidate.headline}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">担当:</p>
            <p className="text-lg font-semibold text-slate-900">
              {candidate.owner}
            </p>
            <span className="mt-2 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">
              連絡先
            </p>
            <p className="mt-1 text-sm text-slate-600">{candidate.email}</p>
            <p className="text-sm text-slate-600">{candidate.phone}</p>
            <p className="text-sm text-slate-600">居住地: {candidate.location}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">
              希望条件
            </p>
            <p className="mt-1 text-sm text-slate-600">
              目標年収: {candidate.desiredAnnualSalary}万円
            </p>
            <p className="text-sm text-slate-600">
              希望ポジション:{" "}
              {Array.isArray(candidate.desiredRoles) &&
              candidate.desiredRoles.length > 0
                ? candidate.desiredRoles.join(" / ")
                : "-"}
            </p>
            <p className="text-sm text-slate-600">
              退職予告期間: {candidate.noticePeriodDays}日
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">
              スキル
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {candidate.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          コミュニケーションログ
        </h2>
        <div className="mt-4 space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{note.author}</span>
                <span>
                  {new Date(note.createdAt).toLocaleString("ja-JP", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{note.body}</p>
            </div>
          ))}
          {notes.length === 0 && (
            <p className="text-sm text-slate-500">
              まだノートが登録されていません。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
