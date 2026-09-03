'use strict';

// =====================
// StorageService
// =====================

/**
 * Konstanta key yang digunakan untuk menyimpan data di Local Storage.
 * Semua modul menggunakan konstanta ini agar konsisten dan mudah diubah.
 */
const STORAGE_KEYS = {
  TASKS:       'ld_tasks',
  LINKS:       'ld_links',
  THEME:       'ld_theme',
  CUSTOM_NAME: 'ld_custom_name',
  SORT_ORDER:  'ld_sort_order',
};

/**
 * StorageService — lapisan abstraksi tipis di atas localStorage.
 * Mengisolasi error serialisasi/deserialisasi dan menyederhanakan akses data.
 */
const StorageService = {
  /**
   * Mengecek apakah localStorage tersedia di browser ini.
   * @returns {boolean} true jika localStorage dapat digunakan, false jika tidak.
   */
  isAvailable() {
    const TEST_KEY = '__ld_test__';
    try {
      localStorage.setItem(TEST_KEY, '1');
      localStorage.getItem(TEST_KEY);
      localStorage.removeItem(TEST_KEY);
      return true;
    } catch (_e) {
      return false;
    }
  },

  /**
   * Menyimpan nilai ke localStorage dengan serialisasi JSON.
   * @param {string} key   - Key penyimpanan.
   * @param {*}      value - Nilai yang akan disimpan (akan di-serialize ke JSON).
   * @throws {Error} Jika localStorage.setItem gagal (misalnya kuota penuh).
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      throw new Error(`StorageService.set gagal untuk key "${key}": ${err.message}`);
    }
  },

  /**
   * Membaca nilai dari localStorage dengan deserialisasi JSON.
   * @param {string} key - Key penyimpanan.
   * @returns {*} Nilai yang tersimpan, atau null jika key tidak ada / parsing gagal.
   */
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch (_e) {
      return null;
    }
  },

  /**
   * Menghapus key dari localStorage.
   * @param {string} key - Key yang akan dihapus.
   */
  remove(key) {
    localStorage.removeItem(key);
  },
};

// =====================
// Validator
// =====================

/**
 * Validator — kumpulan metode pure untuk memvalidasi input pengguna.
 * Setiap metode tidak memiliki efek samping dan hanya bergantung pada argumennya.
 */
const Validator = {
  /**
   * Mengecek apakah `str` adalah string dengan minimal satu karakter non-spasi.
   * @param {*} str - Nilai yang akan dicek.
   * @returns {boolean} true jika str adalah string non-kosong (bukan hanya spasi).
   */
  isNonEmptyString(str) {
    return typeof str === 'string' && str.trim().length > 0;
  },

  /**
   * Mengecek apakah `str` adalah URL yang diawali dengan 'http://' atau 'https://'.
   * @param {*} str - Nilai yang akan dicek.
   * @returns {boolean} true jika str dimulai dengan http:// atau https://.
   */
  isValidUrl(str) {
    return typeof str === 'string' &&
      (str.startsWith('http://') || str.startsWith('https://'));
  },

  /**
   * Mengecek apakah panjang `str` tidak melebihi `max`.
   * @param {*}      str - String yang akan dicek.
   * @param {number} max - Panjang maksimum yang diperbolehkan.
   * @returns {boolean} true jika str.length <= max.
   */
  isWithinMaxLength(str, max) {
    return typeof str === 'string' && str.length <= max;
  },

  /**
   * Memvalidasi teks task pada Todo List.
   * Menolak teks yang kosong/hanya spasi atau melebihi 200 karakter.
   * @param {string} text - Teks task yang akan divalidasi.
   * @returns {{ valid: boolean, errorMessage: string }}
   */
  validateTask(text) {
    if (!this.isNonEmptyString(text)) {
      return { valid: false, errorMessage: 'Task tidak boleh kosong.' };
    }
    if (!this.isWithinMaxLength(text, 200)) {
      return { valid: false, errorMessage: 'Task maksimal 200 karakter.' };
    }
    return { valid: true, errorMessage: '' };
  },

  /**
   * Memvalidasi label dan URL untuk Quick Link.
   * Menolak label/URL kosong, URL tanpa protokol http/https,
   * label > 50 karakter, atau URL > 2048 karakter.
   * @param {string} label - Label tampilan link.
   * @param {string} url   - URL tujuan link.
   * @returns {{ valid: boolean, errorMessage: string }}
   */
  validateLink(label, url) {
    if (!this.isNonEmptyString(label)) {
      return { valid: false, errorMessage: 'Label tidak boleh kosong.' };
    }
    if (!this.isNonEmptyString(url)) {
      return { valid: false, errorMessage: 'URL tidak boleh kosong.' };
    }
    if (!this.isValidUrl(url)) {
      return { valid: false, errorMessage: 'URL harus diawali dengan http:// atau https://.' };
    }
    if (!this.isWithinMaxLength(label, 50)) {
      return { valid: false, errorMessage: 'Label maksimal 50 karakter.' };
    }
    if (!this.isWithinMaxLength(url, 2048)) {
      return { valid: false, errorMessage: 'URL maksimal 2048 karakter.' };
    }
    return { valid: true, errorMessage: '' };
  },

  /**
   * Memvalidasi Custom Name untuk Greeting Widget.
   * Nama kosong diperbolehkan; hanya menolak jika melebihi 50 karakter.
   * @param {string} name - Nama kustom pengguna.
   * @returns {{ valid: boolean, errorMessage: string }}
   */
  validateCustomName(name) {
    if (typeof name === 'string' && !this.isWithinMaxLength(name, 50)) {
      return { valid: false, errorMessage: 'Nama maksimal 50 karakter.' };
    }
    return { valid: true, errorMessage: '' };
  },
};

