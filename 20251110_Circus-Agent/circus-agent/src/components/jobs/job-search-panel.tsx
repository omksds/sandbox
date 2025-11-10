"use client";

import type { Job } from "@/lib/domain/types";
import { cn } from "@/lib/utils/cn";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";

export function JobSearchPanel() {
  const [keyword, setKeyword] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);

  const { data, isLoading } = useQuery<{ data: Job[] }>({
    queryKey: ["jobs", keyword, remoteOnly],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (keyword) params.set("q", keyword);
      if (remoteOnly) params.set("remoteOnly", "true");
      const response = await fetch(`/api/jobs?${params.toString()}`, {
        cache: "no-store",
      });
      return response.json();
    },
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <input
          placeholder="キーワード / 企業名 / 勤務地"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={() => setRemoteOnly((prev) => !prev)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium transition",
            remoteOnly
              ? "border-blue-500 bg-blue-50 text-blue-600"
              : "border-slate-200 text-slate-600 hover:border-slate-300",
          )}
        >
          リモート可のみ
        </button>
      </div>

      <div className="mt-6 space-y-5">
        {isLoading && (
          <p className="text-sm text-slate-500">求人情報を読み込んでいます...</p>
        )}
        {!isLoading &&
          data?.data.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="block rounded-2xl border border-slate-100 p-5 transition hover:border-blue-200 hover:bg-blue-50/40"
            >
              <article>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      {job.companyName}
                    </p>
                    <h3 className="text-xl font-bold text-slate-900 hover:text-blue-600">
                      {job.title}
                    </h3>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <p>{job.location}</p>
                    <p>{job.compensationRange}</p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-600">{job.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>平均内定日数 {job.avgTimeToOfferDays}日</span>
                  <span>•</span>
                  <span>成約率 {(job.successRate * 100).toFixed(0)}%</span>
                  {job.urgent && (
                    <>
                      <span>•</span>
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-rose-600">
                        緊急度高
                      </span>
                    </>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            </Link>
          ))}
        {!isLoading && data?.data.length === 0 && (
          <p className="text-sm text-slate-500">求人データが見つかりません。</p>
        )}
      </div>
    </div>
  );
}
