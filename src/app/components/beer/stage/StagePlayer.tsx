"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChapterId, ChapterMark, StageLayout } from "./choreography";
import StageComposition, {
  type HeroBox,
  type StageProps,
} from "./StageComposition";

/** Scroll distance covered by one frame of the composition. */
const PX_PER_FRAME = 2;
const FPS = 60;
/** Time constant of the playhead easing towards the scroll position. */
const EASE_SECONDS = 0.1;
const DESKTOP_QUERY = "(min-width: 900px)";

/** Idle time before the can's hover settles, and then before rendering
 * pauses altogether, so a reader is not kept at 60 fps by a still image. */
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

/** Space reserved for the fixed site header. */
const HEADER_CLEARANCE = 60;

export type StagePlayerProps = Omit<
  StageProps,
  | "marks"
  | "layout"
  | "heroBox"
  | "reducedMotion"
  | "onReady"
  | "active"
  | "calm"
> & {
  onReady: () => void;
};

interface Metrics {
  width: number;
  height: number;
  duration: number;
  marks: ChapterMark[];
  layout: StageLayout;
  heroBox: HeroBox | null;
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
    a.heroBox?.top === b.heroBox?.top &&
    a.heroBox?.bottom === b.heroBox?.bottom &&
    a.marks.length === b.marks.length &&
    a.marks.every(
      (mark, index) =>
        mark.id === b.marks[index].id &&
        mark.start === b.marks[index].start &&
        mark.end === b.marks[index].end,
    )
  );
}

/**
 * Lays the page out as a timeline. A chapter's `start` is the scroll
 * position where it has arrived and `end` where it begins to leave, so the
 * can holds its pose while a chapter is read and travels in between.
 *
 * "Arrived" means the chapter's edge crossed the focus line: the middle of
 * the screen on desktop, lower on mobile where copy sits below the can.
 */
function measure(host: HTMLElement): Metrics | null {
  const track = host.closest<HTMLElement>("[data-beer-track]");
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

  const spans: { id: ChapterId; start: number; end: number }[] = [];
  for (const chapter of track.querySelectorAll<HTMLElement>("[data-chapter]")) {
    const rect = chapter.getBoundingClientRect();
    const top = rect.top + window.scrollY - trackTop;
    const id = chapter.dataset.chapter as ChapterId;
    // The pinned label chapter always runs from pin to unpin.
    const pinned = id === "label" || layout === "desktop";
    const focus = (pinned ? 0.5 : 0.68) * height;
    const travel = (pinned ? 1 : 0.5) * height;
    const start = top - focus + travel / 2;
    const end = top + rect.height - focus - travel / 2;
    const middle = (start + end) / 2;
    spans.push({
      id,
      start: clamp(end < start ? middle : start),
      end: clamp(end < start ? middle : end),
    });
  }

  // Keep every move between two chapters short enough to feel deliberate.
  const longestMove = (layout === "desktop" ? 1 : 0.5) * height;
  const marks: ChapterMark[] = spans.map((span, index) => {
    const next = spans[index + 1];
    const end = next ? Math.max(span.end, next.start - longestMove) : span.end;
    return {
      id: span.id,
      start: Math.round(span.start / PX_PER_FRAME),
      end: Math.round(Math.max(span.start, end) / PX_PER_FRAME),
    };
  });

  const heroCopy = track.querySelector<HTMLElement>("[data-hero-copy]");
  const heroBox = heroCopy
    ? {
        top: HEADER_CLEARANCE,
        bottom: Math.round(
          heroCopy.getBoundingClientRect().top + window.scrollY - trackTop,
        ),
      }
    : null;

  return {
    width,
    height,
    duration: Math.max(2, Math.round(range / PX_PER_FRAME) + 1),
    marks,
    layout,
    heroBox,
    trackTop: Math.round(trackTop),
  };
}

export default function StagePlayer({ onReady, ...scene }: StagePlayerProps) {
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

    const track = element.closest<HTMLElement>("[data-beer-track]");
    const resize = new ResizeObserver(update);
    resize.observe(element);
    if (track) resize.observe(track);
    window.addEventListener("resize", update);

    // Rendering pauses once the can has scrolled out of view.
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

  // Scroll is the playhead: seek the composition to the scroll position,
  // eased so wheel steps turn into one continuous move.
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

  // The entrance starts when the label has loaded, however long that took.
  const handleReady = useCallback(() => {
    touch.current();
    onReady();
  }, [onReady]);
  const active = visible && energy !== "asleep";
  const calm = energy !== "awake";

  const {
    canSize,
    canColor,
    labelUrl,
    labelAspect,
    labelFront,
    bg,
    glow,
    ink,
    isDark,
    fontFamily,
  } = scene;
  const marks = metrics?.marks;
  const layout = metrics?.layout;
  const heroTop = metrics?.heroBox?.top;
  const heroBottom = metrics?.heroBox?.bottom;
  const inputProps = useMemo<StageProps | null>(
    () =>
      marks && layout
        ? {
            marks,
            layout,
            heroBox:
              heroTop !== undefined && heroBottom !== undefined
                ? { top: heroTop, bottom: heroBottom }
                : null,
            canSize,
            canColor,
            labelUrl,
            labelAspect,
            labelFront,
            bg,
            glow,
            ink,
            isDark,
            fontFamily,
            reducedMotion,
            active,
            calm,
            onReady: handleReady,
          }
        : null,
    [
      marks,
      layout,
      heroTop,
      heroBottom,
      canSize,
      canColor,
      labelUrl,
      labelAspect,
      labelFront,
      bg,
      glow,
      ink,
      isDark,
      fontFamily,
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
          component={StageComposition}
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
