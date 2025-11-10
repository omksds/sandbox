# Circus Agent 開発要件書

## 📋 目次
1. [システム概要](#1-システム概要)
2. [技術スタック](#2-技術スタック)
3. [アーキテクチャ](#3-アーキテクチャ)
4. [データモデル](#4-データモデル)
5. [機能要件詳細](#5-機能要件詳細)
6. [API設計](#6-api設計)
7. [UI/UX要件](#7-uiux要件)
8. [非機能要件](#8-非機能要件)
9. [セキュリティ要件](#9-セキュリティ要件)
10. [開発フェーズ](#10-開発フェーズ)

---

## 1. システム概要

### 1.1. プロダクト名
**Circus Agent**（サーカスエージェント）

### 1.2. システム種別
B2B SaaS型 採用管理システム（ATS: Applicant Tracking System）

### 1.3. 目的
人材紹介エージェントと募集企業が、求職者の紹介・選考プロセスを共同で管理し、成約率を最大化するためのプラットフォーム

### 1.4. 主要ユーザー
- **エージェント（主要）**: 求職者管理、求人検索、選考管理
- **募集企業（サブ）**: 応募受付、面接調整、合否連絡
- **プラットフォーム運営**: コンテンツ管理、データキュレーション

---

## 2. 技術スタック

### 2.1. 推奨技術構成

#### フロントエンド
- **フレームワーク**: Next.js 14+ (App Router)
- **言語**: TypeScript 5+
- **UI ライブラリ**: 
  - React 18+
  - shadcn/ui (Radix UI ベース)
  - Tailwind CSS
- **状態管理**: 
  - Zustand または Jotai
  - TanStack Query (React Query) v5
- **フォーム**: React Hook Form + Zod
- **カレンダー**: FullCalendar または React Big Calendar
- **グラフ**: Recharts または Chart.js
- **カンバンボード**: @hello-pangea/dnd (旧 react-beautiful-dnd)

#### バックエンド
- **フレームワーク**: Next.js API Routes または Express.js
- **言語**: TypeScript
- **ORM**: Prisma
- **認証**: NextAuth.js v5 または Auth.js
- **API**: REST API + tRPC（オプション）

#### データベース
- **主DB**: PostgreSQL 15+
- **キャッシュ**: Redis
- **全文検索**: PostgreSQL Full-Text Search または Elasticsearch

#### インフラ
- **ホスティング**: Vercel (フロント) + AWS/GCP (バックエンド)
- **ストレージ**: AWS S3 または Cloudflare R2
- **CDN**: Cloudflare
- **監視**: Sentry, Datadog

---

## 3. アーキテクチャ

### 3.1. システム構成図

```
┌─────────────────────────────────────────────────────────┐
│                   クライアント層                           │
├─────────────────┬───────────────────┬───────────────────┤
│ エージェント画面  │   企業画面         │   管理画面         │
│ (Next.js App)   │  (Next.js App)    │  (Next.js App)    │
└─────────────────┴───────────────────┴───────────────────┘
                          ↓ HTTPS
┌─────────────────────────────────────────────────────────┐
│                   API Gateway                            │
│              (Next.js API Routes / tRPC)                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   ビジネスロジック層                       │
├──────────────┬──────────────┬──────────────┬───────────┤
│ 求職者管理    │ 求人検索      │ 選考管理      │ 通知       │
│ サービス      │ サービス      │ サービス      │ サービス   │
└──────────────┴──────────────┴──────────────┴───────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   データアクセス層 (Prisma)                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌────────────────┬──────────────────┬────────────────────┐
│  PostgreSQL    │     Redis        │   S3 Storage       │
│  (主DB)        │   (キャッシュ)    │   (ファイル保管)    │
└────────────────┴──────────────────┴────────────────────┘
```

### 3.2. マルチテナント戦略
- **アプローチ**: Row-Level Security (行レベル分離)
- **実装**: 
  - 各テーブルに `agentCompanyId` / `recruitingCompanyId` カラムを追加
  - Prisma Middleware で自動的にテナントフィルタを適用

---

## 4. データモデル

### 4.1. ERD 主要エンティティ

```
┌──────────────┐
│    User      │ ユーザー（認証）
├──────────────┤
│ id           │
│ email        │
│ passwordHash │
│ role         │ ENUM: AGENT, COMPANY, ADMIN
│ createdAt    │
└──────────────┘
       │
       │ 1:N
       ↓
┌─────────────────┐
│  AgentCompany   │ エージェント企業
├─────────────────┤
│ id              │
│ name            │
│ status          │
└─────────────────┘
       │
       │ 1:N
       ↓
┌──────────────────┐
│   Candidate      │ 求職者
├──────────────────┤
│ id               │
│ agentCompanyId   │ FK
│ name             │
│ nameKana         │
│ email            │
│ birthDate        │
│ gender           │
│ phone            │
│ currentSalary    │
│ desiredSalary    │
│ education        │
│ school           │
│ major            │
│ careerSummary    │ TEXT
│ skills           │ JSON
│ labels           │ JSON
│ assignedTo       │ FK → User
│ lastUpdatedAt    │
└──────────────────┘
       │
       │ N:M (through Application)
       ↓
┌──────────────────┐
│  JobPosting      │ 求人
├──────────────────┤
│ id               │
│ companyId        │ FK
│ title            │
│ description      │ TEXT
│ salaryMin        │
│ salaryMax        │
│ location         │
│ employmentType   │
│ tags             │ JSON: ["リモートOK", "未経験OK"]
│ requirements     │ TEXT
│ benefits         │ TEXT
│ status           │ ENUM: DRAFT, PUBLISHED, CLOSED
│ isHot            │ BOOLEAN
│ hotRanking       │ INT (NULL)
│ views            │ INT
│ applications     │ INT
│ documentPassRate │ DECIMAL
│ interviewPassRate│ DECIMAL
│ publishedAt      │
└──────────────────┘
       │
       │ 1:N
       ↓
┌──────────────────┐
│  Application     │ 応募（選考）
├──────────────────┤
│ id               │
│ candidateId      │ FK
│ jobPostingId     │ FK
│ agentCompanyId   │ FK
│ status           │ ENUM: NEW, DOCUMENT_REVIEW, 
│                  │       INTERVIEW_1, INTERVIEW_2,
│                  │       OFFER, HIRED, REJECTED
│ appliedAt        │
│ statusUpdatedAt  │
│ interviewDate    │
│ notes            │ TEXT
│ rejectionReason  │ TEXT
└──────────────────┘

┌──────────────────┐
│   Project        │ 保存求人プロジェクト
├──────────────────┤
│ id               │
│ agentCompanyId   │ FK
│ name             │ "石田さんへ"
│ description      │
│ createdBy        │ FK → User
│ createdAt        │
└──────────────────┘
       │
       │ N:M
       ↓
┌──────────────────┐
│ ProjectJobPosting│ プロジェクト-求人 中間テーブル
├──────────────────┤
│ id               │
│ projectId        │ FK
│ jobPostingId     │ FK
│ status           │ ENUM: UNCONFIRMED, REVIEWING, APPLIED
│ addedAt          │
└──────────────────┘

┌──────────────────┐
│  Announcement    │ お知らせ
├──────────────────┤
│ id               │
│ title            │
│ content          │ TEXT
│ targetRole       │ ENUM: ALL, AGENT, COMPANY
│ publishedAt      │
│ expiresAt        │
└──────────────────┘

┌──────────────────┐
│  CandidateFile   │ 求職者ファイル（履歴書等）
├──────────────────┤
│ id               │
│ candidateId      │ FK
│ fileName         │
│ fileUrl          │
│ fileType         │ ENUM: RESUME, PORTFOLIO, OTHER
│ uploadedAt       │
└──────────────────┘

┌──────────────────┐
│  PassedCandidate │ 選考通過者属性（分析用）
│  Analytics       │
├──────────────────┤
│ id               │
│ jobPostingId     │ FK
│ ageRange         │ "30-34"
│ gender           │
│ currentSalary    │
│ transferCount    │ 転職回数
│ passedStage      │ どの段階まで通過したか
└──────────────────┘
```

### 4.2. Prisma スキーマ例（抜粋）

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  AGENT
  COMPANY
  ADMIN
}

enum ApplicationStatus {
  NEW
  DOCUMENT_REVIEW
  INTERVIEW_1
  INTERVIEW_2
  INTERVIEW_3
  OFFER
  HIRED
  REJECTED
}

enum JobStatus {
  DRAFT
  PUBLISHED
  CLOSED
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  role          UserRole
  name          String?
  agentCompanyId String?
  agentCompany  AgentCompany? @relation(fields: [agentCompanyId], references: [id])
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model AgentCompany {
  id          String       @id @default(cuid())
  name        String
  status      String       @default("ACTIVE")
  users       User[]
  candidates  Candidate[]
  projects    Project[]
  applications Application[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Candidate {
  id              String        @id @default(cuid())
  agentCompanyId  String
  agentCompany    AgentCompany  @relation(fields: [agentCompanyId], references: [id])
  name            String
  nameKana        String
  email           String?
  birthDate       DateTime?
  gender          String?
  phone           String?
  currentSalary   Int?
  desiredSalary   Int?
  education       String?
  school          String?
  major           String?
  careerSummary   String?       @db.Text
  skills          Json?
  labels          Json?
  assignedTo      String?
  applications    Application[]
  files           CandidateFile[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([agentCompanyId])
  @@index([assignedTo])
}

model JobPosting {
  id                  String        @id @default(cuid())
  companyId           String
  title               String
  description         String        @db.Text
  salaryMin           Int
  salaryMax           Int
  location            String
  employmentType      String
  tags                Json?
  requirements        String?       @db.Text
  benefits            String?       @db.Text
  status              JobStatus     @default(DRAFT)
  isHot               Boolean       @default(false)
  hotRanking          Int?
  views               Int           @default(0)
  applications        Int           @default(0)
  documentPassRate    Decimal?      @db.Decimal(5, 2)
  interviewPassRate   Decimal?      @db.Decimal(5, 2)
  publishedAt         DateTime?
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt
  applicationRecords  Application[]
  projectJobs         ProjectJobPosting[]
  analytics           PassedCandidateAnalytics[]

  @@index([companyId])
  @@index([status, isHot])
}

model Application {
  id              String            @id @default(cuid())
  candidateId     String
  candidate       Candidate         @relation(fields: [candidateId], references: [id])
  jobPostingId    String
  jobPosting      JobPosting        @relation(fields: [jobPostingId], references: [id])
  agentCompanyId  String
  agentCompany    AgentCompany      @relation(fields: [agentCompanyId], references: [id])
  status          ApplicationStatus @default(NEW)
  appliedAt       DateTime          @default(now())
  statusUpdatedAt DateTime          @updatedAt
  interviewDate   DateTime?
  notes           String?           @db.Text
  rejectionReason String?           @db.Text
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  @@index([candidateId])
  @@index([jobPostingId])
  @@index([agentCompanyId, status])
}

model Project {
  id              String              @id @default(cuid())
  agentCompanyId  String
  agentCompany    AgentCompany        @relation(fields: [agentCompanyId], references: [id])
  name            String
  description     String?
  createdBy       String
  jobPostings     ProjectJobPosting[]
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  @@index([agentCompanyId])
}

model ProjectJobPosting {
  id            String      @id @default(cuid())
  projectId     String
  project       Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  jobPostingId  String
  jobPosting    JobPosting  @relation(fields: [jobPostingId], references: [id])
  status        String      @default("UNCONFIRMED") // UNCONFIRMED, REVIEWING, APPLIED
  addedAt       DateTime    @default(now())

  @@unique([projectId, jobPostingId])
  @@index([projectId, status])
}

model Announcement {
  id          String    @id @default(cuid())
  title       String
  content     String    @db.Text
  targetRole  String    @default("ALL") // ALL, AGENT, COMPANY
  publishedAt DateTime?
  expiresAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([publishedAt, expiresAt])
}

model CandidateFile {
  id          String    @id @default(cuid())
  candidateId String
  candidate   Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  fileName    String
  fileUrl     String
  fileType    String    // RESUME, PORTFOLIO, OTHER
  uploadedAt  DateTime  @default(now())

  @@index([candidateId])
}

model PassedCandidateAnalytics {
  id             String     @id @default(cuid())
  jobPostingId   String
  jobPosting     JobPosting @relation(fields: [jobPostingId], references: [id], onDelete: Cascade)
  ageRange       String     // "25-29", "30-34"
  gender         String
  currentSalary  Int
  transferCount  Int        // 転職回数
  passedStage    String     // DOCUMENT, INTERVIEW_1, OFFER, HIRED
  recordedAt     DateTime   @default(now())

  @@index([jobPostingId])
}
```

---

## 5. 機能要件詳細

### 5.1. エージェント機能

#### 5.1.1. ホーム（ダッシュボード）

**画面**: `/agent/dashboard`

**機能一覧**:
1. **新着求人セクション**
   - 最新20件の求人を表示
   - [NEW] バッジ、企業名、タイトル、タグを表示
   - クリックで求人詳細へ遷移

2. **求人情報コンテンツ（ショートカット）**
   - タイル型のカテゴリボタン（6〜12個）
   - カテゴリ例: "ハイクラス", "コンサルタント", "営業", "医療/介護"
   - クリックで該当カテゴリの求人検索結果へ遷移

3. **事務局からのお知らせ**
   - 最新5件のアナウンスを表示
   - タイトル、公開日、内容（要約）
   - クリックで全文表示（モーダルまたは詳細ページ）

4. **保存した求人（プロジェクト）**
   - 自分が作成したプロジェクト一覧（最大10件表示）
   - プロジェクト名、保存件数を表示
   - クリックでプロジェクト詳細（カンバンボード）へ遷移

**API エンドポイント**:
- `GET /api/agent/dashboard` - ダッシュボードデータ取得

#### 5.1.2. 求職者（候補者）管理

**画面**:
- `/agent/candidates` - 一覧
- `/agent/candidates/:id` - 詳細

**機能一覧**:

**A. 求職者一覧**
- **検索機能**:
  - フリーワード検索（氏名、キーワード）
  - フィルター: ラベル、担当者、ステータス
- **テーブル表示**:
  - カラム: 氏名、ラベル、担当者、求人数、応募数、内定数、メモ、最終更新日
  - ソート機能: 各カラムでソート可
  - ページネーション: 50件/ページ
- **アクション**:
  - 「新規登録」ボタン
  - 各行クリックで詳細画面へ

**B. 求職者詳細**
- **タブ構成**:
  1. **情報表示**: 基本情報の閲覧モード
  2. **情報編集**: 基本情報の編集モード
  3. **求人**: この求職者が関心のある求人、推薦した求人
  4. **ファイル**: 履歴書、職務経歴書などのアップロード・管理
  5. **アーカイブ**: 過去の選考履歴
  6. **補足**: 自由記入のメモ欄
  7. **推薦依頼**: （機能詳細未定）

- **警告表示**: 
  - 他エージェントとの重複登録がある場合にアラート表示
  - 「AGENT連携の権限を有していません」等

- **基本情報項目**:
  - 氏名、フリガナ、メールアドレス、電話番号
  - 生年月日、性別
  - 現在年収、希望年収
  - 最終学歴、学校名、専攻
  - 職務経歴サマリー（テキストエリア）
  - スキル（タグ入力）
  - ラベル（複数選択可能）

- **アクション**:
  - 保存、削除、求人を推薦

**API エンドポイント**:
- `GET /api/agent/candidates` - 一覧取得
- `GET /api/agent/candidates/:id` - 詳細取得
- `POST /api/agent/candidates` - 新規作成
- `PUT /api/agent/candidates/:id` - 更新
- `DELETE /api/agent/candidates/:id` - 削除
- `POST /api/agent/candidates/:id/files` - ファイルアップロード

#### 5.1.3. 求人検索・管理

**画面**:
- `/agent/jobs/search` - 検索
- `/agent/jobs/:id` - 求人詳細
- `/agent/projects` - プロジェクト一覧
- `/agent/projects/:id` - プロジェクト詳細（カンバンボード）

**機能一覧**:

**A. 求人検索インターフェース**
- **検索タイプタブ**:
  - 「求人」「法人」「事業内容」「サポート流入」「シェアリング求人」
- **検索条件**:
  - 求人名（フリーテキスト）
  - 法人名（フリーテキスト）
  - 求人キーワード（フリーテキスト）
  - 想定年収: 下限〜上限（スライダー or 数値入力）
  - 勤務地（都道府県選択）
  - 雇用形態（チェックボックス）
  - タグ（複数選択）
- **検索ボタン**:
  - 条件入力中に動的にヒット件数を表示
  - 例: 「94,287件の求人を表示」

**B. 検索結果表示（求人カード）**
- **基本情報**:
  - 企業名、求人タイトル
  - 想定年収（例: 450万円〜800万円）
  - 求人概要（200文字程度）
  - 勤務地
- **タグ/バッジ**:
  - 「リモートOK」「未経験OK」「研修制度充実」「フォロワー体制◎」等
- **データ可視化（重要）**:
  - **書類通過率**: 横棒グラフ or パーセンテージ表示
  - **選考通過者の属性**: 
    - 年齢分布（例: 20代後半 30%, 30代前半 50%）
    - 性別分布（円グラフ）
    - 現年収分布（ヒストグラム）
    - 転職回数分布（棒グラフ）
- **アクション**:
  - 「詳細を見る」ボタン
  - 「保存する」ボタン → プロジェクトへ追加
  - 「推薦する」ボタン → 求職者を選択して応募

**C. 求人保存（プロジェクト管理）**
- **プロジェクト一覧**:
  - プロジェクト名、求人件数を表示
  - 例: 「石田さんへ（14件）」「ゆっけさんへ（11件）」
- **カンバンボード表示**:
  - 各プロジェクト内の求人を、ステータスごとに列で管理
  - ステータス例: 「未確認」「確認中」「応募済み」「見送り」
  - ドラッグ&ドロップでステータス変更可能
- **アクション**:
  - 「新規プロジェクト作成」
  - カード上で「求人詳細を見る」「推薦する」「削除」

**D. HOT求人ランキング**
- **タブ構成**:
  - 「HOT求人」: 運営が選定した注目求人 TOP 20
  - 「直近の内定ランキング上位法人」: 過去30日間の内定数が多い企業 TOP 10
- **表示内容**:
  - ランキング順位、企業名、求人タイトル、内定数（またはHOTスコア）
- **アクション**:
  - 各求人クリックで詳細へ遷移

**API エンドポイント**:
- `GET /api/agent/jobs/search` - 求人検索（クエリパラメータで条件指定）
- `GET /api/agent/jobs/:id` - 求人詳細取得
- `GET /api/agent/jobs/:id/analytics` - 選考通過者属性取得
- `POST /api/agent/projects` - プロジェクト作成
- `GET /api/agent/projects` - プロジェクト一覧
- `GET /api/agent/projects/:id` - プロジェクト詳細（求人カード一覧）
- `PUT /api/agent/projects/:id/jobs/:jobId` - 求人ステータス更新
- `DELETE /api/agent/projects/:id/jobs/:jobId` - 求人削除
- `GET /api/agent/jobs/hot-rankings` - HOT求人ランキング取得

#### 5.1.4. 選考管理

**画面**: `/agent/applications`

**機能一覧**:
- **ステータスタブ**:
  - 「すべて」「新規(4)」「書類選考(0)」「面接(0)」「内定(0)」「内定後」
  - 各タブに該当件数をバッジ表示
- **テーブル表示**:
  - カラム: 選考日、求職者名、担当者、企業名、求人名、ステータス、メモ、送信フラグ
  - フィルター: 担当者、企業名、期間
  - ソート: 各カラムでソート可
- **アクション**:
  - 各行に「編集」ボタン（ペンアイコン）
  - モーダルまたはサイドパネルで以下を編集:
    - ステータス変更（ドロップダウン）
    - 面接日程設定（カレンダーピッカー）
    - メモ記入
    - 合否結果入力（通過/不合格、不合格理由）

**API エンドポイント**:
- `GET /api/agent/applications` - 選考一覧取得
- `GET /api/agent/applications/:id` - 選考詳細取得
- `PUT /api/agent/applications/:id` - 選考情報更新
- `POST /api/agent/applications` - 新規応募作成

---

### 5.2. 募集企業機能

#### 5.2.1. カレンダー（デフォルトビュー）

**画面**: `/company/calendar`

**機能一覧**:
- **週次カレンダー表示**:
  - デフォルトで当週を表示（月〜日）
  - 応募受付日、面接予定日をイベントとしてプロット
- **イベント詳細**:
  - クリックで応募者情報、面接情報を表示
  - アクション: 「面接日程を設定」「合否を入力」
- **フィルター**:
  - 求人ごとにフィルタ
  - エージェントごとにフィルタ
- **月次/日次表示切り替え**可能

**API エンドポイント**:
- `GET /api/company/calendar` - カレンダーイベント取得

#### 5.2.2. エージェント管理

**画面**: `/company/agents`

**機能一覧**:
- **エージェント一覧テーブル**:
  - カラム: エージェント名、ステータス、応募数、決定数、最終応募日
  - ソート: 応募数、決定数でソート可
- **アクション**:
  - 「エージェント詳細を見る」
  - 「契約管理」（契約書アップロード、契約条件編集）

**API エンドポイント**:
- `GET /api/company/agents` - エージェント一覧取得

#### 5.2.3. 選考管理

**画面**: `/company/applications`

**機能一覧**:
- **応募者一覧テーブル**:
  - カラム: 応募日、求人名、候補者名、エージェント名、ステータス、アクション
  - フィルター: 求人、エージェント、ステータス
- **アクション**:
  - 各行に「詳細」「合否入力」ボタン
  - 合否入力: 通過/不合格、次回面接日程設定、メモ

**API エンドポイント**:
- `GET /api/company/applications` - 応募一覧取得
- `PUT /api/company/applications/:id` - 選考結果更新

---

### 5.3. プラットフォーム運営機能

#### 5.3.1. お知らせ配信

**画面**: `/admin/announcements`

**機能一覧**:
- **お知らせ一覧**: CRUD操作
- **配信対象設定**: 全体、エージェントのみ、企業のみ
- **公開期間設定**: 公開開始日、終了日

**API エンドポイント**:
- `GET /api/admin/announcements`
- `POST /api/admin/announcements`
- `PUT /api/admin/announcements/:id`
- `DELETE /api/admin/announcements/:id`

#### 5.3.2. 求人キュレーション

**画面**: 
- `/admin/hot-jobs` - HOT求人管理
- `/admin/categories` - カテゴリ管理

**機能一覧**:
- **HOT求人管理**:
  - 求人を検索し、HOTフラグを付与
  - ランキング順位を設定（1〜20位）
- **カテゴリ管理**:
  - カテゴリ作成（名称、説明、アイコン）
  - カテゴリに求人を紐付け

**API エンドポイント**:
- `PUT /api/admin/jobs/:id/hot-ranking`
- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `POST /api/admin/categories/:id/jobs` - 求人紐付け

#### 5.3.3. データ分析・集計

**画面**: `/admin/analytics`

**機能一覧**:
- **選考通過率の自動集計**: 日次バッチで各求人の書類通過率、面接通過率を計算
- **選考通過者属性の集計**: 内定者・通過者の年齢、性別、年収、転職回数を集計し、`PassedCandidateAnalytics` テーブルに保存

---

## 6. API設計

### 6.1. REST API エンドポイント一覧

#### 認証
- `POST /api/auth/signup` - ユーザー登録
- `POST /api/auth/login` - ログイン
- `POST /api/auth/logout` - ログアウト
- `GET /api/auth/me` - 現在のユーザー情報取得

#### エージェント
- `GET /api/agent/dashboard` - ダッシュボード
- `GET /api/agent/candidates` - 求職者一覧
- `POST /api/agent/candidates` - 求職者登録
- `GET /api/agent/candidates/:id` - 求職者詳細
- `PUT /api/agent/candidates/:id` - 求職者更新
- `DELETE /api/agent/candidates/:id` - 求職者削除
- `POST /api/agent/candidates/:id/files` - ファイルアップロード
- `GET /api/agent/jobs/search?q=...&salaryMin=...&salaryMax=...` - 求人検索
- `GET /api/agent/jobs/:id` - 求人詳細
- `GET /api/agent/jobs/:id/analytics` - 選考通過者属性
- `GET /api/agent/jobs/hot-rankings` - HOT求人ランキング
- `GET /api/agent/projects` - プロジェクト一覧
- `POST /api/agent/projects` - プロジェクト作成
- `GET /api/agent/projects/:id` - プロジェクト詳細
- `PUT /api/agent/projects/:id/jobs/:jobId` - プロジェクト内求人ステータス更新
- `DELETE /api/agent/projects/:id/jobs/:jobId` - プロジェクトから求人削除
- `GET /api/agent/applications` - 選考一覧
- `POST /api/agent/applications` - 応募作成
- `PUT /api/agent/applications/:id` - 選考更新

#### 企業
- `GET /api/company/calendar?start=...&end=...` - カレンダーイベント
- `GET /api/company/agents` - エージェント一覧
- `GET /api/company/applications` - 応募一覧
- `PUT /api/company/applications/:id` - 選考結果更新

#### 管理者
- `GET /api/admin/announcements` - お知らせ一覧
- `POST /api/admin/announcements` - お知らせ作成
- `PUT /api/admin/announcements/:id` - お知らせ更新
- `DELETE /api/admin/announcements/:id` - お知らせ削除
- `PUT /api/admin/jobs/:id/hot-ranking` - HOT求人設定
- `GET /api/admin/analytics/job-pass-rates` - 求人通過率集計
- `POST /api/admin/analytics/run-daily-aggregation` - 日次集計実行

### 6.2. レスポンス形式

```typescript
// 成功レスポンス
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "perPage": 50
  }
}

// エラーレスポンス
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "氏名は必須です",
    "details": [
      { "field": "name", "message": "氏名は必須です" }
    ]
  }
}
```

---

## 7. UI/UX要件

### 7.1. デザインシステム

#### カラーパレット
- **プライマリ**: `#3B82F6` (青)
- **セカンダリ**: `#10B981` (緑)
- **アクセント**: `#F59E0B` (オレンジ) - NEW バッジ、HOT表示
- **エラー**: `#EF4444` (赤)
- **背景**: `#F9FAFB` (グレー)
- **テキスト**: `#111827` (ダークグレー)

#### タイポグラフィ
- **フォント**: Inter, Noto Sans JP
- **見出し**: font-weight: 700
- **本文**: font-weight: 400

### 7.2. コンポーネント要件

#### ダッシュボード
- **レイアウト**: 2カラム（サイドバー + メインエリア）
- **サイドバー**: 固定、ナビゲーションメニュー
- **メインエリア**: スクロール可能、セクションごとにカード表示

#### 求人検索結果
- **レイアウト**: グリッドレイアウト（2列）
- **カード**: 
  - ホバー時に影を強調
  - クリックで詳細画面へ遷移
  - 「保存」「推薦」ボタンを配置

#### カンバンボード
- **ライブラリ**: @hello-pangea/dnd
- **列**: ステータスごとに列を表示
- **カード**: ドラッグ&ドロップ可能、求人タイトルと企業名を表示

#### カレンダー
- **ライブラリ**: FullCalendar
- **ビュー**: 週次、月次、日次
- **イベント**: 応募、面接をカラーで区別

### 7.3. レスポンシブデザイン
- **ブレークポイント**:
  - モバイル: 〜768px
  - タブレット: 768px〜1024px
  - デスクトップ: 1024px〜
- **モバイル優先**: ただし、主要ユーザーはデスクトップを想定

---

## 8. 非機能要件

### 8.1. パフォーマンス
- **初回ロード時間**: 3秒以内（LCP）
- **API レスポンス時間**: 500ms以内（P95）
- **求人検索**: 1秒以内に結果表示（10万件規模のDB）
- **画像最適化**: Next.js Image コンポーネント使用、WebP形式

### 8.2. スケーラビリティ
- **想定ユーザー数**: 
  - エージェント: 1,000社、10,000ユーザー
  - 企業: 5,000社、20,000ユーザー
- **データ規模**:
  - 求人: 10万件
  - 求職者: 50万件
  - 選考: 100万件
- **対応**: 
  - DB インデックス最適化
  - Redis キャッシュ（HOT求人、ダッシュボードデータ）
  - CDN によるアセット配信

### 8.3. 可用性
- **稼働率**: 99.9% (年間ダウンタイム 8.76時間以内)
- **バックアップ**: 日次フルバックアップ、1時間ごとの増分バックアップ
- **障害復旧**: RPO 1時間、RTO 4時間

### 8.4. 保守性
- **コード規約**: ESLint + Prettier
- **テスト**: 
  - ユニットテスト: Vitest (カバレッジ 80%以上)
  - E2Eテスト: Playwright (主要フロー)
- **ドキュメント**: 
  - API ドキュメント (OpenAPI/Swagger)
  - コンポーネントカタログ (Storybook)

---

## 9. セキュリティ要件

### 9.1. 認証・認可
- **認証方式**: JWT (HTTP-only Cookie)
- **セッション管理**: Redis セッションストア
- **パスワード**: bcrypt ハッシュ化（ストレッチング回数 12）
- **多要素認証**: オプション（管理者は必須）

### 9.2. 認可
- **ロールベース**: AGENT, COMPANY, ADMIN
- **データアクセス**: 
  - エージェント: 自社の求職者、応募のみアクセス可
  - 企業: 自社の求人、応募のみアクセス可
  - 管理者: 全データアクセス可
- **実装**: Prisma Middleware でテナントフィルタ自動適用

### 9.3. データ保護
- **個人情報**: 暗号化（AES-256）
- **通信**: HTTPS 必須（TLS 1.3）
- **ファイルアップロード**: 
  - ウイルススキャン（ClamAV）
  - 許可拡張子: pdf, docx, xlsx, jpg, png
  - 最大ファイルサイズ: 10MB

### 9.4. 脆弱性対策
- **SQLインジェクション**: Prisma（パラメータ化クエリ）で対策
- **XSS**: React の自動エスケープ + DOMPurify
- **CSRF**: SameSite Cookie + CSRF トークン
- **依存関係**: Snyk または Dependabot で脆弱性スキャン

### 9.5. ログ・監査
- **アクセスログ**: 全APIリクエストを記録
- **監査ログ**: 個人情報の閲覧・編集・削除を記録
- **保持期間**: 1年間

---

## 10. 開発フェーズ

### Phase 1: MVP（3ヶ月）
**目標**: エージェントの中核業務をサポートする最小限の機能

**機能**:
- ✅ 認証・認可（エージェント、企業）
- ✅ 求職者管理（CRUD）
- ✅ 求人検索（基本検索のみ）
- ✅ 求人詳細表示（データ可視化なし）
- ✅ 選考管理（一覧、ステータス更新）
- ✅ ダッシュボード（新着求人、お知らせのみ）

**技術タスク**:
- Next.js + TypeScript セットアップ
- Prisma + PostgreSQL セットアップ
- NextAuth.js 認証実装
- shadcn/ui コンポーネント導入
- 基本的な CRUD API 実装

### Phase 2: 拡張機能（2ヶ月）
**目標**: エージェントの意思決定を支援する高度な機能

**機能**:
- ✅ 求人検索（詳細条件、動的件数表示）
- ✅ データ可視化（書類通過率、選考通過者属性）
- ✅ プロジェクト管理（保存求人）
- ✅ カンバンボード
- ✅ HOT求人ランキング
- ✅ 企業側カレンダー

**技術タスク**:
- Recharts でグラフ実装
- @hello-pangea/dnd でカンバンボード実装
- FullCalendar 統合
- Redis キャッシュ導入
- 選考通過者属性集計バッチ

### Phase 3: 最適化・運営機能（1.5ヶ月）
**目標**: プラットフォーム運営機能と、パフォーマンス最適化

**機能**:
- ✅ 管理画面（お知らせ、HOT求人、カテゴリ管理）
- ✅ データ分析ダッシュボード（管理者向け）
- ✅ ファイルアップロード（履歴書等）
- ✅ 通知機能（メール、アプリ内通知）

**技術タスク**:
- S3 ファイルストレージ統合
- メール送信（Resend または SendGrid）
- パフォーマンス最適化（DB インデックス、クエリ最適化）
- E2E テスト（Playwright）
- 本番環境デプロイ（Vercel + AWS）

### Phase 4: リリース・運用（継続）
**目標**: リリース後の改善とスケール対応

**タスク**:
- ユーザーフィードバック収集
- A/B テスト実施
- 機能追加（検索アルゴリズム改善、AI マッチング等）
- スケール対応（DB シャーディング、CDN 最適化）

---

## 11. 成功指標（KPI）

### ビジネスKPI
- **エージェント側**:
  - 月間アクティブエージェント数（MAU）
  - 求人検索回数/月
  - 応募数/月
  - 成約率（応募→内定）
  - プロジェクト作成数/月
- **企業側**:
  - 月間アクティブ企業数
  - 応募受付数/月
  - 平均面接設定日数（応募→面接設定）
  - 内定承諾率

### 技術KPI
- **パフォーマンス**:
  - Core Web Vitals（LCP < 2.5s, FID < 100ms, CLS < 0.1）
  - API レスポンスタイム P95 < 500ms
- **品質**:
  - ユニットテストカバレッジ > 80%
  - E2E テスト成功率 > 95%
  - 本番エラー率 < 0.1%
- **運用**:
  - 稼働率 > 99.9%
  - 平均復旧時間（MTTR）< 4時間

---

## 12. リスク管理

### 技術リスク
| リスク | 影響度 | 対策 |
|--------|--------|------|
| 求人検索のパフォーマンス劣化 | 高 | Elasticsearch 導入、インデックス最適化 |
| データ分析集計の遅延 | 中 | 非同期バッチ処理、キャッシュ活用 |
| ファイルアップロード容量超過 | 中 | S3 ライフサイクル管理、容量制限 |

### ビジネスリスク
| リスク | 影響度 | 対策 |
|--------|--------|------|
| エージェント側の利用率低迷 | 高 | オンボーディング強化、UI/UX 改善 |
| 企業側の応募承認遅延 | 中 | リマインダー通知、自動エスカレーション |
| データ品質の低下 | 高 | バリデーション強化、管理者承認フロー |

---

## 13. 補足資料

### 13.1. 用語集
- **ATS**: Applicant Tracking System（採用管理システム）
- **エージェント**: 人材紹介会社
- **求職者**: エージェントが担当する転職希望者
- **応募**: エージェントが企業の求人に求職者を推薦すること
- **選考**: 応募から内定までのプロセス
- **HOT求人**: プラットフォーム運営が推奨する成約しやすい求人

### 13.2. 参考資料
- 元要件定義: `memo.md`
- UI/UX デザイン: （Figma URL を追加予定）
- API 設計書: （Swagger URL を追加予定）

---

## 変更履歴
- 2025-11-10: 初版作成