// =====================
// GreetingModule
// =====================

/**
 * GreetingModule — mengelola widget salam, waktu, tanggal, dan custom name.
 * Fungsi murni (getGreeting, formatTime, formatDate) dapat diuji secara independen.
 */
const GreetingModule = {
  /** @type {string} Nama kustom pengguna yang sedang aktif. */
  _customName: '',

  /**
   * Menginisialisasi widget: muat nama dari storage, render awal,
   * lalu jalankan setInterval setiap 1 detik.
   */
  init() {
    this.loadCustomName();
    this.render();
    setInterval(() => this.render(), 1000);

    // Pasang event listener tombol Save dan Clear
    const btnSave  = document.getElementById('btn-save-name');
    const btnClear = document.getElementById('btn-clear-name');
    const input    = document.getElementById('custom-name-input');

    if (btnSave) {
      btnSave.addEventListener('click', () => {
        this.setCustomName(input ? input.value : '');
      });
    }

    if (btnClear) {
      btnClear.addEventListener('click', () => {
        this.clearCustomName();
        if (input) input.value = '';
      });
    }

    // Hapus pesan error saat pengguna mulai mengetik
    if (input) {
      input.addEventListener('input', () => {
        const errEl = document.getElementById('greeting-error');
        if (errEl) errEl.textContent = '';
      });
    }
  },

  /**
   * Memperbarui elemen DOM: #greeting, #time-display, #date-display.
   */
  render() {
    const now = new Date();

    const greetingEl = document.getElementById('greeting');
    const timeEl     = document.getElementById('time-display');
    const dateEl     = document.getElementById('date-display');

    if (greetingEl) {
      greetingEl.textContent = this.getGreeting(now.getHours());
    }
    if (timeEl) {
      timeEl.textContent = this.formatTime(now);
    }
    if (dateEl) {
      dateEl.textContent = this.formatDate(now);
    }
  },

  /**
   * Mengembalikan teks salam berdasarkan jam, dengan nama jika tersedia.
   * - 05–11  → "Selamat Pagi"
   * - 12–14  → "Selamat Siang"
   * - 15–17  → "Selamat Sore"
   * - 18–23 dan 00–04 → "Selamat Malam"
   *
   * @param {number} hour - Jam saat ini (0–23).
   * @returns {string} Teks salam lengkap.
   */
  getGreeting(hour) {
    let base;
    if (hour >= 5 && hour <= 11) {
      base = 'Selamat Pagi';
    } else if (hour >= 12 && hour <= 14) {
      base = 'Selamat Siang';
    } else if (hour >= 15 && hour <= 17) {
      base = 'Selamat Sore';
    } else {
      base = 'Selamat Malam';
    }

    if (this._customName && this._customName.trim().length > 0) {
      return `${base}, ${this._customName}!`;
    }
    return `${base}!`;
  },

  /**
   * Memformat objek Date menjadi "HH:MM" (24 jam, zero-padded).
   * @param {Date} date - Objek tanggal/waktu.
   * @returns {string} Format "HH:MM".
   */
  formatTime(date) {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm  = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  },

  /**
   * Memformat objek Date menjadi "DDDD, DD MMMM YYYY" dalam Bahasa Indonesia.
   * Contoh: "Senin, 25 Agustus 2025"
   * @param {Date} date - Objek tanggal/waktu.
   * @returns {string} Format tanggal lengkap dalam Bahasa Indonesia.
   */
  formatDate(date) {
    const DAYS = [
      'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu',
    ];
    const MONTHS = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];

    const dayName   = DAYS[date.getDay()];
    const dd        = String(date.getDate()).padStart(2, '0');
    const monthName = MONTHS[date.getMonth()];
    const yyyy      = date.getFullYear();

    return `${dayName}, ${dd} ${monthName} ${yyyy}`;
  },

  /**
   * Menyimpan Custom Name ke storage setelah validasi.
   * Menampilkan error di #greeting-error jika tidak valid.
   * @param {string} name - Nama kustom yang diinputkan pengguna.
   */
  setCustomName(name) {
    // Pastikan elemen error ada; buat jika belum ada
    let errEl = document.getElementById('greeting-error');
    if (!errEl) {
      errEl = document.createElement('p');
      errEl.id = 'greeting-error';
      errEl.setAttribute('role', 'alert');
      errEl.setAttribute('aria-live', 'polite');
      const input = document.getElementById('custom-name-input');
      if (input && input.parentNode) {
        input.parentNode.appendChild(errEl);
      } else {
        const section = document.getElementById('greeting-widget');
        if (section) section.appendChild(errEl);
      }
    }

    const result = Validator.validateCustomName(name);
    if (!result.valid) {
      errEl.textContent = result.errorMessage;
      return;
    }

    errEl.textContent = '';
    // Nama kosong / hanya spasi → dianggap hapus nama
    const trimmed = (typeof name === 'string') ? name.trim() : '';
    this._customName = trimmed;

    if (trimmed.length > 0) {
      StorageService.set(STORAGE_KEYS.CUSTOM_NAME, trimmed);
    } else {
      StorageService.remove(STORAGE_KEYS.CUSTOM_NAME);
    }

    this.render();
  },

  /**
   * Menghapus Custom Name dari storage, mereset state, dan re-render.
   */
  clearCustomName() {
    this._customName = '';
    StorageService.remove(STORAGE_KEYS.CUSTOM_NAME);
    this.render();
  },

  /**
   * Memuat Custom Name dari storage ke state internal.
   */
  loadCustomName() {
    const stored = StorageService.get(STORAGE_KEYS.CUSTOM_NAME);
    this._customName = (typeof stored === 'string') ? stored : '';
  },
};

