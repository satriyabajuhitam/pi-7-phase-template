---
description: Buat dan bandingkan prototipe di docs/prototype/ memakai skill prototype-me
argument-hint: "[target-atau-fokus-prototype]"
---
Muat dan ikuti skill project-local `prototype-me`.

Gunakan `docs/idea.md` sebagai konteks utama. Tinjau juga `docs/research.md`, `docs/prd.md`, dan file yang sudah ada di `docs/prototype/` bila relevan.

Tentukan dulu apakah fase prototyping memang diperlukan. Jika memang diperlukan:
- definisikan objective prototype, decision criteria, scope, dan out of scope
- buat **2-3 variasi yang benar-benar berbeda** secara default, kecuali pengguna meminta hanya satu
- gunakan artifact di `docs/prototype/` sebagai output utama
- buat atau perbarui:
  - `docs/prototype/prototype-1.md`
  - `docs/prototype/prototype-2.md`
  - `docs/prototype/prototype-3.md` bila perlu
  - `docs/prototype/comparison.md`
- untuk tiap variasi, jelaskan goal, key behavior/design choices, strengths, weaknesses, risks, dan kapan opsi itu cocok dipilih
- di `comparison.md`, tampilkan decision criteria, perbandingan side-by-side, status tiap variasi, exactly one winner bila prototyping memang dipakai, apa yang dipromosikan ke PRD, unresolved questions, dan recommended next step

Jangan perlakukan prototype sebagai implementasi final. Jika runnable prototype tidak diperlukan, cukup dokumentasikan variasinya dengan jelas.
Jangan rekomendasikan PRD sebelum ada tepat satu winner, kecuali memang diputuskan bahwa prototyping tidak diperlukan.

Jika prototyping ternyata tidak diperlukan, jelaskan alasannya dan rekomendasikan fase berikutnya.

Target atau fokus prototype tambahan bila ada: $@
