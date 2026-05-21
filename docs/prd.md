# PRD

## Overview
Minor release ini menambahkan readiness-gate validator untuk workflow template 7-phase dan merapikan konsistensi hardening di seluruh permukaan utama workflow. Tujuannya adalah membuat handoff `idea -> PRD` dan `PRD -> issues` lebih konsisten, lebih sulit dibypass, dan tetap ringan dipakai oleh maintainer template maupun repo turunan.

## Problem statement
`v1-context-hardening` sudah memperkuat rule handoff, tetapi enforcement masih tersebar dan parsial. Saat ini sebagian guardrail hidup di `AGENTS.md`, prompt, dan template PRD, sehingga user masih bisa menemukan jalur yang tidak sepenuhnya menegakkan rule yang sama. Selain itu belum ada validator otomatis yang memberi feedback cepat di lokal dan pagar keras di CI.

## Desired outcome
Setelah perubahan ini selesai:
- aturan handoff untuk `idea -> PRD` dan `PRD -> issues` konsisten di skill, prompt, template, dan repo guidance
- tersedia validator ringan yang memeriksa `docs/idea.md` dan `docs/prd.md`
- validasi memberi feedback advisory di lokal dan memblokir di CI bila readiness gate dilanggar
- clean template state tetap aman dan tidak rusak oleh validator

## Users and actors
- Primary users:
  - Maintainer workflow template
  - Contributor yang memakai workflow ini di repo turunan
- Secondary users:
  - Reviewer yang ingin memastikan phase handoff tidak dibypass
- Internal actors or systems involved:
  - Local validation command/script
  - CI runner

## Scope
- In scope:
  - Konsistensi rule handoff di `AGENTS.md`, prompt terkait, skill terkait, dan template artifact terkait
  - Validator readiness gate untuk `docs/idea.md` dan `docs/prd.md`
  - Mode feedback advisory di lokal
  - Mode feedback blocking di CI
  - Dokumentasi perilaku validator dan handoff readiness yang relevan untuk pengguna template
- Included workflows:
  - Penulisan atau refinement `docs/idea.md` sebelum handoff ke PRD
  - Penulisan atau refinement `docs/prd.md` sebelum handoff ke Issues
  - Validasi lokal sebelum commit/push atau sebelum lanjut fase
  - Validasi CI saat perubahan diajukan untuk merge
- Included surfaces or entry points:
  - `docs/idea.md`
  - `docs/prd.md`
  - skill dan prompt yang mengarahkan Phase 1, 4, dan 5
  - dokumentasi repo yang menjelaskan perilaku baru

## Non-goals
- Explicitly out of scope for this phase:
  - Hardening penuh untuk `issues -> execute`, `execute -> QA`, atau `QA -> release`
  - Penilaian semantik terhadap kualitas isi artifact
  - Implementasi product/app feature di luar workflow template
- Nice-to-have but deferred:
  - Ekstensi validator ke fase berikutnya
  - Release automation yang lebih luas dari kebutuhan validator ini
- Related problems not solved here:
  - Menentukan apakah sebuah ide atau PRD sudah “bagus” secara substantif
  - Menghilangkan seluruh kemungkinan bypass berbasis keputusan manusia di luar artifact

## User experience and behavior
Saat contributor bekerja pada `docs/idea.md` atau `docs/prd.md`, workflow tetap terasa ringan tetapi lebih aman.

Di lokal, user dapat menjalankan validator dan menerima hasil yang jelas namun tidak memblokir. Jika readiness gate belum valid, user melihat pesan yang menjelaskan file mana yang bermasalah, rule mana yang gagal, dan apa yang harus diperbaiki.

Di CI, rule yang sama dijalankan sebagai pagar keras. Jika artifact aktif melanggar readiness gate, CI gagal dan menunjukkan alasan yang spesifik.

Untuk clean template state, file artifact yang masih kosong tidak dianggap error. Validator harus memperlakukan artifact kosong sebagai belum aktif sehingga template tetap bersih dan usable.

Untuk artifact aktif, perilakunya harus konsisten:
- `docs/idea.md` harus punya `## Handoff to PRD`
- `docs/prd.md` harus punya `## Handoff to Issues`
- field readiness wajib ada
- logika minimum readiness wajib konsisten dengan status checklist dan blocker

Prompt, skill, dan guidance repo juga harus memakai bahasa handoff yang selaras agar user tidak menerima instruksi yang saling bertentangan.

## Functional requirements
1. Workflow surfaces yang relevan harus memakai rule handoff yang konsisten untuk `idea -> PRD` dan `PRD -> issues`, termasuk section handoff, readiness field, dan blocker semantics.
2. Sistem harus menyediakan validator yang memeriksa `docs/idea.md` dan `docs/prd.md` ketika file tersebut aktif/non-empty.
3. Untuk `docs/idea.md` yang aktif, validator harus memverifikasi keberadaan `## Handoff to PRD`, field `Ready for next phase`, dan field `Primary blocker`.
4. Untuk `docs/prd.md` yang aktif, validator harus memverifikasi keberadaan `## Handoff to Issues`, field `Ready for next phase`, dan field `Primary blocker`.
5. Jika `Ready for next phase: no`, validator harus menandai error bila `Primary blocker` kosong atau bernilai `none`.
6. Jika `Ready for next phase: yes`, validator harus menandai error bila masih ada checklist handoff yang unchecked pada section handoff yang relevan.
7. Di lokal, validator harus mengembalikan hasil advisory yang jelas dan actionable tanpa menjadi pagar merge wajib.
8. Di CI, validator harus memblokir perubahan bila rule readiness gate yang divalidasi gagal.
9. Artifact kosong pada clean template state harus diperlakukan sebagai inactive dan tidak menyebabkan validasi gagal.
10. Dokumentasi repo yang relevan harus menjelaskan kapan validator berlaku, apa yang dicek, dan bagaimana membaca hasilnya.

