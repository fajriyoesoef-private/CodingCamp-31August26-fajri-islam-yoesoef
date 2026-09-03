# Implementation Plan: Life Dashboard Todo App

## Overview

Implementasi aplikasi web statis Life Dashboard menggunakan HTML5, CSS3, dan Vanilla JavaScript (ES2015+) tanpa framework atau dependency eksternal. Aplikasi dibangun secara modular dengan urutan: fondasi proyek → Storage Service → Validator → modul-modul fitur → integrasi HTML/CSS → responsivitas dan tema.

## Tasks

- [x] 1. Set up project structure and testing infrastructure
  - Buat struktur direktori: `css/`, `js/`, `js/__tests__/`
  - Buat `package.json` dengan script `test` menggunakan `vitest --run`
  - Install dev dependencies: `vitest` dan `fast-check`
  - Buat `index.html` dengan skeleton HTML5: placeholder untuk semua widget (greeting, timer, todo, quick links, theme toggle, sort control)
  - Buat `css/style.css` kosong dengan komentar section untuk setiap widget
  - Buat `js/app.js` kosong dengan komentar section untuk setiap modul
  - _Requirements: TC-1, TC-4_

- [x] 2. Implement StorageService
  - [x] 2.1 Implement StorageService module
    - Tulis `StorageService` dengan metode `set(key, value)`, `get(key)`, `remove(key)`, dan `isAvailable()` di `js/app.js`
    - `set` harus serialize ke JSON dan melempar exception jika gagal
    - `get` harus deserialize dari JSON dan mengembalikan `null` jika key tidak ada atau gagal
    - `isAvailable` mengecek ketersediaan localStorage di browser ini
    - Definisikan konstanta untuk semua storage keys: `ld_tasks`, `ld_links`, `ld_theme`, `ld_custom_name`, `ld_sort_order`
    - _Requirements: TC-2, 3.5.15, 4.4.10_

  - [ ] 2.2 Write unit tests for StorageService
    - Test `get` mengembalikan null saat key tidak ada
    - Test `set` + `get` round trip (nilai tersimpan dan terbaca kembali)
    - Test `remove` menghapus key
    - Test graceful fallback saat localStorage tidak tersedia
    - _File: `js/__tests__/storage.test.js`_
    - _Requirements: TC-2_

- [x] 3. Implement Validator module
  - [x] 3.1 Implement Validator module
    - Tulis `Validator` dengan metode pure: `isNonEmptyString(str)`, `isValidUrl(str)`, `isWithinMaxLength(str, max)`
    - Tulis `validateTask(text)` → `{ valid, errorMessage }`: menolak kosong/spasi, menolak > 200 karakter
    - Tulis `validateLink(label, url)` → `{ valid, errorMessage }`: menolak kosong, menolak URL tanpa http/https, menolak label > 50 char / URL > 2048 char
    - Tulis `validateCustomName(name)` → `{ valid, errorMessage }`: menolak > 50 karakter
    - _Requirements: 3.1.4, 3.3.11, 4.1.3, 4.1.4, 4.1.5, 7.7_

  - [ ] 3.2 Write property test for Validator — task empty/whitespace rejection (Property 2)
    - **Property 2: Validasi task menolak input kosong/spasi**
    - **Validates: Requirements 3.1.4, 3.3.11**
    - Gunakan `fc.string()` yang difilter hanya berisi whitespace characters
    - Verifikasi `validateTask(str).valid === false` untuk semua input tersebut
    - _File: `js/__tests__/validator.test.js`_

  - [ ] 3.3 Write property test for Validator — URL protocol rejection (Property 8)
    - **Property 8: Validasi URL menolak protokol selain http/https**
    - **Validates: Requirements 4.1.4**
    - Gunakan `fc.string()` yang difilter tidak diawali `http://` atau `https://`
    - Verifikasi `Validator.isValidUrl(url) === false` untuk semua input tersebut
    - _File: `js/__tests__/validator.test.js`_

  - [ ] 3.4 Write unit tests for Validator
    - Test `validateTask`: string valid, string > 200 char, string hanya spasi, string kosong
    - Test `validateLink`: URL valid, URL tanpa protokol, label kosong, label/URL melampaui batas
    - Test `validateCustomName`: nama valid, nama > 50 karakter
    - _File: `js/__tests__/validator.test.js`_

