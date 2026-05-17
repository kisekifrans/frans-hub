import type { QuickReply, QuickReplyStore } from "./types";

function snippet(
  partial: Omit<QuickReply, "id" | "createdAt" | "updatedAt" | "pinned" | "favorite"> &
    Partial<Pick<QuickReply, "pinned" | "favorite">> & { id?: string },
): QuickReply {
  const now = new Date().toISOString();
  return {
    id: partial.id ?? `qr_seed_${partial.title.toLowerCase().replace(/\s+/g, "_")}`,
    title: partial.title,
    category: partial.category,
    content: partial.content,
    pinned: partial.pinned ?? false,
    favorite: partial.favorite ?? false,
    createdAt: now,
    updatedAt: now,
  };
}

export const SEED_SNIPPETS: QuickReply[] = [
  snippet({
    title: "Thank You + REP",
    category: "Thank You",
    content: `Terima kasih sudah berbelanja dan percaya dengan saya ❤️

Mohon untuk komen +REP dan Like postingan berikut 🙏

Jika sudah, bisa diabaikan kak!

https://facebook.com/example`,
    favorite: true,
  }),
  snippet({
    title: "BCA Payment",
    category: "Payment",
    content: `BCA
Agisna Fransisco
1234567890

Mohon transfer sesuai nominal ya kak 🙏

Pastikan nama rekening sesuai sebelum transfer.`,
    pinned: true,
  }),
  snippet({
    title: "Steam Wallet — Konfirmasi",
    category: "Steam",
    content: `Halo kak! Pesanan Steam Wallet sudah kami proses ✅

Mohon tunggu 1–5 menit. Jika belum masuk, kabari saya ya.`,
  }),
  snippet({
    title: "Peringatan — Jangan Transfer Dulu",
    category: "Warning",
    content: `Mohon jangan transfer dulu sebelum saya konfirmasi slot dan nominal ya kak 🙏`,
  }),
];

export function createDefaultStore(): QuickReplyStore {
  return {
    version: 1,
    snippets: [...SEED_SNIPPETS],
    customCategories: [],
    recentIds: [],
  };
}
