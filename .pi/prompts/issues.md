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
- pastikan ada sinyal approval eksplisit `Planning approval: approved for issues planning (correctness and scope)` di `## Handoff to Issues`; jika tidak ada atau versinya malformed, hentikan dan arahkan kembali ke Phase 4
- identifikasi dulu user-visible flows, acceptance criteria, scope boundaries, dependencies, constraints, dan unresolved questions yang memengaruhi planning
- buat atau perbarui `docs/issues.md`
- pecah PRD menjadi vertical slices, bukan horizontal technical layers
- pastikan setiap ticket mewakili outcome yang sempit tapi lengkap, dapat didemokan/diverifikasi, dan tidak terlalu besar
- buat blockers, dependencies, AFK/HITL status, dan peluang paralelisasi menjadi eksplisit
- gunakan konvensi ticket yang konsisten: `Status` = `todo|in-progress|blocked|done`, `Type` = `AFK|HITL`, `Parallelizable` = `yes|no`
- untuk setiap ticket, tulis goal, why it exists, scope, source requirements, acceptance criteria, dan notes/risks
- untuk ticket non-trivial, tambahkan execution brief singkat hanya jika ticket itu benar-benar melewati threshold ini: kemungkinan menyentuh beberapa surface/area yang rawan boundary drift, path validasi atau acceptance focus tidak cukup obvious, atau satu guardrail out-of-scope singkat akan materially mengurangi ticket creep
- jika goal, scope, dan acceptance criteria sudah cukup jelas untuk eksekusi aman, omit execution brief, hapus section-nya sekalian, dan pertahankan default yang lebih ringan
- jika dipakai, jaga execution brief tetap singkat: likely touchpoints, validation focus, atau satu explicit out-of-scope guardrail; jangan ubah menjadi giant micro-plan
- review granularity sebelum final: pecah ticket yang terlalu besar atau terlalu teknis, dan cek apakah ada slicing yang lebih aman atau lebih paralel
- lakukan planning self-review singkat sebelum final: granularity scan, PRD coverage scan, dan avoidable-ambiguity scan
- jika self-review menemukan blocker nyata, rapikan ticket set atau arahkan kembali ke PRD refinement; jangan bluff readiness
- jika follow-up QA nantinya masih masuk scope ticket lama, prefer reopen ticket lama daripada membuat ticket baru
- tutup dengan rekomendasi fase berikutnya secara spesifik, biasanya handoff ke `execute-me` untuk satu ready `AFK` ticket

Jangan mengimplementasikan product code selama sesi planning aktif.

Fokus atau klarifikasi planning tambahan bila ada: $@
