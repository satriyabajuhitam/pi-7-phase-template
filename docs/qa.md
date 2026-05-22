# QA

## Objective
- Memverifikasi bahwa `runs-once.sh` v1 memenuhi PRD untuk flow `NO_READY`, `DONE`, `BLOCKED`, dan `FAIL`, termasuk kontrak artifact `.runs/`, manual sync procedure, dokumentasi operator, dan kejelasan output saat user menemui masalah.

## Scope under test
- Features or flows under review:
  - seleksi ticket eligible pertama dan preflight runner
  - explicit target worker execution
  - bootstrap context + artifact contract `.runs/`
  - successful `DONE` flow dengan commit reviewable dan manual merge steps
  - safe `BLOCKED` / `FAIL` behavior
  - dokumentasi operator `docs/runs-once.md` dan local repo hygiene
  - actionable error/help messaging untuk `dirty working tree` dan `NO_READY`
- Completed tickets included:
  - `ISSUE-001`
  - `ISSUE-002`
  - `ISSUE-003`
  - `ISSUE-004`
  - `ISSUE-005`
  - `ISSUE-006`
  - `ISSUE-007` (temporary smoke-test ticket)
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
  - Branch saat artifact ini dirapikan: `ralph/ISSUE-007`
  - Commit live smoke evidence: `ad74294` — `runs-once: complete ISSUE-007`
  - Working tree saat ini tidak bersih karena ada follow-up UX improvement lokal pada `docs/issues.md`, `scripts/runs-once.mjs`, dan `tests/runs-once.test.mjs`
- Environment notes:
  - Automated evidence berasal dari `node --test tests/runs-once.test.mjs`
  - Test harness memakai repo sementara + fake `pi` wrapper untuk automated coverage
  - Tambahan HITL evidence berasal dari eksekusi `./runs-once.sh` dengan Pi CLI live pada repo kerja aktual

## Test scenarios
1. Jalankan runner saat tidak ada issue eligible dan verifikasi hasil `NO_READY`, tanpa branch issue baru, dengan artifact `.runs/` tetap tertulis.
2. Jalankan successful path dan verifikasi branch `ralph/ISSUE-XXX`, explicit target worker, session file, commit reviewable, dan langkah merge manual.
3. Verifikasi `docs/research.md` hanya diload ketika ticket secara eksplisit membutuhkannya.
4. Verifikasi preflight failure seperti dirty working tree dan missing tooling menghasilkan `FAIL` terkontrol.
5. Verifikasi `BLOCKED` saat target tidak lagi ready, termasuk pembuangan partial code dan instruksi copy-back `docs/issues.md` tanpa merge branch issue.
6. Verifikasi runner gagal menandai `DONE` bila worker selesai tetapi target issue tidak menjadi `done`.
7. Verifikasi worker exit non-zero menghasilkan `FAIL` dengan `status_reason` dan `next_action` non-empty.
8. Verifikasi dokumentasi operator mencakup usage, status outcomes, manual sync `DONE`/`BLOCKED`, dan hygiene `.runs/` / `.runs-sessions/`.
9. Verifikasi output `dirty working tree` dan `NO_READY` memberi clue langkah berikutnya yang actionable untuk operator.

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
  - real `BLOCKED` path dengan Pi CLI live belum dismoke-test secara manual; evidence saat ini masih terutama dari automated harness

## Human review checklist
- UX and behavior consistency:
  - ringkasan akhir shell mudah dipahami operator untuk tiap status
  - langkah `DONE` vs `BLOCKED` tidak ambigu
  - `FAIL` dan `NO_READY` memberi tindakan konkret, bukan hanya diagnosis umum
- Copy / labeling sanity:
  - istilah di `docs/runs-once.md`, `README.md`, dan shell summary konsisten
- Security sanity check:
  - workflow tetap HITL untuk merge kembali ke orchestrator branch
  - `BLOCKED` flow tidak mengarahkan merge branch issue
