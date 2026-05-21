# GUIDE.md

## Tujuan

Panduan ini menjelaskan cara memakai workflow 7 fase di repo ini untuk **membuat app sederhana dari nol**.

Contoh studi kasus yang dipakai:

**Membuat app Todo sederhana dari nol** dengan kemampuan:
- menambah todo
- melihat daftar todo
- menandai todo selesai
- memfilter `all / active / done`

Tujuan panduan ini adalah agar user baru bisa langsung merasakan ritme workflow:
- ide dulu
- research bila perlu
- prototype bila perlu
- PRD
- breakdown issues
- execute satu ticket per run
- QA

---

## Ringkasan workflow

Urutan command yang tersedia:

1. `/idea`
2. `/research`
3. `/prototype`
4. `/prd`
5. `/issues`
6. `/execute`
7. `/qa`

Artifact utama yang dihasilkan:
- `docs/idea.md`
- `docs/research.md`
- `docs/prototype/`
- `docs/prd.md`
- `docs/issues.md`
- `docs/qa.md`

---

## Kapan panduan ini cocok dipakai?

Pakai panduan ini jika Anda ingin:
- memulai app baru dari nol
- belajar memakai workflow ini dengan kasus kecil tapi nyata
- melatih agent bekerja lebih disiplin sebelum mencoba project yang lebih besar

---

## Studi kasus: app Todo sederhana dari nol

Kita akan berpura-pura belum punya app sama sekali, lalu memakai workflow ini untuk membangunnya.

### Scope app contoh
Versi awal app Todo ini hanya punya:
- tambah todo
- lihat semua todo
- tandai selesai / belum selesai
- filter `all`, `active`, `done`

### Non-goals
Belum ada:
- login
- database cloud
- multi-user
- share todo
- reminder
- drag and drop

Ini penting supaya project tetap kecil dan cocok untuk belajar.

---

## Langkah 0 — Persiapan

### Apakah repo ini sudah bisa dipakai sebagai master?

**Ya, hampir.**

Untuk dipakai sebagai **master workflow**, repo ini sudah kuat karena sudah punya:
- `AGENTS.md`
- semua skill fase 1–7 di `.pi/skills/`
- semua prompt template di `.pi/prompts/`
- `GUIDE.md`
- struktur artifact di `docs/`

Tapi untuk dipakai sebagai **master project yang bersih**, saya sarankan Anda menganggap repo ini sebagai **template workflow**, lalu membersihkan artifact contoh sebelum mulai project baru.

Yang sebaiknya dibersihkan saat membuat project baru:
- isi `docs/idea.md`
- isi `docs/research.md`
- isi `docs/prd.md`
- isi `docs/issues.md`
- isi `docs/qa.md` jika ada
- isi `docs/prototype/`
- folder sandbox/contoh seperti `sandbox/demo-notes/` bila tidak dibutuhkan
- cache `.firecrawl/` bila ada

### Contoh copy master project ke folder baru

Misalnya repo master ini ada di:

```bash
/path/to/pi-7-phase-template
```

Dan Anda ingin memulai project baru di:

```bash
/path/to/my-todo-app
```

Contoh perintah:

```bash
rsync -a \
  --exclude '.git' \
  --exclude '.firecrawl' \
  /path/to/pi-7-phase-template/ \
  /path/to/my-todo-app/
```

Lalu masuk ke project baru:

```bash
cd /path/to/my-todo-app
```

Kalau ingin project baru benar-benar bersih dari artifact contoh, jalankan:

```bash
: > docs/idea.md
: > docs/research.md
: > docs/prd.md
: > docs/issues.md
rm -f docs/qa.md
rm -f docs/prototype/*.md
rm -rf sandbox/demo-notes
```

Jika ingin langsung menjadikannya repo git baru:

```bash
git init
git add .
git commit -m "chore: initialize project from 7-phase workflow master"
```