- [x] 4. Checkpoint — Ensure all tests pass
  - _(Dilewati; belum ada test yang ditulis pada tahap ini)_

- [x] 5. Implement GreetingModule
  - [x] 5.1 Implement GreetingModule
    - Tulis `GreetingModule` dengan `init()`, `render()`, `getGreeting(hour)`, `formatTime(date)`, `formatDate(date)`, `setCustomName(name)`, `clearCustomName()`, `loadCustomName()`
    - `getGreeting`: 05–11 → "Selamat Pagi", 12–14 → "Selamat Siang", 15–17 → "Selamat Sore", 18–23 dan 00–04 → "Selamat Malam"
    - `formatTime`: mengembalikan "HH:MM" zero-padded (24 jam)
    - `formatDate`: mengembalikan "DDDD, DD MMMM YYYY" dalam Bahasa Indonesia (nama hari dan bulan)
    - `init` menjalankan `setInterval` setiap 1 detik untuk memanggil `render`
    - `setCustomName` memvalidasi (max 50 char), menyimpan ke LS, lalu re-render; menampilkan error jika tidak valid
    - `clearCustomName` menghapus dari LS dan re-render
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [ ] 5.2 Write property test for GreetingModule — greeting coverage (Property 1)
    - **Property 1: Greeting berdasarkan jam**
    - **Validates: Requirements 1.4, 1.5, 1.6, 1.7, 1.8**
    - Gunakan `fc.integer({ min: 0, max: 23 })`
    - Verifikasi hasil adalah salah satu dari empat salam yang valid, mencakup seluruh rentang 0–23 tanpa celah atau tumpang tindih
    - _File: `js/__tests__/greeting.test.js`_

  - [ ] 5.3 Write property test for GreetingModule — time format (Property 12)
    - **Property 12: Format waktu selalu dua digit**
    - **Validates: Requirements 1.1**
    - Gunakan `fc.date()` untuk berbagai objek Date yang valid
    - Verifikasi output `formatTime(date)` selalu cocok dengan regex `/^\d{2}:\d{2}$/`
    - _File: `js/__tests__/greeting.test.js`_

  - [ ] 5.4 Write property test for GreetingModule — custom name round trip (Property 11)
    - **Property 11: Custom name round trip persistensi**
    - **Validates: Requirements 7.2, 7.4**
    - Gunakan `fc.string({ minLength: 1, maxLength: 50 })` yang difilter bukan hanya whitespace
    - Setelah `setCustomName(name)`, verifikasi `StorageService.get("ld_custom_name") === name`
    - _File: `js/__tests__/greeting.test.js`_

  - [ ] 5.5 Write unit tests for GreetingModule
    - Test format tanggal Bahasa Indonesia (nama hari dan bulan yang benar)
    - Test salam ditampilkan dengan/tanpa custom name
    - Test `clearCustomName` mengembalikan salam tanpa nama
    - Test error saat custom name melebihi 50 karakter
    - _File: `js/__tests__/greeting.test.js`_

