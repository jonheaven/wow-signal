import { DEST_META, type WowEnvelope } from "@/lib/protocol";

export const SEND_MIME = "image/svg+xml;charset=utf-8";

const W = 720;
const H = 420;

function xml(s: string): string {
  return s
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;")
    .replace(/'/g, "\u0026apos;");
}

function wrap(text: string, width: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  const push = (s: string) => {
    if (lines.length < maxLines) lines.push(s);
  };
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= width) {
      cur = next;
      continue;
    }
    if (cur) push(cur);
    if (w.length > width) {
      for (let i = 0; i < w.length && lines.length < maxLines; i += width) {
        const chunk = w.slice(i, i + width);
        if (i + width >= w.length) cur = chunk;
        else push(chunk);
      }
    } else {
      cur = w;
    }
  }
  if (cur) push(cur);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    const last = lines[maxLines - 1] ?? "";
    lines[maxLines - 1] = last.slice(0, Math.max(0, width - 1)) + "…";
  }
  return lines;
}

export function utf8Bytes(s: string): number {
  return new TextEncoder().encode(s).length;
}

/** Canonical on-chain body for op:send. Indexers read <metadata> JSON. */
export function buildPostcardSvg(envelope: WowEnvelope): string {
  const dest = DEST_META[envelope.to];
  const msgLines = wrap(envelope.msg || "…", 42, 7);
  const vowLines = envelope.vow ? wrap(envelope.vow, 48, 2) : [];
  const meta = xml(JSON.stringify(envelope));
  const handle = envelope.x.startsWith("@") ? envelope.x : `@${envelope.x}`;
  const when = new Date(envelope.ts).toISOString().slice(0, 16).replace("T", " ");
  const font = "ui-monospace,'IBM Plex Mono','Courier New',monospace";

  const msg = msgLines
    .map(
      (line, i) =>
        `<text x="44" y="${168 + i * 26}" fill="#efe6d2" font-family="${font}" font-size="18">${xml(line)}</text>`,
    )
    .join("");
  const vowY = 168 + msgLines.length * 26 + 18;
  const vow = vowLines
    .map(
      (line, i) =>
        `<text x="44" y="${vowY + i * 18}" fill="#c9a227" font-family="${font}" font-size="12">${xml(line)}</text>`,
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<metadata>${meta}</metadata>
<rect width="${W}" height="${H}" fill="#08070b"/>
<rect x="18" y="18" width="684" height="384" fill="none" stroke="#c9a227" stroke-width="1.25"/>
<rect x="26" y="26" width="668" height="368" fill="none" stroke="#2a261c" stroke-width="1"/>
<text x="44" y="58" fill="#c9a227" font-family="${font}" font-size="11" letter-spacing="3.2">Ð:WOW · SEND</text>
<text x="44" y="96" fill="#efe6d2" font-family="${font}" font-size="28" font-weight="700">TO ${xml(dest.label.toUpperCase())}</text>
<text x="44" y="122" fill="#8e8778" font-family="${font}" font-size="11" letter-spacing="2">EARTH'S OUTBOUND LOG</text>
<g transform="translate(628 86)" fill="none" stroke="#c9a227" stroke-width="1.15">
  <circle r="7"/>
  <path d="M-18-10a22 22 0 0 1 0 20"/>
  <path d="M-30-18a34 34 0 0 1 0 36"/>
  <path d="M-42-26a46 46 0 0 1 0 52"/>
</g>
<text x="628" y="142" fill="#c9a227" font-family="${font}" font-size="10" text-anchor="middle" letter-spacing="2">${xml(dest.short)}</text>
${msg}
${vow}
<line x1="44" y1="348" x2="676" y2="348" stroke="#2a261c" stroke-width="1"/>
<text x="44" y="374" fill="#8e8778" font-family="${font}" font-size="11">${xml(handle)}</text>
<text x="360" y="374" fill="#5c574d" font-family="${font}" font-size="11" text-anchor="middle">${xml(when)} UTC</text>
<text x="676" y="374" fill="#c9a227" font-family="${font}" font-size="11" text-anchor="end">POSTAGE PAID</text>
</svg>`;
}
