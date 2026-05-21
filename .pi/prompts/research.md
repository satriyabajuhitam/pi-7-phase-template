---
description: Buat atau perbarui docs/research.md memakai skill research-me
argument-hint: "[fokus-tambahan]"
---
Muat dan ikuti skill project-local `research-me`.

Gunakan artifact proyek berikut sebagai sumber konteks utama bila relevan:
- `docs/idea.md`
- `docs/prd.md`
- `docs/prototype/`
- `docs/research.md`

Tentukan dulu apakah fase research memang diperlukan. Jika belum diperlukan, jelaskan alasannya dan rekomendasikan fase berikutnya yang lebih tepat.

Jika research memang diperlukan:
- mulai dengan restatement singkat tentang apa yang perlu dipelajari
- definisikan research plan yang ketat: `Objective`, `Questions to answer`, `Scope`, dan `Out of scope`
- prioritaskan official docs, API references, SDK docs, atau vendor guides sebelum sumber pihak ketiga
- jika butuh web retrieval di repo ini, muat dan ikuti skill `firecrawl-cli`, simpan raw output di `.firecrawl/`, dan simpan hanya kesimpulan yang sudah didistilasi ke `docs/research.md`
- buat atau perbarui `docs/research.md` agar:
  - ringkas dan reusable untuk sprint atau feature ini
  - hanya memuat temuan yang relevan terhadap keputusan, risiko, atau dependency yang sedang dibahas
  - mencantumkan sumber yang digunakan
  - membedakan temuan terkonfirmasi, caveat, asumsi yang belum tervalidasi, dan pertanyaan terbuka
  - menambahkan freshness note
  - merekomendasikan fase berikutnya secara spesifik

Jangan mengimplementasikan product code. Jika research gagal menjawab pertanyaan penting, katakan dengan jelas dan sebutkan apa yang masih belum pasti.

Fokus tambahan bila ada: $@
