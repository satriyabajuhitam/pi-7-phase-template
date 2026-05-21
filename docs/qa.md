# QA

## Objective
- Memverifikasi bahwa minor release `feat/readiness-gate-validator` benar-benar memberi guardrail yang dijanjikan untuk handoff `idea -> PRD` dan `PRD -> issues`, termasuk validator lokal, mode blocking untuk CI, dan dokumentasi scope-nya.

## Scope under test
- Features or flows under review:
  - parity hardening untuk Phase 1, 4, dan 5 surfaces
  - validator lokal `scripts/validate-readiness-gates.mjs`
  - mode CI blocking via `.github/workflows/readiness-gates.yml`
  - dokumentasi penggunaan validator dan batas scope minor release
- Completed tickets included:
  - `ISSUE-001`
  - `ISSUE-002`
  - `ISSUE-003`
  - `ISSUE-004`
  - `ISSUE-005`
- Explicitly out of scope for this pass:
  - hardening downstream handoffs seperti `issues -> execute`, `execute -> QA`, atau `QA -> release`
  - penilaian semantik kualitas isi `docs/idea.md` atau `docs/prd.md`
  - end-to-end remote execution GitHub Actions di hosted runner yang belum dijalankan dari repo ini

## Source artifacts
- `docs/prd.md`
- `docs/issues.md`
- Other relevant sources:
  - `scripts/validate-readiness-gates.mjs`
  - `.github/workflows/readiness-gates.yml`
  - `README.md`
  - `GUIDE.md`
  - `MASTER_TEMPLATE.md`

## Build / revision under review
- Branch / commit / working tree context:
  - Branch: `feat/readiness-gate-validator`
  - Working tree: ada perubahan lokal belum di-commit untuk skill/docs/validator/workflow terkait minor release ini
- Environment notes:
  - Node.js `v24.15.0`
  - Validasi dijalankan lokal melalui CLI
  - Belum ada bukti run GitHub Actions langsung di remote runner pada QA pass ini

## Test scenarios
1. Jalankan validator lokal pada artifact aktif yang valid dan pastikan `docs/idea.md` serta `docs/prd.md` lulus dengan output advisory yang jelas.
2. Jalankan validator dalam mode CI (`--ci`) pada artifact aktif yang valid dan pastikan output berubah ke mode blocking tanpa error.
3. Uji failure path validator dengan fixture sementara untuk memastikan pelanggaran readiness gate menghasilkan exit code non-zero dan pesan rule yang spesifik.
4. Verifikasi bahwa artifact kosong diperlakukan sebagai clean template state dan di-skip, bukan dianggap gagal.
5. Verifikasi bahwa dokumentasi utama menjelaskan command validator, beda advisory vs blocking, empty template-state behavior, dan batas scope minor release.

## Edge cases to verify
- Invalid input:
  - `Ready for next phase` bukan `yes/no`
  - `Primary blocker` kosong atau placeholder saat readiness `no`
- Permissions / access:
  - file artifact tidak bisa dibaca harus gagal eksplisit
- Empty state:
  - `docs/idea.md` atau `docs/prd.md` kosong harus di-skip sebagai template state
- Error state:
  - section handoff hilang
  - field readiness atau blocker hilang
- Retry / duplicate action:
  - validator bisa dijalankan berulang dan hasilnya konsisten pada state yang sama
- External dependency failure:
  - CI runner gagal menjalankan script harus tampak sebagai kegagalan check, bukan pass diam-diam

## Human review checklist
- UX and behavior consistency:
  - istilah `advisory` vs `blocking` konsisten di README/GUIDE/template docs
- Copy / labeling sanity:
  - nama section handoff dan field readiness konsisten dengan AGENTS/prompt/skill
- Security sanity check:
  - workflow CI tidak menjalankan command berisiko di luar validator
- Performance sanity check:
  - validator cukup ringan untuk dipakai berulang di lokal dan CI
- Maintainability / readability spot check:
  - parser validator cukup kecil dan modular untuk diperluas nanti tanpa memperlebar scope sekarang

## Known risks
- Belum ada bukti langsung bahwa workflow GitHub Actions ini sudah berjalan sukses di hosted runner; QA pass ini baru memverifikasi file workflow dan mode `--ci` secara lokal.
- Validator sengaja hanya memeriksa struktur handoff dan logika readiness minimum; ia belum menilai kualitas substantif artifact.

## Findings
- Pass:
  - `node scripts/validate-readiness-gates.mjs` lulus pada `docs/idea.md` dan `docs/prd.md` aktif dengan output advisory yang sesuai.
  - `node scripts/validate-readiness-gates.mjs --ci` lulus pada `docs/idea.md` dan `docs/prd.md` aktif dengan output blocking yang sesuai.
  - Failure path validator sudah dibuktikan sebelumnya dengan fixture sementara untuk kasus missing section, missing field, placeholder blocker, unchecked checklist, dan memberi exit code gagal.
  - Empty template-state behavior sudah dibuktikan: artifact kosong di-skip, bukan gagal.
  - Dokumentasi utama (`README.md`, `GUIDE.md`, `MASTER_TEMPLATE.md`) sekarang menjelaskan command validator, advisory vs blocking, empty template-state handling, dan batas scope minor release.
- Fail:
  - none in this QA pass
- Uncertain:
  - Workflow `.github/workflows/readiness-gates.yml` belum diverifikasi lewat run nyata di GitHub Actions hosted runner.
  - Belum ada release-signoff evidence seperti changelog/release note terstruktur; PRD memang menandai ini sebagai non-blocking open question.

## Follow-up issues
- New AFK tickets:
  - none
- New HITL tickets:
  - Manual remote smoke check: jalankan workflow `Readiness Gates` melalui PR/push atau `workflow_dispatch` untuk memastikan hosted runner behavior sesuai ekspektasi.
- Existing tickets to reopen or unblock:
  - none

## Release / sign-off recommendation
- Ready for release:
  - not yet recommended as fully signed off without one remote GitHub Actions smoke run
- Ready for next execution pass:
  - no AFK execution work is required from current evidence
- Blocked pending HITL:
  - yes — pending one human-triggered remote CI smoke check / sign-off
- Needs more testing:
  - only lightweight remote verification, not broader replanning

## Next step
- Recommended action:
  - Lakukan satu HITL smoke test di GitHub Actions untuk workflow `Readiness Gates`, lalu sign-off/release jika hasilnya hijau.
- Why:
  - Semua evidence lokal untuk validator dan dokumentasi sudah baik, tetapi satu-satunya gap penting yang tersisa adalah bukti bahwa blocking check juga benar-benar berjalan di environment CI remote.