## Edge cases
- Invalid input:
  - `Ready for next phase` tidak bernilai `yes` atau `no`
  - `Primary blocker` ada tetapi kosong atau placeholder yang ekuivalen dengan tidak ada blocker saat readiness `no`
- Partial failure:
  - Satu artifact valid dan satu artifact tidak valid; hasil harus menunjukkan file yang gagal tanpa menyamarkan file yang lolos
- External dependency failure:
  - Jika CI tidak bisa menjalankan validator karena environment failure, hasil harus tampak sebagai kegagalan CI, bukan lulus diam-diam
- Timeouts / retries:
  - Validator harus cukup ringan untuk dijalankan berulang tanpa penalti besar pada workflow biasa
- Permissions / access issues:
  - Jika file target tidak bisa dibaca, hasil harus eksplisit sebagai kegagalan validasi, bukan skip diam-diam
- Duplicate or repeated actions:
  - Menjalankan validator berulang pada state yang sama harus memberi hasil yang konsisten
- Empty or missing data:
  - File artifact kosong harus dianggap inactive
  - Artifact aktif tanpa section handoff wajib gagal validasi

## Acceptance criteria
- [ ] Pada artifact aktif, `docs/idea.md` yang tidak memiliki `## Handoff to PRD`, readiness field, atau blocker field gagal validasi dengan pesan yang spesifik.
- [ ] Pada artifact aktif, `docs/prd.md` yang tidak memiliki `## Handoff to Issues`, readiness field, atau blocker field gagal validasi dengan pesan yang spesifik.
- [ ] Jika readiness bernilai `no`, artifact gagal validasi ketika blocker kosong atau `none`.
- [ ] Jika readiness bernilai `yes`, artifact gagal validasi ketika masih ada checklist handoff yang unchecked.
- [ ] Menjalankan validator secara lokal menghasilkan feedback advisory yang tidak memerlukan merge-blocking context.
- [ ] Menjalankan validator di CI memblokir perubahan ketika rule yang sama gagal.
- [ ] File `docs/idea.md` dan `docs/prd.md` yang masih kosong pada clean template state tidak menyebabkan validasi gagal.
- [ ] Prompt, skill, dan template yang relevan tidak lagi memberi instruksi handoff yang bertentangan untuk dua fase yang dicakup.
- [ ] Dokumentasi yang relevan menjelaskan perilaku validator dan batas scope minor release ini.

## Constraints
- Business constraints:
  - Workflow harus tetap ringan untuk template umum, bukan hanya untuk satu repo spesifik
- Legal or compliance constraints:
  - none known
- Technical constraints that affect behavior:
  - Repo menjaga `docs/` tetap kosong pada clean template state
  - Validasi harus berbasis artifact yang ada di repo, bukan context percakapan saja
- Timeline or rollout constraints:
  - Scope dibatasi untuk minor release agar perubahan tetap fokus dan selesai end-to-end

## Dependencies
- Relevant external services:
  - CI provider yang menjalankan check repository
- Upstream or downstream systems:
  - Skill dan prompt Phase 1, 4, dan 5
  - Dokumentasi repo untuk onboarding dan usage guidance
- Required research findings:
  - none
- Prototype decisions being promoted:
  - No prototype was needed for this change

## Open questions
- Apakah validator perlu menyiapkan struktur ekstensi generik untuk fase berikutnya sejak iterasi pertama, atau cukup modular secara internal tanpa surface area tambahan?
- Release hygiene minimum apa yang wajib untuk minor release ini: cukup update docs relevan, atau perlu changelog/release notes terstruktur di repo?
- Apakah CI harus selalu memvalidasi seluruh active artifact state, atau cukup state repository yang relevan terhadap perubahan saat ini?

## Recommended next step
- Suggested next phase:
  - Phase 5 / issues planning
- Why that is the right next step:
  - Scope, boundaries, behavior, dan acceptance criteria sudah cukup jelas untuk dipecah menjadi ticket vertical slice
- What should happen immediately after this PRD is accepted:
  - Pecah pekerjaan menjadi ticket untuk parity updates, validator behavior, CI integration, dan documentation updates

## Source artifacts
- `docs/idea.md`
- `docs/research.md`
- `docs/prototype/comparison.md`

## Handoff to Issues
- [x] Main user flows are clear
- [x] Acceptance criteria are testable enough for planning
- [x] Scope boundaries are explicit
- [x] Dependencies and constraints that affect slicing are visible
- [x] Material ambiguities that could break ticket breakdown are explicitly listed

Ready for next phase: yes
Primary blocker: none
Notes:
- Scope minor release sengaja dibatasi ke `docs/idea.md` dan `docs/prd.md`
- Enforcement model: advisory lokal, blocking CI
- Open questions yang tersisa dianggap non-blocking untuk planning
