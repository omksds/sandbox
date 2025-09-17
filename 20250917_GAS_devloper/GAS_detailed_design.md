# GAS プロジェクト詳細設計（スプレッドシートバインド版）

本書は `概要書.md` の方針を受け、ログをスプレッドシートへ、成功コードをドキュメントへ書き込む Google Apps Script (GAS) プロジェクトの詳細設計を整理したものである。本設計では **スプレッドシートにバインドされたコンテナバインド型スクリプト** を前提とし、ユーザーがシート上で完結して実行できる運用を目指す。また、成功コード保存用ドキュメントは初回セットアップ時にスクリプトが自動生成し、その ID をスクリプトプロパティに保持することで、ユーザーが ID を直接扱う必要をなくす。

---

## 1. システム全体像

```
[ユーザー]
   |  (シートのカスタムメニュー / ボタン)
   v
[スプレッドシート (バインドスクリプト)]
   |-- 毎実行 --> [LOG シート (最新1件)]
   |-- 成功時 --> [Googleドキュメント (最新コード1件)]
   '-- 成功時 --> [Gemini ナレッジ (ログ + コード)]
```

* スクリプトはログ保存先スプレッドシートにバインドされる。`SpreadsheetApp.getActiveSpreadsheet()` が常に対象になるため、シート ID は定数として保持しない。
* `run()` をメインエントリとし、`onOpen()` でカスタムメニュー（例：`Debug Booster > Run`）を提供する。必要に応じてボタンやショートカットも設定する。
* ログはアクティブスプレッドシート内の `LOG` シートへ出力し、実行毎にクリアして最新状態のみを保持する。
* 成功時のみ Apps Script API を用いてプロジェクト全ソースを取得し、Google ドキュメントへヘッダー区切りで上書き保存する。ドキュメントは初回セットアップ時に自動生成され、ID はスクリプトプロパティ (`SUCCESS_DOC_ID`) に保存される。
* Gemini にはログシートとコードドキュメントをナレッジとして登録し、会話経由で参照できるようにする。

---

## 2. 成果物・環境

| 区分 | 名称 (例) | 役割 | 備考 |
| ---- | --------- | ---- | ---- |
| スプレッドシート (ホスト) | `GAS_LOG_latest` | ログ保存シート / スクリプト実行 UI | このシートに GAS をバインドする |
| Apps Script プロジェクト | `GAS Debugging Booster` | `run()`、`onOpen()`、ユーティリティを格納 | ホストシート直下に作成される |
| Google ドキュメント | `GAS_CODE_success_latest` | 最新成功コードをヘッダー付きで保存 | セットアップ関数が自動生成し ID をスクリプトプロパティへ保存 |
| Gemini ジェム | `gas-debugging` | ログ + コードのナレッジ参照 | アクセス権は閲覧のみ共有 |

### 2.1 コンテナバインド特有の設計ポイント

* スクリプト管理画面はシートから開く。Git 等にエクスポートする場合は clasp などを利用する。
* バインド型のため `SpreadsheetApp.getUi()` が利用でき、ユーザー向け UI（メニュー・アラート・トースト）を提供可能。
* ドキュメント ID は自動生成/保存されるため、ユーザーは ID を参照したり貼り付けたりする必要がない。

---

## 3. モジュール構成

| モジュール | ファイル想定 | 主な責務 |
| ---------- | ------------- | -------- |
| Main | `main.gs` | `onOpen()` でメニュー登録、`run()` 実行フロー、ロック管理 |
| Config | `config.gs` | `LOG_SHEET_NAME` やマスク設定、スクリプトプロパティキー、タイムアウト等の定数 |
| SheetContext | `sheet_context.gs` | バインドスプレッドシートの取得、`LOG` シート生成/キャッシュ |
| Logger | `logger.gs` | ログ行整形・書き込み、マスク処理、ステータス集計 |
| SpreadsheetWriter | `sheet_writer.gs` | ヘッダー管理、行書き込み、実行開始時のクリア処理 |
| DocumentWriter | `document_writer.gs` | プロジェクトソースの取得・フォーマット・ドキュメント上書き |
| Setup | `setup.gs` | 初期化処理 (`initializeProject()`)、ドキュメント自動生成、スクリプトプロパティ管理 |
| Util | `util.gs` | JSON stringify、truncate、Gemini 向けテキスト整形など共通処理 |

> バインド環境ではファイル数が増えると編集 UI が狭くなるため、概ね 7〜8 ファイル以内を推奨する。

---

## 4. 定数・設定値

