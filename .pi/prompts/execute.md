---
description: Eksekusi tepat satu ticket AFK dari docs/issues.md memakai skill execute-me
argument-hint: "[fokus-atau-klarifikasi-eksekusi]"
---
Muat dan ikuti skill project-local `execute-me`.

Gunakan artifact proyek berikut sebagai sumber konteks utama:
- `docs/issues.md`
- `docs/prd.md`
- `docs/research.md`
- `docs/prototype/comparison.md`
- `docs/idea.md` bila relevan

Tentukan dulu apakah proyek memang siap masuk Phase 6. Jika belum siap, jelaskan gap utamanya dan rekomendasikan fase yang harus didahulukan.

Jika sudah siap:
- pilih tepat satu ticket `AFK` yang ready dari `docs/issues.md`
- jangan kerjakan ticket `HITL`
- jangan mengerjakan ticket kedua dalam run yang sama
- update ticket terpilih ke `in-progress` lalu `done` atau `blocked` sesuai hasilnya
- implement hanya perubahan yang dibutuhkan untuk ticket itu
- untuk ticket yang mengubah behavior dan dapat diuji lewat public interface, prefer red-green-refactor secara vertikal: satu test gagal, implement minimal, lalu ulangi
- jangan menulis semua test di depan untuk seluruh ticket
- jika tidak memakai TDD, jelaskan alasan singkatnya dan gunakan validasi alternatif yang paling relevan
- jalankan validasi yang paling relevan sebelum menandai `done`
- jika ada ambiguity atau dependency yang ternyata belum terpenuhi, hentikan dan tandai `blocked`
- jika ternyata ini bukan masalah eksekusi yang jelas tetapi masalah diagnosis bug, rekomendasikan `diagnose-me`
- tutup dengan status loop yang jelas: bisa lanjut ke ticket AFK berikutnya atau berhenti karena blocker/HITL

Fokus atau klarifikasi eksekusi tambahan bila ada: $@
