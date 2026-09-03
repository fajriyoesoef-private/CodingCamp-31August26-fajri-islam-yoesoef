# Requirements Document

## Introduction

Life Dashboard adalah aplikasi web berbasis klien yang dirancang sebagai halaman tab pribadi atau *standalone web app*. Aplikasi ini menyediakan tujuh fitur utama dalam satu tampilan: **Greeting** (salam waktu dan tanggal dengan nama kustom), **Focus Timer** (timer Pomodoro 25 menit), **To-Do List** (daftar tugas dengan pengurutan), **Quick Links** (tautan favorit), **Light/Dark Mode** (tema tampilan), **Custom Name** (nama pengguna pada salam), dan **Sort Tasks** (pengurutan daftar tugas). Seluruh data pengguna disimpan secara lokal di browser menggunakan Local Storage API, tanpa memerlukan backend server. Aplikasi dibangun dengan HTML, CSS, dan Vanilla JavaScript murni agar ringan, cepat, dan tidak bergantung pada framework eksternal.

---

## Glossary

- **Dashboard**: Halaman utama aplikasi yang menampilkan seluruh widget dalam satu tampilan.
- **Greeting_Widget**: Komponen yang menampilkan waktu, tanggal, dan salam berdasarkan waktu hari.
- **Focus_Timer**: Komponen penghitung mundur (countdown) 25 menit yang berfungsi sebagai timer Pomodoro.
- **Todo_List**: Komponen pengelola daftar tugas (task) pengguna.
- **Task**: Sebuah item dalam Todo_List yang memiliki teks deskripsi dan status penyelesaian.
- **Quick_Links**: Komponen yang menampilkan kumpulan tautan (URL) favorit pengguna sebagai tombol yang dapat diklik.
- **Link**: Sebuah item dalam Quick_Links yang memiliki label tampilan dan URL tujuan.
- **Local_Storage**: Browser Local Storage API yang digunakan untuk menyimpan data pengguna secara persisten di sisi klien.
- **Sesi_Timer**: Satu siklus hitungan mundur Focus_Timer dari 25:00 hingga 00:00.
- **Validator**: Komponen logika yang memvalidasi input pengguna sebelum data disimpan.
- **Theme**: Preferensi tampilan pengguna antara mode terang (light) atau mode gelap (dark).
- **Custom_Name**: Nama pengguna yang dikustomisasi dan ditampilkan dalam teks salam pada Greeting_Widget.
- **Sort_Order**: Kriteria pengurutan daftar task pada Todo_List (misalnya: berdasarkan status, alfabetis, atau urutan tambah).

---

## Requirements

### Batasan Teknis

#### TC-1: Tumpukan Teknologi
THE Dashboard SHALL dibangun menggunakan HTML5 untuk struktur, CSS3 untuk tampilan, dan Vanilla JavaScript (ECMAScript 2015+) tanpa framework atau library eksternal untuk logika dan interaktivitas.

#### TC-2: Penyimpanan Data
THE Dashboard SHALL menyimpan seluruh data pengguna (task, link) secara eksklusif di sisi klien menggunakan browser Local_Storage API, tanpa komunikasi ke server manapun.

#### TC-3: Kompatibilitas Browser
THE Dashboard SHALL berfungsi penuh di Chrome, Firefox, Edge, dan Safari versi modern (dua rilis mayor terkini), baik sebagai halaman web biasa maupun sebagai *browser extension* (new tab page).

#### TC-4: Struktur File
THE Dashboard SHALL mengorganisasi kode dengan tepat satu file CSS di dalam direktori `css/` dan tepat satu file JavaScript di dalam direktori `js/`. Seluruh kode SHALL ditulis dengan bersih, mudah dibaca, menggunakan indentasi yang konsisten, penamaan variabel/fungsi yang deskriptif, dan komentar yang menjelaskan blok logika utama.

---

### Persyaratan Non-Fungsional

#### NFR-1: Kesederhanaan
THE Dashboard SHALL menyajikan antarmuka yang bersih dan minimal sehingga pengguna dapat langsung menggunakannya tanpa panduan atau konfigurasi awal.

