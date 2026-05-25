---
description: Tinjau state eksekusi dan QA saat ini lalu rekomendasikan langkah closeout berikutnya memakai skill finish-me
argument-hint: "[fokus-atau-klarifikasi-closeout]"
---
Muat dan ikuti skill project-local `finish-me`.

Gunakan artifact proyek berikut sebagai sumber konteks utama bila relevan:
- `docs/issues.md`
- `docs/qa.md`
- `docs/prd.md`
- `docs/research.md` bila constraint atau residual risk memengaruhi keputusan
- output validasi, test, atau command terbaru bila relevan
- repo state hanya bila benar-benar memengaruhi closeout judgment, dan batasi default-nya ke sinyal kecil berikut: dirty/clean working tree, keberadaan artifact/evidence workflow yang relevan, dan branch/HEAD context hanya saat pertanyaannya memang PR prep atau merge

Tentukan dulu apakah proyek memang siap untuk closeout review. Jika belum siap, jelaskan gap utamanya dan rekomendasikan fase yang harus didahulukan.

Jika sudah siap:
- bedakan dengan jelas state implementasi vs state validasi vs state readiness
- bangun closeout packet yang ringkas: evidence reviewed, validation state, residual risks, missing evidence/blockers, recommended next action, dan alasan utamanya
- gunakan current artifacts untuk menilai apakah next action terbaik adalah `continue execution`, `request HITL review`, `prepare PR`, `merge`, `keep`, atau `discard`
- perlakukan semua itu sebagai rekomendasi, bukan automasi git
- jangan klaim `ready`, `safe`, `mergeable`, atau setara tanpa evidence fresh yang cukup dari run saat ini
- jika evidence incomplete, stale, blocked, atau missing, katakan itu secara eksplisit dan downgrade rekomendasinya
- jika repo-state signal yang relevan tidak tersedia, tidak terverifikasi, atau tidak bisa diinspeksi, sebutkan sinyal mana yang kurang dan downgrade ke rekomendasi yang lebih lemah daripada mengasumsikan state aman/siap
- jika ada limit dari environment, permission, external dependency, atau missing QA evidence, sebutkan jelas sebagai caveat
- jaga repo-state checks tetap ringan; jangan ubah helper ini menjadi worktree choreography, branch choreography, atau release automation
- jika tidak ada opsi closeout yang cocok, arahkan ke workflow yang paling tepat seperti `execute-me`, `qa-me`, atau `diagnose-me`
- tutup dengan format yang jelas:
  - `Recommendation`
  - `Evidence reviewed`
  - `Validation state`
  - `Residual risks`
  - `Missing evidence or blockers`
  - `Suggested next workflow step`

Jangan mengimplementasikan feature work baru atau menjalankan merge/branch-delete otomatis selama sesi finish aktif.

Fokus atau klarifikasi closeout tambahan bila ada: $@
