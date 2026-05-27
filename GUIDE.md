# GUIDE.md

## Tujuan

Panduan ini menjelaskan cara memakai workflow 7 fase di repo ini untuk **membuat app sederhana dari nol** tanpa bergantung pada prompt template lokal.

Contoh studi kasus yang dipakai:
- app Todo sederhana
- tambah todo
- lihat daftar todo
- tandai selesai
- filter `all / active / done`

Prinsip utamanya:
- user cukup berbicara natural
- agent memilih skill yang tepat sendiri
- artifact di `docs/` menjadi source of truth lintas sesi

---

## Ringkasan workflow

Urutan fasenya tetap sama:

1. Idea
2. Research
3. Prototype
4. PRD
5. Issues
6. Execution
7. QA

Optional helper:
- triage
- diagnose
- finish

Skill yang biasanya terlibat:
- Idea → `grill-me`
- Research → `research-me`
- Prototype → `prototype-me`
- PRD → `prd-me`
- Issues → `issues-me`
- Execution → `execute-me`
- QA → `qa-me`
- Intake → `triage-me`
- Diagnosis → `diagnose-me`
- Closeout → `finish-me`

Artifact utama:
- `docs/idea.md`
- `docs/research.md`
- `docs/prototype/`
- `docs/prd.md`
- `docs/issues.md`
- `docs/qa.md`

---

## Langkah 0 — Persiapan

### Apakah repo ini siap dipakai sebagai template?

Ya.

Repo ini sudah mencakup:
- `AGENTS.md`
- skill lokal di `.pi/skills/`
- artifact kosong di `docs/`
- validator lokal di `scripts/`
- dokumentasi penggunaan di `README.md`, `GUIDE.md`, dan `MASTER_TEMPLATE.md`

### Cara memulai project baru

Rekomendasi utama:
1. buka repo template di GitHub
2. klik **Use this template**
3. buat repo baru
4. clone repo baru ke lokal

Contoh:

```bash
git clone git@github.com:YOUR_USERNAME/my-todo-app.git
cd my-todo-app
```

Lalu buka repo itu di Pi dan jalankan:

```txt
/reload
```

Setelah itu, mulai dengan request natural, misalnya:

```txt
Saya ingin membuat app Todo sederhana dari nol. Tolong mulai dari fase idea dan pertajam dulu scope v1-nya.
```

---

## Phase 1 — Idea

Di fase ini, belum coding. Fokusnya memperjelas ide.

### Contoh request

```txt
Saya ingin membuat app Todo sederhana dari nol. User bisa menambah todo, melihat daftar todo, menandai selesai, dan memfilter berdasarkan status. Tolong grill ide ini sampai siap masuk PRD.
```

### Yang diharapkan
Agent memakai `grill-me` untuk memperjelas:
- masalah yang diselesaikan
- outcome yang diinginkan
- scope v1
- non-goals
- constraint
- apakah perlu research
- apakah perlu prototype

### Artifact
- `docs/idea.md`

### Kapan boleh lanjut?
Sebelum lanjut ke PRD, pastikan `docs/idea.md` punya `## Handoff to PRD` dengan:
- checklist handoff
- `Ready for next phase: yes/no`
- `Primary blocker` bila masih `no`

---

## Phase 2 — Research

Phase ini opsional.

### Kapan dipakai?
Pakai jika ide bergantung pada:
- API pihak ketiga
- SDK atau layanan eksternal
- dokumentasi vendor
- constraint teknis yang belum jelas

### Contoh request

```txt
Tolong riset batasan dan pola terbaik untuk menyimpan todo di local-first app sederhana dengan stack yang dipakai repo ini, lalu rangkum ke docs/research.md.
```

### Artifact
- `docs/research.md`

### Catatan
Kalau tidak perlu research, jangan dipaksa.

---

## Phase 3 — Prototype

Dipakai kalau masih ada beberapa arah UX, arsitektur, atau flow yang perlu dibandingkan.

### Contoh request

```txt
Bandingkan 2-3 variasi UI untuk app Todo sederhana dari nol, fokus pada cara menambah todo dan memfilter status. Simpan hasilnya di docs/prototype/ dan pilih satu winner bila memang perlu prototype.
```

### Artifact
- `docs/prototype/prototype-1.md`
- `docs/prototype/prototype-2.md`
- `docs/prototype/prototype-3.md` bila perlu
- `docs/prototype/comparison.md`

### Aturan penting
Jika prototyping dipakai:
- buat beberapa opsi seperlunya
- pilih tepat **satu** winner sebelum PRD

---

## Phase 4 — PRD

PRD mendefinisikan end-state yang ingin dicapai.

### Contoh request

```txt
Tulis PRD untuk app Todo sederhana dari artifact yang sudah ada. Fokus pada behavior dan requirement user-visible, bukan detail implementasi.
```

### Artifact
- `docs/prd.md`

