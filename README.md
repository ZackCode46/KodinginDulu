# Belajar Coding

Web belajar coding lewat **soal cerita + live coding**: Dart (8 tipe data), Flutter UI (dengan preview di samping editor), Go, Firebase (JSON), Postman (HTTP request), dan **Modul MCS Bab 1 sampai 8**.

- 20 sub-bab dan 748 soal. Sub-bab dasar memakai 10 level (level 1 = 6 soal, level 2 sampai 9 = 5 soal, level 10 = 8 soal). Sub-bab Modul MCS punya jumlah level dan soal sendiri
- Halaman pengantar beranimasi (efek mengetik, peta modul interaktif) dan hormat pada `prefers-reduced-motion`
- Bobot soal naik per level: variabel turunan, operator logika, panjang teks, dan komposisi widget (BoxDecoration, alignment, jarak, trailing, tema) sampai dashboard penuh
- Modul MCS: kuis konsep dari materi tiap bab, ditambah praktik (rangkaian MaterialApp/Scaffold, `ListView.builder` dengan `itemBuilder`, bentuk JSON, request ke endpoint kartu dan servo)
- Soal dibuat otomatis dari generator dengan seed tetap, tanpa soal kembar dalam satu sub-bab
- Jawaban diperiksa lewat checklist (struktur, nilai, dan output), bukan sekadar cocok teks
- Tanpa backend dan tanpa build: murni HTML, CSS, dan JavaScript statis

## Sumber materi

Materi Modul MCS Bab 1 sampai 8 mengacu pada modul Praktikum Mobile Computing System, Advanced Computer System Laboratory, Universitas Gunadarma (https://mcs.acsl.my.id/). Ini proyek belajar mandiri dan bukan situs resmi ACSL. Pertanyaan dan contoh jawabannya ditulis ulang di sini, bukan salinan modul.

## Struktur

```
index.html      halaman utama (pengantar beranimasi + aplikasi)
css/style.css   tampilan (mendukung light/dark mode)
js/app.js       simulator Dart/Go, renderer Flutter mini, generator soal, UI
tests/          tes otomatis (Node + jsdom)
vercel.json     konfigurasi deploy dan header keamanan
```

## Jalankan lokal

Buka `index.html` langsung di browser, atau:

```bash
npx serve .
```

## Deploy ke Vercel

1. Push folder ini ke repo GitHub.
2. Di Vercel: **Add New > Project**, pilih repo-nya.
3. Framework Preset: **Other**. Kosongkan Build Command dan Output Directory (default).
4. Deploy.

Setiap push ke branch utama akan otomatis ter-deploy ulang.

## Tes

```bash
cd tests
npm install
npm test
```

Tes mencakup: semua contoh jawaban lolos checker-nya sendiri, tidak ada soal kembar, jawaban kosong atau salah ditolak, variasi penulisan jawaban benar tetap diterima (CRLF, petik tunggal, `:=` di Go, `const` di Flutter, dan lain-lain), serta uji UI end-to-end di jsdom.

## Menambah sub-bab

Tambahkan satu objek di array `TP` pada `js/app.js`:

```js
{n:"Nama", g:"Grup", l:"dart|go|json|http|flutter", f:generator, m:"materi singkat"}
```

`generator(level, rng)` mengembalikan `{s: cerita, c: [[pesan, fungsiCek]], h: petunjuk, sol: contoh jawaban}`. Untuk sub-bab non-Dart/Go, tambahkan juga fungsi `rn(code)` yang mengembalikan `{out, err}`. Setelah itu jalankan `npm test`.

## Batasan

- Endpoint Bab 6 sampai 8 mengikuti daftar route di modul. Host dan port pada soal (mis. localhost:8080) hanya contoh dalam cerita soal
- Soal praktik Bab 3 (Firebase Auth dan Provider) dan kode ESP32 / Arduino hanya berbentuk kuis konsep karena tidak bisa dijalankan di browser
- Simulator Dart/Go hanya memahami variabel, perubahan nilai, `print` / `fmt.Println`, dan interpolasi. Format angka asli bisa beda (misalnya Dart mencetak `35000.0` untuk double).
- Preview Flutter adalah renderer mini untuk widget dasar (termasuk ListView.builder dan FloatingActionButton), mirip tampilan Flutter tetapi tidak identik.
- Progres belum disimpan: refresh halaman akan mengulang dari awal.