### Setelah copy project

Jalankan dulu:

```txt
/reload
```

Lalu pastikan prompt template ini tersedia:
- `/idea`
- `/research`
- `/prototype`
- `/prd`
- `/issues`
- `/execute`
- `/qa`

Catatan:
- file di `docs/` boleh kosong saat mulai
- agent akan mengisinya selama proses berjalan

---

## Phase 1 — Idea

Di fase ini, kita belum coding. Kita memperjelas ide app.

### Contoh prompt

```txt
/idea Saya ingin membuat app Todo sederhana dari nol. User bisa menambah todo, melihat daftar todo, menandai selesai, dan memfilter berdasarkan status.
```

### Yang diharapkan terjadi
Agent akan membantu memperjelas:
- masalah apa yang diselesaikan app ini
- siapa user utamanya
- apa outcome yang diinginkan
- apa yang masuk scope v1
- apa yang di luar scope
- constraint apa yang ada
- apakah perlu research
- apakah perlu prototype

### Hasil artifact
Agent akan menulis ke:
- `docs/idea.md`

### Hasil yang baik
Pada akhir fase ini, `docs/idea.md` biasanya sudah jelas tentang:
- app ini untuk apa
- fitur minimal v1
- apa yang sengaja tidak dibuat dulu
- apakah perlu research/prototype

---

## Phase 2 — Research

Phase ini **opsional**.

### Untuk app Todo sederhana dari nol
Biasanya **tidak perlu research** jika:
- stack sudah Anda tentukan
- tidak ada dependency eksternal rumit
- tidak ada API pihak ketiga

### Kapan research diperlukan?
Misalnya jika Anda ingin:
- pakai backend-as-a-service tertentu
- pakai auth provider
- pakai sync provider
- deploy ke platform tertentu yang belum Anda pahami

### Contoh prompt jika perlu

```txt
/research Cari batasan dan pola terbaik untuk menyimpan todo di local-first app sederhana dengan stack yang dipakai repo ini
```

### Hasil artifact
- `docs/research.md`

### Catatan penting
Kalau tidak perlu research, itu **normal**. Jangan memaksa Phase 2 hanya demi formalitas.

---

## Phase 3 — Prototype

Phase ini dipakai jika Anda masih ingin membandingkan beberapa arah.

### Untuk app Todo sederhana
Prototype bisa berguna jika Anda ingin membandingkan:
- layout mobile-first vs desktop-first
- inline edit vs modal edit
- filter di top bar vs tab navigation

### Contoh prompt

```txt
/prototype Bandingkan 2-3 variasi UI untuk app Todo sederhana dari nol, fokus pada cara menambah todo dan memfilter status
```

### Aturan penting
Jika prototyping dipakai:
- agent membuat beberapa variasi
- lalu memilih **tepat satu winner**
- PRD nanti hanya boleh memakai **0 atau 1 prototype winner**

### Hasil artifact
- `docs/prototype/prototype-1.md`
- `docs/prototype/prototype-2.md`
- `docs/prototype/prototype-3.md` bila perlu
- `docs/prototype/comparison.md`

### Kapan lanjut?
- jika prototype memang tidak perlu, langsung ke PRD
- jika prototype dipakai, pilih dulu satu winner

---

## Phase 4 — PRD

Di fase ini kita menulis target akhir app dengan jelas.

### Contoh prompt

```txt
/prd Tulis PRD untuk app Todo sederhana dari nol berdasarkan artifact yang sudah ada
```

### Fokus PRD
PRD harus menjelaskan:
- apa yang user lihat
- bagaimana flow utama bekerja
- bagaimana app berperilaku
- edge case penting
- acceptance criteria

### Untuk contoh app Todo
PRD yang baik biasanya menjelaskan:
- user bisa menambah todo
- user bisa melihat daftar todo
- user bisa toggle done state
- user bisa memfilter list
- empty state ditangani
- todo invalid/empty tidak boleh disimpan