* `LOG_SHEET_NAME = 'LOG'` を基本とし、存在しなければ `SpreadsheetWriter.ensureSheet()` で生成する。
* ドキュメント ID は定数では保持せず、`PropertiesService.getScriptProperties()` に `SUCCESS_DOC_ID` というキーで保存する。`DocumentWriter.getSuccessDocId_()` がプロパティから ID を取得し、未設定の場合は `Setup.ensureSuccessDocument_()` を呼び出す。
* `CONFIG_KEYS = { SUCCESS_DOC_ID: 'SUCCESS_DOC_ID', APP_VERSION: 'APP_VERSION' }` のようにキー文字列を管理する。
* `LOG_HEADER = ['timestamp','level','function','step','message','detail','elapsedMs']`。
* `MASK_PATTERNS` 配列にメール・電話番号・クレジットカード番号などを定義。
* `APP_VERSION`, `LOCK_TIMEOUT_MS`, `API_RETRY_MAX`, `DOC_FETCH_RETRY` などを Config にまとめ、ログとドキュメントのメタデータへ出力する。

---

## 5. スプレッドシート詳細設計

### 5.1 シート構造

| 列 | データ型 | 記録内容 | 生成元 |
| -- | -------- | -------- | ------ |
| `timestamp` | ISO 8601 | ログ記録時刻 | `new Date().toISOString()` |
| `level` | 文字列 | INFO/WARN/ERROR/DEBUG | Logger 呼び出し時の指定 |
| `function` | 文字列 | 呼び出し元関数 | Logger がスタックから推測 or 引数指定 |
| `step` | 文字列 | 処理ステップ | 呼び出し時引数 |
| `message` | 文字列 | 概要メッセージ | 呼び出し時引数 |
| `detail` | 文字列 | JSON 等の詳細 | JSON stringify + mask + truncate |
| `elapsedMs` | 数値 | 前ログからの経過ミリ秒 | Logger 内部計測 |

* 行 1 にヘッダー、行 2 以降にデータを配置。
* 実行開始時に `SpreadsheetWriter.resetLogSheet()` を呼び、ヘッダー行を再設定。
* 行追加は `getRange(row, 1, 1, header.length).setValues()` で行い、`flush()` はまとめて実行し性能を確保する。
* detail が 4KB を超える場合は末尾を `...(truncated)` で切り詰める。

### 5.2 UI 対応

* `onOpen()` でカスタムメニュー（例：`Debug Booster`）を作成し、`Run`, `Show Last Status`, `Open Success Doc`, `Initialize` などの項目を提供する。
* 必要に応じてシートにボタンを配置し、`run` や `initializeProject` を割り当てる。
* 実行中/完了時は `SpreadsheetApp.getUi().alert()` や `SpreadsheetApp.getActive().toast()` で通知する。

---

## 6. ドキュメント詳細設計

### 6.1 フォーマット

```
==== metadata ====
App: GAS Debugging Booster
Version: v1.0.0
ExecutedAt: 2025-09-17T12:34:56Z
HostSpreadsheet: https://docs.google.com/spreadsheets/d/<id>
Result: SUCCESS

==== main.gs ====
<source>

==== logger.gs ====
<source>
...
```

* メタデータにホストスプレッドシート URL と使用バージョンを含め、紐づきが明確になるようにする。
* ソース取得には Apps Script API の `projects.getContent` を利用する。
* ドキュメント更新は `DocumentApp.openById(docId)` → `getBody().clear()` → `appendText` or `appendParagraph`。
* スタイルはノーマルテキストで統一し、Gemini が解析しやすいよう余計な書式を付けない。

### 6.2 自動生成とエラー時の扱い

* `Setup.initializeProject()` または `DocumentWriter.getSuccessDocId_()` が初回実行時に `PropertiesService` を確認し、ID が存在しなければ `DocumentApp.create('GAS_CODE_success_latest')` でドキュメントを生成して ID を保存する。
* 例外発生時は既存ドキュメントを変更しない。エラー詳細は LOG シート `detail` 列に JSON 形式で保存する。

---

## 7. 実行フロー

1. `onOpen()`
   * カスタムメニューを追加。
   * `Setup.ensureInitialized_()` を呼び、`LOG` シートの存在確認・必要であれば作成。
   * スクリプトプロパティに `SUCCESS_DOC_ID` が無い場合はドキュメントを生成し、ユーザーへトースト通知する。
2. `initializeProject()`（メニューから明示実行可能）
   * `Setup.initializeProject()` が LOG シート初期化とドキュメント生成・ID 保存を実施。
   * 初期化結果を UI とログに記録。
3. `run()`
   1. `ScriptLock` を取得 (`waitLock(LOCK_TIMEOUT_MS)`)。
    2. `SheetContext.getLogSheet()` で LOG シートを取得し、`resetLogSheet()` でヘッダーだけの状態にする。
   3. `Logger.startRun()` が開始ログを INFO で記録 (step=`start`)。
   4. 業務処理 (`executeMainFlow_()` など) を実行し、随時 Logger API を呼ぶ。
   5. 成功時は `DocumentWriter.backupProject()` がスクリプトプロパティから ID を取得し、ドキュメントへ全ソースを出力。
   6. `Logger.flushSummary('SUCCESS', stats)` でサマリ行を追加。
4. 例外処理
   * `catch (err)` で `Logger.error('failure','run failed', err)` を記録。
   * `Logger.flushSummary('FAILURE', stats)` を出力し、ドキュメント更新は行わない。
   * UI に `SpreadsheetApp.getUi().alert('失敗しました...')` を表示。
