import { create } from "zustand";
import type { CandidateStatus } from "@/lib/domain/types";

type CandidateFilterState = {
  keyword: string;
  statuses: CandidateStatus[];
  setKeyword: (keyword: string) => void;
  setStatuses: (statuses: CandidateStatus[]) => void;
};

export const useCandidateFilterStore = create<CandidateFilterState>((set) => ({
  keyword: "",
  statuses: [],
  setKeyword: (keyword) => set({ keyword }),
  setStatuses: (statuses) => set({ statuses }),
}));
