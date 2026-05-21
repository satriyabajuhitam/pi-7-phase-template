# Idea

## Problem statement
Template 7-phase ini sudah punya struktur artifact dan prompt yang baik untuk pengelolaan konteks, tetapi belum jelas apakah guardrail yang ada cukup kuat untuk menjaga kualitas handoff antar phase tanpa terlalu bergantung pada disiplin manual.

## Desired outcome
Menentukan rekomendasi pengelolaan konteks yang cukup ketat untuk menjaga continuity antar session, tetapi tetap ringan dipakai sehari-hari.

## Scope
- Strategi pengelolaan konteks untuk workflow 7-phase di repo ini
- Kapan cukup mengandalkan prompt/skill
- Kapan perlu guardrail tambahan seperti checklist atau automation ringan
- Hardening iterasi pertama pada artifact structure, prompt guardrails, dan checklist handoff

## Non-goals
- Implementasi tooling atau automation sekarang
- Mendesain ulang seluruh workflow 7-phase
- Membahas detail product feature di luar context management
- Menambahkan CI, linter, atau validator otomatis pada iterasi pertama

## Constraints
- Workflow saat ini berbasis artifact di `docs/`
- Guardrail yang ada saat ini dominan berupa instruksi di `AGENTS.md`, prompt, dan skill
- Artifact proyek saat ini masih kosong

## Assumptions
- Tujuan utamanya adalah stabilitas konteks antar session, bukan sekadar kelengkapan dokumen
- User ingin pressure-test rekomendasi, bukan langsung mengeksekusi perubahan

## Decision map
- Governance level: cukup prompt-driven atau perlu enforcement tambahan
- Artifact quality: seberapa ketat isi minimum tiap phase harus dipenuhi
- Handoff quality: apa informasi minimum yang wajib ada sebelum pindah phase
- Operational cost: berapa banyak proses tambahan yang masih layak tanpa membuat workflow berat

## Questions asked
- Apakah target workflow ini untuk solo use atau multi-session/multi-agent?
- Apakah perubahan lokal saat ini harus dibuang agar titik mulai benar-benar bersih?
- Apakah commit baseline `eaf45c4` perlu diberi annotated tag?
- Apakah versi baru harus dikerjakan di branch feature terpisah sebelum merge ke `main`?
- Apakah validasi minimum sebelum merge cukup review artifact, atau perlu review artifact plus simulasi kecil end-to-end?
- Apakah perubahan lokal saat ini harus dibuang total, atau diparkir dulu di scratch branch / stash sebelum workspace dibersihkan?
- Apakah scope preservasi scratch branch mencakup seluruh working tree saat ini atau hanya artifact tertentu?
- Apakah setelah scratch branch dibuat, workspace utama dibersihkan dengan hard reset ke `origin/main`?
- Apakah simulasi minimum sebaiknya menguji satu alur dokumentasi penuh seperti `idea -> prd -> issues`?
- Apakah kriteria lolos simulasi cukup didefinisikan sebagai: tidak bingung fase, keputusan inti tidak hilang, dan konteks tidak perlu diulang?

