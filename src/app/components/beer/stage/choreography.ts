import { Easing, interpolate } from "remotion";

export type ChapterId =
  | "hero"
  | "story"
  | "facts"
  | "label"
  | "ingredients"
  | "summary";

export type StageLayout = "desktop" | "mobile";

/** Where a chapter sits on the timeline, in frames. */
export interface ChapterMark {
  id: ChapterId;
  /** Frame at which the chapter is fully in view. */
  start: number;
  /** Frame at which the chapter starts to leave. */
  end: number;
}

export interface Pose {
  /** Horizontal position, -1 (left edge) to 1 (right edge). */
  x: number;
  /** Vertical position, -1 (bottom edge) to 1 (top edge). */
  y: number;
  /** Can height as a fraction of the viewport height. */
  size: number;
  /** Lean towards the viewer, in radians. Shows the lid. */
  tiltX: number;
  /** Sideways lean, in radians. */
  tiltZ: number;
  /** 0 = floating, 1 = resting on the ground. */
  grounded: number;
  /** Strength of the light pool behind the can. */
  glow: number;
  /** Opacity of the veil that hides passing text behind the can (mobile). */
  veil: number;
}

const POSES: Record<StageLayout, Record<ChapterId, Pose>> = {
  desktop: {
    hero: {
      x: 0.44,
      y: -0.04,
      size: 0.76,
      tiltX: 0.2,
      tiltZ: -0.2,
      grounded: 0,
      glow: 1,
      veil: 0,
    },
    story: {
      x: 0.5,
      y: 0,
      size: 0.6,
      tiltX: 0.12,
      tiltZ: 0.09,
      grounded: 0,
      glow: 0.7,
      veil: 0,
    },
    facts: {
      x: -0.5,
      y: 0,
      size: 0.6,
      tiltX: 0.1,
      tiltZ: -0.08,
      grounded: 0,
      glow: 0.7,
      veil: 0,
    },
    label: {
      x: 0,
      y: 0.02,
      size: 0.64,
      tiltX: 0.16,
      tiltZ: 0,
      grounded: 0,
      glow: 1,
      veil: 0,
    },
    ingredients: {
      x: 0.5,
      y: 0,
      size: 0.6,
      tiltX: 0.1,
      tiltZ: 0.08,
      grounded: 0,
      glow: 0.7,
      veil: 0,
    },
    summary: {
      x: -0.46,
      y: 0,
      size: 0.64,
      tiltX: 0.07,
      tiltZ: 0,
      grounded: 1,
      glow: 0.85,
      veil: 0,
    },
  },
  mobile: {
    hero: {
      x: 0,
      y: 0.3,
      size: 0.4,
      tiltX: 0.2,
      tiltZ: -0.16,
      grounded: 0,
      glow: 1,
      veil: 0,
    },
    story: {
      x: 0,
      y: 0.5,
      size: 0.3,
      tiltX: 0.12,
      tiltZ: 0.07,
      grounded: 0,
      glow: 0.7,
      veil: 1,
    },
    facts: {
      x: 0,
      y: 0.5,
      size: 0.3,
      tiltX: 0.1,
      tiltZ: -0.07,
      grounded: 0,
      glow: 0.7,
      veil: 1,
    },
    label: {
      x: 0,
      y: 0.16,
      size: 0.5,
      tiltX: 0.16,
      tiltZ: 0,
      grounded: 0,
      glow: 1,
      veil: 0,
    },
    ingredients: {
      x: 0,
      y: 0.5,
      size: 0.3,
      tiltX: 0.1,
      tiltZ: 0.07,
      grounded: 0,
      glow: 0.7,
      veil: 1,
    },
    summary: {
      x: 0,
      y: 0.5,
      size: 0.3,
      tiltX: 0.07,
      tiltZ: 0,
      grounded: 1,
      glow: 0.85,
      veil: 1,
    },
  },
};

/**
 * Which part of the label faces the viewer while a chapter is in view,
 * in turns (0 = front), and how far the can turns while it stays there.
 */
const FACING: Record<ChapterId, { phase: number; drift: number }> = {
  hero: { phase: 0, drift: 0 },
  story: { phase: 0.26, drift: 0.12 },
  // The back of the label, where the brewery prints the facts.
  facts: { phase: 0.48, drift: 0.12 },
  // One full revolution, front to front.
  label: { phase: 0, drift: 1 },
  ingredients: { phase: 0.48, drift: 0.12 },
  summary: { phase: 0, drift: 0 },
};

const MIN_TURN_BETWEEN_CHAPTERS = 0.12;

interface Track {
  frames: number[];
  values: number[];
}

export interface Timeline {
  pose: Record<keyof Pose, Track>;
  turns: Track;
}

