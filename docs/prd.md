# PRD

## Overview
Increment berikutnya menambahkan `runs-afk.sh` sebagai harness lokal multi-iterasi yang bounded di atas `runs-once.sh`. Tujuannya bukan mengganti kontrak aman `runs-once.sh`, tetapi mengurangi friksi saat operator ingin memproses beberapa ticket `AFK` yang eligible secara berurutan dengan guardrail yang tetap ketat, audit trail yang jelas, dan source of truth yang tetap berada di `docs/issues.md` pada branch orchestrator.

## Problem statement
`runs-once.sh` v1 sudah membuat satu sesi eksekusi menjadi aman dan reviewable, tetapi operator masih harus mengulang banyak langkah manual ketika ada beberapa ticket `AFK` yang eligible: menjalankan command lagi, kembali ke branch orchestrator, merge hasil sukses, lalu memulai sesi berikutnya. Friksi ini membuat loop multi-ticket tetap berat secara operasional walaupun perilaku satu-ticket sudah cukup baik.

## Desired outcome
Setelah perubahan ini selesai:
- user bisa menjalankan satu command bounded untuk memproses beberapa ticket `AFK` secara berurutan
- setiap ticket tetap dieksekusi lewat session fresh terpisah melalui `runs-once.sh`
- `docs/issues.md` pada branch orchestrator tetap menjadi source of truth antar-iterasi
- hanya hasil `DONE` yang boleh otomatis disinkronkan kembali ke orchestrator branch
- hasil loop selalu berhenti secara prediktif, punya alasan berhenti yang jelas, dan meninggalkan audit trail agregat yang mudah ditelusuri

## Users and actors
- Primary users:
  - Maintainer atau contributor lokal yang ingin menjalankan beberapa ticket `AFK` secara berurutan tanpa kehilangan guardrail `runs-once.sh`
- Secondary users:
  - Reviewer manusia yang meninjau hasil branch issue dan outcome loop setelah batch selesai atau berhenti
- Internal actors or systems involved:
  - `runs-afk.sh`
  - `runs-once.sh`
  - Pi worker non-interaktif yang tetap dipakai lewat `runs-once.sh`
  - `docs/issues.md`
  - `docs/prd.md`
  - opsional `docs/research.md`
  - git branches (`orchestrator` + `ralph/ISSUE-XXX`)
  - `.runs/`

## Scope
- In scope:
  - command lokal `runs-afk.sh <iterations>` untuk bounded multi-iteration local loop
  - pemanggilan berulang `runs-once.sh` sebagai primitive resmi per iterasi
  - auto-return ke orchestrator branch dan auto-merge lokal hanya untuk iterasi `DONE`
  - stop policy yang eksplisit untuk `DONE`, `NO_READY`, `BLOCKED`, `FAIL`, dan merge failure
  - artifact agregat per-loop di `.runs/`
  - ringkasan final human-readable ke stdout
- Included workflows:
  - satu atau lebih iterasi `DONE` lalu berhenti karena `NO_READY`
  - satu atau lebih iterasi `DONE` lalu berhenti karena batas iterasi tercapai
  - iterasi `DONE` lalu merge ke orchestrator gagal atau conflict
  - iterasi berakhir `BLOCKED`
  - iterasi berakhir `FAIL`
  - iterasi pertama langsung `NO_READY`
- Included surfaces or entry points:
  - `runs-afk.sh`
  - `runs-once.sh`
  - `docs/issues.md`
  - `.runs/`
  - branch orchestrator dan branch issue `ralph/ISSUE-XXX`

## Non-goals
- Explicitly out of scope for this phase:
  - mengubah kontrak dasar atau behavior inti `runs-once.sh`
  - auto-diagnosis setelah `BLOCKED`
  - auto-create issue resmi atau auto-edit `docs/issues.md` di luar flow eksekusi normal `runs-once.sh` + merge sukses
  - scheduler, cron, daemon, atau background automation tak terbatas
  - GitHub PR automation atau integrasi issue tracker eksternal
  - auto-delete branch issue setelah merge sukses
  - stdout machine-readable yang menjadi kontrak scripting resmi
