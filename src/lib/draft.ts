import { DESTINATIONS, type Destination } from "@/lib/protocol";

const KEY = "wow-signal.draft";

export type TransmitDraft = {
  destination: Destination;
  message: string;
  vow: string;
  autoQueue?: boolean;
};

function canStore(): boolean {
  return typeof window !== "undefined";
}

export function saveDraft(draft: TransmitDraft): void {
  if (!canStore()) return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    /* private mode / quota */
  }
}

export function readDraft(): TransmitDraft | null {
  if (!canStore()) return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<TransmitDraft>;
    if (typeof d.message !== "string") return null;
    const destination = DESTINATIONS.includes(d.destination as Destination)
      ? (d.destination as Destination)
      : "mars";
    return {
      destination,
      message: d.message.slice(0, 280),
      vow: typeof d.vow === "string" ? d.vow.slice(0, 120) : "",
      autoQueue: Boolean(d.autoQueue),
    };
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  if (!canStore()) return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function hasDraftMessage(): boolean {
  const d = readDraft();
  return Boolean(d?.message.trim());
}
