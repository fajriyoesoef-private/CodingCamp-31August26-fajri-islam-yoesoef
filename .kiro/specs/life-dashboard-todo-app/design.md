# Design Document: Life Dashboard Todo App

## Overview

Life Dashboard adalah aplikasi web klien statis yang berfungsi sebagai halaman tab baru (*new tab page*) atau *standalone web app* pribadi. Aplikasi ini menggabungkan tujuh fitur utama dalam satu tampilan tunggal: Greeting Widget, Focus Timer (Pomodoro), To-Do List, Quick Links, Light/Dark Mode, Custom Name, dan Sort Tasks. Seluruh data disimpan di browser menggunakan Local Storage — tidak ada backend, tidak ada framework eksternal, hanya HTML5 + CSS3 + Vanilla JavaScript (ES2015+).

### Tujuan Desain

- **Kesederhanaan**: Satu file HTML, satu file CSS, satu file JS. Tidak ada bundler, tidak ada dependency eksternal.
- **Ketahanan**: Setiap fitur harus tetap berfungsi meski fitur lain gagal (isolasi error per widget).
- **Persistensi tanpa server**: Semua state disimpan ke Local Storage dengan key yang terdefinisi jelas.
- **Performa**: Rendering awal < 1 detik; respon interaksi < 100 ms.

---

## Architecture

Aplikasi mengikuti arsitektur **modular single-page** berbasis Vanilla JS tanpa framework. Semua logika diorganisasi dalam satu file JS (`js/app.js`) yang terbagi menjadi modul-modul fungsional menggunakan *immediately-invoked* atau *object literal pattern*.

```
life-dashboard/
├── index.html          ← Struktur HTML tunggal
├── css/
│   └── style.css       ← Seluruh styling (light/dark theme, responsif)
└── js/
    └── app.js          ← Seluruh logika JavaScript
```

### Lapisan Arsitektur

```
┌─────────────────────────────────────────────────────┐
│                    index.html (DOM)                  │
├─────────────────────────────────────────────────────┤
│                   js/app.js                          │
│  ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌───────┐  │
│  │ Greeting  │ │  Timer   │ │  Todo    │ │ Links │  │
│  │  Module   │ │  Module  │ │  Module  │ │Module │  │
│  └───────────┘ └──────────┘ └──────────┘ └───────┘  │
│  ┌───────────────────────────────────────────────┐   │
│  │              Theme Module                     │   │
│  └───────────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────────┐   │
│  │         Storage Service (abstraksi LS)        │   │
│  └───────────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────────┐   │
│  │              Validator Module                 │   │
│  └───────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│              Browser Local Storage API               │
└─────────────────────────────────────────────────────┘
```

### Alur Data

```
User Interaction
      │
      ▼
  DOM Event Handler (di masing-masing modul)
      │
      ▼
  Validator (validasi input)
      │         │
   valid      invalid
      │         │
      ▼         ▼
  Business   Tampilkan
  Logic      Error Message
      │
      ▼
  Storage Service → Local Storage
      │
      ▼
  Render / Update DOM
```

---

## Components and Interfaces

### 1. Storage Service

Lapisan abstraksi tipis di atas `localStorage` untuk mengisolasi error dan menyederhanakan serialisasi JSON.

```javascript
const StorageService = {
  // Menyimpan nilai (di-serialize ke JSON). Melempar error jika gagal.
  set(key, value),

  // Membaca nilai (di-deserialize dari JSON). Mengembalikan null jika tidak ada/gagal.
  get(key),

  // Menghapus key.
  remove(key),

  // Mengecek apakah Local Storage tersedia di browser ini.
  isAvailable()
}
```

**Keys yang digunakan:**

| Key                       | Tipe Data        | Deskripsi                     |
|---------------------------|------------------|-------------------------------|
| `ld_tasks`                | `Task[]`         | Daftar semua task             |
| `ld_links`                | `Link[]`         | Daftar semua quick link       |
| `ld_theme`                | `"light"/"dark"` | Preferensi tema               |
| `ld_custom_name`          | `string`         | Nama kustom pengguna          |
| `ld_sort_order`           | `SortOrder`      | Preferensi urutan task        |

