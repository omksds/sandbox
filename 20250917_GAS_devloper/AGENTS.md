# Repository Guidelines

## Project Structure & Module Organization
- Root docs `GAS_detailed_design.md` (architecture) and `仕様.md` (requirements) stay authoritative; update them with every behavior change.
- Sync the Apps Script project with clasp into `src/`, keeping one module per concern (`main.gs`, `logger.gs`, `document_writer.gs`, etc.).
- Place future unit specs under `tests/` mirroring module names (`SpreadsheetWriter.test.gs`) and keep sample spreadsheets or document exports in `assets/` with IDs redacted.
- Use `.clasp.json` and `.claspignore` to keep credentials out of git; store non-sharable secrets in your clasp-managed `.env`.

## Build, Test, and Development Commands
- `npx clasp login` (once per device) establishes Apps Script auth.
- `npx clasp pull` before branching ensures local sources match production.
- `npx clasp push --watch` during development keeps Apps Script in sync; stop watch before committing to avoid noisy revisions.
- `npx clasp run run --nondev` exercises the main workflow and surfaces log output.
- `npx clasp open` quickly jumps to the online IDE to check triggers or deployment status.

## Coding Style & Naming Conventions
- Stick to two-space indentation and ES5-friendly syntax; avoid modules, async/await, or Node-only globals.
- Functions and variables use `camelCase`, helper objects `UpperCamelCase`, and shared constants `ALL_CAPS` such as `LOG_SHEET_NAME`.
- Keep log text structured as `<component>#<action>: detail` and funnel writes through the shared logger helpers.
- Run `npx eslint --ext .gs src` with the team config; add inline disables only with a brief justification.

## Testing Guidelines
- Smoke-test each change with `npx clasp run run --nondev`, then review the `LOG` sheet reset and the regenerated success document.
- When unit tests are added, keep fixtures in `tests/fixtures/` and name files `*.test.gs` so production pushes ignore them.
- Record manual verification steps and links (with redacted IDs) in every pull request until automated coverage matures.

## Commit & Pull Request Guidelines
- Follow the terse, imperative commit style already in history (`add logo`, `chore: Add .gitignore`); use prefixes like `feat:`, `fix:`, `chore:` for clarity.
- Scope each commit to one concern and update both design docs when behavior or UX changes.
- Pull requests should outline intent, enumerate validation results, and note follow-up work before requesting review.