- [x] 6. Implement TimerModule
  - [x] 6.1 Implement TimerModule
    - Tulis `TimerModule` dengan `init()`, `start()`, `stop()`, `reset()`, `tick()`, `render()`, `showSessionComplete()`, `clearSessionComplete()`
    - State: `{ remaining: 1500, running: false, intervalId: null }`
    - `init`: cek ketersediaan `setInterval`; jika tidak ada, tampilkan error dan nonaktifkan semua tombol
    - `start`: memulai countdown dari nilai saat ini, nonaktifkan tombol Start
    - `stop`: hentikan interval, pertahankan nilai, aktifkan tombol Start
    - `reset`: hentikan interval, kembalikan ke 1500 (25:00), hapus notifikasi "Sesi selesai!"
    - `tick`: kurangi remaining 1; jika 0, panggil `showSessionComplete`
    - `render`: update tampilan MM:SS zero-padded
    - `showSessionComplete`: tampilkan "Sesi selesai!", nonaktifkan Stop, aktifkan Reset
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ] 6.2 Write unit tests for TimerModule
    - Test start dari 25:00
    - Test stop mempertahankan nilai
    - Test reset mengembalikan ke 25:00
    - Test notifikasi "Sesi selesai!" muncul di 00:00 dan hilang saat reset
    - Test tombol-tombol dinonaktifkan/diaktifkan sesuai state
    - _File: `js/__tests__/timer.test.js`_

- [x] 7. Implement TodoModule
  - [x] 7.1 Implement TodoModule — CRUD and persistence
    - Tulis `TodoModule` dengan `init()`, `addTask(text)`, `deleteTask(id)`, `toggleTask(id)`, `saveToStorage()`, `loadFromStorage()`, `renderList()`, `renderTask(task)`
    - `addTask`: validasi via `Validator.validateTask`; jika valid, buat Task baru `{ id: Date.now().toString(), text, completed: false, createdAt: Date.now() }`; tampilkan error jika melebihi 100 task
    - `toggleTask`: toggle `completed`, simpan, re-render (terapkan class strikethrough)
    - `deleteTask`: hapus dari array, simpan, re-render
    - `loadFromStorage`: baca `ld_tasks` dari LS; tampilkan pesan error jika gagal
    - `saveToStorage`: tangkap exception dari `StorageService.set`, rollback state dan tampilkan error jika gagal
    - _Requirements: 3.1.1, 3.1.2, 3.1.3, 3.1.4, 3.1.5, 3.2.6, 3.2.7, 3.4.13, 3.4.14, 3.5.15, 3.5.16, 3.5.17, 3.5.18_

  - [ ] 7.2 Write property test for TodoModule — task addition round trip (Property 3)
    - **Property 3: Task addition round trip**
    - **Validates: Requirements 3.1.2, 3.5.15**
    - Gunakan `fc.string({ minLength: 1, maxLength: 200 })` yang difilter bukan hanya whitespace
    - Setelah `addTask(text)`, verifikasi `StorageService.get("ld_tasks")` berisi task dengan `text` yang sama persis
    - _File: `js/__tests__/todo.test.js`_

  - [ ] 7.3 Write property test for TodoModule — toggle round trip (Property 4)
    - **Property 4: Toggle task adalah idempoten ganda (round trip)**
    - **Validates: Requirements 3.2.6, 3.2.7**
    - Generate task arbitrary, catat `completed` awal
    - Panggil `toggleTask(id)` dua kali berturut-turut
    - Verifikasi `completed` akhir identik dengan nilai semula
    - _File: `js/__tests__/todo.test.js`_

  - [x] 7.4 Implement TodoModule — inline edit
    - Tambahkan `beginEditTask(id)`, `saveEditTask(id, newText)`, `cancelEditTask(id)` ke `TodoModule`
    - `beginEditTask`: ubah elemen task menjadi input mode, isi dengan teks saat ini
    - `saveEditTask`: validasi teks baru via `Validator.validateTask`; jika valid, update dan simpan; jika tidak valid, tampilkan error dan pertahankan mode edit
    - `cancelEditTask`: kembalikan tampilan ke teks semula tanpa menyimpan
    - _Requirements: 3.3.8, 3.3.9, 3.3.10, 3.3.11, 3.3.12_

  - [ ] 7.5 Write unit tests for TodoModule
    - Test tambah task → muncul di DOM (simulasi dengan jsdom)
    - Test hapus task → hilang dari DOM
    - Test edit task → teks ter-update
    - Test cancel edit → teks kembali ke semula
    - Test load dari LS saat `init`
    - _File: `js/__tests__/todo.test.js`_

