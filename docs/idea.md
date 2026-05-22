# Idea

## Problem statement
Repo ini sudah punya invariant eksekusi yang bagus di atas kertas: `docs/issues.md` adalah source of truth, dan Phase 6 seharusnya menjalankan tepat satu ticket `AFK` per run. Masalahnya, eksekusi itu masih bergantung pada operator manusia untuk memulai sesi, memilih issue, dan menjaga disiplin "1 issue, 1 session" secara konsisten.

## Desired outcome
Membuat harness ala Ralph yang bisa menjalankan ticket `AFK` secara lebih otomatis tanpa melanggar invariant repo: satu sesi hanya memilih satu issue ready, mengerjakannya, memvalidasi hasilnya, memperbarui state, lalu berhenti. Issue berikutnya hanya boleh dikerjakan di sesi baru.

## Scope
- Mendefinisikan harness eksekusi issue-driven untuk `docs/issues.md`
- Menetapkan rule seleksi "ready AFK" untuk tepat satu ticket per sesi
- Menentukan output sesi: commit, branch, atau draft PR
- Menentukan guardrail validasi, failure handling, dan stop conditions
- Menentukan mode awal: HITL dulu atau langsung AFK

## Non-goals
- Menjalankan beberapa ticket dalam satu sesi
- Membuat agent bebas memilih dan menyelesaikan backlog tanpa batas
- Langsung mendesain full release automation end-to-end
- Menyamakan semua ticket `AFK` sebagai aman untuk autonomous execution

## Constraints
- Harus menghormati invariant repo: one run, one ready `AFK` ticket, one validation cycle
- `docs/issues.md` tetap source of truth
- Blast radius tiap sesi harus kecil dan audit trail harus jelas
- Automation tidak boleh mengorbankan reviewability dan safety secara sembrono

## Assumptions
- Pola Ralph relevan untuk repo ini bila diadaptasi menjadi issue-driven loop
- Session boundary yang tegas lebih penting daripada throughput maksimum
- Feedback loops seperti test/lint/checks akan menjadi pagar kualitas utama
- Tidak semua ticket `AFK` otomatis aman untuk mode AFK penuh

## Decision map
- **Autonomy model:** mulai HITL, semi-otomatis, atau langsung AFK terjadwal
- **Session output:** commit lokal, branch, atau draft PR
- **Selection contract:** definisi tepat untuk ticket `AFK` yang dianggap ready
- **Failure semantics:** kapan status menjadi `blocked`, `in-progress`, atau berhenti tanpa update
- **Runtime safety:** sandbox, scheduler, notification, dan batas eksekusi