// =====================
// TimerModule
// =====================

/**
 * TimerModule — mengelola Focus Timer (Pomodoro 25 menit).
 * State berisi sisa detik, flag running, dan ID interval aktif.
 * Semua interaksi DOM dilakukan via ID yang telah ditentukan di HTML.
 */
const TimerModule = {
  /** State internal timer. */
  _state: {
    remaining: 1500,   // 25 menit dalam detik
    running:   false,
    intervalId: null,
  },

  /**
   * Inisialisasi modul.
   * Mengecek ketersediaan setInterval; jika tidak tersedia, tampilkan error
   * dan nonaktifkan semua tombol. Jika tersedia, lakukan render awal.
   */
  init() {
    if (typeof setInterval !== 'function') {
      const display = document.getElementById('timer-display');
      if (display) display.textContent = 'Timer tidak tersedia di browser ini.';
      ['btn-start', 'btn-stop', 'btn-reset'].forEach((id) => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = true;
      });
      return;
    }
    this.render();
  },

  /**
   * Memulai hitungan mundur.
   * Jika sudah running, langsung return.
   * Nonaktifkan tombol Start, aktifkan Stop dan Reset, lalu mulai setInterval 1 detik.
   */
  start() {
    if (this._state.running) return;

    this._state.running = true;

    const btnStart = document.getElementById('btn-start');
    const btnStop  = document.getElementById('btn-stop');
    const btnReset = document.getElementById('btn-reset');
    if (btnStart) btnStart.disabled = true;
    if (btnStop)  btnStop.disabled  = false;
    if (btnReset) btnReset.disabled = false;

    this._state.intervalId = setInterval(() => this.tick(), 1000);
  },

  /**
   * Menghentikan hitungan mundur tanpa mereset nilai.
   * Aktifkan kembali tombol Start, nonaktifkan Stop.
   */
  stop() {
    clearInterval(this._state.intervalId);
    this._state.intervalId = null;
    this._state.running    = false;

    const btnStart = document.getElementById('btn-start');
    const btnStop  = document.getElementById('btn-stop');
    if (btnStart) btnStart.disabled = false;
    if (btnStop)  btnStop.disabled  = true;
  },

  /**
   * Menghentikan dan mereset timer ke 25:00.
   * Menghapus notifikasi "Sesi selesai!", mengaktifkan semua tombol kecuali Stop.
   */
  reset() {
    this.stop();
    this._state.remaining = 1500;

    const btnReset = document.getElementById('btn-reset');
    if (btnReset) btnReset.disabled = false;

    this.clearSessionComplete();
    this.render();
  },

  /**
   * Dipanggil setiap detik oleh setInterval.
   * Mengurangi remaining 1 detik; jika mencapai 0, panggil showSessionComplete.
   * Selalu memanggil render() untuk memperbarui tampilan.
   */
  tick() {
    this._state.remaining -= 1;
    if (this._state.remaining <= 0) {
      this._state.remaining = 0;
      this.showSessionComplete();
    }
    this.render();
  },

  /**
   * Memperbarui elemen #timer-display dengan sisa waktu dalam format MM:SS.
   */
  render() {
    const display = document.getElementById('timer-display');
    if (display) display.textContent = this.formatTime(this._state.remaining);
  },

  /**
   * Dipanggil saat hitungan mundur mencapai 00:00.
   * Hentikan interval, tampilkan "Sesi selesai!" di #timer-notification,
   * nonaktifkan Stop, aktifkan Reset, nonaktifkan Start.
   */
  showSessionComplete() {
    clearInterval(this._state.intervalId);
    this._state.intervalId = null;
    this._state.running    = false;

    const notification = document.getElementById('timer-notification');
    if (notification) notification.textContent = 'Sesi selesai!';

    const btnStart = document.getElementById('btn-start');
    const btnStop  = document.getElementById('btn-stop');
    const btnReset = document.getElementById('btn-reset');
    if (btnStart) btnStart.disabled = true;
    if (btnStop)  btnStop.disabled  = true;
    if (btnReset) btnReset.disabled = false;
  },

  /**
   * Menghapus teks notifikasi di #timer-notification.
   */
  clearSessionComplete() {
    const notification = document.getElementById('timer-notification');
    if (notification) notification.textContent = '';
  },

  /**
   * Helper murni (pure) — mengubah jumlah detik menjadi string "MM:SS" zero-padded.
   * Dapat diuji tanpa DOM.
   * @param {number} seconds - Total detik (non-negatif).
   * @returns {string} Format "MM:SS".
   */
  formatTime(seconds) {
    const totalSec = Math.max(0, Math.floor(seconds));
    const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const ss = String(totalSec % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  },
};