- [x] 8. Implement TodoModule — Sort Tasks
  - [x] 8.1 Implement sortTasks and sort persistence
    - Tambahkan `sortTasks(order)` ke `TodoModule`
    - `"creation"`: urutkan berdasarkan `createdAt` ascending
    - `"alphabetical"`: urutkan `text.toLowerCase()` ascending (A–Z)
    - `"status"`: task `completed === false` di atas, `completed === true` di bawah
    - Simpan `order` ke `ld_sort_order` di LS saat diubah
    - `loadFromStorage` membaca `ld_sort_order` dan menerapkan sort default "creation" jika tidak ada
    - Saat `addTask` saat sort aktif: sisipkan task pada posisi yang sesuai urutan aktif
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9_

  - [ ] 8.2 Write property test for TodoModule — alphabetical sort (Property 5)
    - **Property 5: Sort alfabetis case-insensitive**
    - **Validates: Requirements 8.3**
    - Generate daftar Task arbitrary yang non-kosong
    - Setelah `sortTasks("alphabetical")`, verifikasi setiap pasang berurutan: `task[i].text.toLowerCase() <= task[i+1].text.toLowerCase()`
    - _File: `js/__tests__/todo.test.js`_

  - [ ] 8.3 Write property test for TodoModule — status sort (Property 6)
    - **Property 6: Sort status menempatkan belum-selesai di atas**
    - **Validates: Requirements 8.4**
    - Generate daftar Task yang mengandung minimal satu task selesai dan satu belum selesai
    - Setelah `sortTasks("status")`, verifikasi semua `completed === false` muncul sebelum semua `completed === true`
    - _File: `js/__tests__/todo.test.js`_

  - [ ] 8.4 Write property test for TodoModule — creation sort (Property 7)
    - **Property 7: Sort urutan tambah mempertahankan createdAt ascending**
    - **Validates: Requirements 8.2**
    - Generate daftar Task arbitrary yang non-kosong
    - Setelah `sortTasks("creation")`, verifikasi setiap pasang berurutan: `task[i].createdAt <= task[i+1].createdAt`
    - _File: `js/__tests__/todo.test.js`_

- [ ] 9. Checkpoint — Ensure all tests pass
  - Jalankan `npm test` dan pastikan semua test lulus.
  - Tanyakan kepada user jika ada kendala.

- [x] 10. Implement QuickLinksModule
  - [x] 10.1 Implement QuickLinksModule
    - Tulis `QuickLinksModule` dengan `init()`, `addLink(label, url)`, `deleteLink(id)`, `renderLinks()`, `renderLink(link)`, `saveToStorage()`, `loadFromStorage()`
    - `addLink`: validasi via `Validator.validateLink`; jika valid, buat Link baru `{ id: Date.now().toString(), label, url }`; tampilkan error jika melebihi 50 link
    - `renderLink`: render sebagai tombol dengan atribut `target="_blank"` dan tombol/ikon hapus yang selalu terlihat atau muncul saat hover
    - `loadFromStorage`: baca `ld_links`; tampilkan pesan error jika gagal
    - `saveToStorage`: tangkap exception, rollback jika gagal
    - _Requirements: 4.1.1, 4.1.2, 4.1.3, 4.1.4, 4.1.5, 4.1.6, 4.2.7, 4.3.8, 4.3.9, 4.4.10, 4.4.11, 4.4.12_

  - [ ] 10.2 Write property test for QuickLinksModule — link round trip (Property 9)
    - **Property 9: Link round trip persistensi**
    - **Validates: Requirements 4.1.2, 4.4.10**
    - Generate label arbitrary (1–50 char, non-whitespace-only) dan URL arbitrary yang diawali `http://` atau `https://`
    - Setelah `addLink(label, url)`, verifikasi `StorageService.get("ld_links")` berisi link dengan `label` dan `url` yang sama persis
    - _File: `js/__tests__/quicklinks.test.js`_

  - [ ] 10.3 Write unit tests for QuickLinksModule
    - Test tambah link → muncul sebagai tombol di DOM
    - Test hapus link → hilang dari DOM
    - Test klik link → `target="_blank"` terset pada elemen anchor
    - Test load dari LS saat `init`
    - _File: `js/__tests__/quicklinks.test.js`_

