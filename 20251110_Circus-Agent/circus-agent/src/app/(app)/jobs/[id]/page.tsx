import { jobRepository } from "@/lib/repositories/job-repository";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, MapPin, DollarSign, Briefcase, Users, Calendar } from "lucide-react";
import { SuccessRateChart } from "@/components/dashboard/success-rate-chart";

type Params = { params: Promise<{ id: string }> };

export default async function JobDetailPage({ params }: Params) {
  const { id } = await params;
  const job = await jobRepository.getById(id);

  if (!job) {
    notFound();
  }

  // モックデータ - 実際にはAPIから取得
  const jobDetail = {
    ...job,
    // 企業情報
    companyInfo: {
      establishedYear: "2020年",
      phase: "ベンチャー",
      employees: "10～30名",
      averageAge: "28歳",
      genderRatio: "男女比",
      address: "160-0023 新宿区西新宿3丁目 6-4 CIRCLES西新宿 5階",
      marketStatus: "未上場",
    },
    // 統計情報
    stats: {
      documentReviewSpeed: "3日以内",
      hiringCount: "3ヶ月\n5～9名",
      documentPassRate: "50%以上",
    },
    // 選考通過者の年収分布
    salaryDistribution: [
      { range: "300万円未満", screening: 0, hired: 0 },
      { range: "300万円~449万円", screening: 9, hired: 0 },
      { range: "450万円~699万円", screening: 0, hired: 1 },
      { range: "700万円以上", screening: 0, hired: 0 },
    ],
    // 必須条件
    requirements: {
      age: "23歳~29歳",
      tags: ["性別不問", "外国籍NG", "大卒以上", "職種未経験OK", "業種未経験OK"],
      must: [
        "社会人経験がある方",
        "※入社者事例：金融機関、人材営業、エンジニア、研究職など業界職種問わず",
        "※ポテンシャル採用が主です",
      ],
      preferred: [
        "素直さ100%で、言われたことを全力で吸収し、即実行に移す方（心理的柔軟性がある）",
        "やり切る力がある。目標掲げて達成してきてる方",
        "上昇志向があり、成長欲求を持ち合わせている方",
        "コミュニケーションを通じてチームとして、目的達成のための適切をインプット/アウトプットができる方",
        "仲間思いで、見返りを求めぬ愛情を持げられる方",
      ],
    },
    // 見送り理由
    rejectionReasons: {
      document: [
        "外国籍",
        "既往歴あり(完治含む)",
        "35歳以上",
        "離職3回以上",
        "離職期間が半年以上",
      ],
      interview: [
        "他責傾向が強い",
        "変化に対して消極的（安定・平穏志向が強すぎる、環境の変化を楽しめない）",
        "改善・提案の意欲や工夫が読み取れない（指示されたことしかやっていない）",
        "質問の内容と回答がずれる、尋ねていない内容まで話す",
        "印象が暗い、目が合わない",
      ],
    },
    // コンピテンシー
    competencies: [
      "熱量",
      "協働性",
      "素直さ",
      "達成思考",
      "課題発見",
      "課題分析",
      "計画実行力",
      "情報収集力",
      "探求する意欲",
      "誠実さ",
    ],
    // 求人の魅力
    appeal: {
      vision: `私たちWEEVAは、クライアントの受注率と単価を最大化し、そこから得られる知見を仕組み化することで、高い再現性を持つ営業・経営モデルを構築してきました。

単なる一時的な成果ではなく、誰が取り組んでも成果が出る仕組みを創り出し、クライアントの生産性を最大化することが私たちの使命です。

その先にあるのは、企業の成長を加速させるだけでなく、そこで働く人々のキャリアや挑戦の可能性を広げていくこと。
「挑戦が成果になり、成果が次の可能性を生む」――そんな未来をつくることを、WEEVAのビジョンとしています。`,
      business: `■事業内容
WEEVAは、経営者と一緒に「どうすれば売上が伸びるか」を考え、実際に営業現場で成果を出すところまで伴走するコンサルティング会社です。
提案や戦略を考えるだけでなく、営業資料づくりや仕組みづくりまでサポートし、数字が動く瞬間に立ち会えるのが特徴です。

【サービス内容】
■ 営業支援
・「どうすれば売れるのか」を一緒に考え、営業のやり方を整える仕事。
・資料やトークの工夫、提案方法の見直しなどを行い、受注率を高めます。

■ 創業融資支援
・起業したい人のために、銀行から資金を借りるサポート。
・書類の準備から交渉、融資後のアフターフォローまで専門家が一緒に進めます。

■ 事業計画書作成
・「これからどんなビジネスをするのか」を形にする計画書を、スピーディーかつ正確に作成。
・経営者が資金調達や取引に集中できるように支えます。

■ クラウドファンディング代行
・クラファンページの企画から広告までをトータルで代行。
・経営者は本業に集中しながら、資金集めとファンづくりを両立できます。

■ WEBマーケティング
・SNSや動画広告を使って「認知度を上げる・お客様を集める」支援。
・流行に合わせた仕掛けで、効果的に集客や売上に貢献します。

■ 補助金・助成金サポート
・「国や自治体の支援制度をどう活用するか」を一緒に考え、申請から活用までサポート。
・成長フェーズに合わせて最適な制度を提案します。`,
    },
    // エージェント向け情報
    agentInfo: {
      commission: "理論年収 × 30%",
      milestone: "入社",
      paymentSite: "被採用者の入社日が属する月の翌月末支払い\n※銀行営業日ではない場合は、前日までの入金となります。",
      refundPolicy: `被採用者の自己都合により退職に至った場合、
以下の通り返金するものとします。
入社後1ヶ月未満で退職した場合:人材紹介手数料の80%
入社後3ヶ月未満で退職した場合:人材紹介手数料の50%
入社後6ヶ月未満で退職した場合:人材紹介手数料の20%`,
      theoreticalSalaryNote: `・理論年収=「月額固定給×12ヶ月＋賞与算定基準額×前年度実績賞与支給月数」となります。
・月額固定給=「基本給+家族手当+住宅手当+役職手当などその他諸手当」で算出致します。
但し、通勤手当や超過勤務手当(残業手当)等変動する手当では含まれません。
割増賃金が固定で支払われる場合は、月額固定給に含まれるものとします。
・年俸制の場合は、年俸額を年収(=理論年収)としております。`,
    },
    // 人事担当からの伝達事項
    hrNotes: {
      supplement: [
        "2025年2月から毎月2名は採用継続",
        "足元で4名早期に採用したい温度感",
        "入社時期：即可能",
      ],
      background: [
        "今期2名営業ポジション採用し、営業基盤が構築され、安定した案件獲得ができている",
        "今期採用した2名の育成が順調に進行し、一部育成に関与できるメンバーもいる",
        "職位：メンバー（マネージャー候補）",
      ],
      idealCandidate: {
        age: "25歳（社会人3年目くらい）",
        gender: "男性",
        maritalStatus: "独身",
        residence: "関東在住",
        currentSalary: "現年収350万～500万のレンジ",
        education: "学歴：MARCH、関関同立の水準以上（高校+大学で偏差値110超）",
        career: "職歴：ベンチャー系、もしくはいわゆる大手（金融、不動産、広告、人材とか良い）とりあえ大った大ような方",
      },
    },
  };

  return (
    <div className="space-y-6">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />
        求人一覧に戻る
      </Link>

      {/* ヘッダー */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                企業求人
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                正社員
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">
              {job.title}
            </h1>
            <p className="mt-2 text-lg font-semibold text-blue-600">
              {job.companyName}
            </p>
          </div>
          <div className="rounded-2xl bg-red-500 px-6 py-3 text-center text-white shadow-lg">
            <p className="text-sm font-medium">成約手数料</p>
            <p className="text-xl font-bold">{jobDetail.agentInfo.commission}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600">職種</span>
            <span className="font-semibold text-slate-900">{job.title}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600">年収</span>
            <span className="font-semibold text-slate-900">{job.compensationRange}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600">勤務地</span>
            <span className="font-semibold text-slate-900">{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600">雇用形態</span>
            <span className="font-semibold text-slate-900">
              {job.employmentType === "full-time" ? "正社員" : job.employmentType}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 企業情報 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Building2 className="h-5 w-5" />
          企業情報
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500">設立年</p>
            <p className="mt-1 font-semibold text-slate-900">{jobDetail.companyInfo.establishedYear}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">上場区分</p>
            <p className="mt-1 font-semibold text-slate-900">{jobDetail.companyInfo.marketStatus}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">企業フェーズ</p>
            <p className="mt-1 font-semibold text-slate-900">{jobDetail.companyInfo.phase}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">平均年齢</p>
            <p className="mt-1 font-semibold text-slate-900">{jobDetail.companyInfo.averageAge}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">従業員数</p>
            <p className="mt-1 font-semibold text-slate-900">{jobDetail.companyInfo.employees}</p>
          </div>
          <div className="md:col-span-3">
            <p className="text-xs text-slate-500">住所</p>
            <p className="mt-1 text-sm text-slate-900">{jobDetail.companyInfo.address}</p>
          </div>
        </div>
      </div>

      {/* 選考統計 */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-slate-600">書類選考スピード</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {jobDetail.stats.documentReviewSpeed}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-slate-600">採用予定人数</p>
          <p className="mt-2 whitespace-pre-line text-2xl font-bold text-blue-600">
            {jobDetail.stats.hiringCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-slate-600">書類選考通過率</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {jobDetail.stats.documentPassRate}
          </p>
        </div>
      </div>

      {/* 選考通過者の年収分布 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          選考通過者の現年収分布
        </h2>
        <div className="mt-6">
          <div className="flex items-center justify-end gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-600"></div>
              <span>書類通過</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-pink-500"></div>
              <span>内定</span>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {jobDetail.salaryDistribution.map((item) => (
              <div key={item.range} className="flex items-center gap-4">
                <div className="w-32 text-sm text-slate-600">{item.range}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {item.screening > 0 && (
                      <div
                        className="h-8 bg-blue-600"
                        style={{ width: `${item.screening * 40}px` }}
                      ></div>
                    )}
                    {item.hired > 0 && (
                      <div
                        className="h-8 bg-pink-500"
                        style={{ width: `${item.hired * 40}px` }}
                      ></div>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="w-8 text-right">{item.screening}人</span>
                  <span className="w-8 text-right">{item.hired}人</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 応募条件 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">応募必須条件</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {jobDetail.requirements.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-700">■必須</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              {jobDetail.requirements.must.map((item, index) => (
                <li key={index}>※{item}</li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-700">
              内定の可能性が高い人
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
              {jobDetail.requirements.preferred.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              書類見送りの主な理由
            </h2>
            <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-slate-600">
              {jobDetail.rejectionReasons.document.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              面接見送りの主な理由
            </h2>
            <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-slate-600">
              {jobDetail.rejectionReasons.interview.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-sm text-slate-600">
                加えて、弊社の面接においては、コンピテンシー面接を導入しており、
                面接内で過去の行動事実を拾い自社の大事にする行動特性に合致しているか否かで
                判断しております。
              </p>
              <div className="mt-3">
                <p className="text-sm font-semibold text-slate-700">
                  大事にするコンピテンシー一部抜粋
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {jobDetail.competencies.map((comp) => (
                    <span
                      key={comp}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* この求人の魅力 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">この求人の魅力</h2>

        <div className="mt-6">
          <h3 className="inline-block rounded-full bg-slate-900 px-4 py-1 text-sm font-semibold text-white">
            理念・ビジョン
          </h3>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {jobDetail.appeal.vision}
          </p>
        </div>

        <div className="mt-8">
          <h3 className="inline-block rounded-full bg-slate-900 px-4 py-1 text-sm font-semibold text-white">
            仕事・事業
          </h3>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {jobDetail.appeal.business}
          </p>
        </div>
      </div>

      {/* 成約手数料 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">成約手数料</h2>
        <div className="mt-4 space-y-4">
          <div className="flex gap-4 border-b border-slate-100 pb-4">
            <p className="w-32 text-sm font-medium text-slate-600">成果報酬金額</p>
            <p className="text-sm font-bold text-red-600">
              {jobDetail.agentInfo.commission}
            </p>
          </div>
          <div className="flex gap-4 border-b border-slate-100 pb-4">
            <p className="w-32 text-sm font-medium text-slate-600">成果地点</p>
            <p className="text-sm text-slate-900">{jobDetail.agentInfo.milestone}</p>
          </div>
          <div className="flex gap-4 border-b border-slate-100 pb-4">
            <p className="w-32 text-sm font-medium text-slate-600">支払いサイト</p>
            <p className="whitespace-pre-line text-sm text-slate-900">
              {jobDetail.agentInfo.paymentSite}
            </p>
          </div>
          <div className="flex gap-4 border-b border-slate-100 pb-4">
            <p className="w-32 text-sm font-medium text-slate-600">返戻金の規定</p>
            <p className="whitespace-pre-line text-sm text-slate-900">
              {jobDetail.agentInfo.refundPolicy}
            </p>
          </div>
          <div className="flex gap-4">
            <p className="w-32 text-sm font-medium text-slate-600">理論年収の考え方</p>
            <p className="whitespace-pre-line text-sm text-slate-900">
              {jobDetail.agentInfo.theoreticalSalaryNote}
            </p>
          </div>
        </div>
      </div>

      {/* 人事担当からの伝達事項 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          人事担当からの伝達事項
        </h2>

        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">【補足】</h3>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
              {jobDetail.hrNotes.supplement.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700">（背景）</h3>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
              {jobDetail.hrNotes.background.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700">
              【（あくまでも）理想の人物像、ペルソナ】
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              <li>・{jobDetail.hrNotes.idealCandidate.age}</li>
              <li>・{jobDetail.hrNotes.idealCandidate.gender}</li>
              <li>・{jobDetail.hrNotes.idealCandidate.maritalStatus}</li>
              <li>・{jobDetail.hrNotes.idealCandidate.residence}</li>
              <li>・{jobDetail.hrNotes.idealCandidate.currentSalary}</li>
              <li>・{jobDetail.hrNotes.idealCandidate.education}</li>
              <li>・{jobDetail.hrNotes.idealCandidate.career}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-4">
        <button className="flex-1 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          求人票を出力する
        </button>
        <button className="flex-1 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          求職者を選択する
        </button>
      </div>
    </div>
  );
}

