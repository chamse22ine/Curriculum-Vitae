"use client";

import * as React from "react";

const CELL = 44;
const DRIFT = 6;      // px / s
const SWEEP = 9000;   // ms entre deux balayages
const FPS = 30;

/** Trame de mesure en fond du portfolio uniquement (jamais dans le calculateur) */
export function MeasureGrid() {
  const ref = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, last = 0, running = true;
    const t0 = performance.now();

    const ink = () =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--ink-rgb").trim() || "26, 25, 23";

    const draw = (now: number, withSweep: boolean) => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== w * dpr || cv.height !== h * dpr) {
        cv.width = w * dpr; cv.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const off = (((now - t0) / 1000 * DRIFT) % CELL + CELL) % CELL;
      const rgb = ink();

      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${rgb}, 0.05)`;
      ctx.beginPath();
      for (let x = -CELL + off; x < w + CELL; x += CELL) {
        ctx.moveTo(Math.round(x) + 0.5, 0);
        ctx.lineTo(Math.round(x) + 0.5, h);
      }
      for (let y = -CELL + off; y < h + CELL; y += CELL) {
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(w, Math.round(y) + 0.5);
      }
      ctx.stroke();

      const phase = ((now - t0) % SWEEP) / SWEEP;
      if (withSweep && phase < 0.28) {
        const x = -160 + (phase / 0.28) * (w + 320);
        const g = ctx.createLinearGradient(x, 0, x + 160, 0);
        g.addColorStop(0, `rgba(${rgb}, 0)`);
        g.addColorStop(0.5, `rgba(${rgb}, 0.06)`);
        g.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(x, 0, 160, h);
      }
    };

    const loop = (now: number) => {
      if (!running) return;
      if (now - last > 1000 / FPS) { draw(now, true); last = now; }
      raf = requestAnimationFrame(loop);
    };

    // Mouvement réduit : la trame est peinte une seule fois, sans balayage
    draw(performance.now(), !reduced);
    if (!reduced) raf = requestAnimationFrame(loop);

    const onVis = () => {
      cancelAnimationFrame(raf);
      running = !document.hidden && !reduced;
      if (running) raf = requestAnimationFrame(loop);
    };

    // Sans boucle, on repeint quand le thème (classe .dark) ou la taille change
    const repaint = () => {
      if (reduced) draw(performance.now(), false);
    };
    const observer = new MutationObserver(repaint);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });

    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", repaint);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", repaint);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