## Questions asked
- Haruskah pola ini mengikuti model Ralph? yes, tetapi tetap `1 issue = 1 session`
- Apakah mode awal sebaiknya HITL-first atau AFK-first?
- Apakah bentuk `afk` yang diinginkan adalah loop panjang atau banyak sesi fresh?
- Jika workflow utamanya lokal tanpa PR formal, output sesi terbaik apa?
- Apakah setiap session harus diisolasi dengan branch lokal khusus per issue?
- Apakah ide ini perlu dikembangkan dulu di satu branch feature terpisah?
- Apakah `AFK` saja cukup untuk auto-run, atau perlu flag eksplisit tambahan?
- Apakah flag auto-run perlu sederhana atau multi-field?
- Selain `Auto-run: yes`, rule readiness apa lagi yang wajib dipenuhi?
- Jika session gagal validasi atau mentok ambiguity, status default-nya apa?
- Bisakah harness ini dibuat sebagai extension Pi yang berjalan dari sesi utama?
- Jika memakai extension Pi, apakah sesi utama sebaiknya tetap menjadi orchestrator dan tiap iterasi dijalankan di worker session terpisah?
- Setelah worker selesai, apakah session-nya disimpan penuh atau dianggap disposable?
- Saat worker gagal dan ticket jadi `blocked`, apakah catatan blocker perlu format bebas atau terstruktur?
- Jika terstruktur, field minimum apa saja yang wajib ada?
- Apakah fase awal masih perlu integrasi GitHub?
- Untuk harness script, apakah wrapper `afk` harus membaca output bebas agent atau hasil terstruktur dari `once`?
- Status minimum apa saja yang harus menjadi kontrak hasil `once`?
- Seberapa jauh script perlu memahami `docs/issues.md`?
- Kapan branch lokal per issue harus dibuat?
- Siapa yang harus memegang loop control utama?
- Apa saja preflight minimum yang wajib ada sebelum script memanggil agent?
- Siapa yang memicu script: user atau agent utama?
- Untuk v1, seberapa sederhana interface command yang diinginkan?
- Jika branch harus dibuat sebelum agent mulai, bagaimana script tahu nama branch per issue sementara pemilihan issue final tetap di agent?
- Siapa yang harus menentukan issue ID cukup awal untuk branch naming: script atau agent?
- Untuk v1, apakah seleksi mekanis script cukup mengambil issue eligible pertama sesuai urutan file?
- Apa definisi minimum “issue eligible” yang aman untuk dipakai script secara mekanis?
- Bagaimana strategi branch naming yang cukup stabil dan sederhana untuk v1?
- Setelah session `DONE`, apakah runner harus otomatis membuat commit di branch issue?
- Jika session berakhir `BLOCKED`, apakah perubahan parsial boleh ikut di-commit, atau harus dibuang?
- Di branch mana `docs/issues.md` harus hidup sebagai source of truth antar-run?
- Apa mekanisme sinkronisasi minimal dari issue branch kembali ke orchestrator branch?
- Siapa yang melakukan sinkronisasi kembali ke orchestrator branch pada v1?
- Apa yang tepatnya harus menjadi output akhir `runs-once.sh` agar review manusia dan sinkronisasi cepat?
- Untuk `Next action`, apakah cukup label singkat atau harus langkah/command eksplisit?
- Untuk v1, apakah `Next action` harus dipaksa menjadi satu command copy-paste, atau boleh berupa beberapa langkah eksplisit?
- Setelah `runs-once.sh` selesai, shell sebaiknya berakhir di branch mana?
- Untuk status `NO_READY`, apa perilaku akhir yang paling tepat?
- Jika `runs-afk.sh` menerima hasil `BLOCKED`, apakah loop harus langsung berhenti total?
- Ketika ada konflik antara loop multi-iterasi dan review/sinkronisasi manual, mana yang harus diprioritaskan untuk v1?
- Setelah `runs-once.sh` selesai dengan `DONE`, seperti apa prosedur manual sinkronisasi minimal yang resmi untuk v1?
- Setelah `runs-once.sh` selesai dengan `BLOCKED`, seperti apa prosedur manual sinkronisasi minimal yang resmi untuk v1?
- Untuk worker v1, apakah sebaiknya memakai workflow/skill eksekusi repo yang sudah ada atau prompt Ralph baru yang terpisah?
- Apakah worker command v1 cukup memanggil Pi non-interaktif dengan `/execute` tanpa wrapper prompt tambahan?
- Dari mana runner harus mengambil status akhir `DONE/NO_READY/BLOCKED/FAIL` secara paling andal?
- Apakah runner harus memilih issue ID lebih dulu lalu meneruskannya secara eksplisit ke worker?
- Apakah jalur `/execute` perlu ditighten agar menerima issue ID eksplisit dan gagal jika issue itu tidak cocok/tidak ready?
- Untuk v1, apakah interface target eksplisit worker cukup berupa `/execute ISSUE-007`?
- Apakah `/execute ISSUE-007` benar-benar cocok untuk worker non-interaktif, atau itu hanya nyaman di sesi interaktif?
- Jika slash command terlalu interaktif-oriented, apakah worker non-interaktif boleh memakai prompt biasa yang deterministik?
- Apakah contoh Ralph Matt yang memakai `PRD.md` + `progress.txt` tanpa issue ID eksplisit lebih cocok daripada model target-issue eksplisit untuk repo ini?
- Jika model Matt lebih sederhana, apakah kita rela melepas branch-per-issue yang deterministik demi loop yang lebih mudah?
- Apakah v1 masih membutuhkan file progress tambahan ala `progress.txt`?

