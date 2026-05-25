---
description: Eksekusi tepat satu ticket AFK dari docs/issues.md memakai skill execute-me
argument-hint: "[fokus-atau-klarifikasi-eksekusi]"
---
Muat dan ikuti skill project-local `execute-me`.

Gunakan artifact proyek berikut sebagai sumber konteks utama bila relevan:
- `docs/issues.md`
- `docs/prd.md`
- `docs/research.md`
- `docs/prototype/comparison.md`
- `docs/idea.md` bila relevan

Tentukan dulu apakah proyek memang siap masuk Phase 6. Jika belum siap, jelaskan gap utamanya dan rekomendasikan fase yang harus didahulukan.

Jika sudah siap:
- bila fokus tambahan memuat issue ID eksplisit seperti `ISSUE-002`, perlakukan issue itu sebagai target wajib
- saat target wajib diberikan, verifikasi issue ID yang sama di `docs/issues.md` sebelum implementasi dan jangan fallback ke ticket AFK lain
- bila target wajib itu missing, materially mismatched, atau tidak lagi ready, hentikan dan tandai `blocked` alih-alih improvisasi
- pilih tepat satu ticket `AFK` yang benar-benar ready dari `docs/issues.md`, mengikuti urutan file kecuali pengguna menentukan lain
- jangan kerjakan ticket `HITL`
- jangan mengerjakan ticket kedua dalam run yang sama
- update ticket terpilih ke `in-progress` lalu `done` atau `blocked` sesuai hasilnya
- baca acceptance criteria, source requirements, constraint, dan code path yang relevan sebelum mengubah code
- implement hanya perubahan yang dibutuhkan untuk ticket itu
- untuk ticket yang mengubah behavior dan punya public interface yang praktis untuk diuji, default ke red-green-refactor secara vertikal: satu test gagal, konfirmasi gagal karena alasan yang tepat, implement minimal, lalu ulangi
- jangan menulis semua test di depan untuk seluruh ticket
- jika tidak memakai TDD pada behavior change yang sebenarnya testable, jelaskan alasan singkatnya dan gunakan validasi alternatif yang paling relevan
- jangan klaim `done`, `fixed`, `pass`, atau `ready` tanpa evidence validasi fresh dari run saat ini
- jalankan validasi yang paling relevan sebelum menandai `done`
- bila ticket berisiko tinggi, multi-file, mengubah shared contract, atau readiness-sensitive, lakukan atau rekomendasikan review independen dengan urutan: cek requirement fit dulu, lalu code quality / boundary drift
- jika ada ambiguity atau dependency yang ternyata belum terpenuhi, hentikan dan tandai `blocked`
- jika ternyata ini bukan masalah eksekusi yang jelas tetapi masalah diagnosis bug, rekomendasikan `diagnose-me`
- jangan commit secara default kecuali pengguna secara eksplisit memintanya
- tutup dengan status loop yang jelas: bisa lanjut ke ticket AFK berikutnya, perlu kembali ke planning/PRD, atau perlu handoff ke `qa-me` untuk verification yang lebih luas
- jika ticket selesai, sertakan minimum completion evidence: `Ticket`, `Files changed`, `Validation commands`, `Validation summary`, `TDD used: yes/no`, `If no, why`, dan `Remaining risks` atau `none`

Fokus atau klarifikasi eksekusi tambahan bila ada: $@