- Performance sanity check:
  - runner tetap ringan untuk repo lokal kecil; tidak ada loop multi-ticket
- Maintainability / readability spot check:
  - `scripts/runs-once.mjs` masih cukup padat; refactor modular tetap layak dipertimbangkan sebagai backlog polish, bukan blocker v1
- Pending HITL verification:
  - optional: satu smoke test manual tambahan untuk path `BLOCKED` live jika tim ingin confidence operasional lebih tinggi

## Known risks
- Automated tests membuktikan banyak behavior, tetapi tidak menggantikan semua variasi perilaku Pi CLI live.
- Implementasi utama masih terpusat di `scripts/runs-once.mjs`, sehingga maintainability dan konflik edit lintas-ticket bisa memburuk jika scope harness berkembang.
- Path `BLOCKED` sudah tervalidasi otomatis, tetapi belum mendapat smoke test manual live setingkat yang sudah dilakukan untuk `DONE`.

## Findings
- Pass:
  - `node --test tests/runs-once.test.mjs` lulus: 11 tests pass, 0 fail.
  - Evidence otomatis mencakup `NO_READY`, `DONE`, `BLOCKED`, `FAIL`, conditional research loading, explicit target enforcement, commit creation, fail-closed behavior, actionable dirty-tree messaging, dan actionable `NO_READY` guidance.
  - HITL smoke test live membuktikan dirty-working-tree preflight benar-benar memblokir run saat repo kotor.
  - HITL smoke test live membuktikan `NO_READY` berjalan benar saat repo bersih tetapi belum ada ticket eligible.
  - HITL smoke test live membuktikan successful `DONE` path benar-benar jalan dengan Pi CLI live melalui `ISSUE-007`, termasuk branch `ralph/ISSUE-007`, session file nyata, artifact `.runs/...`, dan next step merge manual.
  - Inspeksi dokumentasi via `rg -n "runs-once|NO_READY|BLOCKED|DONE|FAIL|\.runs|\.runs-sessions|git merge --no-ff|copy back|jangan merge" docs/runs-once.md README.md .gitignore scripts/runs-once.mjs` menunjukkan coverage untuk command usage, status meanings, manual merge/copy-back, dan hygiene `.runs/` / `.runs-sessions`.
  - `.gitignore` sudah mengecualikan `.runs/` dan `.runs-sessions/` sesuai keputusan hygiene v1.
- Fail:
  - none from current automated checks or observed live smoke runs.
- Uncertain:
  - Warning model-pattern dari Pi CLI muncul pada live run, tetapi sejauh evidence saat ini bersifat non-blocking.
  - Path `BLOCKED` belum mendapat smoke test manual live; evidence untuk path ini masih terutama berasal dari automated harness.

## Follow-up issues
- New AFK tickets:
  - none required from current evidence
- New HITL tickets:
  - optional: manual smoke test tambahan khusus untuk `BLOCKED` live jika tim ingin confidence operasional ekstra
- Existing tickets to reopen or unblock:
  - none required from current evidence

## Release / sign-off recommendation
- Ready for release:
  - yes for v1 scope, dengan residual risk kecil yang sudah diketahui pada smoke-test coverage `BLOCKED` live
- Ready for next execution pass:
  - no mandatory AFK implementation follow-up terlihat dari evidence saat ini
- Blocked pending HITL:
  - no
- Needs more testing:
  - optional only; tidak ada gap blocking untuk sign-off v1 saat ini

## Next step
- Recommended action:
  - Lanjut ke sign-off / merge branch hasil review yang memang ingin dipertahankan, lalu pindahkan improvement berikutnya ke backlog terpisah.
- Why:
  - Core harness v1 sudah didukung oleh automated coverage yang hijau, live smoke test untuk `FAIL` dirty-tree, `NO_READY`, dan `DONE`, serta dokumentasi operator yang konsisten. Residual uncertainty yang tersisa bersifat kecil dan tidak memblokir sign-off v1.
