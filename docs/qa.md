# QA

## Objective
- Memverifikasi bahwa `runs-once.sh` v1 memenuhi PRD untuk flow `NO_READY`, `DONE`, `BLOCKED`, dan `FAIL`, termasuk kontrak artifact `.runs/`, manual sync procedure, dan dokumentasi operator.

## Scope under test
- Features or flows under review:
  - seleksi ticket eligible pertama dan preflight runner
  - explicit target worker execution
  - bootstrap context + artifact contract `.runs/`
  - successful `DONE` flow dengan commit reviewable dan manual merge steps
  - safe `BLOCKED` / `FAIL` behavior
  - dokumentasi operator `docs/runs-once.md` dan local repo hygiene
- Completed tickets included:
  - `ISSUE-001`
  - `ISSUE-002`
  - `ISSUE-003`
  - `ISSUE-004`
  - `ISSUE-005`
  - `ISSUE-006`
- Explicitly out of scope for this pass:
  - `runs-afk.sh` multi-iterasi
  - auto-merge ke orchestrator branch
  - validasi UX TUI/interactive flow di luar mode script
  - evaluasi substantif prototype; planning menyatakan prototype winner: none

## Source artifacts
- `docs/prd.md`
- `docs/issues.md`
- Other relevant sources:
  - `docs/research.md`
  - `docs/runs-once.md`
  - `tests/runs-once.test.mjs`
  - `scripts/runs-once.mjs`
  - `README.md`
  - `.gitignore`

## Build / revision under review
- Branch / commit / working tree context:
  - Branch: `main`
  - Working tree: local implementation masih uncommitted pada saat QA pass ini dijalankan
- Environment notes:
  - Automated evidence berasal dari `node --test tests/runs-once.test.mjs`
  - Test harness memakai repo sementara + fake `pi` wrapper, bukan real end-to-end run dengan Pi CLI live

## Test scenarios
1. Jalankan runner saat tidak ada issue eligible dan verifikasi hasil `NO_READY`, tanpa branch issue baru, dengan artifact `.runs/` tetap tertulis.
2. Jalankan successful path dan verifikasi branch `ralph/ISSUE-XXX`, explicit target worker, session file, commit reviewable, dan langkah merge manual.
3. Verifikasi `docs/research.md` hanya diload ketika ticket secara eksplisit membutuhkannya.
4. Verifikasi preflight failure seperti dirty working tree dan missing tooling menghasilkan `FAIL` terkontrol.
5. Verifikasi `BLOCKED` saat target tidak lagi ready, termasuk pembuangan partial code dan instruksi copy-back `docs/issues.md` tanpa merge branch issue.
6. Verifikasi runner gagal menandai `DONE` bila worker selesai tetapi target issue tidak menjadi `done`.
7. Verifikasi worker exit non-zero menghasilkan `FAIL` dengan `status_reason` dan `next_action` non-empty.
8. Verifikasi dokumentasi operator mencakup usage, status outcomes, manual sync `DONE`/`BLOCKED`, dan hygiene `.runs/` / `.runs-sessions/`.

## Edge cases to verify
- Invalid input:
  - target issue hilang atau materially mismatched saat reverification
  - target issue tetap bukan `done` setelah worker selesai
- Permissions / access:
  - tooling `pi` missing
  - git state tidak aman untuk memulai run
- Empty state:
  - tidak ada ticket eligible (`NO_READY`)
- Error state:
  - worker exit non-zero
  - working tree dirty
- Retry / duplicate action:
  - branch issue sudah ada atau target issue tidak lagi ready saat run ulang
- External dependency failure:
  - real Pi CLI behavior belum diverifikasi dalam QA pass ini; evidence saat ini masih berbasis stubbed worker

## Human review checklist
- UX and behavior consistency:
  - ringkasan akhir shell mudah dipahami operator untuk tiap status
  - langkah `DONE` vs `BLOCKED` tidak ambigu
- Copy / labeling sanity:
  - istilah di `docs/runs-once.md`, `README.md`, dan shell summary konsisten
- Security sanity check:
  - workflow tetap HITL untuk merge kembali ke orchestrator branch
  - `BLOCKED` flow tidak mengarahkan merge branch issue
- Performance sanity check:
  - runner tetap ringan untuk repo lokal kecil; tidak ada loop multi-ticket
- Maintainability / readability spot check:
  - `scripts/runs-once.mjs` masih cukup padat; layak dipertimbangkan refactor modular setelah behavior stabil
- Pending HITL verification:
  - jalankan satu smoke test nyata dengan Pi CLI live pada repo kerja aktual sebelum sign-off final

## Known risks
- Automated tests belum membuktikan integrasi end-to-end dengan Pi CLI live; test saat ini memakai fake `pi` wrapper.
- Implementasi utama masih terpusat di `scripts/runs-once.mjs`, sehingga maintainability dan konflik edit lintas-ticket bisa memburuk jika scope harness berkembang.
- QA pass ini tidak mencakup real human usability review atas prosedur merge/copy-back di lingkungan operator nyata.

## Findings
- Pass:
  - `node --test tests/runs-once.test.mjs` lulus: 10 tests pass, 0 fail.
  - Evidence otomatis mencakup `NO_READY`, `DONE`, `BLOCKED`, `FAIL`, conditional research loading, explicit target enforcement, commit creation, dan fail-closed behavior.
  - Inspeksi dokumentasi via `rg -n "runs-once|NO_READY|BLOCKED|DONE|FAIL|\.runs|\.runs-sessions|git merge --no-ff|copy back|jangan merge" docs/runs-once.md README.md .gitignore scripts/runs-once.mjs` menunjukkan coverage untuk command usage, status meanings, manual merge/copy-back, dan hygiene `.runs/` / `.runs-sessions`.
  - `.gitignore` sudah mengecualikan `.runs/` dan `.runs-sessions/` sesuai keputusan hygiene v1.
- Fail:
  - none from executed automated checks in this QA pass.
- Uncertain:
  - Belum ada evidence HITL bahwa `runs-once.sh` bekerja baik dengan Pi CLI live, bukan hanya fake worker dalam test harness.
  - Belum ada evidence human review bahwa prosedur `BLOCKED` copy-back dan `DONE` merge manual cukup nyaman untuk operator sehari-hari.

## Follow-up issues
- New AFK tickets:
  - none required from current automated evidence
- New HITL tickets:
  - Manual smoke test: jalankan `./runs-once.sh` sekali dengan Pi CLI live pada repo kerja aktual dan review usability prosedur `DONE` / `BLOCKED`
- Existing tickets to reopen or unblock:
  - none based on current evidence

## Release / sign-off recommendation
- Ready for release:
  - not yet for final sign-off; masih butuh satu HITL smoke test nyata
- Ready for next execution pass:
  - no clear AFK implementation follow-up dari evidence saat ini
- Blocked pending HITL:
  - yes, untuk final confidence sebelum sign-off
- Needs more testing:
  - yes, tetapi fokusnya sempit: satu manual end-to-end smoke test dengan Pi CLI live

## Next step
- Recommended action:
  - Lanjut ke HITL review / manual smoke test untuk `runs-once.sh`, lalu sign-off jika hasilnya bersih.
- Why:
  - Semua evidence otomatis yang tersedia sudah hijau, tetapi gap tersisa adalah integrasi nyata dengan Pi CLI live dan kenyamanan prosedur operator, yang memang membutuhkan verifikasi manusia daripada AFK execution tambahan.
