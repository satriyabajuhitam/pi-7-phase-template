---
description: Buat atau rapikan docs/prd.md memakai skill prd-me
argument-hint: "[fokus-atau-klarifikasi-prd]"
---
Muat dan ikuti skill project-local `prd-me`.

Gunakan artifact proyek berikut sebagai sumber konteks utama bila relevan:
- `docs/idea.md`
- `docs/research.md`
- `docs/prototype/comparison.md`
- file lain di `docs/prototype/` bila relevan
- `docs/prd.md` bila sudah ada

Tentukan dulu apakah proyek memang siap masuk Phase 4. Jika belum siap, jelaskan gap utamanya dan rekomendasikan fase yang harus didahulukan. Secara khusus, jangan lanjut jika masih ada lebih dari satu arah prototype yang aktif. Jika request masih terlalu lebar untuk satu PRD yang koheren, hentikan dan arahkan ke dekomposisi dulu.

Jika sudah siap:
- baca dan gunakan template dari `.pi/skills/prd-me/assets/prd-template.md`
- identifikasi dulu keputusan PRD yang harus jelas: users/actors, core flows, scope boundaries, non-goals, functional requirements, edge cases, acceptance criteria, serta constraints/dependencies
- buat atau perbarui `docs/prd.md`
- fokus pada end state, user-visible behavior, scope, non-goals, edge cases, acceptance criteria, constraints, dan dependencies
- promosikan hanya temuan research dan keputusan dari nol atau satu prototype winner yang benar-benar memengaruhi requirement
- hindari mengubah PRD menjadi implementation plan
- ajukan pertanyaan klarifikasi hanya jika benar-benar diperlukan untuk menutup ambiguity yang material, idealnya satu pertanyaan tajam pada satu waktu
- jika ambiguity penting belum bisa ditutup, tandai dengan jelas di `Open questions` daripada mengarang kepastian
- jika prototyping dipakai tetapi winner belum tunggal, hentikan dan arahkan kembali ke Phase 3
- sebelum handoff, lakukan self-review singkat pada draft PRD: ambiguity scan, contradiction scan, dan missing-edge-case scan
- jika self-review menemukan blocker nyata, perbaiki draft atau tandai blocker itu dengan jelas; jangan bluff readiness
- sebelum menutup sesi, perbarui `## Handoff to Issues` di `docs/prd.md` dengan checklist handoff, `Planning approval: approved for issues planning (correctness and scope)` jika review/approval correctness+scope memang sudah selesai, `Ready for next phase: yes/no`, dan `Primary blocker` jika readiness adalah `no`
- jangan rekomendasikan fase planning/issues jika `## Handoff to Issues` belum siap; arahkan kembali ke gap, blocker, dekomposisi yang masih dibutuhkan, atau fase sebelumnya yang paling tepat
- tutup dengan rekomendasi fase berikutnya secara spesifik, biasanya handoff ke `issues-me` bila PRD sudah solid

Jangan mengimplementasikan product code selama sesi PRD aktif.

Fokus atau klarifikasi tambahan bila ada: $@