5. finally
   * ロック解放。
   * `Logger.endRun()` 等で内部状態をリセット。

---

## 8. リトライ・エラー処理方針

* Apps Script API (Script Projects) へのリクエストは `UrlFetchApp.fetch` を利用し、429/500 時は指数バックオフで最大 3 回再試行する。
* シート書き込み失敗時は 3 回まで再試行し、継続的に失敗する場合は ERROR ログを記録して例外を再送出する。
* ロック取得に失敗した場合は WARN ログを出し、ユーザーへ再実行を案内する。
* ユーザー操作で中断された場合、Toast 等でキャンセルを通知し、ログには `status=CANCELLED` を残す。

---

## 9. マスク・サニタイズ

* `maskSensitive_(text)` でメール (`[\w.+-]+@[\w.-]+`), 電話番号, 数字 16 桁を `***masked***` に置換する。
* JSON detail は `JSON.stringify(obj, null, 2)` → `maskSensitive_` → truncate の順で処理する。
* バインド型のため、ユーザーがシートで detail を直接目視できる。マスク漏れは致命的になりやすいので単体テストを充実させる。

---

## 10. マニフェスト (`appsscript.json`)

```json
{
  "timeZone": "Asia/Tokyo",
  "runtimeVersion": "V8",
  "exceptionLogging": "STACKDRIVER",
  "oauthScopes": [
    "https://www.googleapis.com/auth/script.projects",
    "https://www.googleapis.com/auth/spreadsheets.currentonly",
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/drive.readonly"
  ],
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "ScriptProjects",
        "serviceId": "scriptprojects",
        "version": "v1"
      }
    ]
  }
}
```

* `spreadsheets.currentonly` スコープを基本とし、ホストシート以外へのアクセスを最小化する。別シートへアクセスする場合のみ `spreadsheets` に拡張する。
* ドキュメント自動生成・更新のため `documents` スコープが必要。`Drive.readonly` は成功ドキュメントの URL 取得や Gemini 登録を想定した読み取り用途。
* `Apps Script API` を高度なサービスとして有効化する。

---

## 11. 運用・チェックリスト

1. 初期設定
   * ホストスプレッドシートにバインドされた Apps Script プロジェクトを作成する。
   * カスタムメニューから `Debug Booster > Initialize` を実行し、LOG シート整備と成功ドキュメント自動生成を完了させる。
   * Gemini ジェムにシートとドキュメントをナレッジとして登録（閲覧のみ付与）。
2. リリース前テスト
   * `Run` を実行し、ログが 1 実行分のみ残ることを確認。
   * わざと `throw` してドキュメント非更新・ERROR ログを確認。
   * マスク対象（メール・電話）が detail に残っていないか確認。
   * `Initialize` を再実行してもドキュメントが重複生成されず、既存 ID が再利用されることを確認。
3. 運用
   * 定期的にドキュメントの更新日時とログの整合性をチェック。
   * Gemini 側で更新が反映されない場合は手動でナレッジを再同期。
   * ユーザーが複数いる環境ではロックエラーの頻度を監視し、必要に応じて待機時間を調整する。

---

## 12. テスト観点

| テスト | 目的 | 手順 | 期待結果 |
| ------ | ---- | ---- | -------- |
| 初期化 | 自動生成が正しく動作する | プロパティを削除 → `Initialize` 実行 | スクリプトプロパティに `SUCCESS_DOC_ID` が保存され、ドキュメントが 1 件だけ作成される |
| 正常系 | 成功時にログ & ドキュメントが更新される | テスト用ロジックで成功させる | LOG シートの最終行に `status=SUCCESS`、ドキュメントの `ExecutedAt` 更新 |
| 失敗系 | 例外時にドキュメントが保護される | 業務処理内で `throw` | ドキュメント更新なし、LOG に ERROR 行 |
| マスク | 機微情報が伏字になる | detail にメール/電話を含める | `***masked***` に変換される |
| ロック | 同時実行で競合しない | メニューから短時間で2回実行 | 片方がリトライ or WARN 終了、ログに競合記録 |
| onOpen | メニューが正常に表示される | シートを再読み込み | `Debug Booster` メニューが追加される |

---

## 13. 拡張余地 (任意)

* LOG シートとは別に「集計」シートを追加し、成功回数・失敗回数などを可視化する。
* 成功コードドキュメントへ差分ハイライトを付与し、前回との差異を Gemini に伝えやすくする。
* 設定タブを設け、スクリプトプロパティ値の確認や再生成を UI から行えるようにする。

---

## 14. まとめ

スプレッドシートにバインドした形で実装し、成功ドキュメントを自動生成・管理することで、ユーザーはログ確認・実行トリガー・状態把握をすべてシート上で完結できる。ID の取得や設定といった煩雑な作業を排除しながら、最新ログと成功コードを Gemini へ同期するデバッグ基盤を提供できる。