### Hasil artifact
- `docs/prd.md`

### Kapan lanjut?
Lanjut jika PRD sudah cukup jelas untuk dipecah jadi ticket.

---

## Phase 5 — Issues / Kanban Board

PRD sekarang diubah jadi ticket eksekusi.

### Contoh prompt

```txt
/issues Pecah PRD app Todo sederhana menjadi ticket vertical slice kecil yang siap dieksekusi
```

### Yang diharapkan terjadi
Agent akan membuat `docs/issues.md` dengan ticket seperti misalnya:
- ISSUE-001 — bootstrap app shell dan render daftar kosong
- ISSUE-002 — tambah todo baru
- ISSUE-003 — toggle status done
- ISSUE-004 — filter all/active/done
- ISSUE-005 — edge case dan hardening

### Prinsip ticket yang baik
Ticket harus:
- kecil
- observable
- end-to-end
- punya acceptance criteria
- punya dependency jelas

### Bukan ticket yang baik
Hindari ticket seperti:
- buat folder utils
- setup service layer
- bikin schema dulu

### Hasil artifact
- `docs/issues.md`

### Kapan lanjut?
Lanjut jika ada minimal satu ticket `AFK` yang ready.

---

## Phase 6 — Execute

Ini fase coding.

### Aturan terpenting
- **satu run = satu ticket**
- pilih ticket `AFK` yang ready
- hormati dependency
- validasi dulu sebelum mark `done`
- update `docs/issues.md`

### Contoh prompt

```txt
/execute
```

atau:

```txt
/execute Fokus pada ticket AFK berikutnya dan validasi ketat sebelum mark done
```

### Yang diharapkan terjadi
Agent akan:
- membaca `docs/issues.md`
- memilih satu ticket `AFK`
- update status ke `in-progress`
- mengimplementasikan ticket itu saja
- menjalankan validasi
- update status ke `done` atau `blocked`

### Cara menjalankannya
Biasanya Anda akan menjalankan `/execute` beberapa kali:

```txt
/execute
/execute
/execute
```

Setiap run mengerjakan **satu** ticket berikutnya.

### Ini adalah adaptasi Ralph-style
Workflow kita mengambil pola Ralph seperti ini:
- satu ticket per iterasi
- validasi tiap iterasi
- progress disimpan di `docs/issues.md`

---

## Phase 7 — QA

Setelah beberapa ticket selesai, sekarang kita verifikasi hasil.

### Contoh prompt

```txt
/qa
```

atau:

```txt
/qa Fokus pada edge case, regression, dan checklist review manual untuk app Todo sederhana
```

### Yang diharapkan terjadi
Agent akan membuat atau memperbarui:
- `docs/qa.md`

Isi utamanya biasanya:
- scope under test
- test scenarios
- edge cases
- human review checklist
- findings
- follow-up issues
- sign-off recommendation

### Contoh hal yang diuji pada app Todo
- menambah todo valid
- menolak todo kosong
- toggle done bekerja
- filter active/done bekerja
- empty state masuk akal
- perilaku UI konsisten

### Fungsi QA dalam workflow ini
QA bukan akhir mutlak. QA adalah loop:
- jika ada masalah → kembali ke `/issues` atau `/execute`
- jika aman → lanjut release/manual sign-off

---

## Contoh alur praktis dari nol

Kalau Anda ingin langsung mencoba, pakai alur ini:

```txt
/reload
/idea Saya ingin membuat app Todo sederhana dari nol. User bisa menambah todo, melihat daftar todo, menandai selesai, dan memfilter status.
/prd Tulis PRD untuk app Todo sederhana dari nol berdasarkan artifact yang ada
/issues Pecah PRD menjadi ticket vertical slice kecil
/execute
/execute
/execute
/qa
```

Jika Anda merasa butuh eksplor UI lebih dulu, sisipkan:

