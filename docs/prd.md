# PRD

## Overview
V1 menambahkan harness lokal ala Ralph untuk mengeksekusi tepat satu ticket `AFK` secara semi-otomatis melalui `runs-once.sh`. Harness ini tetap menghormati workflow repo yang sudah ada: `docs/issues.md` tetap source of truth, eksekusi tetap satu issue per session fresh, hasil tetap direview manusia, dan sinkronisasi kembali ke branch orchestrator tetap manual.

## Problem statement
Saat ini repo sudah punya aturan Phase 6 yang jelas, tetapi operator masih harus melakukan banyak langkah berulang secara manual: memeriksa issue yang ready, membuat branch issue, memulai sesi fresh, menjaga agar agent hanya mengerjakan satu ticket, lalu menutup sesi dengan jejak audit yang rapi. Tanpa harness tipis, disiplin "1 issue = 1 session" mudah bocor dan operasional lokal terasa lebih berat dari yang seharusnya.

## Desired outcome
Setelah perubahan ini selesai:
- user bisa menjalankan satu command lokal untuk memproses tepat satu ticket `AFK` yang eligible
- runner selalu bekerja dari target issue yang deterministik dan branch issue yang terisolasi
- worker session selalu fresh, punya context bootstrap yang cukup, dan tidak boleh memilih issue lain
- hasil run selalu menghasilkan audit trail yang konsisten dan langkah lanjut yang jelas
- review manusia dan sinkronisasi ke orchestrator branch tetap eksplisit dan aman

## Users and actors
- Primary users:
  - Maintainer atau contributor lokal yang memakai workflow 7-phase ini untuk mengeksekusi ticket `AFK`
- Secondary users:
  - Reviewer manusia yang meninjau hasil run sebelum sinkronisasi ke orchestrator branch
- Internal actors or systems involved:
  - `runs-once.sh`
  - Pi worker non-interaktif
  - workflow/skill eksekusi repo (`execute-me`)
  - `docs/issues.md`
  - `docs/prd.md`
  - opsional `docs/research.md`
  - git branches (`orchestrator` + `ralph/ISSUE-XXX`)
  - `.runs/`

## Scope
- In scope:
  - command lokal `runs-once.sh` untuk satu run satu issue
  - seleksi mekanis issue eligible pertama dari `docs/issues.md`
  - branch-per-issue yang deterministik (`ralph/ISSUE-XXX`)
  - worker session fresh dengan context bootstrap eksplisit
  - audit trail run di `.runs/`
  - ringkasan hasil run dan langkah lanjut eksplisit
  - prosedur manual resmi untuk sinkronisasi `DONE` dan `BLOCKED`
- Included workflows:
  - eligible issue ditemukan lalu selesai `DONE`
  - target issue menjadi tidak ready lalu berakhir `BLOCKED`
  - tidak ada issue eligible lalu berakhir `NO_READY`
  - kegagalan proses/infra lalu berakhir `FAIL`
- Included surfaces or entry points:
  - `runs-once.sh`
  - `docs/issues.md`
  - `docs/prd.md`
  - `docs/research.md` bila relevan
  - `.runs/`
  - branch `ralph/ISSUE-XXX`

## Non-goals
- Explicitly out of scope for this phase:
  - `runs-afk.sh` multi-iterasi
  - sinkronisasi otomatis kembali ke orchestrator branch
  - GitHub PR automation atau integrasi issue GitHub
  - file progress tambahan seperti `progress.txt`
  - eksekusi beberapa issue dalam satu sesi
  - workflow paralel kedua yang menyalin ulang logika `execute-me`
- Nice-to-have but deferred:
  - scheduler/cron
  - cleanup policy atau retention policy yang lebih canggih untuk `.runs/`
  - index global di `.runs/`
  - helper command untuk merge/copy-back otomatis
- Related problems not solved here:
  - menentukan apakah seluruh backlog `AFK` sudah aman untuk fully autonomous looping
  - menghilangkan kebutuhan review manusia sebelum sync ke orchestrator
  - menyederhanakan seluruh Phase 6 menjadi background automation penuh