// =====================
// TodoModule
// =====================

/**
 * TodoModule — mengelola daftar tugas (CRUD) dengan persistensi ke Local Storage.
 * Mendukung penambahan, penghapusan, toggle status, dan render ulang daftar task.
 */
const TodoModule = {
  /** @type {Array<{id: string, text: string, completed: boolean, createdAt: number}>} */
  _tasks: [],

  /** Urutan pengurutan aktif saat ini: 'creation' | 'alphabetical' | 'status'. */
  _sortOrder: 'creation',

  /**
   * Inisialisasi modul: muat data dari storage, pasang event listener, render daftar.
   */
  init() {
    this.loadFromStorage();

    const input    = document.getElementById('task-input');
    const btnAdd   = document.getElementById('btn-add-task');
    const sortSel  = document.getElementById('sort-select');

    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        this.addTask(input ? input.value : '');
      });
    }

    if (input) {
      // Tambahkan task saat tekan Enter
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.addTask(input.value);
        }
      });

      // Bersihkan pesan error saat pengguna mengetik
      input.addEventListener('input', () => {
        const errEl = document.getElementById('todo-error');
        if (errEl) errEl.textContent = '';
      });
    }

    if (sortSel) {
      sortSel.addEventListener('change', () => {
        this.sortTasks(sortSel.value);
      });
    }

    this.renderList();
  },

  /**
   * Menampilkan pesan error di elemen #todo-error.
   * @param {string} message - Pesan error yang akan ditampilkan.
   */
  _showError(message) {
    const errEl = document.getElementById('todo-error');
    if (errEl) errEl.textContent = message;
  },

  /**
   * Menghapus pesan error di elemen #todo-error.
   */
  _clearError() {
    const errEl = document.getElementById('todo-error');
    if (errEl) errEl.textContent = '';
  },

  /**
   * Menambahkan task baru ke daftar setelah validasi.
   * Membersihkan input dan menampilkan pesan error jika tidak valid.
   * @param {string} text - Teks task yang akan ditambahkan.
   */
  addTask(text) {
    // Cek batas maksimum 100 task
    if (this._tasks.length >= 100) {
      this._showError('Maksimal 100 task.');
      return;
    }

    const result = Validator.validateTask(text);
    if (!result.valid) {
      this._showError(result.errorMessage);
      return;
    }

    this._clearError();

    const newTask = {
      id:        Date.now().toString(),
      text:      text.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    this._tasks.push(newTask);
    this.saveToStorage();

    // Kosongkan input setelah berhasil menambahkan
    const input = document.getElementById('task-input');
    if (input) input.value = '';

    // Terapkan urutan aktif — sortTasks juga memanggil renderList
    this.sortTasks(this._sortOrder);
  },

  /**
   * Menghapus task berdasarkan id.
   * @param {string} id - ID task yang akan dihapus.
   */
  deleteTask(id) {
    this._tasks = this._tasks.filter((task) => task.id !== id);
    this.saveToStorage();
    this.renderList();
  },

  /**
   * Mengalihkan (toggle) status `completed` sebuah task.
   * @param {string} id - ID task yang akan di-toggle.
   */
  toggleTask(id) {
    const task = this._tasks.find((t) => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    this.saveToStorage();
    this.renderList();
  },

  /**
   * Menyimpan array _tasks ke Local Storage.
   * Jika gagal, rollback ke state sebelumnya dan tampilkan error.
   */
  saveToStorage() {
    const previous = this._tasks.slice(); // snapshot untuk rollback
    try {
      StorageService.set(STORAGE_KEYS.TASKS, this._tasks);
    } catch (err) {
      // Rollback ke state sebelum set
      this._tasks = previous;
      this._showError('Data tidak dapat disimpan: ' + err.message);
    }
  },

  /**
   * Memuat array tasks dari Local Storage.
   * Menampilkan pesan error jika pembacaan gagal atau data tidak valid.
   */
  loadFromStorage() {
    try {
      const data = StorageService.get(STORAGE_KEYS.TASKS);
      this._tasks = Array.isArray(data) ? data : [];
    } catch (_e) {
      this._tasks = [];
      this._showError('Data tidak dapat dimuat dari penyimpanan lokal.');
    }

    // Baca dan terapkan sort order yang tersimpan
    const savedOrder = StorageService.get(STORAGE_KEYS.SORT_ORDER);
    if (savedOrder === 'alphabetical' || savedOrder === 'status') {
      this._sortOrder = savedOrder;
    } else {
      this._sortOrder = 'creation';
    }

    // Sinkronisasi nilai dropdown jika sudah ada di DOM
    const sortSel = document.getElementById('sort-select');
    if (sortSel) sortSel.value = this._sortOrder;

    // Terapkan urutan — dipanggil sebelum render pertama
    this.sortTasks(this._sortOrder);
  },

  /**
   * Mengosongkan dan merender ulang seluruh daftar task di #task-list.
   */
  renderList() {
    const listEl = document.getElementById('task-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    this._tasks.forEach((task) => {
      const li = this.renderTask(task);
      listEl.appendChild(li);
    });
  },

  /**
   * Membuat elemen <li> untuk sebuah task dengan checkbox, teks, dan tombol hapus.
   * @param {{id: string, text: string, completed: boolean, createdAt: number}} task
   * @returns {HTMLLIElement}
   */
  renderTask(task) {
    const li = document.createElement('li');
    li.className   = 'task-item' + (task.completed ? ' completed' : '');
    li.dataset.id  = task.id;

    // Checkbox untuk toggle status
    const checkbox         = document.createElement('input');
    checkbox.type          = 'checkbox';
    checkbox.className     = 'task-checkbox';
    checkbox.checked       = task.completed;
    checkbox.setAttribute('aria-label', `Tandai task: ${task.text}`);
    checkbox.addEventListener('change', () => {
      this.toggleTask(task.id);
    });

    // Teks task
    const span         = document.createElement('span');
    span.className     = 'task-text';
    span.textContent   = task.text;

    // Tombol edit
    const btnEdit              = document.createElement('button');
    btnEdit.className          = 'btn-edit-task';
    btnEdit.setAttribute('aria-label', `Edit task: ${task.text}`);
    btnEdit.textContent        = '✏️';
    btnEdit.addEventListener('click', () => {
      this.beginEditTask(task.id);
    });

    // Tombol hapus
    const btnDelete              = document.createElement('button');
    btnDelete.className          = 'btn-delete-task';
    btnDelete.setAttribute('aria-label', 'Hapus task');
    btnDelete.textContent        = '🗑';
    btnDelete.addEventListener('click', () => {
      this.deleteTask(task.id);
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(btnEdit);
    li.appendChild(btnDelete);

    return li;
  },

  /**
   * Mengurutkan _tasks berdasarkan kriteria `order`, menyimpan preferensi ke LS,
   * memperbarui state _sortOrder, lalu merender ulang daftar.
   * @param {'creation'|'alphabetical'|'status'} order - Kriteria pengurutan.
   */
  sortTasks(order) {
    this._sortOrder = order;
    StorageService.set(STORAGE_KEYS.SORT_ORDER, order);

    if (order === 'alphabetical') {
      // A–Z, tidak membedakan huruf besar/kecil
      this._tasks.sort((a, b) => {
        const ta = a.text.toLowerCase();
        const tb = b.text.toLowerCase();
        if (ta < tb) return -1;
        if (ta > tb) return 1;
        return 0;
      });
    } else if (order === 'status') {
      // Belum selesai (false) di atas, selesai (true) di bawah
      this._tasks.sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
      });
    } else {
      // 'creation' — ascending berdasarkan createdAt
      this._tasks.sort((a, b) => a.createdAt - b.createdAt);
    }

    this.renderList();
  },

  /**
   * Mengubah tampilan sebuah task menjadi mode edit inline.
   * Mengganti <span class="task-text"> dengan <input type="text">,
   * mengganti tombol hapus dengan tombol Save dan Cancel,
   * dan menambahkan class "editing" ke <li>.
   * @param {string} id - ID task yang akan diedit.
   */
  beginEditTask(id) {
    const li = document.querySelector(`#task-list li[data-id="${id}"]`);
    if (!li) return;

    const task = this._tasks.find((t) => t.id === id);
    if (!task) return;

    // Tandai li sebagai mode edit
    li.classList.add('editing');

    // Ganti span teks dengan input
    const span = li.querySelector('.task-text');
    if (span) {
      const input = document.createElement('input');
      input.type         = 'text';
      input.className    = 'task-edit-input';
      input.value        = task.text;
      input.maxLength    = 200;
      input.setAttribute('aria-label', 'Edit teks task');

      // Simpan saat tekan Enter, batalkan saat tekan Escape
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter')  this.saveEditTask(id, input.value);
        if (e.key === 'Escape') this.cancelEditTask(id);
      });

      span.replaceWith(input);
      input.focus();
      // Posisikan kursor di akhir teks
      input.setSelectionRange(input.value.length, input.value.length);
    }

    // Ganti tombol hapus dengan tombol Save dan Cancel
    const btnDelete = li.querySelector('.btn-delete-task');
    if (btnDelete) {
      const btnSave = document.createElement('button');
      btnSave.className    = 'btn-save-task';
      btnSave.textContent  = '💾';
      btnSave.setAttribute('aria-label', 'Simpan perubahan task');
      btnSave.addEventListener('click', () => {
        const editInput = li.querySelector('.task-edit-input');
        this.saveEditTask(id, editInput ? editInput.value : '');
      });

      const btnCancel = document.createElement('button');
      btnCancel.className    = 'btn-cancel-task';
      btnCancel.textContent  = '✖';
      btnCancel.setAttribute('aria-label', 'Batalkan edit task');
      btnCancel.addEventListener('click', () => {
        this.cancelEditTask(id);
      });

      btnDelete.replaceWith(btnSave);
      // Sisipkan btnCancel setelah btnSave
      btnSave.insertAdjacentElement('afterend', btnCancel);
    }

    // Sembunyikan tombol edit sementara dalam mode edit
    const btnEdit = li.querySelector('.btn-edit-task');
    if (btnEdit) btnEdit.style.display = 'none';
  },

  /**
   * Menyimpan hasil edit sebuah task setelah validasi.
   * Jika teks valid, update _tasks, simpan ke storage, re-render.
   * Jika tidak valid, tampilkan error dan pertahankan mode edit.
   * @param {string} id      - ID task yang sedang diedit.
   * @param {string} newText - Teks baru hasil edit pengguna.
   */
  saveEditTask(id, newText) {
    const result = Validator.validateTask(newText);
    if (!result.valid) {
      this._showError(result.errorMessage);
      // Kembalikan fokus ke input agar pengguna dapat langsung memperbaiki
      const li = document.querySelector(`#task-list li[data-id="${id}"]`);
      if (li) {
        const input = li.querySelector('.task-edit-input');
        if (input) input.focus();
      }
      return;
    }

    const task = this._tasks.find((t) => t.id === id);
    if (!task) return;

    task.text = newText.trim();
    this._clearError();
    this.saveToStorage();
    this.renderList();
  },

  /**
   * Membatalkan mode edit dan mengembalikan tampilan task ke keadaan semula.
   * @param {string} id - ID task yang sedang diedit.
   */
  cancelEditTask(id) {
    this.renderList();
  },
};

