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
- jika area belum familiar, zoom out dulu untuk memetakan module, entry point, dan caller utama yang relevan
- bangun feedback loop terkecil yang bisa dipercaya sebelum berteori terlalu jauh
- coba repro failure dan laporkan statusnya dengan jelas
- buat 3–5 hipotesis berurutan yang bisa diuji
- lakukan probe kecil yang membedakan hipotesis-hipotesis itu
- gunakan hasil diagnosis untuk menentukan apakah outcome-nya `needs-info`, `needs-research`, `ready-for-execution`, `hitl`, atau `not reproduced`
- jika perlu mencatat hasilnya, update hanya artifact yang paling tepat dan paling kecil, biasanya `docs/issues.md` atau `docs/qa.md`, dan `docs/research.md` hanya bila blocker utamanya benar-benar fakta eksternal
- jangan langsung mengimplementasikan fix
- jika outcome sudah `ready-for-execution`, handoff yang disarankan biasanya ke `execute-me`

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
