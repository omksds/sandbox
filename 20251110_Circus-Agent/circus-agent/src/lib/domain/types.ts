export type Role = "AGENT" | "COMPANY" | "ADMIN";

export type CandidateStatus =
  | "new"
  | "screening"
  | "submitted"
  | "interview"
  | "offer"
  | "placed"
  | "archived";

export type ApplicationStage =
  | "screening"
  | "document"
  | "firstInterview"
  | "secondInterview"
  | "offer"
  | "hired"
  | "rejected";

export type JobStatus = "open" | "paused" | "closed";

export type EmploymentType =
  | "full-time"
  | "contract"
  | "temporary"
  | "internship";

export type AgentUser = {
  id: string;
  email: string;
  name: string;
  organization: string;
  role: Role;
};

export type Candidate = {
  id: string;
  name: string;
  kana: string;
  email: string;
  phone: string;
  location: string;
  status: CandidateStatus;
  headline: string;
  experienceYears: number;
  currentCompany: string;
  currentTitle: string;
  desiredRoles: string[];
  desiredAnnualSalary: number;
  noticePeriodDays: number;
  updatedAt: string;
  labels: string[];
  skills: string[];
  owner: AgentUser["name"];
  lastContactAt: string;
  resumeUrl?: string;
  riskFlag?: string;
};

export type CandidateNote = {
  id: string;
  candidateId: string;
  author: string;
  createdAt: string;
  body: string;
};

export type Job = {
  id: string;
  title: string;
  companyName: string;
  companySize: string;
  location: string;
  compensationRange: string;
  employmentType: EmploymentType;
  status: JobStatus;
  hotScore: number;
  category: string;
  tags: string[];
  updatedAt: string;
  description: string;
  remoteFriendly: boolean;
  urgent: boolean;
  openings: number;
  avgTimeToOfferDays: number;
  successRate: number;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  severity: "info" | "warning";
  publishedAt: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  jobCount: number;
  candidateCount: number;
  updatedAt: string;
};

export type Application = {
  id: string;
  candidateId: string;
  jobId: string;
  stage: ApplicationStage;
  status: "active" | "blocked" | "success" | "lost";
  lastActionAt: string;
  updatedAt: string;
  probability: number;
};

export type PipelineCard = Application & {
  candidate?: Candidate;
  job?: Job;
};

export type PipelineColumn = {
  stage: ApplicationStage;
  label: string;
  applications: PipelineCard[];
};

export type DashboardSnapshot = {
  kpis: {
    activeCandidates: number;
    interviewsThisWeek: number;
    offersPending: number;
    placements: number;
  };
  funnel: {
    label: string;
    value: number;
    trend: number;
  }[];
  newJobs: Job[];
  announcements: Announcement[];
  projects: Project[];
  categoryShortcuts: string[];
};