// =====================
// QuickLinksModule
// =====================

/**
 * QuickLinksModule — mengelola widget Quick Links (tautan favorit).
 * Mendukung tambah, hapus, dan persistensi link ke Local Storage.
 * Setiap link memiliki label tampilan dan URL tujuan.
 */
const QuickLinksModule = {
  /** @type {Array<{id: string, label: string, url: string}>} Array link saat ini. */
  _links: [],

  /**
   * Inisialisasi modul: muat dari storage, pasang event listener, render.
   */
  init() {
    this.loadFromStorage();

    const btnAdd      = document.getElementById('btn-add-link');
    const labelInput  = document.getElementById('link-label-input');
    const urlInput    = document.getElementById('link-url-input');
    const errorEl     = document.getElementById('links-error');

    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        this.addLink(
          labelInput ? labelInput.value : '',
          urlInput   ? urlInput.value   : ''
        );
      });
    }

    // Bersihkan pesan error saat pengguna mulai mengetik
    if (labelInput && errorEl) {
      labelInput.addEventListener('input', () => { errorEl.textContent = ''; });
    }
    if (urlInput && errorEl) {
      urlInput.addEventListener('input', () => { errorEl.textContent = ''; });
    }

    this.renderLinks();
  },

  /**
   * Menambahkan link baru setelah validasi.
   * Menolak jika sudah mencapai 50 link atau validasi gagal.
   * @param {string} label - Label tampilan link.
   * @param {string} url   - URL tujuan link.
   */
  addLink(label, url) {
    const errorEl = document.getElementById('links-error');

    if (this._links.length >= 50) {
      if (errorEl) errorEl.textContent = 'Maksimal 50 link.';
      return;
    }

    const result = Validator.validateLink(label, url);
    if (!result.valid) {
      if (errorEl) errorEl.textContent = result.errorMessage;
      return;
    }

    if (errorEl) errorEl.textContent = '';

    const newLink = {
      id:    Date.now().toString(),
      label: label.trim(),
      url:   url.trim(),
    };

    this._links.push(newLink);
    this.saveToStorage();
    this.renderLinks();

    // Kosongkan input setelah berhasil tambah
    const labelInput = document.getElementById('link-label-input');
    const urlInput   = document.getElementById('link-url-input');
    if (labelInput) labelInput.value = '';
    if (urlInput)   urlInput.value   = '';
  },

  /**
   * Menghapus link berdasarkan id, simpan, dan render ulang.
   * @param {string} id - ID link yang akan dihapus.
   */
  deleteLink(id) {
    this._links = this._links.filter((link) => link.id !== id);
    this.saveToStorage();
    this.renderLinks();
  },

  /**
   * Mengosongkan #links-container lalu merender setiap link.
   */
  renderLinks() {
    const container = document.getElementById('links-container');
    if (!container) return;

    container.innerHTML = '';
    this._links.forEach((link) => {
      const el = this.renderLink(link);
      container.appendChild(el);
    });
  },

  /**
   * Membuat elemen DOM untuk satu link.
   * @param {{id: string, label: string, url: string}} link - Objek link.
   * @returns {HTMLElement} Elemen div yang berisi anchor dan tombol hapus.
   */
  renderLink(link) {
    const wrapper = document.createElement('div');
    wrapper.className = 'link-item';
    wrapper.dataset.id = link.id;

    const anchor = document.createElement('a');
    anchor.href             = link.url;
    anchor.target           = '_blank';
    anchor.rel              = 'noopener noreferrer';
    anchor.className        = 'link-btn';
    anchor.textContent      = link.label;

    const btnDelete = document.createElement('button');
    btnDelete.className        = 'btn-delete-link';
    btnDelete.setAttribute('aria-label', `Hapus link ${link.label}`);
    btnDelete.textContent      = '🗑';

    btnDelete.addEventListener('click', () => {
      this.deleteLink(link.id);
    });

    wrapper.appendChild(anchor);
    wrapper.appendChild(btnDelete);

    return wrapper;
  },

  /**
   * Menyimpan array link ke Local Storage.
   * Tangkap exception, rollback state, dan tampilkan error jika gagal.
   */
  saveToStorage() {
    const previous = [...this._links];
    try {
      StorageService.set(STORAGE_KEYS.LINKS, this._links);
    } catch (err) {
      // Rollback ke state sebelum perubahan
      this._links = previous;
      const errorEl = document.getElementById('links-error');
      if (errorEl) {
        errorEl.textContent = 'Gagal menyimpan data. Perubahan dibatalkan.';
      }
    }
  },

  /**
   * Memuat array link dari Local Storage.
   * Jika data bukan array atau terjadi exception, set ke [].
   */
  loadFromStorage() {
    try {
      const stored = StorageService.get(STORAGE_KEYS.LINKS);
      this._links = Array.isArray(stored) ? stored : [];
    } catch (_e) {
      this._links = [];
    }
  },
};