- Nice-to-have but deferred:
  - cleanup policy branch issue yang lebih canggih
  - retention policy artifact `.runs/`
  - helper terpisah untuk branch hygiene atau cleanup lama
  - subflow diagnosis opsional yang hanya membuat draft follow-up
- Related problems not solved here:
  - menentukan apakah seluruh backlog `AFK` sudah aman untuk autonomous execution penuh
  - menghilangkan kebutuhan review manusia untuk hasil batch
  - menjadikan `runs-afk.sh` sebagai workflow planning, triage, atau diagnosis otomatis

## User experience and behavior
User memulai dari branch orchestrator yang bersih dan menjalankan `runs-afk.sh` dengan jumlah iterasi maksimum yang eksplisit.

Jika tidak ada issue eligible sejak awal, loop berhenti normal tanpa menjalankan iterasi kerja tambahan. User tetap mendapat artifact agregat dan ringkasan akhir yang menjelaskan bahwa tidak ada ticket eligible.

Jika sebuah iterasi `runs-once.sh` berakhir `DONE`, wrapper kembali ke branch orchestrator, melakukan merge lokal `--no-ff` dari branch issue yang baru selesai, lalu hanya setelah merge sukses wrapper boleh memulai iterasi berikutnya.

Jika merge sukses tetapi batas iterasi sudah habis, loop berhenti normal dan menjelaskan bahwa batch berhenti karena cap iterasi yang diminta user sudah tercapai.

Jika sebuah iterasi berakhir `BLOCKED`, loop berhenti total. Wrapper tidak boleh mencoba diagnosis otomatis, tidak boleh membuat follow-up issue resmi, dan tidak boleh lanjut ke ticket berikutnya. Operator harus meninjau artifact run yang sudah ada.

Jika sebuah iterasi berakhir `FAIL`, atau jika merge pasca-`DONE` gagal atau conflict, loop berhenti total dan tidak boleh mencoba ticket berikutnya. Operator harus diberi alasan berhenti yang jelas dan tahu iterasi mana yang terakhir berhasil.

Untuk semua hasil akhir, `runs-afk.sh` menulis satu artifact JSON agregat di `.runs/` dan mencetak satu ringkasan final human-readable ke stdout. Summary agregat harus menunjukkan status akhir loop, alasan berhenti, jumlah iterasi yang benar-benar dijalankan, branch orchestrator, daftar issue yang diproses beserta outcome masing-masing, dan pointer ke artifact per-run agar audit cepat tetap mudah.

