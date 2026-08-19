import { useEffect, useRef } from "react";
import type { Destination, Transmission } from "@/lib/protocol";

type Pulse = {
  t: number;
  dest: Destination;
  speed: number;
};

export function BeaconCanvas({ signals }: { signals: Transmission[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pulses = useRef<Pulse[]>([]);
  const lastId = useRef<string | null>(null);

  useEffect(() => {
    const newest = signals[0];
    if (newest && newest.id !== lastId.current) {
      lastId.current = newest.id;
      pulses.current.push({
        t: 0,
        dest: newest.destination,
        speed: newest.destination === "mars" ? 0.18 : newest.destination === "moon" ? 0.42 : 0.7,
      });
      if (pulses.current.length > 18) pulses.current.shift();
    }
  }, [signals]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let running = true;
    let w = 0;
    let h = 0;
    let dpr = 1;

    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.2,
      a: Math.random() * 0.5 + 0.15,
    }));

    const read = (name: string, fallback: string) => {
      const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fallback;
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    let t0 = performance.now();

    const draw = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - t0) / 1000, 0.05);
      t0 = now;
      const bg = read("--color-bg", "#08070b");
      const gold = read("--color-gold", "#c9a227");
      const paper = read("--color-fg", "#efe6d2");
      const earth = read("--color-earth", "#5b8494");
      const moon = read("--color-moon", "#9a9588");
      const mars = read("--color-mars", "#b84a2a");
      const faint = read("--color-faint", "#5c574d");

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      for (const s of stars) {
        ctx.fillStyle = `rgba(239,230,210,${s.a})`;
        ctx.fillRect(s.x * w, s.y * h, s.r, s.r);
      }

      const cx = w * 0.38;
      const cy = h * 0.52;
      const scale = Math.min(w, h);

      const earthR = scale * 0.072;
      const moonOrbit = scale * 0.16;
      const marsOrbit = scale * 0.36;
      const phase = reduce ? 0.8 : now / 1000;

      ctx.strokeStyle = faint;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.ellipse(cx, cy, moonOrbit, moonOrbit * 0.34, -0.35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy, marsOrbit, marsOrbit * 0.38, -0.28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      const moonA = phase * 0.35;
      const marsA = phase * 0.12 + 1.2;
      const mx = cx + Math.cos(moonA) * moonOrbit;
      const my = cy + Math.sin(moonA) * moonOrbit * 0.34;
      const rx = cx + Math.cos(marsA) * marsOrbit;
      const ry = cy + Math.sin(marsA) * marsOrbit * 0.38;

      const destPt = (d: Destination): [number, number] => {
        if (d === "moon") return [mx, my];
        if (d === "mars") return [rx, ry];
        if (d === "earth") return [cx + earthR * 1.6, cy - earthR * 0.2];
        return [cx + scale * 0.42, cy - scale * 0.18];
      };

      if (!reduce) {
        for (const p of pulses.current) p.t += dt * p.speed;
        pulses.current = pulses.current.filter((p) => p.t < 1.15);
      }

      for (const p of pulses.current) {
        const [dx, dy] = destPt(p.dest);
        const u = Math.min(p.t, 1);
        const px = cx + (dx - cx) * u;
        const py = cy + (dy - cy) * u;
        ctx.strokeStyle = gold;
        ctx.globalAlpha = 0.25 * (1 - u);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.globalAlpha = 0.9 * (1 - u * 0.4);
        ctx.fillStyle = gold;
        ctx.beginPath();
        ctx.arc(px, py, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      const glow = ctx.createRadialGradient(cx, cy, earthR * 0.2, cx, cy, earthR * 2.4);
      glow.addColorStop(0, "rgba(91,132,148,0.28)");
      glow.addColorStop(1, "rgba(91,132,148,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, earthR * 2.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = earth;
      ctx.beginPath();
      ctx.arc(cx, cy, earthR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(8,7,11,0.28)";
      ctx.beginPath();
      ctx.ellipse(cx - earthR * 0.2, cy - earthR * 0.1, earthR * 0.55, earthR * 0.28, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = gold;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, earthR + 4, -0.4, 0.6);
      ctx.stroke();

      ctx.fillStyle = moon;
      ctx.beginPath();
      ctx.arc(mx, my, scale * 0.016, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = mars;
      ctx.beginPath();
      ctx.arc(rx, ry, scale * 0.028, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(8,7,11,0.25)";
      ctx.beginPath();
      ctx.arc(rx + scale * 0.008, ry - scale * 0.006, scale * 0.01, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = paper;
      ctx.font = `500 11px "IBM Plex Mono", monospace`;
      ctx.globalAlpha = 0.7;
      ctx.fillText("EARTH", cx - 18, cy + earthR + 18);
      ctx.fillText("MOON", mx + 10, my - 8);
      ctx.fillText("MARS", rx + 12, ry + 4);
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
