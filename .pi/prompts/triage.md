---
description: Triage bug report, feature request, refactor, atau QA finding ke artifact dan fase lokal yang tepat
argument-hint: "[laporan-atau-permintaan-yang-perlu-ditriage]"
---
Muat dan ikuti skill project-local `triage-me`.

Gunakan artifact proyek berikut sebagai sumber konteks utama bila relevan:
- `docs/qa.md`
- `docs/issues.md`
- `docs/prd.md`
- `docs/research.md`
- `docs/idea.md`
- `docs/prototype/comparison.md`

Tujuan Anda:
- klasifikasikan item sebagai `bug`, `enhancement`, `refactor`, atau `process/question`
- pilih tepat satu local triage state: `needs-info`, `needs-repro`, `needs-idea`, `needs-research`, `needs-prototype`, `needs-prd`, `needs-planning`, `ready-for-execution`, `hitl`, atau `wont-do`
- jika item adalah bug, coba repro secara ringan dulu sebelum merutekannya
- tentukan artifact lokal terkecil yang seharusnya memiliki langkah berikutnya
- jika destination artifact sudah jelas atau user meminta output tertulis, update artifact itu saja
- jangan langsung mengimplementasikan perubahan

Routing default:
- request masih kabur atau masih berupa proposal awal -> `docs/idea.md`
- ada ketidakpastian fakta atau dependency eksternal -> `docs/research.md`
- ada beberapa arah UX/arsitektur yang masih bersaing -> `docs/prototype/`
- ada requirement baru / perubahan requirement yang user-visible -> `docs/prd.md`
- PRD sudah jelas tetapi belum dipecah jadi ticket -> `docs/issues.md`
- follow-up yang jelas masih dalam scope ticket lama -> reopen/update ticket terkait di `docs/issues.md`

Tutup dengan ringkasan singkat berisi:
- `Classification`
- `Triage state`
- `Why`
- `Destination artifact`
- `Recommended next step`

Laporan atau permintaan yang perlu ditriage: $@