## Functional requirements
1. Sistem harus menyediakan entry point lokal `runs-afk.sh <iterations>` untuk menjalankan bounded multi-iteration loop di atas `runs-once.sh`.
2. `runs-afk.sh` harus menolak input iterasi yang tidak valid dan hanya berjalan ketika user memberi jumlah iterasi maksimum yang eksplisit.
3. Sebelum loop dimulai, wrapper harus memverifikasi state awal aman untuk orchestrator flow, termasuk repo bisa memulai `runs-once.sh` secara sah dari branch orchestrator.
4. Wrapper harus menjalankan paling banyak sejumlah iterasi yang diminta user, tidak lebih.
5. Setiap iterasi harus tetap memakai `runs-once.sh` sebagai primitive resmi sehingga satu iterasi tetap berarti satu issue dan satu session fresh.
6. Wrapper hanya boleh lanjut ke iterasi berikutnya setelah iterasi sebelumnya berakhir `DONE` dan merge lokal kembali ke branch orchestrator berhasil.
7. Jika sebuah iterasi berakhir `NO_READY`, loop harus berhenti normal tanpa error dan tidak boleh mencoba iterasi tambahan.
8. Jika sebuah iterasi berakhir `BLOCKED`, loop harus berhenti total dan tidak boleh memicu diagnosis otomatis, tidak boleh membuat issue resmi baru, dan tidak boleh lanjut ke iterasi berikutnya.
9. Jika sebuah iterasi berakhir `FAIL`, loop harus berhenti total dengan hasil error yang jelas dan tidak boleh lanjut ke iterasi berikutnya.
10. Jika merge pasca-`DONE` gagal atau conflict, loop harus berhenti total dan tidak boleh lanjut ke iterasi berikutnya.
11. Setelah setiap iterasi `DONE`, wrapper harus kembali ke branch orchestrator dan melakukan merge lokal `--no-ff` dari branch issue yang baru selesai sebelum mengevaluasi apakah loop boleh lanjut.
12. Wrapper tidak boleh menghapus branch issue otomatis setelah merge sukses pada v1.
13. Untuk setiap loop, wrapper harus menulis tepat satu artifact agregat machine-readable di `.runs/`.
14. Artifact agregat minimum harus memuat: status akhir loop, alasan berhenti, jumlah iterasi yang dijalankan, branch orchestrator, daftar issue yang diproses beserta outcome-nya, dan pointer eksplisit ke artifact per-run tiap iterasi.
15. Pointer audit pada artifact agregat harus cukup untuk membawa operator ke artifact `bootstrap` dan `result` dari tiap iterasi tanpa perlu menebak-nebak nama file.
16. Ringkasan final di stdout harus human-readable dan konsisten dengan artifact agregat, tetapi stdout tidak perlu menjadi kontrak machine-readable resmi.
17. Jika batas iterasi tercapai setelah satu atau lebih iterasi sukses, loop harus berhenti normal dan artifact agregat harus menyatakan bahwa alasan berhenti adalah cap iterasi, bukan kegagalan.
18. Wrapper harus mempertahankan `docs/issues.md` pada branch orchestrator sebagai source of truth antar-iterasi; tidak boleh ada jalur lain yang diam-diam mengambil alih state loop permanen.

## Edge cases
- Invalid input:
  - argumen iterasi hilang
  - argumen iterasi bukan bilangan bulat positif
- Partial failure:
  - beberapa iterasi awal sukses, lalu iterasi berikutnya `BLOCKED`
  - iterasi `DONE` sukses tetapi merge kembali ke orchestrator gagal
- External dependency failure:
  - `runs-once.sh` tidak bisa dipanggil
  - git merge gagal karena conflict atau masalah repo lokal
- Timeouts / retries:
  - worker di dalam `runs-once.sh` berhenti di tengah dan mengembalikan `FAIL`
  - batch berhenti di tengah setelah sebagian iterasi sukses
- Permissions / access issues:
  - wrapper tidak bisa menulis artifact agregat
  - branch orchestrator tidak bisa di-checkout kembali
- Duplicate or repeated actions:
  - user menjalankan `runs-afk.sh` saat branch issue lama masih ada dari run sebelumnya
  - loop berhenti karena `NO_READY` padahal sebelumnya sudah menyelesaikan beberapa iterasi sukses
- Empty or missing data:
  - artifact per-run tidak ditemukan saat wrapper menyusun summary agregat
  - iterasi pertama langsung `NO_READY`

