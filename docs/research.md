# Research

## Objective
Memahami pola "Ralph" dari dua artikel AI Hero dan menilai bagaimana pola itu bisa diterapkan untuk menjalankan ticket `AFK` secara otomatis di repo ini.

## Questions to answer
- Apa inti pola Ralph?
- Komponen minimum apa yang dibutuhkan agar loop AFK bekerja?
- Guardrail apa yang disarankan sebelum full automation?
- Bagaimana pola itu dipetakan ke workflow repo ini yang memakai `docs/issues.md` sebagai source of truth?

## Scope
- Fokus pada dua artikel berikut:
  - `https://www.aihero.dev/getting-started-with-ralph`
  - `https://www.aihero.dev/tips-for-ai-coding-with-ralph-wiggum`
- Fokus pada implikasi untuk auto-execution ticket `AFK`.

## Sources
- AI Hero — Getting Started With Ralph
- AI Hero — 11 Tips For AI Coding With Ralph Wiggum
- Raw retrieval saved under:
  - `.firecrawl/ralph-getting-started.json`
  - `.firecrawl/ralph-tips.json`

## Findings
- **Ralph pada dasarnya adalah loop yang menjalankan prompt yang sama berulang kali.** Bukan framework kompleks; task source + progress state + feedback loops + bounded iterations adalah inti harness-nya.
- **Mulai dari HITL, lalu baru AFK.** Artikel sangat menekankan belajar loop secara manual dulu (`ralph-once.sh`) sebelum menjalankan loop penuh (`afk-ralph.sh`).
- **Task source harus jelas dan machine-readable secukupnya.** Ralph bisa membaca PRD, issues, Linear, beadfile, atau sumber lain, selama agent bisa memilih satu task berikutnya dengan jelas.
- **Progress file penting karena context window tidak persistent.** Tiap iterasi butuh state ringkas tentang apa yang sudah dikerjakan, keputusan, blocker, dan file yang berubah.
- **One iteration = one small task.** Task kecil memberi feedback lebih cepat, kualitas lebih stabil, dan mengurangi context rot.
- **Feedback loops adalah quality gate utama.** Types, unit tests, lint, dan checks lain harus dijalankan tiap iterasi; idealnya commit gagal jika checks merah.
- **Task berisiko tinggi sebaiknya tetap HITL.** AFK lebih cocok untuk pekerjaan low-risk, bounded, dan sudah punya arsitektur/fondasi yang jelas.
- **Sandbox isolation penting untuk AFK.** Artikel merekomendasikan Docker sandbox agar agent bisa edit/commit tanpa menyentuh host di luar workspace.
- **Loop harus dibatasi.** Ada max iterations dan completion signal untuk mencegah runaway cost/behavior.
- **Output loop tidak harus commit ke main.** Artikel eksplisit menyebut alternatif yang lebih aman: branch per iterasi, buka PR, update issue/comment, atau output lain selain direct commit.

## Constraints and caveats
- Dua artikel ini adalah **high-signal practitioner guidance**, bukan spec resmi platform.
- Rekomendasi mereka sangat cocok untuk repo yang sudah punya test/lint/quality gates; tanpa itu, AFK loop lebih berisiko.
- Repo ini punya invariant sendiri: **Phase 6 = one run, one ready AFK ticket** dan `docs/issues.md` adalah source of truth. Adaptasi Ralph harus menghormati invariant itu.
- Ticket `AFK` tidak semuanya aman untuk full autonomy; perlu rule seleksi dan exclusion criteria.
- Full auto-merge tidak dibahas sebagai baseline aman; pola artikel lebih dekat ke **bounded automation dengan reviewable output**.

## Recommended approach
- Adaptasi Ralph di repo ini sebaiknya menjadi **issue-driven loop**, bukan PRD-driven loop:
  - baca `docs/issues.md`
  - pilih **tepat satu** ticket `AFK` dengan `Status: todo`, dependency clear, dan aman untuk auto-run
  - jalankan eksekusi + validasi
  - update artifact status/progress
  - commit ke branch kerja atau buka draft PR
- Mulai dari **HITL autopilot** dulu:
  - satu command menjalankan satu ticket otomatis
  - manusia review hasil branch/PR
  - setelah prompt/harness stabil, baru pertimbangkan scheduler AFK
- Simpan state lintas iterasi dalam file progress lokal repo, misalnya `docs/execution-log.md` atau section khusus di `docs/issues.md`.
- Gunakan guardrail minimum:
  - max 1 ticket per run
  - hanya ticket `AFK`
  - skip jika dependency belum `done`
  - wajib run checks
  - jika check gagal, tandai `blocked` atau biarkan `in-progress` dengan log jelas
  - prefer branch + draft PR, bukan direct merge
- Untuk mode AFK penuh, tambahkan runtime boundary:
  - sandbox/container
  - max iterations / max tickets per schedule = 1
  - explicit completion/failure signals
  - notification saat selesai/gagal

## Open questions
- Apakah output yang diinginkan adalah **commit lokal**, **branch**, atau **draft PR**?
- Apakah auto-run dipicu **manual command**, **cron/scheduler**, atau **CI workflow dispatch**?
- Rule apa yang menentukan sebuah ticket `AFK` aman untuk autonomous execution?
- Di mana progress lintas run paling tepat disimpan: `docs/issues.md` saja atau file terpisah?
- Apakah repo ini sudah punya checks yang cukup kuat untuk menjadi feedback loop utama?

## Freshness note
Researched on 2026-05-21. Temuan ini bergantung pada isi dua artikel AI Hero pada tanggal tersebut dan bisa stale jika artikel berubah atau jika tooling Claude/Docker/agent harness berkembang.

## Next step
Phase 1 / idea refinement untuk mendefinisikan harness lokal: selection rules, output mode, safety rails, dan runtime model sebelum menulis PRD implementasi autopilot AFK.
