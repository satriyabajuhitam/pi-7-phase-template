---
description: Buat atau perbarui docs/qa.md memakai skill qa-me
argument-hint: "[fokus-atau-klarifikasi-qa]"
---
Muat dan ikuti skill project-local `qa-me`.

Gunakan artifact proyek berikut sebagai sumber konteks utama bila relevan:
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
- turunkan PRD dan status issue menjadi core test scenarios, edge cases, human review checklist, known risks, dan sign-off recommendation
- bedakan dengan jelas automated checks vs human review
- jika review ini readiness-sensitive atau menyentuh shared behavior, gunakan urutan: cek requirement fit dulu, lalu quality / boundary drift
- jika run ini hanya planning, jangan pura-pura menulis findings seolah sudah diverifikasi; tandai sebagai pending verification
- catat findings hanya jika memang ada evidence dari test, inspection, atau verifikasi aktual
- jangan klaim `pass`, `ready`, `sign-off`, atau aman dirilis tanpa evidence fresh dari run saat ini
- jika ada follow-up work yang jelas, arahkan secara eksplisit sebagai AFK, HITL, reopen existing ticket, atau new issue sesuai kebutuhan
- jika finding QA masih sebenarnya ambiguity diagnosis, rekomendasikan `diagnose-me`
- jika follow-up masih masuk scope ticket lama, prefer reopen ticket lama daripada membuat ticket baru
- tutup dengan rekomendasi fase berikutnya secara spesifik, misalnya `execute-me`, `diagnose-me`, HITL review, atau release/sign-off
- jika Anda memberi rekomendasi positif seperti readiness atau sign-off, sebutkan evidence fresh yang mendasarinya; jika belum ada, katakan itu secara eksplisit

Jangan mengimplementasikan feature work baru selama sesi QA aktif.

Fokus atau klarifikasi QA tambahan bila ada: $@