// =====================
// ThemeModule
// =====================

/**
 * ThemeModule — mengelola tema tampilan (light/dark).
 * Menyimpan preferensi ke Local Storage dan menerapkannya ke dokumen
 * via atribut `data-theme` pada `document.documentElement`.
 */
const ThemeModule = {
  /** Tema yang sedang aktif: 'light' atau 'dark'. */
  _currentTheme: 'light',

  /**
   * Inisialisasi modul: baca preferensi dari storage, terapkan tema.
   * Harus dipanggil sebelum modul lain agar tidak ada flash tampilan.
   */
  init() {
    const saved = this.loadFromStorage();
    this._currentTheme = saved;
    this.apply(saved);
  },

  /**
   * Beralih antara tema 'light' dan 'dark', simpan ke storage,
   * terapkan ke dokumen, dan update label tombol toggle.
   */
  toggle() {
    const next = this._currentTheme === 'light' ? 'dark' : 'light';
    this._currentTheme = next;
    this.saveToStorage(next);
    this.apply(next);
  },

  /**
   * Terapkan tema ke dokumen dan update label/aria tombol toggle.
   * @param {'light'|'dark'} theme - Tema yang akan diterapkan.
   */
  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    const btn = document.getElementById('theme-toggle');
    if (btn) {
      if (theme === 'light') {
        btn.textContent = '🌙 Dark Mode';
        btn.setAttribute('aria-label', 'Switch to dark mode');
      } else {
        btn.textContent = '☀️ Light Mode';
        btn.setAttribute('aria-label', 'Switch to light mode');
      }
    }
  },

  /**
   * Simpan preferensi tema ke Local Storage.
   * @param {'light'|'dark'} theme - Nilai tema yang akan disimpan.
   */
  saveToStorage(theme) {
    StorageService.set(STORAGE_KEYS.THEME, theme);
  },

  /**
   * Baca preferensi tema dari Local Storage.
   * @returns {'light'|'dark'} Tema tersimpan, atau 'light' jika tidak ada.
   */
  loadFromStorage() {
    const saved = StorageService.get(STORAGE_KEYS.THEME);
    return saved === 'dark' ? 'dark' : 'light';
  },
};

// =====================
// App Initialization
// =====================

document.addEventListener('DOMContentLoaded', function () {
  // 1. ThemeModule first — prevents flash of unstyled theme
  ThemeModule.init();

  // 2. Wire theme toggle button
  const btnTheme = document.getElementById('theme-toggle');
  if (btnTheme) {
    btnTheme.addEventListener('click', function () {
      ThemeModule.toggle();
    });
  }

  // 3. Init remaining modules
  GreetingModule.init();
  TimerModule.init();
  TodoModule.init();
  QuickLinksModule.init();

  // 4. Wire timer buttons (modules handle their own internal listeners)
  const btnStart = document.getElementById('btn-start');
  const btnStop  = document.getElementById('btn-stop');
  const btnReset = document.getElementById('btn-reset');
  if (btnStart) btnStart.addEventListener('click', function () { TimerModule.start(); });
  if (btnStop)  btnStop.addEventListener('click',  function () { TimerModule.stop(); });
  if (btnReset) btnReset.addEventListener('click', function () { TimerModule.reset(); });
});
