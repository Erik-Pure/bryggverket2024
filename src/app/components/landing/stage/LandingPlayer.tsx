"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChapterMark, LandingChapter, StageLayout } from "./choreography";
import LandingComposition, {
  type LandingCompositionProps,
} from "./LandingComposition";
import type { FeaturedCan } from "./LandingScene";

const PX_PER_FRAME = 2;
const FPS = 60;
const EASE_SECONDS = 0.1;
const DESKTOP_QUERY = "(min-width: 900px)";
const CALM_AFTER_MS = 6000;
const SLEEP_AFTER_MS = 2500;
const ACTIVITY_EVENTS = [
  "scroll",
  "pointermove",
  "pointerdown",
  "touchstart",
  "keydown",
] as const;

type Energy = "awake" | "calm" | "asleep";

export type LandingPlayerProps = {
  featured: [FeaturedCan, FeaturedCan, FeaturedCan];
  bg: string;
  glow: string;
  onReady: () => void;
};

interface Metrics {
  width: number;
  height: number;
  duration: number;
  marks: ChapterMark[];
  layout: StageLayout;
  trackTop: number;
}

function sameMetrics(a: Metrics | null, b: Metrics): boolean {
  return (
    a !== null &&
    a.width === b.width &&
    a.height === b.height &&
    a.duration === b.duration &&
    a.layout === b.layout &&
    a.trackTop === b.trackTop &&
    a.marks.length === b.marks.length &&
    a.marks.every(
      (mark, index) =>
        mark.id === b.marks[index].id &&
        mark.start === b.marks[index].start &&
        mark.end === b.marks[index].end,
    )
  );
}

function measure(host: HTMLElement): Metrics | null {
  const track = host.closest<HTMLElement>("[data-landing-track]");
  if (!track) return null;
  const width = Math.round(host.clientWidth);
  const height = Math.round(host.clientHeight);
  if (width < 2 || height < 2) return null;

  const layout: StageLayout = window.matchMedia(DESKTOP_QUERY).matches
    ? "desktop"
    : "mobile";
  const trackTop = track.getBoundingClientRect().top + window.scrollY;
  const range = Math.max(0, track.offsetHeight - height);
  const clamp = (px: number) => Math.min(range, Math.max(0, px));

  const spans: { id: LandingChapter; start: number; end: number }[] = [];
  for (const chapter of track.querySelectorAll<HTMLElement>("[data-chapter]")) {
    const rect = chapter.getBoundingClientRect();
    const top = rect.top + window.scrollY - trackTop;
    const id = chapter.dataset.chapter as LandingChapter;
    const pinned = layout === "desktop";
    const focus = (pinned ? 0.5 : 0.62) * height;
    const travel = (pinned ? 1 : 0.45) * height;
    const start = top - focus + travel / 2;
    const end = top + rect.height - focus - travel / 2;
    const middle = (start + end) / 2;
    spans.push({
      id,
      start: clamp(end < start ? middle : start),
      end: clamp(end < start ? middle : end),
    });
  }

  const longestMove = (layout === "desktop" ? 0.9 : 0.45) * height;
  const marks: ChapterMark[] = spans.map((span, index) => {
    const next = spans[index + 1];
    const end = next ? Math.max(span.end, next.start - longestMove) : span.end;
    return {
      id: span.id,
      start: Math.round(span.start / PX_PER_FRAME),
      end: Math.round(Math.max(span.start, end) / PX_PER_FRAME),
    };
  });

  return {
    width,
    height,
    duration: Math.max(2, Math.round(range / PX_PER_FRAME) + 1),
    marks,
    layout,
    trackTop: Math.round(trackTop),
  };
}

