---
description: Buat atau rapikan docs/prd.md memakai skill prd-me
argument-hint: "[fokus-atau-klarifikasi-prd]"
---
Muat dan ikuti skill project-local `prd-me`.

Gunakan artifact proyek berikut sebagai sumber konteks utama:
- `docs/idea.md`
- `docs/research.md`
- `docs/prototype/comparison.md`
- file lain di `docs/prototype/` bila relevan
- `docs/prd.md` bila sudah ada

Tentukan dulu apakah proyek memang siap masuk Phase 4. Jika belum siap, jelaskan gap utamanya dan rekomendasikan fase yang harus didahulukan. Secara khusus, jangan lanjut jika masih ada lebih dari satu arah prototype yang aktif.

Jika sudah siap:
- baca dan gunakan template dari `.pi/skills/prd-me/assets/prd-template.md`
- buat atau perbarui `docs/prd.md`
- fokus pada end state, user-visible behavior, scope, non-goals, edge cases, acceptance criteria, constraints, dan dependencies
- hindari mengubah PRD menjadi implementation plan
- ajukan pertanyaan klarifikasi hanya jika benar-benar diperlukan untuk menutup ambiguity yang material
- promosikan hanya temuan research dan keputusan dari nol atau satu prototype winner yang benar-benar memengaruhi requirement
- jika prototyping dipakai tetapi winner belum tunggal, hentikan dan arahkan kembali ke Phase 3
- tutup dengan rekomendasi fase berikutnya secara spesifik

Fokus atau klarifikasi tambahan bila ada: $@
