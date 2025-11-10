"use client";

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";
import jaLocale from "@fullcalendar/core/locales/ja";

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps?: {
    candidateName?: string;
    jobTitle?: string;
    companyName?: string;
    type?: "interview" | "application" | "offer";
  };
};

// モックデータ（実際にはAPIから取得）
const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "一次面接: 山田太郎",
    start: "2025-11-15T10:00:00",
    end: "2025-11-15T11:00:00",
    backgroundColor: "#3B82F6",
    borderColor: "#2563EB",
    extendedProps: {
      candidateName: "山田太郎",
      jobTitle: "シニアエンジニア",
      companyName: "株式会社テックカンパニー",
      type: "interview",
    },
  },
  {
    id: "2",
    title: "二次面接: 佐藤花子",
    start: "2025-11-16T14:00:00",
    end: "2025-11-16T15:30:00",
    backgroundColor: "#10B981",
    borderColor: "#059669",
    extendedProps: {
      candidateName: "佐藤花子",
      jobTitle: "プロダクトマネージャー",
      companyName: "株式会社イノベーション",
      type: "interview",
    },
  },
  {
    id: "3",
    title: "応募受付: 鈴木一郎",
    start: "2025-11-12",
    backgroundColor: "#F59E0B",
    borderColor: "#D97706",
    extendedProps: {
      candidateName: "鈴木一郎",
      jobTitle: "データサイエンティスト",
      companyName: "AIソリューションズ",
      type: "application",
    },
  },
  {
    id: "4",
    title: "オファー面談: 田中美咲",
    start: "2025-11-20T16:00:00",
    end: "2025-11-20T17:00:00",
    backgroundColor: "#EF4444",
    borderColor: "#DC2626",
    extendedProps: {
      candidateName: "田中美咲",
      jobTitle: "UXデザイナー",
      companyName: "クリエイティブスタジオ",
      type: "offer",
    },
  },
];

export function InterviewCalendar() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  const handleEventClick = (info: EventClickArg) => {
    setSelectedEvent({
      id: info.event.id,
      title: info.event.title,
      start: info.event.startStr,
      end: info.event.endStr,
      backgroundColor: info.event.backgroundColor,
      extendedProps: info.event.extendedProps,
    });
  };

  const handleDateClick = (arg: { dateStr: string }) => {
    console.log("Date clicked:", arg.dateStr);
    // 新しいイベントを追加するモーダルを開くなど
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <style jsx global>{`
          /* FullCalendar 基本スタイル */
          .fc {
            font-family: inherit;
          }
          .fc-theme-standard td,
          .fc-theme-standard th {
            border: 1px solid #e2e8f0;
          }
          .fc-theme-standard .fc-scrollgrid {
            border: 1px solid #e2e8f0;
          }
          .fc .fc-button {
            background-color: #3b82f6;
            border-color: #3b82f6;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
          }
          .fc .fc-button:hover {
            background-color: #2563eb;
            border-color: #2563eb;
          }
          .fc .fc-button:disabled {
            opacity: 0.5;
          }
          .fc-event {
            border-radius: 0.25rem;
            padding: 2px 4px;
            font-size: 0.875rem;
          }
          .fc-daygrid-event {
            white-space: normal;
          }
          .fc-timegrid-event {
            border-radius: 0.25rem;
          }
          .fc-col-header-cell {
            background-color: #f8fafc;
            font-weight: 600;
            padding: 0.5rem;
          }
          .fc-day-today {
            background-color: #eff6ff !important;
          }
        `}</style>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale={jaLocale}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={mockEvents}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          height="auto"
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={true}
          nowIndicator={true}
          editable={true}
          selectable={true}
          selectMirror={true}
        />
      </div>

      {/* イベント詳細モーダル */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                イベント詳細
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-500">候補者名</p>
                <p className="text-base font-semibold text-slate-900">
                  {selectedEvent.extendedProps?.candidateName}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">求人</p>
                <p className="text-base text-slate-900">
                  {selectedEvent.extendedProps?.jobTitle}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">企業</p>
                <p className="text-base text-slate-900">
                  {selectedEvent.extendedProps?.companyName}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">日時</p>
                <p className="text-base text-slate-900">
                  {new Date(selectedEvent.start).toLocaleString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">種類</p>
                <span
                  className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
                  style={{
                    backgroundColor: selectedEvent.backgroundColor,
                  }}
                >
                  {selectedEvent.extendedProps?.type === "interview"
                    ? "面接"
                    : selectedEvent.extendedProps?.type === "application"
                      ? "応募"
                      : "オファー"}
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                編集
              </button>
              <button className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                詳細を見る
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