## Decisions made
- Baseline rollback akan memakai commit `origin/main` saat ini (`eaf45c4`)
- Perubahan berikutnya sebaiknya tidak dimulai dari working tree lokal yang kotor
- Titik mulai untuk versi baru harus clean dan terisolasi dari eksperimen lokal
- Commit baseline perlu diberi annotated tag agar rollback eksplisit
- Versi baru harus dikerjakan di branch feature terpisah lalu di-merge ke `main` setelah validasi
- Naming kerja yang disukai adalah deskriptif tapi tetap ringkas
- Kandidat naming yang layak: tag `v1-pre-context-hardening`, branch `context-hardening`
- Validasi minimum sebelum merge harus mencakup review artifact plus simulasi kecil end-to-end
- Perubahan lokal saat ini tidak boleh dibuang buta; perlu dipreservasi dulu
- Media preservasi yang dipilih sebaiknya scratch branch + commit WIP, bukan stash
- Seluruh working tree saat ini sebaiknya dipreservasi ke scratch branch, bukan hanya `docs/idea.md`
- Setelah scratch branch dibuat, workspace utama sebaiknya dibersihkan dengan hard reset ke `origin/main`
- Simulasi minimum yang diinginkan sebaiknya menguji satu alur dokumentasi penuh, bukan review per-file saja
- Alur kandidat yang cukup representatif: `idea -> prd -> issues`
- Rubric lolos minimum untuk simulasi adalah: artifact dapat dibuat tanpa kebingungan fase, keputusan inti tidak hilang saat handoff, dan konteks dari phase sebelumnya tidak perlu ditulis ulang
- Iterasi hardening pertama harus dibatasi pada artifact structure, prompt guardrails, dan checklist handoff
- Automation/CI harus ditunda sampai guardrail manual terbukti berguna lewat simulasi
- Checklist handoff harus menjadi fokus pertama dalam hardening iterasi ini
- Checklist handoff awal harus dibatasi pada dua transisi: `idea -> prd` dan `prd -> issues`
- Checklist `idea -> prd` harus mengukur readiness requirement, bukan kualitas prose dokumen
- Checklist minimum `idea -> prd` yang disetujui mencakup 6 hal: problem statement jelas, desired outcome jelas, scope awal jelas, non-goals jelas, constraints/asumsi penting tercatat, dan open questions material sudah ditandai
- Checklist `prd -> issues` harus mengukur readiness untuk dipecah menjadi eksekusi, bukan sekadar kelengkapan requirement
- Checklist minimum `prd -> issues` yang disetujui mencakup 5 hal: main user flows jelas, acceptance criteria cukup testable, scope boundaries tegas, dependencies/constraints yang memengaruhi slicing terlihat, dan ambiguity material yang bisa merusak breakdown sudah ditandai
- Perubahan artifact structure harus seminimal mungkin dan hanya mendukung checklist yang sudah disetujui
- Jangan menambah file baru pada iterasi pertama; bukti readiness harus hidup dekat dengan artifact sumbernya
- Pendekatan struktur yang diprioritaskan: tambahkan handoff checklist section atau tajamkan section yang sudah ada
- Bentuk struktur minimum yang disetujui: `docs/idea.md` memiliki `## Handoff to PRD` dan `docs/prd.md` memiliki `## Handoff to Issues`
- Kedua section handoff harus memakai checklist eksplisit berbentuk checkbox, bukan prose bebas
- Guardrail prompt iterasi pertama harus dibatasi pada tiga perilaku wajib: jangan lanjut phase jika checklist handoff belum terpenuhi, isi/update section handoff saat menutup phase, dan jika belum siap maka rekomendasikan phase sebelumnya atau blocker question yang tersisa
- Setiap section handoff harus memiliki keputusan eksplisit `Ready for next phase: yes/no` selain checkbox granular
- Jika `Ready for next phase: no`, section handoff wajib mencatat blocker spesifik
- Jika belum ready, handoff juga harus menunjuk satu `Primary blocker` agar routing tetap tegas

## Open questions
- Apakah perlu simulasi tambahan untuk alur eksekusi/QA setelah hardening awal selesai
- Apakah lebih aman bekerja di clone/worktree baru meski hard reset sudah dilakukan
- Apakah setelah merge perlu dibuat release/tag kedua untuk menandai versi hardening baru

## Need research?
- No

## Need prototype?
- No

## Biggest risk
Menjalankan perubahan tanpa simulasi handoff yang benar-benar memeriksa continuity, sehingga template tampak lebih rapi tetapi tidak benar-benar lebih tahan dipakai lintas session.

## Recommended next step
Turunkan keputusan handoff yang sudah disepakati ke draft perubahan konkret pada `docs/idea.md`, `docs/prd.md`, dan prompt phase terkait, lalu uji dengan simulasi `idea -> prd -> issues`.

## Handoff to PRD
- [x] Problem statement is clear
- [x] Desired outcome is clear
- [x] Initial scope is clear
- [x] Non-goals are clear
- [x] Important constraints and assumptions are recorded
- [x] Material open questions are explicitly listed

Ready for next phase: yes
Primary blocker: none
Notes:
- This idea is ready to be formalized into `docs/prd.md`.
- If `Ready for next phase: no`, replace `none` with the single most important blocker.