#### NFR-2: Performa
WHEN pengguna membuka Dashboard, THE Dashboard SHALL menampilkan seluruh konten dalam waktu kurang dari 1 detik pada koneksi lokal (file:// atau localhost).

WHEN pengguna melakukan interaksi (menambah, mengedit, atau menghapus data), THE Dashboard SHALL memperbarui tampilan dalam waktu kurang dari 100 milidetik.

#### NFR-3: Desain Visual
THE Dashboard SHALL menerapkan hierarki visual yang jelas dengan tipografi yang mudah dibaca (ukuran font minimal 14px untuk konten utama) dan kontras warna yang memenuhi rasio minimum 4.5:1 (WCAG AA) untuk teks pada latar belakang.

---

### Persyaratan Fitur

---

#### Persyaratan 1: Greeting Widget

**User Story:** Sebagai pengguna, saya ingin melihat waktu, tanggal, dan salam yang relevan saat membuka dashboard, sehingga saya langsung mengetahui konteks waktu saat ini.

#### Kriteria Penerimaan

1. WHEN halaman Dashboard dimuat, THE Greeting_Widget SHALL menampilkan jam dan menit saat ini dalam format HH:MM (24 jam).

2. WHEN detik berganti, THE Greeting_Widget SHALL memperbarui tampilan jam secara otomatis setiap detik tanpa perlu memuat ulang halaman.

3. WHEN halaman Dashboard dimuat, THE Greeting_Widget SHALL menampilkan hari, tanggal, bulan, dan tahun saat ini dalam format "DDDD, DD MMMM YYYY" menggunakan nama hari dan bulan dalam Bahasa Indonesia (contoh: "Senin, 25 Agustus 2025").

4. WHEN waktu saat ini berada antara pukul 05:00 dan 11:59, THE Greeting_Widget SHALL menampilkan teks salam "Selamat Pagi".

5. WHEN waktu saat ini berada antara pukul 12:00 dan 14:59, THE Greeting_Widget SHALL menampilkan teks salam "Selamat Siang".

6. WHEN waktu saat ini berada antara pukul 15:00 dan 17:59, THE Greeting_Widget SHALL menampilkan teks salam "Selamat Sore".

7. WHEN waktu saat ini berada antara pukul 18:00 dan 23:59, THE Greeting_Widget SHALL menampilkan teks salam "Selamat Malam".

8. WHEN waktu saat ini berada antara pukul 00:00 dan 04:59, THE Greeting_Widget SHALL menampilkan teks salam "Selamat Malam".

9. WHEN waktu saat ini melewati batas pergantian periode (misalnya dari 11:59 ke 12:00), THE Greeting_Widget SHALL memperbarui teks salam secara otomatis tanpa perlu memuat ulang halaman.

---

#### Persyaratan 2: Focus Timer

**User Story:** Sebagai pengguna, saya ingin menggunakan timer Pomodoro 25 menit, sehingga saya dapat mengatur sesi kerja terfokus dengan mudah.

#### Kriteria Penerimaan

1. WHEN halaman Dashboard dimuat, THE Focus_Timer SHALL menampilkan durasi awal 25:00 (dua puluh lima menit nol detik) dalam format MM:SS.

2. WHEN pengguna menekan tombol Start pada Focus_Timer yang sedang berhenti, THE Focus_Timer SHALL memulai hitungan mundur satu detik per detik dari nilai yang ditampilkan saat ini, dan menonaktifkan tombol Start hingga pengguna menekan tombol Stop.

3. WHILE Focus_Timer sedang berjalan, THE Focus_Timer SHALL memperbarui tampilan waktu setiap detik dengan selisih tidak lebih dari ±100 milidetik dari interval satu detik.

4. WHEN pengguna menekan tombol Stop pada Focus_Timer yang sedang berjalan, THE Focus_Timer SHALL menghentikan hitungan mundur dalam waktu paling lama satu detik, mempertahankan nilai waktu yang tersisa, dan mengaktifkan kembali tombol Start.

5. WHEN pengguna menekan tombol Reset pada Focus_Timer, THE Focus_Timer SHALL menghentikan hitungan mundur dalam waktu paling lama satu detik dan mengembalikan tampilan waktu ke 25:00, terlepas dari kondisi timer saat itu (berjalan maupun berhenti).

6. WHEN hitungan mundur Focus_Timer mencapai 00:00, THE Focus_Timer SHALL menghentikan hitungan mundur secara otomatis, menampilkan notifikasi teks "Sesi selesai!" pada area tampilan timer, dan menonaktifkan tombol Stop serta mengaktifkan tombol Reset.

7. IF hitungan mundur Focus_Timer mencapai 00:00 kemudian pengguna menekan tombol Reset, THEN THE Focus_Timer SHALL menghapus notifikasi teks "Sesi selesai!" dan mengembalikan tampilan waktu ke 25:00.

8. IF browser tidak mendukung fungsi interval (setInterval), THEN THE Focus_Timer SHALL menampilkan pesan error yang mengindikasikan timer tidak tersedia di browser tersebut di area timer dan menonaktifkan tombol Start, Stop, dan Reset.

---

#### Persyaratan 3: To-Do List

**User Story:** Sebagai pengguna, saya ingin mengelola daftar tugas harian saya, sehingga saya dapat melacak pekerjaan yang perlu dan sudah diselesaikan.

#### Kriteria Penerimaan

**3.1 — Menambah Task**

1. THE Todo_List SHALL menyediakan kolom input teks (maks. 200 karakter) dan tombol tambah untuk memasukkan task baru.

2. WHEN pengguna memasukkan teks pada kolom input dan menekan tombol tambah atau menekan tombol Enter, THE Todo_List SHALL menambahkan task baru dengan teks tersebut ke dalam daftar dengan status "belum selesai".

3. WHEN task baru berhasil ditambahkan, THE Todo_List SHALL mengosongkan kolom input dan menampilkan task baru tersebut di bagian bawah daftar.

4. IF pengguna menekan tombol tambah atau Enter dengan kolom input kosong atau hanya berisi spasi, THEN THE Validator SHALL mencegah penambahan task dan menampilkan pesan error yang mengindikasikan task tidak boleh kosong.

5. IF jumlah task yang tersimpan telah mencapai 100 task, THEN THE Validator SHALL mencegah penambahan task baru dan menampilkan pesan error yang mengindikasikan batas maksimum task telah tercapai.

**3.2 — Menandai Task Selesai**

6. WHEN pengguna menekan pada sebuah Task yang berstatus "belum selesai", THE Todo_List SHALL mengubah status Task tersebut menjadi "selesai" dan menerapkan tampilan visual coret (strikethrough) pada teks task.

7. WHEN pengguna menekan pada sebuah Task yang berstatus "selesai", THE Todo_List SHALL mengubah status Task tersebut kembali menjadi "belum selesai" dan menghapus tampilan visual coret.

**3.3 — Mengedit Task**

8. THE Todo_List SHALL menyediakan tombol edit pada setiap Task.

9. WHEN pengguna menekan tombol edit pada sebuah Task, THE Todo_List SHALL mengubah tampilan teks Task tersebut menjadi kolom input (maks. 200 karakter) yang dapat diedit, terisi dengan teks Task saat ini.

10. IF pengguna menekan tombol simpan pada Task yang sedang dalam mode edit dengan teks yang valid (tidak kosong dan tidak hanya berisi spasi), THEN THE Todo_List SHALL memperbarui teks Task dengan teks yang baru dan mengembalikan tampilan ke mode tampil normal.

11. IF pengguna mencoba menyimpan teks edit yang kosong atau hanya berisi spasi, THEN THE Validator SHALL mencegah penyimpanan dan menampilkan pesan error yang mengindikasikan task tidak boleh kosong.

12. WHEN pengguna menekan tombol batal pada Task yang sedang dalam mode edit, THE Todo_List SHALL mengembalikan tampilan Task ke teks semula tanpa menyimpan perubahan.

**3.4 — Menghapus Task**

13. THE Todo_List SHALL menyediakan tombol hapus pada setiap Task.

14. WHEN pengguna menekan tombol hapus pada sebuah Task, THE Todo_List SHALL menghapus Task tersebut dari daftar secara permanen.

**3.5 — Persistensi Data**

15. WHEN pengguna menambahkan, mengedit, menandai selesai, atau menghapus sebuah Task, THE Todo_List SHALL menyimpan keseluruhan daftar task yang diperbarui ke Local_Storage sebelum operasi dianggap selesai.

16. IF penyimpanan ke Local_Storage gagal, THEN THE Todo_List SHALL menampilkan pesan error yang mengindikasikan data tidak dapat disimpan dan mempertahankan tampilan sesuai dengan kondisi terakhir yang berhasil disimpan.

17. WHEN halaman Dashboard dimuat ulang, THE Todo_List SHALL membaca data dari Local_Storage dan menampilkan kembali seluruh task beserta statusnya.

18. IF Local_Storage tidak tersedia atau terjadi kegagalan saat membaca data, THEN THE Todo_List SHALL menampilkan daftar task kosong dan menampilkan pesan error yang mengindikasikan data tidak dapat dimuat.

---

#### Persyaratan 4: Quick Links

**User Story:** Sebagai pengguna, saya ingin menyimpan dan mengakses tautan website favorit saya dengan cepat, sehingga saya tidak perlu mengetik URL secara berulang.

#### Kriteria Penerimaan

**4.1 — Menambah Link**

1. THE Quick_Links SHALL menyediakan kolom input untuk nama label (maks. 50 karakter) dan kolom input untuk URL (maks. 2048 karakter), serta tombol tambah untuk menyimpan link baru.

2. WHEN pengguna mengisi label dan URL yang valid lalu menekan tombol tambah, THE Quick_Links SHALL menambahkan link baru sebagai tombol yang dapat diklik ke dalam area tampilan quick links, dan mengosongkan kedua kolom input.

3. IF pengguna menekan tombol tambah dengan kolom label atau URL kosong, THEN THE Validator SHALL mencegah penambahan link dan menampilkan pesan error yang mengindikasikan bahwa label dan URL tidak boleh kosong.

4. IF pengguna memasukkan URL yang tidak dimulai dengan "http://" atau "https://", THEN THE Validator SHALL mencegah penambahan link dan menampilkan pesan error yang mengindikasikan bahwa URL harus dimulai dengan "http://" atau "https://".

5. IF pengguna memasukkan label yang melebihi 50 karakter atau URL yang melebihi 2048 karakter, THEN THE Validator SHALL mencegah penambahan link dan menampilkan pesan error yang mengindikasikan batas karakter yang dilampaui.

6. IF jumlah link yang tersimpan telah mencapai 50 link, THEN THE Validator SHALL mencegah penambahan link baru dan menampilkan pesan error yang mengindikasikan bahwa batas maksimum link telah tercapai.

**4.2 — Menggunakan Link**

7. WHEN pengguna menekan sebuah tombol Link, THE Quick_Links SHALL membuka URL yang sesuai di tab browser baru.

**4.3 — Menghapus Link**

8. THE Quick_Links SHALL menyediakan mekanisme yang selalu terlihat atau muncul saat kursor diarahkan ke tombol link untuk menghapus setiap Link yang tersimpan.

9. WHEN pengguna memilih untuk menghapus sebuah Link, THE Quick_Links SHALL menghapus Link tersebut dari tampilan dan dari Local_Storage secara permanen, tanpa memengaruhi link lain yang tersimpan.

**4.4 — Persistensi Data**

10. WHEN pengguna menambahkan atau menghapus sebuah Link, THE Quick_Links SHALL menyimpan keseluruhan daftar link yang diperbarui ke Local_Storage sebelum operasi dianggap selesai.

11. WHEN halaman Dashboard dimuat ulang, THE Quick_Links SHALL membaca data dari Local_Storage dan menampilkan kembali seluruh link yang tersimpan sebagai tombol dalam urutan yang sama seperti saat disimpan.

12. IF Local_Storage tidak tersedia atau terjadi kegagalan saat membaca data, THEN THE Quick_Links SHALL menampilkan area quick links kosong dan menampilkan pesan error yang mengindikasikan bahwa tautan tidak dapat dimuat.

---

#### Persyaratan 5: Tata Letak dan Navigasi Dashboard

**User Story:** Sebagai pengguna, saya ingin seluruh widget tersaji dalam satu tampilan yang terorganisir, sehingga saya dapat mengakses semua fitur tanpa perlu berpindah halaman.

#### Kriteria Penerimaan

1. THE Dashboard SHALL menampilkan Greeting_Widget, Focus_Timer, Todo_List, dan Quick_Links dalam satu halaman tanpa scroll horizontal; scroll vertikal diperbolehkan.

2. THE Dashboard SHALL menerapkan tata letak responsif sehingga pada lebar viewport antara 320px hingga 1920px, tidak ada widget yang terpotong, tersembunyi, atau meluap keluar dari area tampilan.

3. WHEN lebar viewport kurang dari 768px, THE Dashboard SHALL menyusun widget secara vertikal (satu kolom).

4. WHEN lebar viewport 768px atau lebih, THE Dashboard SHALL menyusun widget dalam tata letak minimal dua kolom untuk memanfaatkan ruang layar yang lebih luas.

---

#### Persyaratan 6: Light / Dark Mode

**User Story:** Sebagai pengguna, saya ingin dapat beralih antara tampilan terang (light) dan gelap (dark), sehingga saya dapat menyesuaikan tampilan dashboard dengan preferensi atau kondisi pencahayaan sekitar saya.

#### Kriteria Penerimaan

1. THE Dashboard SHALL menyediakan tombol atau toggle untuk beralih antara Theme light dan Theme dark yang selalu terlihat di area header atau sudut layar.

2. WHEN pengguna mengaktifkan Theme dark, THE Dashboard SHALL menerapkan skema warna gelap pada seluruh elemen dashboard (latar belakang, teks, widget, tombol) dalam waktu kurang dari 200 milidetik.

3. WHEN pengguna mengaktifkan Theme light, THE Dashboard SHALL menerapkan skema warna terang pada seluruh elemen dashboard dalam waktu kurang dari 200 milidetik.

4. WHEN pengguna beralih Theme, THE Dashboard SHALL memastikan rasio kontras warna teks pada latar belakang tetap memenuhi minimum 4.5:1 (WCAG AA) baik dalam Theme light maupun Theme dark.

5. WHEN pengguna beralih Theme, THE Dashboard SHALL menyimpan preferensi Theme yang dipilih ke Local_Storage.

6. WHEN halaman Dashboard dimuat ulang, THE Dashboard SHALL membaca preferensi Theme dari Local_Storage dan menerapkan Theme yang terakhir dipilih pengguna tanpa kedipan (flash) tampilan.

7. IF tidak ada preferensi Theme yang tersimpan di Local_Storage, THEN THE Dashboard SHALL menerapkan Theme light sebagai default.

---

#### Persyaratan 7: Custom Name pada Greeting

**User Story:** Sebagai pengguna, saya ingin menambahkan nama saya pada salam di Greeting_Widget, sehingga dashboard terasa lebih personal dan relevan untuk saya.

#### Kriteria Penerimaan

1. THE Greeting_Widget SHALL menyediakan kolom input atau mekanisme untuk memasukkan Custom_Name pengguna (maks. 50 karakter).

2. WHEN pengguna menyimpan Custom_Name yang valid (tidak kosong dan tidak hanya berisi spasi), THE Greeting_Widget SHALL menampilkan teks salam dalam format "[Salam], [Custom_Name]!" (contoh: "Selamat Pagi, Budi!").

3. IF Custom_Name belum diatur atau kosong, THEN THE Greeting_Widget SHALL menampilkan teks salam tanpa nama (contoh: "Selamat Pagi!").

4. WHEN pengguna menyimpan Custom_Name, THE Greeting_Widget SHALL menyimpan nilai Custom_Name ke Local_Storage.

5. WHEN halaman Dashboard dimuat ulang, THE Greeting_Widget SHALL membaca Custom_Name dari Local_Storage dan menampilkan salam dengan nama tersebut.

6. WHEN pengguna menghapus Custom_Name (mengosongkan input dan menyimpan), THE Greeting_Widget SHALL kembali menampilkan salam tanpa nama dan menghapus Custom_Name dari Local_Storage.

7. IF pengguna memasukkan Custom_Name yang melebihi 50 karakter, THEN THE Validator SHALL mencegah penyimpanan dan menampilkan pesan error yang mengindikasikan batas karakter terlampaui.

---

#### Persyaratan 8: Sort Tasks

**User Story:** Sebagai pengguna, saya ingin mengurutkan daftar tugas saya berdasarkan kriteria tertentu, sehingga saya dapat dengan mudah menemukan dan memprioritaskan tugas yang relevan.

#### Kriteria Penerimaan

1. THE Todo_List SHALL menyediakan kontrol (misalnya dropdown atau tombol) untuk memilih Sort_Order dari minimal tiga pilihan: urutan tambah (default), alfabetis A–Z, dan status (belum selesai terlebih dahulu).

2. WHEN pengguna memilih Sort_Order "urutan tambah", THE Todo_List SHALL menampilkan task dalam urutan task ditambahkan, task terlama di atas.

3. WHEN pengguna memilih Sort_Order "alfabetis A–Z", THE Todo_List SHALL mengurutkan dan menampilkan seluruh task berdasarkan teks task secara ascending (A ke Z), tidak membedakan huruf besar/kecil.

4. WHEN pengguna memilih Sort_Order "status", THE Todo_List SHALL mengurutkan dan menampilkan task dengan status "belum selesai" di atas task dengan status "selesai".

5. WHEN pengguna menambahkan task baru saat Sort_Order aktif selain "urutan tambah", THE Todo_List SHALL menyisipkan task baru pada posisi yang sesuai dengan Sort_Order yang sedang aktif.

6. WHEN pengguna mengubah Sort_Order, THE Todo_List SHALL memperbarui urutan tampilan task dalam waktu kurang dari 100 milidetik.

7. WHEN pengguna mengubah Sort_Order, THE Todo_List SHALL menyimpan Sort_Order yang dipilih ke Local_Storage.

8. WHEN halaman Dashboard dimuat ulang, THE Todo_List SHALL membaca Sort_Order dari Local_Storage dan menerapkan Sort_Order terakhir yang dipilih pengguna.

9. IF tidak ada Sort_Order yang tersimpan di Local_Storage, THEN THE Todo_List SHALL menggunakan Sort_Order "urutan tambah" sebagai default.
