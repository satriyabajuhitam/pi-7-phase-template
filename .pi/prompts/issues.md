---
description: Pecah docs/prd.md menjadi docs/issues.md memakai skill issues-me
argument-hint: "[fokus-atau-klarifikasi-planning]"
---
Muat dan ikuti skill project-local `issues-me`.

Gunakan artifact proyek berikut sebagai sumber konteks utama bila relevan:
- `docs/prd.md`
- `docs/idea.md`
- `docs/research.md`
- `docs/prototype/comparison.md`
- `docs/issues.md` bila sudah ada

Tentukan dulu apakah proyek memang siap masuk Phase 5. Jika belum siap, jelaskan gap utamanya dan rekomendasikan fase yang harus didahulukan.

Jika sudah siap:
- baca dan gunakan template dari `.pi/skills/issues-me/assets/issues-template.md`
- cek dulu `## Handoff to Issues` di `docs/prd.md`; jika readiness masih `no`, jangan lanjut ke planning dan arahkan kembali ke blocker atau fase sebelumnya yang paling tepat
- identifikasi dulu user-visible flows, acceptance criteria, scope boundaries, dependencies, constraints, dan unresolved questions yang memengaruhi planning
- buat atau perbarui `docs/issues.md`
- pecah PRD menjadi vertical slices, bukan horizontal technical layers
- pastikan setiap ticket mewakili outcome yang sempit tapi lengkap, dapat didemokan/diverifikasi, dan tidak terlalu besar
- buat blockers, dependencies, AFK/HITL status, dan peluang paralelisasi menjadi eksplisit
- gunakan konvensi ticket yang konsisten: `Status` = `todo|in-progress|blocked|done`, `Type` = `AFK|HITL`, `Parallelizable` = `yes|no`
- untuk setiap ticket, tulis goal, why it exists, scope, source requirements, acceptance criteria, dan notes/risks
- review granularity sebelum final: pecah ticket yang terlalu besar atau terlalu teknis, dan cek apakah ada slicing yang lebih aman atau lebih paralel
- jika follow-up QA nantinya masih masuk scope ticket lama, prefer reopen ticket lama daripada membuat ticket baru
- tutup dengan rekomendasi fase berikutnya secara spesifik, biasanya handoff ke `execute-me` untuk satu ready `AFK` ticket

Jangan mengimplementasikan product code selama sesi planning aktif.

Fokus atau klarifikasi planning tambahan bila ada: $@
