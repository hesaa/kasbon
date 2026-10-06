export const COPY = {
  appName: "Kasbon",
  appTagline: "Catat utang-piutang, biar nggak lupa siapa yang belum bayar.",

  // Auth
  loginTitle: "Masuk",
  loginSubmit: "Masuk",
  loginLinkText: "Belum punya akun? Daftar dulu",
  signupTitle: "Bikin akun",
  signupSubmit: "Daftar",
  signupLinkText: "Udah punya akun? Masuk",
  logout: "Keluar",
  signupConfirmNotice: "Cek email kamu buat konfirmasi, abis itu masuk.",

  // Auth Errors
  authErrors: {
    invalid_credentials: "Email atau password salah.",
    user_already_exists: "Email ini udah terdaftar. Coba masuk aja.",
    weak_password: "Password kurang kuat. Pakai minimal 8 karakter ya.",
    over_request_rate_limit: "Kebanyakan percobaan. Tunggu sebentar terus coba lagi.",
    fallback: "Ada yang error. Coba lagi ya.",
  },

  // Cards
  cardOwedToMe: "Total dihutang ke saya",
  cardIOwe: "Total saya hutang",
  cardNet: "Net",
  cardSubtextUnsettled: "{n} catatan belum lunas",
  cardNetPositive: "Lebih banyak yang harus dibayar ke kamu",
  cardNetNegative: "Kamu lebih banyak hutangnya",

  // Types & Statuses
  typeOwedToMe: "Dihutang ke saya",
  typeIOwe: "Saya hutang",
  formRadioOwedToMe: "Saya dihutang",
  formRadioIOwe: "Saya hutang",
  statusUnsettled: "Belum lunas",
  statusSettled: "Lunas",
  statusOverdue: "Lewat jatuh tempo",

  // Filters
  filterStatusAll: "Semua status",
  filterTypeAll: "Semua tipe",
  filterReset: "Reset filter",
  searchPlaceholder: "Cari nama orang…",

  // Actions
  actionNewDebt: "+ Catat baru",
  actionMarkSettled: "Tandai lunas",
  actionUndoSettled: "Batal lunas",
  actionEdit: "Edit",
  actionDelete: "Hapus",
  actionSave: "Simpan",
  actionCancel: "Batal",

  // Form Fields
  formType: "Tipe",
  formName: "Nama orang",
  formNamePlaceholder: "Mis. Budi",
  formAmount: "Jumlah",
  formDate: "Tanggal",
  formDueDate: "Jatuh tempo (opsional)",
  formDueDateToggle: "+ Tambah jatuh tempo",
  formNote: "Catatan (opsional)",
  formNotePlaceholder: "Mis. Patungan makan malam",
  formEditTitle: "Edit catatan",
  formCreateTitle: "Catat baru",

  // Delete Dialog
  deleteTitle: "Hapus catatan ini?",
  deleteConfirmText: "Catatan {nama} sebesar {amount} bakal dihapus permanen.",

  // Toasts
  toastCreated: "Catatan tersimpan",
  toastUpdated: "Perubahan disimpan",
  toastSettled: "Udah ditandai lunas",
  toastUnsettled: "Status lunas dibatalin",
  toastDeleted: "Catatan dihapus",
  toastError: "Yah, gagal nyimpen. Coba lagi ya.",

  // Empty & Error states
  emptyTitle: "Belum ada catatan",
  emptySubtitle: "Mulai catat utang-piutangmu di sini.",
  emptyCTA: "+ Catat yang pertama",
  emptyFilterTitle: "Nggak ada yang cocok sama filter-nya",
  fetchErrorTitle: "Gagal ngambil data",
  fetchErrorRetry: "Coba lagi",
};