## Decisions made
- Ide ini memakai pola Ralph yang diadaptasi ke issue-driven execution
- Prinsip inti yang sudah dipilih: `1 issue = 1 session`
- Ticket kedua dan seterusnya harus dijalankan di sesi lain, bukan loop panjang dalam satu context
- `docs/issues.md` tetap akan menjadi source of truth untuk pemilihan work item
- Hasil riset awal sudah ada di `docs/research.md`
- Harness yang diinginkan berbentuk dua lapis: runner `once` untuk satu issue, lalu wrapper `afk` untuk memanggil runner itu berulang
- Setiap iterasi pada wrapper `afk` harus dianggap session fresh, bukan kelanjutan context sebelumnya
- Arah sementara yang direkomendasikan adalah HITL-first sebelum AFK penuh
- Karena workflow sehari-hari lebih sering lokal tanpa PR formal, output default tidak perlu berupa draft PR
- Setiap session yang sukses sebaiknya berjalan di branch lokal khusus per issue sebagai isolation layer wajib
- Pengembangan harness sendiri sebaiknya dilakukan dulu di satu branch feature terpisah sebelum pola final per-issue dijalankan otomatis
- `AFK` saja tidak cukup sebagai syarat auto-run; perlu flag eksplisit tambahan untuk menandai ticket yang aman dijalankan otomatis
- Flag awal sebaiknya sederhana: `Auto-run: yes/no`
- Ticket hanya boleh dipilih untuk auto-run jika sekaligus memenuhi: `Status: todo`, `Type: AFK`, `Auto-run: yes`, dependency selesai, acceptance criteria cukup jelas untuk divalidasi, dan tidak ada catatan yang menyatakan masih butuh keputusan manusia
- Jika session gagal validasi, mentok ambiguity, atau menemukan kebutuhan keputusan manusia, status default ticket harus menjadi `blocked`, bukan dibiarkan `in-progress`
- Worker session sebaiknya disimpan utuh untuk audit trail dan debugging, bukan dianggap disposable
- Catatan blocker/failure sebaiknya memakai format terstruktur minimum, bukan format bebas
- Field minimum blocker note yang dipilih: `Blocked by`, `Reason`, `Worker session`, dan `Branch`
- Fase awal tidak perlu integrasi GitHub; source of truth tetap lokal di `docs/issues.md`
- Setelah meninjau ulang, pendekatan awal yang lebih masuk akal adalah harness script sederhana ala Ralph (`once` + `afk`) daripada extension Pi yang lebih kompleks
- Ide ini dihidupkan lagi untuk digrill dalam bentuk harness script sederhana, bukan orchestration extension penuh
- Wrapper `afk` sebaiknya membaca hasil terstruktur dari runner `once`, bukan mencoba menebak dari output bebas agent
- Kontrak status minimum untuk hasil `once`: `DONE`, `NO_READY`, `BLOCKED`, dan `FAIL`
- Script sebaiknya hanya melakukan preflight minimum dan tidak menduplikasi logika planning; pemilihan ticket final tetap oleh agent
- Branch lokal per issue harus dibuat oleh script sebelum agent mulai bekerja, agar isolation layer aktif dari awal
- Loop control utama harus tetap di shell script; agent hanya mengerjakan satu sesi dan hasilnya dinormalisasi menjadi `DONE`, `NO_READY`, `BLOCKED`, atau `FAIL`
- Preflight minimum yang dipilih: repo tidak punya uncommitted changes berbahaya, `docs/issues.md` ada, ada minimal satu ticket dengan `Type: AFK` dan `Auto-run: yes`, current branch aman untuk memulai orchestrator, dan tool/command utama yang dibutuhkan tersedia
- Script akan dipicu oleh user secara eksplisit, bukan oleh agent utama/orchestrator otomatis di dalam sesi percakapan
- Interface v1 sebaiknya sederhana: `./runs-once.sh` dan `./runs-afk.sh <iterations>` tanpa banyak flag tambahan
- Untuk menghindari kontradiksi branch naming, script harus menentukan candidate issue lebih dulu secara mekanis sebelum agent mulai
- Untuk v1, aturan seleksi script cukup mengambil issue eligible pertama sesuai urutan file, tanpa override manual
- Definisi minimum `eligible` untuk script: `Status: todo`, `Type: AFK`, `Auto-run: yes`, dan dependency selesai; script tidak menilai acceptance criteria atau notes
- Strategi branch naming v1 cukup sederhana: `ralph/ISSUE-XXX` tanpa slug judul
- Setelah session `DONE`, runner sebaiknya otomatis membuat commit di branch issue agar hasil sukses punya audit trail git yang konsisten
- Jika session berakhir `BLOCKED`, perubahan kode parsial sebaiknya dibuang; yang dipertahankan hanya update status/notes dan audit trail session
- `docs/issues.md` sebaiknya hidup di satu branch orchestrator yang persisten; setiap issue branch dibuat dari sana dan hasilnya harus disinkronkan kembali ke orchestrator sebelum run berikutnya
- Mekanisme sinkronisasi minimal v1: `DONE` berarti commit di issue branch lalu merge kembali ke orchestrator branch; `BLOCKED` berarti partial code dibuang tetapi update status/notes yang relevan tetap masuk ke orchestrator sebelum loop berikutnya
- Pada v1, sinkronisasi kembali ke orchestrator branch sebaiknya dilakukan user secara eksplisit setelah meninjau hasil, bukan otomatis oleh script
- `runs-once.sh` sebaiknya selalu berakhir dengan ringkasan terstruktur minimum: `Status`, `Issue`, `Branch`, `Session`, dan `Next action`
- `Next action` sebaiknya berupa langkah/command eksplisit yang siap dijalankan user, bukan sekadar label singkat
- Untuk v1, `Next action` boleh berupa 2–3 langkah eksplisit; tidak perlu dipaksa menjadi satu command copy-paste
- Setelah `runs-once.sh` selesai, shell sebaiknya tetap berada di issue branch agar review manusia terjadi di tempat hasil dibuat
- Untuk status `NO_READY`, `runs-once.sh` sebaiknya berhenti normal, menampilkan ringkasan terstruktur, dan memberi langkah eksplisit untuk kembali/mengecek orchestrator branch
- Jika `runs-afk.sh` menerima hasil `BLOCKED`, loop harus langsung berhenti total sebagai hard stop
- Untuk v1, review manusia dan sinkronisasi manual per issue diprioritaskan; akibatnya scope awal dibatasi ke `runs-once.sh`, sedangkan `runs-afk.sh` ditunda ke fase berikutnya
- Untuk status `DONE`, prosedur manual resmi v1 cukup sederhana: review di issue branch, lalu pindah ke orchestrator branch dan lakukan `git merge ralph/ISSUE-XXX`
- Untuk status `BLOCKED`, prosedur manual resmi v1: review blocker di issue branch, pindah ke orchestrator branch, ambil hanya perubahan `docs/issues.md` yang relevan dari issue branch, dan jangan merge branch issue ke orchestrator
- Worker v1 sebaiknya memakai workflow/skill `execute-me` yang sudah ada, bukan prompt Ralph baru yang terpisah
- Worker command v1 cukup memanggil Pi non-interaktif dengan `/execute` tanpa wrapper prompt tambahan; harness harus tetap tipis
- Penentuan status akhir sebaiknya memakai kombinasi sinyal, dengan `docs/issues.md` sebagai sumber utama, `exit code` sebagai sinyal infra/proses, dan output teks hanya sebagai pendukung/debug
- Runner harus memilih issue ID lebih dulu lalu meneruskannya secara eksplisit ke worker, agar tidak ada dua selector yang memilih ticket berbeda
- Jalur `/execute` perlu ditighten agar worker menerima issue ID eksplisit dan gagal jika issue itu tidak cocok atau tidak ready, bukan diam-diam memilih ticket eligible pertama
- Interface target eksplisit v1 cukup sederhana secara mental model: `/execute ISSUE-007`
- Ada risiko operasional bahwa bentuk slash command lebih natural untuk sesi interaktif; worker non-interaktif boleh memakai prompt biasa yang deterministik jika itu lebih andal daripada memanggil slash command secara mentah
- Docs Pi menunjukkan prompt template memang bisa diekspansi dari input/prompt, termasuk pada mode non-interaktif; pertanyaan yang tersisa bukan feasibility, tetapi bentuk prompt yang paling tipis dan aman
- Contoh Matt menyoroti model yang lebih sederhana: task source + progress state tanpa target issue eksplisit, tetapi model itu berpotensi berbenturan dengan keputusan kita tentang branch per issue dan sinkronisasi manual ke orchestrator
- Untuk v1, branch-per-issue yang deterministik tetap dipertahankan; kita tidak beralih penuh ke model Matt yang lebih longgar meskipun loop-nya lebih sederhana
- V1 tidak perlu menambah `progress.txt`; state antar-run cukup memakai `docs/issues.md`, session history, dan git history
- Prompt worker harus tipis pada instruksi, tetapi tidak tipis pada konteks: worker sesi fresh tetap harus diberi artifact utama secara eksplisit agar tidak menebak-nebak scope
- Untuk menekan halusinasi, worker harus tahu issue ID target, branch target, source of truth (`docs/issues.md`), dan artifact pendukung yang wajib dibaca sebelum mulai eksekusi
- Script sebaiknya menyuntikkan excerpt ticket terpilih ke worker prompt, bukan hanya issue ID, agar sesi fresh tidak harus menebak scope dari nol
- Context bootstrap minimum worker cukup: excerpt ticket terpilih, path artifact wajib (`docs/issues.md`, `docs/prd.md`, opsional `docs/research.md`), issue ID target, branch target, penegasan bahwa `docs/issues.md` adalah source of truth, dan hard-fail jika issue target tidak cocok atau tidak ready
- `docs/idea.md` tidak perlu dibawa ke worker v1; untuk eksekusi satu issue itu cenderung menjadi noise
- `docs/research.md` hanya dimuat jika issue excerpt atau PRD/ticket jelas membutuhkannya; research bukan default context setiap run
- Worker sebaiknya punya urutan baca ringan: excerpt ticket target, verifikasi di `docs/issues.md`, baca bagian relevan di `docs/prd.md`, baca `docs/research.md` hanya jika diperlukan, lalu eksekusi dan validasi
- Jika excerpt ticket dan `docs/issues.md` tidak sinkron, worker harus mempercayai `docs/issues.md`; jika konfliknya material, worker harus hard-fail daripada improvisasi
- Jika target issue yang dipilih runner ternyata sudah tidak ready saat diverifikasi worker, status akhir yang tepat adalah `BLOCKED`, bukan `NO_READY` atau `FAIL`
- Runner sebaiknya menyimpan snapshot excerpt ticket yang dipakai untuk bootstrap worker agar konflik atau drift context bisa diaudit setelah run
- Untuk v1, snapshot bootstrap cukup disimpan sebagai file temp/log di luar source artifact utama repo, bukan sebagai dokumen permanen di `docs/`
- Untuk v1, snapshot bootstrap sebaiknya disimpan untuk semua run agar debugging konsisten dan tidak bergantung pada status akhir
- Lokasi praktis v1 untuk snapshot bootstrap adalah folder repo-local tersembunyi `.runs/`
- Untuk v1, scope `.runs/` dibatasi hanya untuk snapshot bootstrap, log hasil run minimum, dan metadata status run; bukan dumping ground artifact lain
- Untuk v1, `.runs/` tidak perlu index global; discoverability cukup mengandalkan file per-run yang dinamai konsisten
- Skema nama file per-run v1 sebaiknya memuat timestamp, issue ID, dan kind, misalnya `.runs/2026-05-22T10-15-00Z-ISSUE-007-bootstrap.md` dan `.runs/2026-05-22T10-15-00Z-ISSUE-007-result.json`
- Semua artifact untuk satu run sebaiknya berbagi basename yang sama; hanya suffix/kind yang berbeda
- Untuk v1, dua artifact per run sudah cukup: `bootstrap` dan `result`; metadata penting cukup masuk ke `result`
- Format v1 yang dipilih: `bootstrap` sebagai Markdown dan `result` sebagai JSON
- `result.json` sebaiknya memuat `next_action`, bukan hanya status mentah, agar artifact audit tetap operasional untuk manusia
- `next_action` di `result.json` sebaiknya disimpan sebagai array langkah eksplisit, bukan satu string shell besar
- `result.json` juga perlu menyimpan `status_reason` terstruktur, terutama untuk kasus seperti `BLOCKED` atau `NO_READY`
- Field minimum `result.json` untuk v1 cukup: `status`, `status_reason`, `issue_id`, `branch`, `session`, dan `next_action`
- Field `session` di `result.json` cukup memakai session file/path Pi yang sebenarnya, bukan ID pendek buatan
- Untuk v1, `status_reason` cukup berupa string singkat yang terkontrol; belum perlu object/schema alasan yang kompleks
- `next_action` harus selalu non-empty untuk semua status, termasuk `FAIL`

