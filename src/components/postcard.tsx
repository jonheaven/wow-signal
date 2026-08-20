import { buildPostcardSvg, utf8Bytes, SEND_MIME } from "@/lib/postcard";
import type { WowEnvelope } from "@/lib/protocol";

export function Postcard({
  envelope,
  caption = true,
}: {
  envelope: WowEnvelope;
  caption?: boolean;
}) {
  const svg = buildPostcardSvg(envelope);
  const src = `data:${SEND_MIME},${encodeURIComponent(svg)}`;
  return (
    <figure className="overflow-hidden border border-gold/40 bg-bg">
      <img
        src={src}
        alt={`Ð:WOW postcard to ${envelope.to}`}
        className="block w-full"
        width={720}
        height={420}
      />
      {caption ? (
        <figcaption className="flex items-center justify-between border-t border-border px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-faint">
          <span className="text-gold">The inscription</span>
          <span>
            {SEND_MIME.split(";")[0]} · {utf8Bytes(svg).toLocaleString()} B
          </span>
        </figcaption>
      ) : null}
    </figure>
  );
}
