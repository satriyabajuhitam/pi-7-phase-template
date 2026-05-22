# runs-afk.sh

## Purpose

`runs-afk.sh` menjalankan loop lokal multi-iterasi yang **bounded** di atas `runs-once.sh`.

V1 ini tetap semi-otomatis:
- setiap iterasi tetap memakai `runs-once.sh`
- hanya hasil `DONE` yang di-merge balik otomatis ke branch orchestrator
- `BLOCKED`, `FAIL`, dan merge failure tetap memantul ke manusia
- output machine-readable resmi ada di artifact JSON agregat, bukan di stdout

## Preconditions

Sebelum menjalankan `./runs-afk.sh`, pastikan:
- Anda sedang berada di branch orchestrator, **bukan** branch `ralph/ISSUE-XXX`
- working tree bersih
- `git` dan `pi` tersedia
- `runs-once.sh` sudah berfungsi di repo ini
- ada ticket `AFK` eligible bila Anda mengharapkan loop mengerjakan sesuatu

## Command

Jalankan dari root repo:

```bash
./runs-afk.sh <iterations>
```

Contoh:

```bash
./runs-afk.sh 3
```

Argumen `<iterations>` wajib berupa integer positif.

Untuk memperkirakan batas loop yang masuk akal dari board saat ini tanpa menjalankan batch, gunakan:

```bash
./runs-afk.sh --count
```

Perilaku `--count`:
- mencetak **angka saja** ke stdout
- menghitung berapa ticket `AFK` yang bisa diproses berurutan dari `docs/issues.md` saat ini bila tiap iterasi sukses berakhir `DONE`
- ikut mempertimbangkan dependency yang bisa terbuka setelah ticket sebelumnya selesai
- tidak membuat artifact `.runs/`

Untuk preview human-readable dari urutan ticket yang bisa diproses dan ticket yang belum eligible, gunakan:

```bash
./runs-afk.sh --list
```

Perilaku `--list`:
- mencetak urutan `Processable AFK queue`
- mencetak bagian `Not eligible` beserta alasan setiap ticket belum bisa ikut batch
- mencetak `Summary` dengan jumlah processable dan not eligible
- tidak menjalankan batch dan tidak membuat artifact `.runs/`

## What the wrapper does

Untuk setiap iterasi, wrapper akan:
1. memanggil `runs-once.sh`
2. membaca artifact `result.json` dari iterasi tersebut
3. jika status iterasi `DONE`, kembali ke branch orchestrator lalu menjalankan:

```bash
git merge --no-ff ralph/ISSUE-XXX
```

4. hanya setelah merge sukses, wrapper boleh lanjut ke iterasi berikutnya

## Final batch summary

Saat loop selesai, `runs-afk.sh` mencetak ringkasan final human-readable ke stdout dengan bentuk seperti:
- `Status`
- `Stop reason`
- `Iterations`
- `Orchestrator branch`
- `Processed issues`
- `Aggregate artifact`

Catatan:
- stdout ini untuk manusia
- kontrak machine-readable resmi tetap file JSON agregat di `.runs/`

## Stop behavior

### `NO_READY`
Artinya tidak ada ticket eligible untuk dilanjutkan.

Perilaku:
- berhenti normal
- tidak mencoba iterasi tambahan
- menulis summary agregat

### `DONE` + iteration cap reached
Artinya iterasi yang dijalankan sukses, lalu batch berhenti normal karena batas iterasi yang diminta user sudah habis.

Perilaku:
- branch orchestrator tetap menjadi branch aktif akhir
- issue branches sukses tetap dipertahankan
- summary agregat menandai alasan berhenti sebagai cap iterasi

### `BLOCKED`
Artinya satu iterasi butuh keputusan manusia.

Perilaku:
- loop berhenti total
- tidak auto-diagnose
- tidak auto-create follow-up issue resmi
- tidak lanjut ke ticket berikutnya

### `FAIL`
Artinya satu iterasi gagal atau wrapper tidak bisa melanjutkan dengan aman.

Perilaku:
- loop berhenti total
- exit non-zero
- summary agregat tetap ditulis bila batch sudah sempat mengklasifikasi iterasi

### `merge_failed`
Artinya iterasi `DONE`, tetapi merge balik ke orchestrator gagal atau conflict.

Perilaku:
- loop berhenti total
- tidak mencoba iterasi berikutnya
- summary agregat menandai alasan berhenti sebagai `merge_failed`

## Aggregate artifact

Untuk setiap batch, wrapper menulis tepat satu file agregat:

```txt
.runs/TIMESTAMP-afk-summary.json
```

Isi minimum:
- `status`
- `stop_reason`
- `stop_detail`
- `iteration_count`
- `requested_iterations`
- `orchestrator_branch`
- `processed_issues`
- `aggregate_path`

Setiap item `processed_issues` menunjuk balik ke artifact iterasi:
- `bootstrap_path`
- `result_path`

Gunakan file ini sebagai index audit utama untuk seluruh batch.

## Operator checklist

Sebelum run:
- [ ] berada di branch orchestrator
- [ ] working tree bersih
- [ ] `git` dan `pi` tersedia
- [ ] iteration cap sudah dipilih dengan sengaja

Sesudah normal stop:
- [ ] baca summary final di stdout
- [ ] review `.runs/*-afk-summary.json`
- [ ] review issue branches sukses bila perlu

Sesudah `BLOCKED` atau `FAIL`:
- [ ] baca alasan berhenti di stdout
- [ ] review `.runs/*-afk-summary.json`
- [ ] telusuri artifact iterasi yang dirujuk summary agregat
- [ ] selesaikan blocker atau failure sebelum retry
