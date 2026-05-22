# Idea

## Problem statement
`runs-once.sh` v1 sudah ada dan sengaja berhenti di boundary yang aman: satu issue, satu session fresh, review manusia, lalu sinkronisasi manual ke branch orchestrator. Friksi berikutnya adalah operator masih harus mengulang langkah yang sama beberapa kali saat ada beberapa ticket `AFK` yang eligible. Ide baru yang ingin dipertajam adalah apakah repo ini perlu `runs-afk.sh` sebagai wrapper multi-iterasi yang tetap bounded dan tetap menghormati boundary keselamatan v1.

## Desired outcome
Mendefinisikan `runs-afk.sh` yang bisa memanggil `runs-once.sh` beberapa kali secara terkontrol tanpa merusak invariant repo: `docs/issues.md` tetap source of truth, setiap issue tetap dikerjakan dalam session fresh, dan blast radius loop tetap kecil serta auditable.

## Scope
- Menentukan apakah loop boleh lanjut setelah hasil `DONE`, atau harus berhenti untuk review/sync manusia
- Menentukan stop conditions untuk `DONE`, `BLOCKED`, `FAIL`, dan `NO_READY`
- Menentukan bagaimana wrapper kembali ke branch orchestrator antar-iterasi
- Menentukan interface bounded untuk v1, misalnya jumlah iterasi maksimum
- Menentukan artifact/output minimum agar operator paham apa yang terjadi selama loop
- Menentukan apakah `BLOCKED` boleh memicu diagnosis/follow-up planning otomatis atau harus tetap memantul ke manusia

## Non-goals
- Mengganti kontrak dasar `runs-once.sh`
- Menghapus review manusia tanpa keputusan eksplisit
- Menjadi daemon, scheduler, atau background worker tak terbatas
- Menambah GitHub automation atau auto-PR
- Membuat agent memilih beberapa issue dalam satu session context

## Constraints
- `docs/issues.md` tetap source of truth antar-run
- `runs-once.sh` saat ini mengharuskan start dari branch orchestrator yang bersih
- `runs-once.sh` saat `DONE` meninggalkan user di branch issue dan sinkronisasi ke orchestrator masih manual
- `runs-once.sh` sudah punya outcome eksplisit: `DONE`, `BLOCKED`, `NO_READY`, `FAIL`
- Tiap issue tetap harus diproses lewat session fresh yang terpisah
- Wrapper baru tidak boleh diam-diam melonggarkan guardrail keselamatan yang sudah dipilih untuk v1

## Assumptions
- `runs-once.sh` tetap menjadi primitive utama; `runs-afk.sh` hanyalah orchestrator tipis di atasnya
- Multi-iteration yang dibahas di sini harus tetap bounded, bukan loop tanpa akhir
- Masalah inti bukan hanya memilih issue, tetapi juga mengelola boundary antar-run dengan aman
- Section 6 artikel Ralph menguatkan bahwa loop, task source, dan output boleh dikustomisasi; jadi issue-driven source dan branch-per-iteration output tetap sah secara konsep Ralph

## Decision map
- **Human gate:** apakah loop boleh lanjut setelah `DONE`, atau wajib berhenti untuk review/sync manusia
- **State handoff:** bagaimana wrapper mengembalikan repo ke orchestrator branch yang valid sebelum iterasi berikutnya
- **Status policy:** status mana yang hard-stop vs soft-stop
- **Operator UX:** seperti apa interface bounded yang cukup sederhana untuk dipakai harian
- **Auditability:** artifact minimum apa yang dibutuhkan agar jejak loop tetap jelas

## Questions asked
- Apakah loop boleh lanjut setelah `DONE`, atau wajib berhenti untuk review/sync manusia?
- Jika boundary pasca-`DONE` perlu dilewati agar loop punya nilai nyata, apakah kita rela mengotomatisasikannya?
- Untuk `runs-afk.sh`, apakah seleksi issue tetap deterministik oleh script atau dibuat lebih Ralph-like dengan agent memilih task berikutnya?
- Setelah satu iterasi `DONE`, apakah wrapper boleh otomatis kembali ke branch orchestrator dan melakukan `git merge --no-ff ralph/ISSUE-XXX` sebelum memilih issue berikutnya?
- Jika auto-merge setelah `DONE` gagal atau conflict, apakah loop harus hard-stop total?
- Jika satu iterasi berakhir `BLOCKED`, apakah loop juga harus hard-stop total?
- Jika loop menemui `NO_READY`, apakah itu harus dianggap selesai normal dan exit 0?
- Jika satu iterasi berakhir `FAIL`, apakah loop harus selalu hard-stop total dengan exit non-zero?
- Setelah auto-merge `DONE` berhasil, apakah branch `ralph/ISSUE-XXX` harus otomatis dihapus?
- Jika terjadi `BLOCKED`, bolehkah agent mencoba mendiagnosis penyebabnya, membuat issue follow-up baru, lalu melanjutkan loop otomatis?
- Jika ada automation pasca-`BLOCKED`, apakah hasilnya hanya draft follow-up untuk direview manusia, atau boleh langsung mengedit source of truth?
- Saat `BLOCKED`, apakah v1 perlu subflow diagnosis terpisah, atau cukup berhenti dan mengandalkan artifact `BLOCKED` yang sudah ada?
- Apakah `runs-afk.sh` harus menulis satu artifact agregat per loop, misalnya `.runs/<timestamp>-afk-summary.json`, selain artifact per-run dari `runs-once.sh`?
- Selain artifact agregat file, apakah `runs-afk.sh` juga harus mencetak ringkasan final agregat ke stdout saat loop selesai?
- Untuk v1, apakah artifact agregat cukup memuat status akhir loop, jumlah iterasi dijalankan, daftar issue yang diproses beserta outcome-nya, branch orchestrator, dan alasan berhenti?
- Apakah artifact agregat harus menyertakan pointer eksplisit ke artifact per-run tiap iterasi, misalnya path ke `bootstrap.md` dan `result.json`?
- Apakah ringkasan stdout final perlu dianggap kontrak stabil untuk scripting, atau cukup human-readable saja?

