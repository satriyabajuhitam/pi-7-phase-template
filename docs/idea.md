# Idea

## Problem statement
`v1-context-hardening` sudah memperkuat handoff `idea -> PRD` dan `PRD -> issues`, tetapi enforcement masih parsial. Saat ini hardening terutama hidup di `AGENTS.md`, prompt, dan template PRD; belum konsisten di semua skill, belum punya validator otomatis, dan belum diperluas ke handoff fase berikutnya.

## Desired outcome
Meningkatkan reliability workflow sehingga guardrail phase handoff konsisten, sulit dibypass, tetap ringan dipakai, dan lebih aman untuk fresh context window maupun penggunaan template oleh repo turunan.

## Scope
- Samakan rule hardening di `AGENTS.md`, prompt, skill files, dan template artifacts
- Tambah mekanisme validasi/automation ringan untuk readiness gates
- Rapikan dokumentasi dan release hygiene yang relevan

## Non-goals
- Mengimplementasikan product/app feature di luar workflow template
- Menulis ulang total seluruh skill
- Menambah proses yang berat jika manfaat guardrail-nya kecil

## Constraints
- Repo ini harus tetap clean sebagai template
- Perubahan harus generic, bukan app-specific
- Workflow harus tetap ringkas dan tidak terlalu birokratis
- Jangan menurunkan usability untuk kasus sederhana

## Assumptions
- User bisa memakai prompt atau skill secara langsung, jadi enforcement harus konsisten di keduanya
- Readiness gates yang hanya berupa instruksi teks masih mudah bocor
- Sedikit automation akan memberi leverage besar dibanding hanya menambah docs

## Decision map
- **Enforcement surface:** apakah parity di prompt + skill + template sudah cukup, atau perlu script/CI
- **Guardrail strength:** seberapa keras validation harus memblokir handoff
- **Downstream scope:** apakah hardening berhenti di Phase 5 atau dilanjutkan sampai release
- **Usability tradeoff:** bagaimana mencegah workflow jadi terlalu berat

## Questions asked
- Apakah validator cukup dijalankan lokal, atau perlu lokal + CI?
- Apakah validator harus advisory, hard-blocking, atau kombinasi keduanya?
- Pada minor release ini, artifact mana saja yang wajib divalidasi?
- Apakah validator cukup memeriksa struktur handoff, atau juga logika readiness minimumnya?

## Decisions made
- Fokus awal adalah improvement pasca-release `context-hardening`
- Iterasi berikutnya diposisikan sebagai minor release
- Scope minor release dibatasi ke skill/prompt/template parity dan validator otomatis ringan
- Downstream hardening penuh setelah Phase 5 belum masuk iterasi ini
- Validator readiness gate akan ditegakkan di lokal dan CI
- Model enforcement yang dipilih adalah advisory di lokal dan blocking di CI
- Cakupan validator minor release difokuskan ke `docs/idea.md` dan `docs/prd.md`
- Validator akan memeriksa struktur handoff dan logika readiness minimum, tetapi tidak menilai kualitas isi dokumen secara semantik
- Logika minimum yang divalidasi: section handoff wajib ada; field `Ready for next phase` dan `Primary blocker` wajib ada; jika readiness `no` maka blocker tidak boleh kosong/`none`; jika readiness `yes` maka checklist handoff tidak boleh masih ada item yang unchecked
- Artifact tujuan untuk fase ini adalah `docs/idea.md`

## Open questions
- Apakah validasi perlu menyiapkan hook/struktur ekstensi untuk fase berikutnya sejak awal?
- Release hygiene minimum apa yang benar-benar wajib masuk minor release ini?

## Need research?
No untuk sekarang. Konteks utama sudah cukup dari repo lokal.

## Need prototype?
No untuk sekarang. Ini lebih butuh keputusan scope daripada eksplorasi bentuk.

## Biggest risk
Kita bisa over-harden workflow: guardrail memang lebih aman, tapi bisa membuat template terasa berat dan memperlambat kasus sederhana.

## Recommended next step
Lanjut ke PRD untuk mendefinisikan requirement minor release ini secara eksplisit: perubahan skill/prompt/template parity, validator readiness gate, dan acceptance criteria-nya.

## Handoff to PRD
- [x] Problem statement and target outcome are stable enough
- [x] Scope for the next iteration is bounded
- [x] Non-goals are explicit
- [x] Key constraints are visible
- [x] Open questions are reduced enough to define requirements

Ready for next phase: yes
Primary blocker: none
Notes:
- Minor release sudah dipilih
- Validator akan berjalan di lokal dan CI
- Model enforcement: advisory lokal, blocking CI
- Cakupan awal validator: `docs/idea.md` dan `docs/prd.md`
- Scope downstream hardening penuh sengaja ditunda
- Release hygiene dan extensibility bisa ditangani sebagai requirement sekunder atau open question di PRD