## Acceptance criteria
- [ ] Menjalankan `runs-afk.sh <iterations>` dengan input iterasi valid memproses paling banyak sejumlah iterasi yang diminta, tidak lebih.
- [ ] Jika iterasi pertama atau iterasi berikutnya menghasilkan `NO_READY`, loop berhenti normal, tidak mencoba iterasi tambahan, dan menulis summary agregat dengan alasan berhenti yang sesuai.
- [ ] Jika sebuah iterasi menghasilkan `DONE` lalu merge kembali ke orchestrator sukses, loop boleh lanjut ke iterasi berikutnya selama batas iterasi belum habis.
- [ ] Jika merge pasca-`DONE` gagal atau conflict, loop berhenti total sebelum mencoba issue berikutnya dan summary agregat menunjukkan titik berhentinya.
- [ ] Jika sebuah iterasi menghasilkan `BLOCKED`, loop berhenti total, tidak memicu diagnosis otomatis, tidak membuat issue resmi baru, dan tidak lanjut ke iterasi berikutnya.
- [ ] Jika sebuah iterasi menghasilkan `FAIL`, loop berhenti total dan hasil akhir memperjelas bahwa batch gagal, bukan selesai normal.
- [ ] Artifact agregat per-loop memuat status akhir loop, alasan berhenti, jumlah iterasi dijalankan, branch orchestrator, daftar issue + outcome, dan pointer ke artifact per-run tiap iterasi.
- [ ] Ringkasan final ke stdout konsisten dengan artifact agregat dan dapat dibaca manusia tanpa membuka file JSON terlebih dahulu.
- [ ] Branch issue hasil iterasi `DONE` tidak dihapus otomatis oleh wrapper v1.

## Constraints
- Business constraints:
  - workflow harus tetap ringan untuk penggunaan lokal sehari-hari
  - `runs-afk.sh` harus terasa sebagai helper semi-otomatis, bukan sistem orchestration besar
- Legal or compliance constraints:
  - none known
- Technical constraints that affect behavior:
  - `docs/issues.md` tetap source of truth antar-iterasi
  - `runs-once.sh` tetap primitive resmi per iterasi
  - wrapper tidak boleh menambah state permanen baru seperti `progress.txt`
  - artifact agregat loop tidak boleh menggantikan artifact detail per-run
  - stdout bukan kontrak machine-readable resmi
- Timeline or rollout constraints:
  - phase ini harus fokus pada local bounded loop, bukan scheduler atau background runner
  - boundary diagnosis/planning tetap di luar scope v1

## Dependencies
- Relevant external services:
  - none required for local v1 loop
- Upstream or downstream systems:
  - `runs-once.sh`
  - Pi CLI melalui flow yang sudah dipakai `runs-once.sh`
  - `docs/issues.md`
  - git local repository state
  - `.runs/`
- Required research findings:
  - Ralph loop sebaiknya bounded, one-task-at-a-time, dan memakai feedback loop yang jelas
  - task source dan output loop boleh dikustomisasi selama behavior tetap jelas dan auditable
  - automation yang lebih aman tidak harus commit langsung ke main; branch/reviewable outputs tetap valid
- Prototype decisions being promoted:
  - No prototype was required before PRD; prototype ringan nanti opsional hanya untuk mengecek UX summary agregat

## Open questions
- Tidak ada open question material yang memblokir planning. Detail kecil seperti nama field exact pada JSON agregat bisa diputuskan saat issue breakdown selama behavior di PRD tetap dijaga.

## Recommended next step
- Suggested next phase:
  - Phase 5 / issues planning
- Why that is the right next step:
  - Behavior loop, stop policy, scope boundaries, dan kontrak audit utama sudah cukup jelas untuk dipecah menjadi ticket yang terencana
- What should happen immediately after this PRD is accepted:
  - Pecah pekerjaan ke ticket terpisah untuk wrapper entry point, merge/handoff antar-iterasi, summary agregat, dan operator-facing output/validation

## Source artifacts
- `docs/idea.md`
- `docs/research.md`

## Handoff to Issues
- [x] Main user flows are clear
- [x] Acceptance criteria are testable enough for planning
- [x] Scope boundaries are explicit
- [x] Dependencies and constraints that affect slicing are visible
- [x] Material ambiguities that could break ticket breakdown are explicitly listed

Ready for next phase: yes
Primary blocker: none
Notes:
- `runs-afk.sh` tetap wrapper bounded di atas `runs-once.sh`, bukan workflow eksekusi paralel baru
- Source of truth antar-iterasi tetap `docs/issues.md` pada branch orchestrator
- `BLOCKED` dan `FAIL` tetap memantul ke manusia; tidak ada diagnosis/planning otomatis di v1
- Stdout final cukup human-readable; JSON agregat adalah surface machine-readable resmi
