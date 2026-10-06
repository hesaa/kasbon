import { z } from "zod";

export const MAX_AMOUNT = 1_000_000_000_000;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const baseDebtSchema = z.object({
  type: z.enum(["owed_to_me", "i_owe"], {
    error: "Tipe utang-piutang nggak valid",
  }),
  counterpart_name: z
    .string({ error: "Nama orang wajib diisi" })
    .trim()
    .min(1, "Nama orang wajib diisi")
    .max(100, "Nama maksimal 100 karakter"),
  amount: z
    .number({ error: "Jumlah harus berupa angka" })
    .int("Jumlah harus bilangan bulat")
    .positive("Jumlah harus lebih dari 0")
    .max(MAX_AMOUNT, "Jumlahnya kegedean. Maksimal Rp 1.000.000.000.000"),
  debt_date: z
    .string({ error: "Format tanggal nggak valid" })
    .regex(ISO_DATE_REGEX, "Format tanggal nggak valid"),
  due_date: z
    .string()
    .regex(ISO_DATE_REGEX, "Format tanggal jatuh tempo nggak valid")
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  note: z
    .string()
    .trim()
    .max(200, "Catatan maksimal 200 karakter")
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),
});

export const debtSchema = baseDebtSchema.refine(
  (data) => {
    if (data.due_date && data.debt_date) {
      return data.due_date >= data.debt_date;
    }
    return true;
  },
  {
    message: "Jatuh tempo nggak boleh sebelum tanggal catat",
    path: ["due_date"],
  }
);

export const updateDebtSchema = baseDebtSchema
  .partial()
  .extend({
    settled: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.due_date && data.debt_date) {
        return data.due_date >= data.debt_date;
      }
      return true;
    },
    {
      message: "Jatuh tempo nggak boleh sebelum tanggal catat",
      path: ["due_date"],
    }
  );

export type CreateDebtInput = z.infer<typeof debtSchema>;
export type UpdateDebtInput = z.infer<typeof updateDebtSchema>;
