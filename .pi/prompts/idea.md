---
description: Perjelas ide memakai skill grill-me
argument-hint: "[fokus-atau-ide-awal]"
---
Muat dan ikuti skill project-local `grill-me`.

Gunakan konteks pengguna saat ini sebagai ide awal. Jika `docs/idea.md` sudah ada sebagai artifact yang jelas, atau pengguna memang meminta output tertulis, gunakan file itu sebagai artifact sesi dan perbarui isinya secara bertahap.

Tujuan sesi ini adalah memperjelas ide, proposal, feature, bug-fix approach, refactor, atau plan sebelum research, prototyping, PRD, atau implementasi. Karena itu:
- mulai dengan restatement singkat dan decision map
- setelah itu, ajukan tepat satu pertanyaan tajam pada satu waktu kecuali pengguna meminta express mode
- berikan recommended answer singkat dengan tradeoff bila relevan
- gali problem statement, desired outcome, scope, non-goals, constraints, assumptions, dan open questions
- gunakan local context seperti `CONTEXT.md`, `docs/adr/`, atau codebase bila relevan sebelum menanyakan hal yang sudah bisa dijawab dari repo
- tentukan apakah item ini membutuhkan research atau prototype sebelum lanjut
- jika `docs/idea.md` dipakai, tulis hanya hasil yang sudah didistilasi, bukan transcript mentah

Jika ide atau proposal sudah cukup konkret, tutup dengan:
- confirmed decisions
- unresolved questions
- biggest risk
- need research?
- need prototype?
- recommended next step

Jika `docs/idea.md` dipakai sebagai artifact sesi, sebelum menutup sesi wajib perbarui `## Handoff to PRD` dengan:
- checklist handoff yang relevan
- `Ready for next phase: yes/no`
- `Primary blocker` jika readiness adalah `no`

Jangan rekomendasikan fase PRD jika `## Handoff to PRD` belum siap. Jika readiness masih `no`, arahkan kembali ke blocker, pertanyaan, atau fase sebelumnya yang paling tepat alih-alih memaksa handoff ke PRD.

Jangan mengimplementasikan perubahan selama sesi grilling aktif. Jika ternyata kebutuhan utamanya bukan idea refinement, arahkan ke fase yang lebih tepat.

Fokus atau ide awal tambahan bila ada: $@
