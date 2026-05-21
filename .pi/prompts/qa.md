---
description: Buat atau perbarui docs/qa.md memakai skill qa-me
argument-hint: "[fokus-atau-klarifikasi-qa]"
---
Muat dan ikuti skill project-local `qa-me`.

Gunakan artifact proyek berikut sebagai sumber konteks utama:
- `docs/prd.md`
- `docs/issues.md`
- `docs/research.md`
- `docs/prototype/comparison.md`
- `docs/qa.md` bila sudah ada
- file test, config, atau area implementasi terkait bila relevan

Tentukan dulu apakah proyek memang siap masuk Phase 7. Jika belum siap, jelaskan gap utamanya dan rekomendasikan fase yang harus didahulukan.

Jika sudah siap:
- baca dan gunakan template dari `.pi/skills/qa-me/assets/qa-template.md`
- buat atau perbarui `docs/qa.md`
- turunkan PRD dan status issue menjadi test scenarios, edge cases, human review checklist, dan sign-off recommendation
- bedakan dengan jelas automated checks vs human review
- catat findings hanya jika memang ada evidence dari test, inspection, atau verifikasi aktual
- jika ada follow-up work yang jelas, rekomendasikan atau catat sebagai AFK/HITL di loop berikutnya
- jika failure masih butuh repro dan isolasi sebelum aman dieksekusi, rekomendasikan `diagnose-me`
- tutup dengan rekomendasi fase berikutnya secara spesifik

Fokus atau klarifikasi QA tambahan bila ada: $@