## Decisions made
- Fokus ide sekarang adalah increment setelah `runs-once.sh` v1, bukan kembali ke desain `runs-once.sh`
- `runs-afk.sh` harus dibahas sebagai wrapper bounded di atas primitive yang sudah ada
- Constraint v1 yang sudah hidup di repo tetap berlaku sampai ada keputusan eksplisit untuk mengubahnya
- Jika loop dipaksa berhenti pada setiap `DONE`, nilai tambah `runs-afk.sh` nyaris runtuh menjadi wrapper tipis yang secara praktis setara dengan menjalankan `runs-once.sh` berulang secara manual
- Section 6 artikel Ralph mendukung dua hal yang sudah dekat dengan arah repo ini: task source boleh diganti dari PRD ke issues, dan output boleh diganti dari direct commit ke branch/PR yang lebih reviewable
- Jika `runs-afk.sh` benar-benar mau bernilai, boundary pasca-`DONE` harus diambil alih oleh automation, setidaknya dalam bentuk yang sangat dibatasi
- Model seleksi issue tetap dipertahankan deterministik oleh script, bukan diserahkan ke agent, agar auditability dan konsistensi dengan `runs-once.sh` tetap terjaga
- Untuk path `DONE`, wrapper boleh otomatis kembali ke branch orchestrator dan melakukan `git merge --no-ff ralph/ISSUE-XXX` sebelum memilih issue berikutnya
- Jika auto-merge pasca-`DONE` gagal atau conflict, loop harus hard-stop total dan tidak boleh mencoba issue berikutnya
- Jika satu iterasi berakhir `BLOCKED`, loop juga harus hard-stop total karena status itu berarti perlu keputusan manusia
- Jika loop menemui `NO_READY`, hasil itu harus dianggap selesai normal dengan exit 0, bukan error
- Jika satu iterasi berakhir `FAIL`, loop harus selalu hard-stop total dengan exit non-zero karena kontrak runner/worker sedang tidak bisa dipercaya
- Setelah auto-merge sukses, branch issue tidak dihapus otomatis pada v1; audit trail lokal lebih diprioritaskan daripada hygiene otomatis
- Repo ini sudah punya boundary fase yang jelas: eksekusi, diagnosis, dan planning tidak seharusnya bercampur diam-diam tanpa keputusan eksplisit
- Jika ada automation pasca-`BLOCKED`, hasilnya hanya boleh berupa draft follow-up untuk direview manusia; ia tidak boleh langsung mengubah `docs/issues.md` atau melanjutkan loop eksekusi otomatis
- Untuk v1, `BLOCKED` cukup berhenti dan mengandalkan artifact `BLOCKED` yang sudah ada; tidak perlu subflow diagnosis terpisah
- `runs-afk.sh` harus menulis satu artifact agregat per loop agar operator punya satu ringkasan lintas-iterasi yang eksplisit
- Selain artifact file, `runs-afk.sh` juga harus mencetak ringkasan final agregat ke stdout agar hasil loop langsung terbaca tanpa membuka file
- Format minimum artifact agregat v1 cukup tipis: status akhir loop, jumlah iterasi dijalankan, daftar issue yang diproses beserta outcome-nya, branch orchestrator, dan alasan berhenti
- Artifact agregat juga harus menyertakan pointer eksplisit ke artifact per-run tiap iterasi agar summary sekaligus menjadi index audit yang praktis
- Ringkasan stdout final cukup human-readable; surface machine-readable resmi tetap artifact JSON agregat
- Dengan boundary saat ini, `runs-afk.sh` masih cukup kecil untuk dianggap helper semi-otomatis, bukan workflow diagnosis/planning penuh

## Open questions
- Tidak ada open question material yang tersisa untuk Phase 1. Detail implementasi kecil bisa diformalisasi di PRD.

## Need research?
Belum untuk saat ini. Section 6 artikel Ralph justru cukup untuk menegaskan bahwa task source dan output loop memang boleh dikustomisasi; blocker sekarang lebih ke keputusan produk/safety lokal repo daripada gap informasi eksternal.

## Need prototype?
Tidak wajib. Prototype ringan opsional boleh dipakai nanti bila ingin memvalidasi UX summary agregat, tetapi ide dasarnya sudah cukup jelas tanpa prototype terpisah.

## Biggest risk
Risiko terbesar sekarang bukan lagi sekadar git safety, tetapi boundary creep: `runs-afk.sh` bisa diam-diam berubah dari runner eksekusi menjadi sistem triage/diagnosis/planning otomatis yang mengedit source of truth sambil tetap melaju.

## Recommended next step
Naikkan ide ini ke PRD untuk memformalkan behavior `runs-afk.sh`, kontrak artifact agregat, dan aturan sinkronisasi antar-iterasi di atas `runs-once.sh`.

## Handoff to PRD
- [x] Problem statement for the new increment is clear enough
- [x] Existing repository constraints are visible
- [x] Human gate after `DONE` is decided
- [x] Cross-iteration branch/sync contract is decided for the happy path (`DONE` auto-merge)
- [x] Stop conditions and failure semantics are stable enough to write requirements
- [x] Post-success branch cleanup policy is decided
- [x] Loop-level audit/output contract is decided
- [x] Post-BLOCKED workflow boundary is decided

Ready for next phase: yes
Primary blocker: none
