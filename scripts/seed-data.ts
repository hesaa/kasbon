export interface SeedDebt {
  type: "owed_to_me" | "i_owe";
  counterpart_name: string;
  amount: number;
  note: string;
  daysAgo: number;
  dueDaysAhead?: number | null;
  isSettled?: boolean;
}

export interface SeedAccount {
  email: string;
  pass: string;
  debts: SeedDebt[];
}

export function getSeedAccounts(): SeedAccount[] {
  return [
    {
      email: process.env.SEED_USER_EMAIL || "demo@kasbon.test",
      pass: process.env.SEED_USER_PASSWORD || "Password123!",
      debts: [
        {
          type: "owed_to_me",
          counterpart_name: "Budi",
          amount: 250000,
          note: "Patungan makan malam bersama",
          daysAgo: 0,
          dueDaysAhead: 5,
          isSettled: false,
        },
        {
          type: "i_owe",
          counterpart_name: "Andi",
          amount: 400000,
          note: "Pinjam uang bensin & tol",
          daysAgo: 3,
          dueDaysAhead: null,
          isSettled: false,
        },
        {
          type: "owed_to_me",
          counterpart_name: "Citra",
          amount: 150000,
          note: "Beli kado ultah teman",
          daysAgo: 10,
          dueDaysAhead: null,
          isSettled: true,
        },
        {
          type: "i_owe",
          counterpart_name: "Dewi",
          amount: 100000,
          note: "Patungan kopi & cemilan",
          daysAgo: 1,
          dueDaysAhead: null,
          isSettled: false,
        },
        {
          type: "owed_to_me",
          counterpart_name: "Eko",
          amount: 750000,
          note: "Beli tiket konser musik",
          daysAgo: 7,
          dueDaysAhead: 3,
          isSettled: false,
        },
        {
          type: "i_owe",
          counterpart_name: "Fani",
          amount: 50000,
          note: "Pinjam tunai parkir gedung",
          daysAgo: 2,
          dueDaysAhead: null,
          isSettled: true,
        },
        {
          type: "owed_to_me",
          counterpart_name: "Farhan",
          amount: 300000,
          note: "Talangan perlengkapan kantor",
          daysAgo: 14,
          dueDaysAhead: null,
          isSettled: true,
        },
        {
          type: "i_owe",
          counterpart_name: "Gita",
          amount: 120000,
          note: "Biaya langganan cloud bersama",
          daysAgo: 4,
          dueDaysAhead: 10,
          isSettled: false,
        },
      ],
    },
    {
      email: process.env.USER_A_EMAIL || "usera@kasbon.test",
      pass: process.env.USER_A_PASSWORD || "Password123!",
      debts: [
        {
          type: "owed_to_me",
          counterpart_name: "Hadi",
          amount: 180000,
          note: "Talangan tiket bioskop & popcorn",
          daysAgo: 2,
          dueDaysAhead: 7,
          isSettled: false,
        },
        {
          type: "i_owe",
          counterpart_name: "Indra",
          amount: 500000,
          note: "Pinjaman servis motor darurat",
          daysAgo: 8,
          dueDaysAhead: null,
          isSettled: false,
        },
        {
          type: "owed_to_me",
          counterpart_name: "Joko",
          amount: 90000,
          note: "Patungan makan siang tim",
          daysAgo: 5,
          dueDaysAhead: null,
          isSettled: true,
        },
        {
          type: "i_owe",
          counterpart_name: "Kartika",
          amount: 220000,
          note: "Beli merchandise komik",
          daysAgo: 12,
          dueDaysAhead: null,
          isSettled: true,
        },
        {
          type: "owed_to_me",
          counterpart_name: "Lukman",
          amount: 350000,
          note: "Sewa lapangan badminton",
          daysAgo: 1,
          dueDaysAhead: 2,
          isSettled: false,
        },
      ],
    },
    {
      email: process.env.USER_B_EMAIL || "userb@kasbon.test",
      pass: process.env.USER_B_PASSWORD || "Password123!",
      debts: [
        {
          type: "i_owe",
          counterpart_name: "Maya",
          amount: 150000,
          note: "Titip beli bahan dapur",
          daysAgo: 3,
          dueDaysAhead: 4,
          isSettled: false,
        },
        {
          type: "owed_to_me",
          counterpart_name: "Naufal",
          amount: 600000,
          note: "Talangan uang muka penginapan",
          daysAgo: 6,
          dueDaysAhead: 14,
          isSettled: false,
        },
        {
          type: "i_owe",
          counterpart_name: "Olivia",
          amount: 85000,
          note: "Patungan dessert stall",
          daysAgo: 9,
          dueDaysAhead: null,
          isSettled: true,
        },
        {
          type: "owed_to_me",
          counterpart_name: "Prabowo",
          amount: 450000,
          note: "Talangan jersey olahraga",
          daysAgo: 15,
          dueDaysAhead: null,
          isSettled: true,
        },
        {
          type: "i_owe",
          counterpart_name: "Qila",
          amount: 200000,
          note: "Pinjam saldo e-wallet",
          daysAgo: 1,
          dueDaysAhead: 3,
          isSettled: false,
        },
      ],
    },
    {
      email: "testuser@kasbon.test",
      pass: "Password123!",
      debts: [
        {
          type: "owed_to_me",
          counterpart_name: "Rizal",
          amount: 500000,
          note: "DP perlengkapan kamping",
          daysAgo: 5,
          dueDaysAhead: 10,
          isSettled: false,
        },
        {
          type: "i_owe",
          counterpart_name: "Siska",
          amount: 175000,
          note: "Talangan ongkir ekspedisi",
          daysAgo: 2,
          dueDaysAhead: null,
          isSettled: false,
        },
        {
          type: "owed_to_me",
          counterpart_name: "Tono",
          amount: 80000,
          note: "Patungan bensin luarkota",
          daysAgo: 11,
          dueDaysAhead: null,
          isSettled: true,
        },
        {
          type: "i_owe",
          counterpart_name: "Utama",
          amount: 320000,
          note: "Pembelian voucher game",
          daysAgo: 4,
          dueDaysAhead: 5,
          isSettled: false,
        },
      ],
    },
  ];
}