### Kapan boleh lanjut ke planning?
Sebelum lanjut ke issues, pastikan `docs/prd.md` punya `## Handoff to Issues` dengan:
- checklist handoff
- `Planning approval: approved for issues planning (correctness and scope)`
- `Ready for next phase: yes/no`
- `Primary blocker` bila masih `no`

---

## Phase 5 — Issues

Phase ini memecah PRD menjadi ticket eksekusi.

### Contoh request

```txt
Pecah PRD ini menjadi ticket vertical slice kecil yang siap dieksekusi. Simpan hasil planning di docs/issues.md.
```

### Artifact
- `docs/issues.md`

### Hasil yang baik
Board yang baik:
- memecah PRD ke vertical slices
- menandai `AFK` vs `HITL`
- menjelaskan dependency
- menunjukkan blocker dan peluang parallelisasi
- hanya memakai execution brief opsional bila benar-benar perlu

---

## Phase 6 — Execution

Di fase ini agent mengeksekusi **tepat satu** ticket `AFK` yang ready.

### Contoh request

```txt
Eksekusi ticket AFK berikutnya dari docs/issues.md dan validasi hasilnya dengan ketat sebelum menandai done.
```

### Yang diharapkan
Agent memakai `execute-me` dan:
- memilih satu ticket ready
- update status ke `in-progress`
- implementasi hanya untuk ticket itu
- menjalankan validasi segar
- update status ke `done` atau `blocked`

### Catatan penting
- satu run = satu ticket
- jangan ambil dua ticket sekaligus
- kalau perubahan bisa diuji lewat interface publik yang praktis, default ke TDD

---

## Phase 7 — QA

Phase ini membuat checklist verifikasi dan mencatat findings.

### Contoh request

```txt
Buat docs/qa.md dari PRD, issues, dan implementasi saat ini. Fokus pada edge case, regression, dan checklist review manual.
```

### Artifact
- `docs/qa.md`

### Hasil yang baik
QA yang baik:
- memisahkan automated checks dan human review
- mencatat findings sebagai `Pass / Fail / Uncertain`
- merutekan follow-up kembali ke execution, diagnose, atau HITL bila perlu

---

## Optional helper — Triage

Pakai saat request masih kabur dan fase yang tepat belum jelas.

### Contoh request

```txt
Tolong triage request ini dan tentukan apakah harus masuk idea, research, PRD, issues, atau execution.
```

Skill yang relevan:
- `triage-me`

---

## Optional helper — Diagnose

Pakai saat ada bug atau finding yang belum cukup jelas untuk langsung dieksekusi.

### Contoh request

```txt
Tolong diagnosis bug ini dulu sampai ada feedback loop yang bisa dipercaya, lalu sarankan next step-nya.
```

Skill yang relevan:
- `diagnose-me`

---

## Optional helper — Finish

Pakai saat pertanyaan utamanya adalah “apa langkah berikutnya untuk state sekarang?”

### Contoh request

```txt
Tinjau evidence implementasi dan QA saat ini lalu rekomendasikan apakah sebaiknya lanjut eksekusi, minta HITL review, prepare PR, merge, keep, atau discard.
```

Skill yang relevan:
- `finish-me`

---

## Validator lokal

### 1. Readiness gates

```bash
node scripts/validate-readiness-gates.mjs
```

Validator ini mengecek handoff aktif pada:
- `docs/idea.md`
- `docs/prd.md`

### 2. Planning/closeout assurance

```bash
node scripts/validate-planning-closeout-guidance.mjs
```

Validator ini mengecek anchor wording yang mengeras pada:
- `issues-me`
- `finish-me`
- template skill terkait
- `AGENTS.md`

Catatan:
- validator lokal bersifat **advisory**
- validator tidak menggantikan judgment manusia

---

## Alur minimal paling umum

Untuk project kecil, alur paling umum biasanya cukup seperti ini:

```txt
Saya ingin membuat app sederhana dari nol untuk [tujuan Anda]. Tolong mulai dari fase idea.
Tulis PRD dari artifact yang sudah siap.
Pecah PRD menjadi ticket kecil yang siap dieksekusi.
Eksekusi ticket AFK berikutnya.
Eksekusi ticket AFK berikutnya.
Siapkan QA checklist dan findings.
```

Agent seharusnya memilih skill yang tepat sendiri di tiap langkah.

---

## Anti-pattern yang sebaiknya dihindari

- langsung meminta implementasi saat problem masih kabur
- memaksa research walau tidak perlu
- membawa banyak arah prototype ke PRD tanpa memilih satu winner
- menjalankan planning saat handoff PRD belum siap
- mengeksekusi dua ticket sekaligus
- mengklaim done tanpa validasi segar
- menulis transcript mentah ke artifact `docs/`

---

## Penutup

Inti repo ini sederhana:
- user memberi intent dalam bahasa natural
- agent memilih skill yang tepat
- artifact di `docs/` menyimpan keputusan dan state workflow
- validator lokal membantu menjaga handoff tetap rapi

Jika Anda baru mulai, cukup minta agent memulai dari **idea** dengan bahasa biasa. Itu sudah cukup.