---

### 2. Greeting Module

Menampilkan waktu, tanggal, salam, dan custom name. Menggunakan `setInterval` untuk update setiap detik.

```javascript
const GreetingModule = {
  init(),                          // Setup interval & render awal
  render(),                        // Update semua elemen greeting
  getGreeting(hour),               // Mengembalikan string salam berdasarkan jam (0–23)
  formatTime(date),                // Mengembalikan "HH:MM"
  formatDate(date),                // Mengembalikan "DDDD, DD MMMM YYYY" (Bahasa Indonesia)
  setCustomName(name),             // Menyimpan nama & re-render
  clearCustomName(),               // Menghapus nama & re-render
  loadCustomName()                 // Membaca dari Local Storage
}
```

---

### 3. Timer Module

Mengelola countdown Pomodoro 25 menit.

```javascript
const TimerModule = {
  init(),                          // Render awal & cek ketersediaan setInterval
  start(),                         // Mulai countdown
  stop(),                          // Hentikan countdown, pertahankan nilai
  reset(),                         // Reset ke 25:00
  tick(),                          // Dipanggil setiap detik oleh interval
  render(),                        // Update tampilan MM:SS
  showSessionComplete(),           // Tampilkan "Sesi selesai!"
  clearSessionComplete()           // Hapus notifikasi
}
```

---

### 4. Todo Module

Mengelola CRUD task, toggle status, edit inline, dan sort.

```javascript
const TodoModule = {
  init(),                          // Load dari LS & render
  addTask(text),                   // Validasi & tambah task baru
  deleteTask(id),                  // Hapus task berdasarkan ID
  toggleTask(id),                  // Toggle status selesai/belum
  beginEditTask(id),               // Masuk mode edit inline
  saveEditTask(id, newText),       // Simpan hasil edit
  cancelEditTask(id),              // Batalkan edit
  sortTasks(order),                // Urutkan tasks sesuai order
  renderList(),                    // Re-render seluruh daftar task
  renderTask(task),                // Render satu elemen task
  saveToStorage(),                 // Simpan ke Local Storage
  loadFromStorage()                // Baca dari Local Storage
}
```

---

### 5. Quick Links Module

Mengelola CRUD quick links.

```javascript
const QuickLinksModule = {
  init(),                          // Load dari LS & render
  addLink(label, url),             // Validasi & tambah link baru
  deleteLink(id),                  // Hapus link berdasarkan ID
  renderLinks(),                   // Re-render seluruh daftar link
  renderLink(link),                // Render satu elemen link (tombol + delete)
  saveToStorage(),                 // Simpan ke Local Storage
  loadFromStorage()                // Baca dari Local Storage
}
```

---

### 6. Theme Module

Mengelola toggling light/dark mode.

```javascript
const ThemeModule = {
  init(),                          // Load preferensi dari LS & terapkan
  toggle(),                        // Beralih antara light dan dark
  apply(theme),                    // Terapkan theme ke dokumen (tanpa flash)
  saveToStorage(theme),            // Simpan preferensi ke LS
  loadFromStorage()                // Baca preferensi dari LS
}
```

---

### 7. Validator Module

Fungsi-fungsi validasi murni (pure functions), tidak bergantung pada DOM.

```javascript
const Validator = {
  isNonEmptyString(str),           // true jika str bukan kosong/hanya spasi
  isValidUrl(str),                 // true jika dimulai dengan http:// atau https://
  isWithinMaxLength(str, max),     // true jika panjang str <= max
  validateTask(text),              // Mengembalikan { valid, errorMessage }
  validateLink(label, url),        // Mengembalikan { valid, errorMessage }
  validateCustomName(name)         // Mengembalikan { valid, errorMessage }
}
```

---

## Data Models

### Task

```javascript
/**
 * @typedef {Object} Task
 * @property {string}  id          - UUID atau timestamp unik
 * @property {string}  text        - Deskripsi task (1–200 karakter, bukan hanya spasi)
 * @property {boolean} completed   - Status penyelesaian
 * @property {number}  createdAt   - Unix timestamp saat task dibuat (untuk sort urutan tambah)
 */
```