## User experience and behavior
User memulai dari branch orchestrator yang memegang `docs/issues.md` sebagai source of truth. User menjalankan `runs-once.sh` secara eksplisit.

Jika tidak ada issue eligible, command berhenti normal tanpa membuat branch issue baru. User mendapat ringkasan terstruktur, file audit run tetap dibuat, dan `next_action` memberi langkah eksplisit untuk kembali meninjau orchestrator branch atau backlog.

Jika ada issue eligible, runner memilih issue eligible pertama berdasarkan aturan mekanis yang disepakati, membuat branch `ralph/ISSUE-XXX`, lalu memulai worker session fresh. Worker menerima context bootstrap yang cukup kaya untuk tidak menebak-nebak scope: excerpt issue terpilih, issue ID target, branch target, path artifact wajib, dan instruksi bahwa `docs/issues.md` adalah source of truth.

Worker membaca excerpt ticket, memverifikasi ticket yang sama di `docs/issues.md`, lalu membaca bagian relevan di `docs/prd.md`. Jika `docs/research.md` dirujuk oleh issue atau PRD, worker membacanya; jika tidak, file ini tidak dimuat untuk menghindari noise.

Jika worker berhasil dan validation lolos, status run menjadi `DONE`. Command meninggalkan user di branch issue untuk review manusia. Hasil sukses memiliki commit di branch issue, ringkasan hasil yang jelas, audit trail di `.runs/`, dan langkah lanjut eksplisit untuk pindah ke orchestrator branch lalu melakukan merge manual.

Jika worker mendeteksi konflik material, target issue tidak lagi ready, atau eksekusi perlu keputusan manusia, status run menjadi `BLOCKED`. Partial code tidak boleh dipertahankan sebagai commit sukses. User tetap mendapat audit trail dan langkah lanjut eksplisit untuk membawa kembali hanya perubahan `docs/issues.md` yang relevan ke orchestrator branch tanpa merge branch issue.

Untuk semua status, output akhir harus konsisten: `Status`, `Issue`, `Branch`, `Session`, dan `Next action`. `Next action` harus selalu non-empty.