- [x] 11. Implement ThemeModule
  - [x] 11.1 Implement ThemeModule
    - Tulis `ThemeModule` dengan `init()`, `toggle()`, `apply(theme)`, `saveToStorage(theme)`, `loadFromStorage()`
    - `apply`: terapkan class/atribut ke `document.documentElement` atau `document.body` untuk mengaktifkan skema warna; harus diterapkan sebelum render pertama untuk menghindari flash
    - `init`: baca preferensi dari LS; jika tidak ada, default ke `"light"`; panggil `apply`
    - `toggle`: beralih antara `"light"` dan `"dark"`, simpan ke LS, panggil `apply`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ] 11.2 Write property test for ThemeModule — toggle round trip (Property 10)
    - **Property 10: Theme toggle adalah idempoten ganda (round trip)**
    - **Validates: Requirements 6.2, 6.3**
    - Untuk setiap theme awal (`"light"` atau `"dark"`), panggil `toggle()` dua kali
    - Verifikasi theme akhir identik dengan theme semula
    - _File: `js/__tests__/theme.test.js`_

  - [ ] 11.3 Write unit tests for ThemeModule
    - Test default ke `"light"` jika tidak ada LS
    - Test `apply` menetapkan atribut/class yang benar pada dokumen
    - Test preferensi tersimpan dan terbaca kembali dari LS
    - _File: `js/__tests__/theme.test.js`_

- [x] 12. Build index.html structure and CSS styling
  - [x] 12.1 Build complete index.html DOM structure
    - Lengkapi `index.html` dengan semua elemen DOM yang dibutuhkan oleh setiap modul: `#greeting`, `#time-display`, `#date-display`, `#custom-name-input`, `#timer-display`, `#btn-start`, `#btn-stop`, `#btn-reset`, `#task-input`, `#btn-add-task`, `#task-list`, `#sort-select`, `#link-label-input`, `#link-url-input`, `#btn-add-link`, `#links-container`, `#theme-toggle`
    - Sertakan atribut `maxlength` pada semua input sesuai batasan masing-masing
    - Sertakan placeholder teks yang deskriptif di setiap input
    - Hubungkan `css/style.css` dan `js/app.js` di `<head>` dan sebelum `</body>`
    - _Requirements: TC-1, TC-4, NFR-1, 3.1.1, 4.1.1, 7.1, 8.1_

  - [x] 12.2 Implement CSS styling — base layout and typography
    - Tulis CSS reset minimal dan variable CSS untuk color tokens (light dan dark theme)
    - Terapkan tata letak grid/flexbox dua kolom untuk viewport ≥ 768px dan satu kolom untuk < 768px
    - Ukuran font minimal 14px untuk konten utama
    - Pastikan semua widget terlihat tanpa overflow horizontal pada 320px–1920px
    - _Requirements: 5.1, 5.2, 5.3, 5.4, NFR-2, NFR-3_

  - [x] 12.3 Implement CSS styling — light and dark themes
    - Definisikan variabel CSS untuk skema warna light dan dark (background, text, widget, tombol)
    - Terapkan theme via class/atribut data pada `<html>` atau `<body>` yang diset oleh `ThemeModule.apply`
    - Pastikan transisi warna < 200ms (gunakan `transition: background-color, color 150ms`)
    - Pastikan tidak ada flash saat load (letakkan script theme di `<head>` atau gunakan inline script kecil)
    - _Requirements: 6.2, 6.3, 6.4, 6.6, NFR-3_

  - [x] 12.4 Implement CSS styling — widget-specific styles
    - Style untuk Greeting Widget: tampilan jam besar, teks tanggal, salam
    - Style untuk Focus Timer: tampilan MM:SS besar, tombol Start/Stop/Reset, notifikasi "Sesi selesai!"
    - Style untuk Todo List: daftar task, strikethrough untuk task selesai, mode edit inline, pesan error
    - Style untuk Quick Links: tombol link dengan ikon hapus, hover effect
    - Style untuk Sort control: dropdown/tombol sort
    - Style untuk Custom Name input
    - _Requirements: NFR-1, NFR-3, 3.2.6, 3.2.7, 4.3.8_

