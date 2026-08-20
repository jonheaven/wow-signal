import { useEffect, useRef, useState } from "react";

const HOLD_MS = 720;

export function StampButton({
  disabled,
  busy,
  label = "Hold to stamp",
  busyLabel = "Stamping…",
  onStamp,
}: {
  disabled?: boolean;
  busy?: boolean;
  label?: string;
  busyLabel?: string;
  onStamp: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [reduce, setReduce] = useState(false);
  const raf = useRef<number>(0);
  const start = useRef(0);
  const done = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function cancel() {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = 0;
    start.current = 0;
    if (!done.current) setProgress(0);
  }

  function tick(now: number) {
    const elapsed = now - start.current;
    const p = Math.min(1, elapsed / HOLD_MS);
    setProgress(p);
    if (p >= 1) {
      done.current = true;
      onStamp();
      return;
    }
    raf.current = requestAnimationFrame(tick);
  }

  function begin(e: React.PointerEvent | React.KeyboardEvent) {
    if (disabled || busy) return;
    if ("button" in e && e.button !== 0) return;
    if ("key" in e && e.key !== " " && e.key !== "Enter") return;
    if ("key" in e) e.preventDefault();
    if (reduce) {
      onStamp();
      return;
    }
    done.current = false;
    start.current = performance.now();
    setProgress(0.04);
    raf.current = requestAnimationFrame(tick);
  }

  function onKeyUp(e: React.KeyboardEvent) {
    if (e.key === " " || e.key === "Enter") cancel();
  }

  return (
    <button
      type="button"
      disabled={disabled || busy}
      onPointerDown={begin}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onKeyDown={begin}
      onKeyUp={onKeyUp}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={label}
      className="relative inline-flex h-12 min-w-44 select-none items-center justify-center overflow-hidden bg-gold px-6 text-[12px] font-medium uppercase tracking-[0.18em] text-bg transition-transform duration-150 ease-out active:scale-[0.96] disabled:opacity-40 hover:bg-gold-hot"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 bg-gold-hot"
        style={{ width: `${Math.round(progress * 100)}%` }}
      />
      <span className="relative">{busy ? busyLabel : label}</span>
    </button>
  );
}