export default function LandingPlayer({
  featured,
  bg,
  glow,
  onReady,
}: LandingPlayerProps) {
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<PlayerRef>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visible, setVisible] = useState(true);
  const [energy, setEnergy] = useState<Energy>("awake");
  const touch = useRef<() => void>(() => {});

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const update = () => {
      const next = measure(element);
      if (next) setMetrics((prev) => (sameMetrics(prev, next) ? prev : next));
    };
    update();

    const track = element.closest<HTMLElement>("[data-landing-track]");
    const resize = new ResizeObserver(update);
    resize.observe(element);
    if (track) resize.observe(track);
    window.addEventListener("resize", update);

    const visibility = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    visibility.observe(element);

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setReducedMotion(motion.matches);
    onMotion();
    motion.addEventListener("change", onMotion);

    return () => {
      resize.disconnect();
      visibility.disconnect();
      window.removeEventListener("resize", update);
      motion.removeEventListener("change", onMotion);
    };
  }, []);

  useEffect(() => {
    let last = performance.now();
    let level: Energy = "awake";
    const set = (next: Energy) => {
      if (next === level) return;
      level = next;
      setEnergy(next);
    };
    const onActivity = () => {
      last = performance.now();
      set("awake");
    };
    touch.current = onActivity;
    const timer = window.setInterval(() => {
      const idle = performance.now() - last;
      if (idle > CALM_AFTER_MS + SLEEP_AFTER_MS) set("asleep");
      else if (idle > CALM_AFTER_MS) set("calm");
    }, 500);
    for (const name of ACTIVITY_EVENTS) {
      window.addEventListener(name, onActivity, { passive: true });
    }
    return () => {
      window.clearInterval(timer);
      for (const name of ACTIVITY_EVENTS) {
        window.removeEventListener(name, onActivity);
      }
    };
  }, []);

  useEffect(() => {
    if (!metrics) return;
    const target = () =>
      Math.min(
        metrics.duration - 1,
        Math.max(0, (window.scrollY - metrics.trackTop) / PX_PER_FRAME),
      );

    let current = target();
    let request = 0;
    let running = false;
    let previous = performance.now();
    player.current?.seekTo(Math.round(current));

    const tick = (now: number) => {
      const delta = Math.min(0.1, (now - previous) / 1000);
      previous = now;
      const goal = target();
      current += reducedMotion
        ? goal - current
        : (goal - current) * (1 - Math.exp(-delta / EASE_SECONDS));
      if (Math.abs(goal - current) < 0.2) current = goal;
      player.current?.seekTo(Math.round(current));
      if (current === goal) {
        running = false;
        return;
      }
      request = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (running) return;
      running = true;
      previous = performance.now();
      request = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", wake, { passive: true });
    wake();
    return () => {
      window.removeEventListener("scroll", wake);
      cancelAnimationFrame(request);
    };
  }, [metrics, reducedMotion]);

  const handleReady = useCallback(() => {
    touch.current();
    onReady();
  }, [onReady]);

  const active = visible && energy !== "asleep";
  const calm = energy !== "awake";

  const marks = metrics?.marks;
  const layout = metrics?.layout;
  const inputProps = useMemo<LandingCompositionProps | null>(
    () =>
      marks && layout
        ? {
            marks,
            layout,
            featured,
            bg,
            glow,
            reducedMotion,
            active,
            calm,
            onReady: handleReady,
          }
        : null,
    [
      marks,
      layout,
      featured,
      bg,
      glow,
      reducedMotion,
      active,
      calm,
      handleReady,
    ],
  );

  return (
    <div ref={host} style={{ position: "absolute", inset: 0 }}>
      {metrics && inputProps ? (
        <Player
          ref={player}
          component={LandingComposition}
          inputProps={inputProps}
          durationInFrames={metrics.duration}
          compositionWidth={metrics.width}
          compositionHeight={metrics.height}
          fps={FPS}
          style={{ width: "100%", height: "100%" }}
          controls={false}
          autoPlay={false}
          clickToPlay={false}
          doubleClickToFullscreen={false}
          spaceKeyToPlayOrPause={false}
          allowFullscreen={false}
          errorFallback={() => null}
        />
      ) : null}
    </div>
  );
}