function nextWithPhase(minimum: number, phase: number): number {
  const base = Math.floor(minimum) + phase;
  return base >= minimum - 1e-6 ? base : base + 1;
}

function push(track: Track, frame: number, value: number) {
  const last = track.frames[track.frames.length - 1];
  // Keyframes must be strictly increasing, even if two chapters touch.
  track.frames.push(last !== undefined && frame <= last ? last + 1 : frame);
  track.values.push(value);
}

const POSE_KEYS: (keyof Pose)[] = [
  "x",
  "y",
  "size",
  "tiltX",
  "tiltZ",
  "grounded",
  "glow",
  "veil",
];

/** Keys that simply hold during a chapter and ease in between. */
const TRAVEL_KEYS = POSE_KEYS.filter((key) => key !== "veil");

/** Frames it takes the veil to open or close. */
const VEIL_FRAMES = 45;

/**
 * The veil must be closed whenever copy can pass behind the can, so it does
 * not ease between chapters like the rest of the pose. It only opens once an
 * open chapter (hero, label) has fully arrived and closes before it leaves.
 */
function buildVeil(marks: ChapterMark[], veils: number[]): Track {
  const track: Track = { frames: [], values: [] };
  marks.forEach((mark, index) => {
    const veil = veils[index];
    const closedBefore = index > 0 && veils[index - 1] > 0;
    const closedAfter = index < marks.length - 1 && veils[index + 1] > 0;
    if (veil > 0) {
      push(track, mark.start, veil);
      push(track, mark.end, veil);
      return;
    }
    if (mark.end - mark.start < VEIL_FRAMES * 2) {
      push(track, mark.start, 0);
      if (closedAfter) push(track, mark.end + VEIL_FRAMES, veils[index + 1]);
      return;
    }
    if (closedBefore) {
      push(track, mark.start, veils[index - 1]);
      push(track, mark.start + VEIL_FRAMES, 0);
    } else {
      push(track, mark.start, 0);
    }
    if (closedAfter) {
      push(track, mark.end - VEIL_FRAMES, 0);
      push(track, mark.end, veils[index + 1]);
    } else {
      push(track, mark.end, 0);
    }
  });
  return track;
}

export type PoseOverrides = Partial<Record<ChapterId, Partial<Pose>>>;

/** Turns the measured chapter positions into keyframes for the can. */
export function buildTimeline(
  marks: ChapterMark[],
  layout: StageLayout,
  overrides: PoseOverrides = {},
): Timeline {
  const pose = Object.fromEntries(
    POSE_KEYS.map((key) => [key, { frames: [], values: [] }]),
  ) as unknown as Record<keyof Pose, Track>;
  const turns: Track = { frames: [], values: [] };

  let turned = 0;
  const veils: number[] = [];
  marks.forEach((mark, index) => {
    const target = { ...POSES[layout][mark.id], ...overrides[mark.id] };
    veils.push(target.veil);
    for (const key of TRAVEL_KEYS) {
      push(pose[key], mark.start, target[key]);
      if (mark.end > mark.start) {
        push(pose[key], mark.end, target[key]);
      }
    }

    const { phase, drift } = FACING[mark.id];
    const enter =
      index === 0
        ? phase
        : nextWithPhase(turned + MIN_TURN_BETWEEN_CHAPTERS, phase);
    const leave = enter + drift;
    if (mark.end > mark.start) {
      push(turns, mark.start, enter);
      push(turns, mark.end, leave);
    } else {
      push(turns, mark.start, enter + drift / 2);
    }
    turned = leave;
  });
  pose.veil = buildVeil(marks, veils);

  return { pose, turns };
}

const travel = Easing.inOut(Easing.cubic);

function sample(track: Track, frame: number, eased: boolean): number {
  if (track.frames.length === 0) return 0;
  if (track.frames.length === 1) return track.values[0];
  return interpolate(frame, track.frames, track.values, {
    easing: eased ? travel : Easing.linear,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

export function getPose(timeline: Timeline, frame: number): Pose {
  return Object.fromEntries(
    POSE_KEYS.map((key) => [
      key,
      sample(timeline.pose[key], frame, key !== "veil"),
    ]),
  ) as unknown as Pose;
}

/** Rotation around the can's own axis, in turns. */
export function getTurns(timeline: Timeline, frame: number): number {
  return sample(timeline.turns, frame, false);
}

/** Progress (0-1) through a chapter's own stretch of the timeline. */
export function getChapterProgress(
  marks: ChapterMark[],
  id: ChapterId,
  frame: number,
): number {
  const mark = marks.find((candidate) => candidate.id === id);
  if (!mark || mark.end <= mark.start) return 0;
  return interpolate(frame, [mark.start, mark.end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}