## Open questions
- Apakah kita masih punya open question material yang cukup besar, atau ide ini sudah cukup matang untuk dinaikkan ke PRD dengan prototype ringan opsional?

## Need research?
Tidak untuk sekarang. Riset Ralph dan docs Pi yang relevan sudah cukup untuk merancang harness script awal.

## Need prototype?
Prototype ringan opsional bisa tetap berguna nanti untuk memvalidasi detail operasional `runs-once.sh`, tetapi ide dasarnya sudah cukup matang tanpa harus menunggu prototype penuh.

## Biggest risk
Risiko terbesar yang tersisa sekarang adalah membuat jejak audit bootstrap terlalu ephemeral sehingga saat ada drift atau konflik, kita tidak lagi bisa merekonstruksi konteks yang sebenarnya diberikan ke worker.

## Recommended next step
Naikkan ide ini ke PRD. Jika perlu, gunakan prototype ringan hanya untuk memvalidasi detail operasional kecil, bukan untuk menemukan kembali model dasarnya.

## Handoff to PRD
- [x] Problem statement and target outcome are stable enough for requirements drafting
- [x] Scope for the next iteration is bounded
- [x] Non-goals are explicit
- [x] Key constraints are visible
- [x] Open questions are reduced enough to define requirements

Ready for next phase: yes
Notes:
- Current working principle tetap `1 issue = 1 session`
- Session berikutnya harus dimulai fresh untuk issue berikutnya
- Riset Ralph tetap tersimpan di `docs/research.md`
- Fokus ide kini dipersempit ke harness script sederhana, bukan extension penuh
- `runs-afk.sh` ditunda; v1 hanya `runs-once.sh`
- V1 tidak menambah `progress.txt`; state antar-run cukup memakai artifact repo yang sudah ada
- Prototype ringan boleh dipakai nanti hanya untuk validasi detail operasional, bukan untuk mengubah model inti