```txt
/prototype
```

Jika Anda merasa ada dependency eksternal yang perlu dipelajari, sisipkan:

```txt
/research
```

---

## Contoh hasil yang sehat untuk app baru dari nol

Workflow ini dianggap berjalan sehat jika:
- `docs/idea.md` menjelaskan scope app dengan jelas
- `docs/prd.md` cukup konkret
- `docs/issues.md` berisi ticket kecil yang executable
- `/execute` tidak pernah mengambil dua ticket sekaligus
- `docs/qa.md` memberi test plan yang jelas

---

## Kapan research boleh dilewati?

Untuk app sederhana dari nol, sering kali research **boleh dilewati** jika:
- tidak ada API eksternal
- stack sudah familiar
- problem domain sederhana

Itu normal.

---

## Kapan prototype boleh dilewati?

Prototype boleh dilewati jika:
- arah desain sudah jelas
- app sangat sederhana
- Anda tidak sedang membandingkan beberapa UX direction

Untuk banyak app CRUD sederhana, Anda sering bisa langsung:
- `/idea`
- `/prd`
- `/issues`
- `/execute`
- `/qa`

---

## Checklist singkat per fase

### Sebelum `/prd`
- [ ] ide sudah cukup jelas
- [ ] tidak ada banyak arah prototype aktif

### Sebelum `/issues`
- [ ] PRD cukup jelas
- [ ] acceptance criteria ada

### Sebelum `/execute`
- [ ] ada ticket `AFK` ready
- [ ] dependency ticket terpenuhi

### Sebelum `/qa`
- [ ] ada hasil implementasi yang meaningful
- [ ] status issue sudah terbarui

---

## Anti-pattern yang perlu dihindari

Jangan lakukan ini:
- langsung `/execute` saat belum ada `docs/issues.md`
- menulis PRD saat masih ada 2-3 arah prototype aktif
- memecah issue menjadi layer teknis horizontal
- mengerjakan dua ticket dalam satu run execution
- menulis research mentah ke `docs/research.md`
- menganggap semua project harus melewati semua fase secara penuh

---

## Tips untuk project baru dari nol

### 1. Mulai kecil
Jangan mulai dari app besar. Mulai dari versi minimum yang benar-benar bisa selesai.

### 2. Kunci non-goals sejak awal
Ini sangat membantu supaya PRD dan issues tidak membengkak.

### 3. Pakai vertical slices
Misalnya untuk app Todo:
- shell daftar kosong
- tambah todo
- toggle done
- filter list
- edge cases

### 4. Hormati satu-ticket-per-run
Ini membuat eksekusi lebih stabil dan mudah diverifikasi.

### 5. QA jangan di-skip
Untuk app baru dari nol, justru QA membantu melihat apakah scope awal benar-benar terpenuhi.

---

## Variasi project sederhana lain yang cocok untuk latihan

Kalau tidak ingin Todo app, Anda juga bisa mencoba:
- habit tracker sederhana
- notes app sederhana
- bookmark manager sederhana
- expense tracker mini
- reading list sederhana

Pilih project yang:
- bisa selesai dalam beberapa ticket kecil
- tidak butuh auth dulu
- tidak butuh integrasi eksternal yang berat

---

## Ringkasan akhir

Untuk **membuat app sederhana dari nol**, workflow ini paling mudah dipahami jika dipakai seperti ini:

### Jalur minimal
```txt
/idea
/prd
/issues
/execute
/qa
```

### Jalur lengkap bila perlu
```txt
/idea
/research
/prototype
/prd
/issues
/execute
/qa
```

Mulai dari app kecil, biarkan agent mengisi artifact di `docs/`, lalu ulangi ritmenya sampai Anda nyaman.

Kalau ragu harus mulai dari mana, mulai saja dari:

```txt
/idea Saya ingin membuat app sederhana dari nol untuk [tujuan app Anda].
```
