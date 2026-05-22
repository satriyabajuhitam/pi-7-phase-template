# runs-once.sh

## Purpose

`runs-once.sh` menjalankan tepat satu ticket `AFK` yang eligible dari `docs/issues.md` dengan branch kerja terisolasi, worker session fresh, dan audit trail lokal.

V1 ini tetap **human-in-the-loop**:
- memilih tepat satu ticket
- menjalankan worker untuk ticket itu saja
- menulis artifact run lokal
- **tidak** auto-merge kembali ke branch orchestrator

## Preconditions

Sebelum menjalankan `./runs-once.sh`, pastikan:
- Anda sedang berada di branch orchestrator, **bukan** branch `ralph/ISSUE-XXX`
- working tree bersih dari perubahan lokal yang belum di-commit
- `docs/issues.md` ada dan readable
- `git` dan `pi` tersedia
- ticket target di `docs/issues.md` memenuhi aturan runner:
  - `Status: todo`
  - `Type: AFK`
  - `Auto-run: yes`
  - semua dependency sudah `done`

## Command

Jalankan dari root repo:

```bash
./runs-once.sh
```

V1 tidak menerima argumen tambahan.

## What the runner does

Jika ada ticket eligible, runner akan:
1. memilih ticket eligible pertama sesuai urutan file di `docs/issues.md`
2. membuat branch `ralph/ISSUE-XXX`
3. menulis bootstrap `.runs/...bootstrap.md`
4. menjalankan Pi worker dengan explicit target issue dan session file lokal
5. menulis `.runs/...result.json`
6. mengakhiri run sebagai `DONE`, `BLOCKED`, `NO_READY`, atau `FAIL`

## Final shell summary

Setiap run mencetak ringkasan akhir dengan field berikut:
- `Status`
- `Issue`
- `Branch`
- `Session`
- `Reason`
- `Artifacts`
- `Next action`

`Next action` selalu non-empty dan harus menjadi panduan operator untuk langkah berikutnya.

## Status meanings

### `NO_READY`
Artinya tidak ada ticket yang memenuhi aturan seleksi.

Perilaku:
- tidak membuat branch issue baru
- tidak memulai worker session
- tetap menulis artifact run lokal
- Anda tetap berada di branch orchestrator

Tindakan operator:
- review `docs/issues.md`
- siapkan minimal satu ticket `AFK` yang eligible
- jalankan ulang `./runs-once.sh`

### `DONE`
Artinya worker selesai, target issue benar-benar menjadi `done` di `docs/issues.md`, dan branch issue punya commit reviewable.

Perilaku:
- branch issue tetap aktif (`ralph/ISSUE-XXX`)
- ada commit lokal dengan hasil run
- `result.json` dan shell summary memberi langkah merge manual

Official manual sync procedure:

```bash
git checkout <orchestrator-branch>
git merge --no-ff ralph/ISSUE-XXX
```

Setelah merge manual, Anda bisa lanjut review/cleanup sesuai workflow repo.

### `BLOCKED`
Artinya target issue tidak lagi aman/ready untuk diteruskan, misalnya karena konflik source of truth atau perubahan readiness setelah verifikasi ulang.

Perilaku:
- runner **membuang perubahan code parsial** dari run yang diblokir
- update relevan pada `docs/issues.md` tetap dipertahankan
- branch issue **tidak** menjadi jalur sukses
- shell summary dan `result.json` memberi instruksi copy-back manual

Official manual sync procedure:
- **jangan merge** branch `ralph/ISSUE-XXX` ke orchestrator
- bawa kembali **hanya** perubahan `docs/issues.md` yang relevan ke branch orchestrator
- selesaikan blocker sebelum run berikutnya

Praktiknya bisa berupa salah satu cara berikut:
- copy manual isi `docs/issues.md`
- checkout file itu saja ke branch orchestrator lalu review
- gunakan patch/file diff hanya untuk perubahan issue status/notes yang relevan

### `FAIL`
Artinya runner atau worker gagal karena masalah proses/infra, misalnya:
- tooling tidak tersedia
- worker exit non-zero
- commit sukses tidak bisa dibuat
- target tidak berakhir `done` setelah worker selesai

Perilaku:
- tetap menulis artifact run lokal
- `result.json` punya `status_reason` terkontrol dan `next_action`
- Anda harus membaca `Reason` dan artifact run sebelum retry

Tindakan operator:
- review shell output
- review `.runs/...result.json`
- perbaiki masalah repo/tooling/proses
- ulangi run setelah state aman

## Audit artifacts

### `.runs/`
Untuk setiap run, harness menulis tepat dua file dengan basename yang sama:
- `TIMESTAMP-ISSUE.bootstrap.md`
- `TIMESTAMP-ISSUE.result.json`

Contoh:

```txt
.runs/20260522T020000Z-ISSUE-004.bootstrap.md
.runs/20260522T020000Z-ISSUE-004.result.json
```

Isi utamanya:
- `bootstrap.md`
  - metadata run
  - target issue
  - branch
  - session path
  - read order worker
  - issue excerpt terpilih
- `result.json`
  - `status`
  - `status_reason`
  - `status_detail`
  - `issue_id`
  - `branch`
  - `session`
  - `next_action`
  - path artifact run

### `.runs-sessions/`
Direktori ini menyimpan file session Pi lokal yang dirujuk dari `result.json`.

Gunakan ini hanya untuk audit/debug lokal. Ia bukan artifact requirements repo.

## Local repo hygiene decision

Keputusan v1:
- `.runs/` dan `.runs-sessions/` adalah **artifact operasional lokal**
- keduanya **sebaiknya tidak di-commit**
- keduanya masuk `.gitignore`

Alasannya:
- artifact ini membantu audit lokal, bukan source of truth produk
- source of truth workflow tetap ada di `docs/issues.md`, `docs/prd.md`, dan session outcome
- menghindari noise pada diff dan commit review

## Temporary smoke-test ticket

Untuk smoke test end-to-end, tim boleh menambahkan tepat satu ticket `AFK` sementara dengan `Auto-run: yes`.

Panduan v1:
- usahakan scope sekecil mungkin, idealnya perubahan dokumentasi saja
- gunakan ticket ini hanya untuk memverifikasi shell output, branch flow, dan artifact `.runs/`
- setelah observasi selesai, hapus ticket sementara itu atau tandai `done` dengan catatan eksplisit

## Operator checklist

Sebelum run:
- [ ] berada di branch orchestrator
- [ ] working tree bersih
- [ ] `git` dan `pi` tersedia
- [ ] ada ticket `AFK` eligible

Sesudah `DONE`:
- [ ] review branch `ralph/ISSUE-XXX`
- [ ] review `.runs/...result.json`
- [ ] merge manual ke orchestrator branch

Sesudah `BLOCKED`:
- [ ] jangan merge branch issue
- [ ] copy-back hanya perubahan `docs/issues.md` yang relevan
- [ ] selesaikan blocker

Sesudah `FAIL`:
- [ ] review `Reason`
- [ ] review `result.json`
- [ ] perbaiki masalah lalu retry