### Link

```javascript
/**
 * @typedef {Object} Link
 * @property {string} id    - UUID atau timestamp unik
 * @property {string} label - Nama tampilan (1–50 karakter)
 * @property {string} url   - URL tujuan (dimulai http:// atau https://, maks. 2048 karakter)
 */
```

### SortOrder

```javascript
/**
 * @typedef {"creation" | "alphabetical" | "status"} SortOrder
 *
 * - "creation"     : Urutan penambahan (createdAt ascending), ini adalah default
 * - "alphabetical" : Teks task A–Z (case-insensitive)
 * - "status"       : Task belum selesai di atas, selesai di bawah
 */
```

### AppState (in-memory)

```javascript
/**
 * State in-memory yang dikelola oleh masing-masing modul.
 * Tidak ada global state object tunggal — setiap modul menyimpan state-nya sendiri.
 *
 * TodoModule.state:
 *   { tasks: Task[], sortOrder: SortOrder }
 *
 * QuickLinksModule.state:
 *   { links: Link[] }
 *
 * ThemeModule.state:
 *   { current: "light" | "dark" }
 *
 * TimerModule.state:
 *   { remaining: number, running: boolean, intervalId: number|null }
 *
 * GreetingModule.state:
 *   { customName: string, intervalId: number|null }
 */
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Greeting berdasarkan jam

*For any* nilai jam (integer 0–23), fungsi `getGreeting(hour)` SHALL mengembalikan tepat satu dari empat string salam yang valid ("Selamat Pagi", "Selamat Siang", "Selamat Sore", "Selamat Malam"), dengan cakupan yang lengkap tanpa celah maupun tumpang-tindih di seluruh rentang 0–23.

**Validates: Requirements 1.4, 1.5, 1.6, 1.7, 1.8**

---

### Property 2: Validasi task menolak input kosong/spasi

*For any* string yang seluruhnya terdiri dari karakter spasi (termasuk string kosong), `Validator.validateTask(str)` SHALL mengembalikan `{ valid: false }`.

**Validates: Requirements 3.1.4, 3.3.11**

---

### Property 3: Task addition round trip

*For any* teks task yang valid, setelah operasi `addTask(text)` berhasil, memanggil `StorageService.get("ld_tasks")` SHALL menghasilkan array yang berisi sebuah Task dengan field `text` yang sama persis dengan input.

**Validates: Requirements 3.1.2, 3.5.15**

---

### Property 4: Toggle task adalah idempoten ganda (round trip)

*For any* Task dalam daftar, melakukan `toggleTask(id)` dua kali berturut-turut SHALL menghasilkan Task dengan nilai `completed` yang identik dengan nilai semula.

**Validates: Requirements 3.2.6, 3.2.7**

---

### Property 5: Sort alfabetis case-insensitive

*For any* daftar Task yang non-kosong, setelah `sortTasks("alphabetical")`, untuk setiap pasang task berturut-turut (task[i], task[i+1]), SHALL berlaku `task[i].text.toLowerCase() <= task[i+1].text.toLowerCase()`.

**Validates: Requirements 8.3**

---

### Property 6: Sort status menempatkan belum-selesai di atas

*For any* daftar Task yang mengandung setidaknya satu task selesai dan satu task belum selesai, setelah `sortTasks("status")`, semua task dengan `completed === false` SHALL muncul sebelum semua task dengan `completed === true`.

**Validates: Requirements 8.4**

---

### Property 7: Sort urutan tambah mempertahankan createdAt ascending

*For any* daftar Task yang non-kosong, setelah `sortTasks("creation")`, untuk setiap pasang task berturut-turut (task[i], task[i+1]), SHALL berlaku `task[i].createdAt <= task[i+1].createdAt`.

**Validates: Requirements 8.2**

---

### Property 8: Validasi URL menolak protokol selain http/https

*For any* string URL yang tidak diawali dengan `"http://"` atau `"https://"`, `Validator.isValidUrl(url)` SHALL mengembalikan `false`.

**Validates: Requirements 4.1.4**

---

### Property 9: Link round trip persistensi

*For any* label dan URL yang valid, setelah operasi `addLink(label, url)` berhasil, memanggil `StorageService.get("ld_links")` SHALL menghasilkan array yang berisi sebuah Link dengan `label` dan `url` yang sama persis dengan input.

**Validates: Requirements 4.1.2, 4.4.10**

---

### Property 10: Theme toggle adalah idempoten ganda (round trip)

*For any* theme awal ("light" atau "dark"), memanggil `ThemeModule.toggle()` dua kali berturut-turut SHALL menghasilkan theme yang identik dengan theme semula.

**Validates: Requirements 6.2, 6.3**

---

### Property 11: Custom name round trip persistensi

*For any* nama kustom yang valid (tidak kosong, tidak hanya spasi, panjang ≤ 50 karakter), setelah `GreetingModule.setCustomName(name)`, memanggil `StorageService.get("ld_custom_name")` SHALL mengembalikan string yang sama persis dengan input.

**Validates: Requirements 7.2, 7.4**

---

### Property 12: Format waktu selalu dua digit

*For any* objek `Date` yang valid, `GreetingModule.formatTime(date)` SHALL mengembalikan string dengan format tepat `"HH:MM"` di mana HH dan MM masing-masing selalu terdiri dari tepat dua karakter digit (zero-padded).

**Validates: Requirements 1.1**

---

## Error Handling

### Strategi Umum

Setiap modul menangani error-nya sendiri. Error tidak boleh "merembet" dari satu modul ke modul lain (fault isolation).

### Per-Modul

| Kondisi Error | Modul | Penanganan |
|---|---|---|
| Input task kosong/hanya spasi | Validator → TodoModule | Tampilkan pesan error di bawah input; tidak mengubah state |
| Input task > 200 karakter | Validator → TodoModule | Tampilkan pesan error; tidak mengubah state |
| Batas maksimum 100 task tercapai | Validator → TodoModule | Tampilkan pesan error; tidak mengubah state |
| Edit task menjadi kosong/spasi | Validator → TodoModule | Tampilkan pesan error; mode edit tetap aktif |
| Input link (label/URL) kosong | Validator → QuickLinksModule | Tampilkan pesan error di form |
| URL tidak dimulai http/https | Validator → QuickLinksModule | Tampilkan pesan error di form |
| Label > 50 karakter / URL > 2048 karakter | Validator → QuickLinksModule | Tampilkan pesan error di form |
| Batas maksimum 50 link tercapai | Validator → QuickLinksModule | Tampilkan pesan error di form |
| Custom name > 50 karakter | Validator → GreetingModule | Tampilkan pesan error; tidak menyimpan |
| Local Storage tidak tersedia | StorageService | `isAvailable()` mengembalikan false; setiap modul menampilkan error banner spesifik |
| Local Storage gagal saat write | StorageService.set | Melempar exception; modul menangkap & rollback state in-memory ke kondisi terakhir berhasil, tampilkan error |
| Local Storage gagal saat read | StorageService.get | Mengembalikan null; modul memulai dengan state kosong & menampilkan pesan informatif |
| `setInterval` tidak tersedia | TimerModule | Tampilkan error di area timer; nonaktifkan semua tombol timer |

### Format Pesan Error

Pesan error ditampilkan sebagai elemen `<span class="error-msg">` tepat di bawah elemen input yang relevan. Pesan error dibersihkan otomatis saat pengguna mulai mengetik atau saat operasi berhasil.

---

## Testing Strategy

### Pendekatan

Aplikasi ini menggunakan **dual testing approach**:
1. **Unit tests (example-based)**: Untuk skenario spesifik, edge case, dan kondisi error.
2. **Property-based tests**: Untuk memverifikasi properti universal di seluruh ruang input.

Karena aplikasi adalah Vanilla JS tanpa bundler, testing menggunakan **Vitest** (dapat dijalankan tanpa config kompleks via `vitest --run`) dengan **fast-check** sebagai library PBT.

### Setup

```bash
# Instalasi dev dependencies
npm init -y
npm install --save-dev vitest fast-check
```

File test diletakkan di `js/__tests__/` dengan konvensi penamaan `*.test.js`.

### Unit Tests (Example-Based)

Fokus pada skenario konkret yang tidak ditangkap oleh property tests:

- **GreetingModule**: Format tanggal dalam Bahasa Indonesia (nama hari & bulan), tampilan salam dengan/tanpa custom name, pergantian salam otomatis saat detik berubah.
- **TimerModule**: Start dari 25:00, Stop mempertahankan nilai, Reset mengembalikan ke 25:00, notifikasi "Sesi selesai!" muncul di 00:00 dan dihapus saat reset.
- **TodoModule**: Tambah task → muncul di DOM, hapus task → hilang dari DOM, edit task → teks ter-update, load dari LS saat init.
- **QuickLinksModule**: Tambah link → muncul sebagai tombol, hapus link → hilang dari DOM, klik link → buka tab baru.
- **ThemeModule**: Default ke light jika tidak ada LS, terapkan tanpa flash saat load.
- **StorageService**: Graceful fallback saat LS tidak tersedia, mengembalikan null saat key tidak ada.

### Property-Based Tests

Menggunakan **fast-check** dengan minimum **100 iterasi** per test. Setiap test diberi komentar tag referensi ke properti di design doc.

```javascript
// Contoh: Property 1 — Greeting berdasarkan jam
// Feature: life-dashboard-todo-app, Property 1: Greeting berdasarkan jam
import fc from 'fast-check';
import { getGreeting } from '../greeting.js';