## Functional requirements
1. Sistem harus menyediakan entry point lokal `runs-once.sh` yang menjalankan tepat satu run untuk tepat satu issue atau berhenti normal bila tidak ada target yang eligible.
2. Sebelum memulai worker, runner harus melakukan preflight minimum: repo tidak dalam state berbahaya untuk run, `docs/issues.md` tersedia, ada tool utama yang dibutuhkan, dan current branch aman untuk memulai orchestrator flow.
3. Runner harus memilih issue eligible pertama dari `docs/issues.md` berdasarkan aturan mekanis berikut: `Status: todo`, `Type: AFK`, `Auto-run: yes`, dan semua dependency sudah selesai.
4. Jika tidak ada issue eligible, runner harus mengembalikan status `NO_READY`, tidak membuat branch issue baru, dan tetap menghasilkan artifact run serta `next_action` yang eksplisit.
5. Jika ada issue eligible, runner harus membuat branch issue deterministik `ralph/ISSUE-XXX` dari orchestrator branch sebelum worker mulai bekerja.
6. Worker harus berjalan dalam sesi fresh dan hanya boleh mengeksekusi issue ID target yang diteruskan oleh runner; worker tidak boleh diam-diam memilih ticket lain.
7. Context bootstrap worker harus memuat excerpt ticket terpilih, issue ID target, branch target, path `docs/issues.md`, path `docs/prd.md`, opsional `docs/research.md` bila relevan, penegasan bahwa `docs/issues.md` adalah source of truth, dan instruksi hard-fail jika target issue tidak cocok atau tidak ready.
8. Worker harus mengikuti urutan baca ringan: excerpt ticket target, verifikasi di `docs/issues.md`, baca bagian relevan di `docs/prd.md`, baca `docs/research.md` hanya jika diperlukan, lalu eksekusi dan validasi.
9. Jika excerpt ticket dan `docs/issues.md` tidak sinkron, worker harus mempercayai `docs/issues.md`; jika konfliknya material atau target issue tidak lagi ready, hasil run harus menjadi `BLOCKED`.
10. Worker harus memakai workflow eksekusi repo yang sama secara substantif dengan `execute-me`, sehingga harness tidak menciptakan jalur eksekusi paralel yang menyimpang.
11. Pada hasil `DONE`, runner harus memastikan issue branch memiliki commit hasil kerja, `docs/issues.md` sudah diperbarui sesuai outcome, dan artifact result menyertakan langkah sinkronisasi manual ke orchestrator branch.
12. Pada hasil `BLOCKED`, runner harus membuang partial code yang tidak boleh dipertahankan, namun tetap menyimpan update status/notes yang relevan di branch issue dan memberi langkah manual untuk membawa kembali hanya perubahan `docs/issues.md` ke orchestrator branch.
13. Untuk setiap run, runner harus menulis tepat dua artifact di `.runs/` dengan basename yang sama: satu `bootstrap.md` dan satu `result.json`.
14. Nama artifact per-run harus memuat timestamp, issue ID, dan kind agar bisa diaudit tanpa index global.
15. `result.json` minimum harus memuat `status`, `status_reason`, `issue_id`, `branch`, `session`, dan `next_action`.
16. `status_reason` harus berupa string singkat yang terkontrol. `next_action` harus berupa array langkah eksplisit dan harus selalu non-empty untuk semua status, termasuk `FAIL`.
17. Field `session` di `result.json` harus memakai session file/path Pi yang sebenarnya agar audit trail mudah dilacak.
18. Sinkronisasi kembali ke orchestrator branch untuk v1 harus tetap manual: `DONE` melalui merge branch issue, `BLOCKED` melalui copy-back perubahan `docs/issues.md` yang relevan tanpa merge code branch.

## Edge cases
- Invalid input:
  - `docs/issues.md` tidak punya field `Auto-run` pada ticket target
  - issue target yang diteruskan runner tidak ditemukan lagi saat worker memverifikasi file
- Partial failure:
  - worker sudah mengubah file tetapi validation gagal
  - update status issue berhasil tetapi commit akhir gagal
- External dependency failure:
  - proses Pi worker tidak bisa dijalankan
  - git command yang dibutuhkan runner gagal
- Timeouts / retries:
  - worker run berhenti di tengah dan runner harus mengembalikan `FAIL` dengan langkah lanjut yang jelas
- Permissions / access issues:
  - branch tidak bisa dibuat atau file artifact tidak bisa ditulis
- Duplicate or repeated actions:
  - user menjalankan `runs-once.sh` saat target issue yang sama sudah tidak eligible lagi
  - user mencoba sinkronisasi manual dua kali dari branch issue yang sama
- Empty or missing data:
  - `docs/research.md` tidak ada atau tidak relevan untuk issue target
  - `.runs/` belum ada dan harus dibuat tanpa mengganggu artifact utama repo

## Acceptance criteria
- [ ] Saat `docs/issues.md` tidak memiliki issue eligible, menjalankan `runs-once.sh` berakhir dengan `NO_READY`, tidak membuat branch issue baru, dan menghasilkan `bootstrap.md` serta `result.json` dengan `next_action` non-empty.
- [ ] Saat ada issue eligible, runner memilih issue eligible pertama sesuai urutan file, membuat branch `ralph/ISSUE-XXX`, dan worker hanya mengeksekusi issue target tersebut.
- [ ] Jika target issue tidak lagi ready saat diverifikasi worker, hasil run menjadi `BLOCKED`, partial code tidak dipertahankan sebagai hasil sukses, dan `result.json` memuat `status_reason` serta `next_action` yang jelas.
- [ ] Saat run berakhir `DONE`, branch issue memiliki commit hasil kerja, `result.json` memuat semua field minimum, dan output akhir memberi langkah eksplisit untuk merge manual ke orchestrator branch.
- [ ] Untuk setiap run, `.runs/` berisi tepat dua artifact dengan basename yang sama: satu `bootstrap.md` dan satu `result.json`.
- [ ] `docs/research.md` hanya dimuat ketika issue target atau PRD memang membutuhkannya, bukan secara default setiap run.
- [ ] `docs/idea.md` tidak dimuat ke worker v1.
- [ ] `result.json` selalu memiliki `next_action` non-empty untuk `DONE`, `NO_READY`, `BLOCKED`, dan `FAIL`.
- [ ] Workflow manusia yang sudah ada tetap bisa dipakai tanpa harness multi-iterasi; v1 tidak memerlukan `runs-afk.sh`.

