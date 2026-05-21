---
description: Diagnosa bug, regression, flaky failure, atau performance issue sebelum eksekusi
argument-hint: "[bug-report-atau-finding-yang-perlu-didiagnosis]"
---
Muat dan ikuti skill project-local `diagnose-me`.

Gunakan artifact proyek berikut sebagai sumber konteks utama bila relevan:
- `docs/issues.md`
- `docs/qa.md`
- `docs/prd.md`
- `docs/research.md`
- `docs/idea.md`
- file code, test, script, config, atau log terkait

Tujuan Anda:
- pahami expected behavior vs observed behavior
- bangun feedback loop terkecil yang bisa dipercaya sebelum berteori terlalu jauh
- coba repro failure dan laporkan statusnya dengan jelas
- buat 3–5 hipotesis berurutan yang bisa diuji
- lakukan probe kecil yang membedakan hipotesis-hipotesis itu
- tentukan apakah hasil diagnosis berujung ke `needs-info`, `needs-research`, `ready-for-execution`, `hitl`, atau `not reproduced`
- jika perlu mencatat hasilnya, update artifact yang paling tepat dan paling kecil, biasanya `docs/issues.md` atau `docs/qa.md`
- jangan langsung mengimplementasikan fix

Tutup dengan ringkasan singkat berisi:
- `Issue summary`
- `Expected behavior`
- `Observed behavior`
- `Feedback loop`
- `Reproduction status`
- `Ranked hypotheses`
- `Current best explanation`
- `Recommended next step`

Bug report atau finding yang perlu didiagnosis: $@
