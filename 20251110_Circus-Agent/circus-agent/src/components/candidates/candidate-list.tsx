"use client";

import { candidateStatusOptions } from "@/lib/domain/constants";
import type { Candidate, CandidateStatus } from "@/lib/domain/types";
import { cn } from "@/lib/utils/cn";
import { useCandidateFilterStore } from "@/stores/filter-store";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

export function CandidateList() {
  const { keyword, statuses, setKeyword, setStatuses } =
    useCandidateFilterStore();

  const form = useForm<{
    keyword?: string;
    statuses?: CandidateStatus[];
  }>({
    defaultValues: {
      keyword,
      statuses,
    },
  });

  useEffect(() => {
    form.setValue("statuses", statuses);
  }, [statuses, form]);

  const queryKey = useMemo(() => {
    const keyStatuses = [...statuses].sort().join(",");
    return ["candidates", keyword, keyStatuses];
  }, [keyword, statuses]);

  const { data, isLoading } = useQuery<{ data: Candidate[] }>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (keyword) params.set("q", keyword);
      statuses.forEach((status) => params.append("status", status));
      const res = await fetch(`/api/candidates?${params.toString()}`, {
        cache: "no-store",
      });
      return res.json();
    },
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <form className="grid gap-6 md:grid-cols-3" data-testid="candidate-filter-form">
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-slate-600">
            キーワード
          </label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="氏名 / スキル / メールアドレス..."
            {...form.register("keyword", {
              onChange: (event) => setKeyword(event.target.value),
            })}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600">
            ステータス
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {candidateStatusOptions.map((option) => {
              const selected = statuses.includes(option.value);
              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => {
                    const current = new Set(form.getValues("statuses") ?? []);
                    if (current.has(option.value)) {
                      current.delete(option.value);
                    } else {
                      current.add(option.value);
                    }
                    const next = Array.from(current) as CandidateStatus[];
                    form.setValue("statuses", next);
                    setStatuses(next);
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold transition",
                    selected
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-300",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </form>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">氏名</th>
              <th className="px-4 py-3">状況</th>
              <th className="px-4 py-3">スキル</th>
              <th className="px-4 py-3">最終更新</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  取得中...
                </td>
              </tr>
            )}
            {!isLoading && data?.data.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  条件に一致する候補者がいません。
                </td>
              </tr>
            )}
            {!isLoading &&
              data?.data.map((candidate) => (
                <tr
                  key={candidate.id}
                  className="border-t border-slate-100 text-slate-700 hover:bg-blue-50/40"
                >
                  <td className="px-4 py-4">
                    <Link
                      href={`/candidates/${candidate.id}`}
                      className="font-semibold text-slate-900 hover:text-blue-600"
                    >
                      {candidate.name}
                    </Link>
                    <div className="text-xs text-slate-500">
                      {candidate.headline}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {
                        candidateStatusOptions.find(
                          (option) => option.value === candidate.status,
                        )?.label
                      }
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-500">
                    {new Date(candidate.updatedAt).toLocaleDateString("ja-JP")}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