## Constraints
- Business constraints:
  - workflow harus tetap ringan untuk penggunaan lokal sehari-hari
  - user tetap memegang review dan sinkronisasi manual pada v1
- Legal or compliance constraints:
  - none known
- Technical constraints that affect behavior:
  - `docs/issues.md` tetap source of truth antar-run
  - harness tidak boleh menambah state file permanen baru seperti `progress.txt`
  - harness tidak boleh menulis ulang substansi `execute-me` sebagai workflow paralel
  - `.runs/` tidak boleh menjadi dumping ground artifact sembarang
- Timeline or rollout constraints:
  - v1 harus dibatasi ke `runs-once.sh` saja
  - multi-iterasi ditunda ke fase berikutnya

## Dependencies
- Relevant external services:
  - none required for v1 local workflow
- Upstream or downstream systems:
  - Pi CLI
  - workflow/skill `execute-me`
  - `docs/issues.md`
  - `docs/prd.md`
  - opsional `docs/research.md`
  - git local repository state
- Required research findings:
  - Ralph loop sebaiknya mulai dari HITL-first, bounded, one-task-at-a-time, dengan feedback loop dan audit trail yang jelas
  - prompt tipis tidak boleh berarti context tipis untuk sesi fresh
- Prototype decisions being promoted:
  - No prototype was required before PRD; prototype ringan nanti opsional hanya untuk validasi detail operasional

## Open questions
- Apakah worker deterministik v1 sebaiknya dipicu lewat prompt template khusus repo, atau prompt inline yang digenerate runner selama kontraknya tetap tipis dan setara?
- Apakah `.runs/` perlu otomatis di-`gitignore` sebagai bagian dari UX v1, atau cukup didokumentasikan sebagai artifact operasional lokal?
- Apakah hasil `FAIL` perlu menyertakan snapshot tambahan selain `bootstrap.md` dan `result.json`, atau dua artifact per run tetap cukup untuk v1?

## Recommended next step
- Suggested next phase:
  - Phase 5 / issues planning
- Why that is the right next step:
  - Scope v1 sudah sempit, perilaku utama sudah jelas, kontrak artifact sudah cukup konkret, dan remaining open questions tidak memerlukan kembali ke research atau prototype besar
- What should happen immediately after this PRD is accepted:
  - Pecah pekerjaan menjadi ticket yang membedakan: runner/preflight, worker targeting contract, audit trail `.runs/`, dan dokumentasi/prosedur manual sinkronisasi

## Source artifacts
- `docs/idea.md`
- `docs/research.md`
- `docs/archive/prd-readiness-gate-validator.md`

## Handoff to Issues
- [x] Main user flows are clear
- [x] Acceptance criteria are testable enough for planning
- [x] Scope boundaries are explicit
- [x] Dependencies and constraints that affect slicing are visible
- [x] Material ambiguities that could break ticket breakdown are explicitly listed

Ready for next phase: yes
Primary blocker: none
Notes:
- V1 sengaja dibatasi ke `runs-once.sh`
- `runs-afk.sh` ditunda sampai model one-run flow dan sinkronisasi manual terbukti nyaman
- Prototype ringan nanti boleh dipakai hanya untuk memvalidasi detail operasional kecil, bukan untuk mengganti model inti