test('getGreeting covers all hours 0-23 with valid greeting', () => {
  fc.assert(fc.property(
    fc.integer({ min: 0, max: 23 }),
    (hour) => {
      const result = getGreeting(hour);
      const validGreetings = ['Selamat Pagi', 'Selamat Siang', 'Selamat Sore', 'Selamat Malam'];
      return validGreetings.includes(result);
    }
  ), { numRuns: 100 });
});
```

**Pemetaan Property ke Test:**

| Property | Test File | Tag |
|---|---|---|
| P1: Greeting berdasarkan jam | `greeting.test.js` | `Feature: life-dashboard-todo-app, Property 1` |
| P2: Validasi task menolak input kosong/spasi | `validator.test.js` | `Feature: life-dashboard-todo-app, Property 2` |
| P3: Task addition round trip | `todo.test.js` | `Feature: life-dashboard-todo-app, Property 3` |
| P4: Toggle task round trip | `todo.test.js` | `Feature: life-dashboard-todo-app, Property 4` |
| P5: Sort alfabetis case-insensitive | `todo.test.js` | `Feature: life-dashboard-todo-app, Property 5` |
| P6: Sort status | `todo.test.js` | `Feature: life-dashboard-todo-app, Property 6` |
| P7: Sort urutan tambah | `todo.test.js` | `Feature: life-dashboard-todo-app, Property 7` |
| P8: Validasi URL protokol | `validator.test.js` | `Feature: life-dashboard-todo-app, Property 8` |
| P9: Link round trip persistensi | `quicklinks.test.js` | `Feature: life-dashboard-todo-app, Property 9` |
| P10: Theme toggle round trip | `theme.test.js` | `Feature: life-dashboard-todo-app, Property 10` |
| P11: Custom name round trip persistensi | `greeting.test.js` | `Feature: life-dashboard-todo-app, Property 11` |
| P12: Format waktu dua digit | `greeting.test.js` | `Feature: life-dashboard-todo-app, Property 12` |

### Catatan Pengujian Manual

Beberapa kriteria penerimaan tidak dapat diverifikasi secara otomatis dan memerlukan pengujian manual:

- **NFR-3**: Rasio kontras warna WCAG AA 4.5:1 — verifikasi menggunakan Chrome DevTools atau axe.
- **TC-3**: Kompatibilitas lintas browser — buka di Chrome, Firefox, Edge, Safari.
- **NFR-2**: Waktu muat < 1 detik — ukur via DevTools Network tab (Disable cache).
- **Persyaratan 5.2–5.4**: Layout responsif — uji di DevTools device emulation pada lebar 320px, 768px, 1920px.
- **Persyaratan 6.6**: Theme diterapkan tanpa kedipan — verifikasi secara visual saat hard refresh.