- [x] 13. Wire all modules together in app.js and integrate with DOM
  - [x] 13.1 Wire all modules with DOM event listeners
    - Di bagian `init` utama `app.js`, panggil `init()` semua modul setelah DOMContentLoaded
    - Pasang semua event listener: tombol tambah task (click + Enter), tombol hapus/edit/save/cancel task, toggle completed (click pada task), tombol tambah link, tombol hapus link, sort dropdown change, custom name save/clear, theme toggle
    - Pastikan urutan init: `ThemeModule.init()` pertama (sebelum render lain untuk menghindari flash), lalu modul lainnya
    - Pastikan error message dibersihkan saat pengguna mulai mengetik di input yang relevan
    - _Requirements: TC-1, 2.2, 3.1.2, 3.1.3, 3.3.9, 3.3.10, 3.3.12, 4.2.7, 6.1, 7.1, 8.6_

- [ ] 14. Final checkpoint — Ensure all tests pass
  - Jalankan `npm test` dan pastikan semua test lulus.
  - Verifikasi manual: buka `index.html` di browser, cek semua widget berfungsi, cek responsivitas di 320px dan 768px, cek theme toggle tanpa flash, cek persistensi data setelah reload.
  - Tanyakan kepada user jika ada kendala.

## Notes

- Seluruh implementasi source code sudah selesai. Satu-satunya pekerjaan yang tersisa adalah penulisan test (unit tests dan property-based tests).
- Task yang ditandai `*` di versi sebelumnya sudah dihapus penandanya — semua test dianggap wajib untuk memvalidasi properti kebenaran.
- Setiap task merujuk ke requirement spesifik untuk keterlacakan.
- Checkpoint task 9 dan 14 belum dapat diselesaikan sampai semua test ditulis dan lulus.
- Property tests memvalidasi properti kebenaran universal (12 properti terdefinisi di design).
- Unit tests memvalidasi skenario spesifik dan edge case.
- Jalankan test dengan: `npm test` (menggunakan `vitest --run`).
- Urutan init penting: `ThemeModule.init()` harus dipanggil paling awal untuk menghindari flash tema.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "3.1"] },
    { "id": 3, "tasks": ["3.2", "3.3", "3.4", "5.1", "6.1", "11.1"] },
    { "id": 4, "tasks": ["5.2", "5.3", "5.4", "5.5", "6.2", "7.1", "10.1", "11.2", "11.3"] },
    { "id": 5, "tasks": ["7.2", "7.3", "7.4", "8.1", "10.2", "10.3"] },
    { "id": 6, "tasks": ["7.5", "8.2", "8.3", "8.4"] },
    { "id": 7, "tasks": ["9"] },
    { "id": 8, "tasks": ["12.1", "12.2", "12.3", "12.4"] },
    { "id": 9, "tasks": ["13.1"] },
    { "id": 10, "tasks": ["14"] }
  ]
}
```
