---
description: Buat dan bandingkan prototipe di docs/prototype/ memakai skill prototype-me
argument-hint: "[target-atau-fokus-prototype]"
---
Muat dan ikuti skill project-local `prototype-me`.

Gunakan artifact proyek berikut sebagai sumber konteks utama bila relevan:
- `docs/idea.md`
- `docs/research.md`
- `docs/prd.md`
- file yang sudah ada di `docs/prototype/`

Tentukan dulu apakah fase prototyping memang diperlukan. Jika belum diperlukan, jelaskan alasannya dan rekomendasikan fase berikutnya yang lebih tepat.

Jika memang diperlukan:
- mulai dengan restatement singkat tentang apa yang sedang diprototipekan
- definisikan `Prototype objective`, `What is being compared`, `Success criteria`, `Scope`, dan `Out of scope`
- buat **2-3 variasi yang benar-benar berbeda** secara default, kecuali pengguna memang meminta hanya satu
- jika pengguna hanya meminta satu opsi, perlakukan itu sebagai targeted prototype spike, bukan full comparison, dan katakan dengan jelas
- gunakan artifact di `docs/prototype/` sebagai output utama
- buat atau perbarui:
  - `docs/prototype/prototype-1.md`
  - `docs/prototype/prototype-2.md`
  - `docs/prototype/prototype-3.md` bila perlu
  - `docs/prototype/comparison.md`
- untuk tiap variasi, jelaskan goal, key behavior/design choices, strengths, weaknesses, risks, dan kapan opsi itu cocok dipilih
- di `comparison.md`, tampilkan side-by-side summary, decision criteria, status tiap variasi, exactly one winner bila prototyping memang dipakai, apa yang dipromosikan ke PRD, apa yang tetap throwaway, unresolved questions, dan recommended next step
- jika runnable exploration memang berguna, jaga prototype code tetap terisolasi dan mudah dibuang; jangan mengentangkannya ke production path utama

Jangan perlakukan prototype sebagai implementasi final. Jika runnable prototype tidak diperlukan, cukup dokumentasikan variasinya dengan jelas.
Jangan rekomendasikan PRD sebelum ada tepat satu winner, kecuali memang diputuskan bahwa prototyping tidak diperlukan.
Prefer handoff ke PRD setelah prototype pass yang berhasil, kecuali requirement sudah diformalisasi di tempat lain atau pengguna secara eksplisit meminta jalur lain.

Target atau fokus prototype tambahan bila ada: $@
