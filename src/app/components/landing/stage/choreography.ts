import { Easing, interpolate } from "remotion";

export type LandingChapter = "hero" | "about" | "drinks" | "events" | "merch";

export type StageLayout = "desktop" | "mobile";

export interface ChapterMark {
  id: LandingChapter;
  start: number;
  end: number;
}

/** One can on the stage. */
export interface ActorPose {
  /** Horizontal position, -1 (left) to 1 (right). */
  x: number;
  /** Vertical position, -1 (bottom) to 1 (top). */
  y: number;
  /** Height as a fraction of the viewport height. */
  size: number;
  tiltX: number;
  tiltZ: number;
  /** 0 = floating, 1 = resting. */
  grounded: number;
  /** 0 = hidden, 1 = fully present. */
  visible: number;
}

export interface ScenePose {
  actors: [ActorPose, ActorPose, ActorPose];
  glow: number;
  /** Soft veil behind the can on mobile so copy stays readable. */
  veil: number;
}

/** Shared silhouette for the anonymous black cans. */
const CAN_SIZE = 0.52;

const HIDDEN: ActorPose = {
  x: 0,
  y: -0.15,
  size: CAN_SIZE,
  tiltX: 0.12,
  tiltZ: 0,
  grounded: 0,
  visible: 0,
};

/**
 * Storyboard
 * 1. Hero — one can from the lid, rising into frame
 * 2. About — the same can rights itself and drifts aside
 * 3. Drinks — two companions join into an even black lineup
 * 4. Events — playful lean, still the pack
 * 5. Merch — pack eases back / softens
 */
const DESKTOP: Record<LandingChapter, ScenePose> = {
  hero: {
    actors: [
      {
        x: 0,
        y: -0.64,
        size: 0.86,
        tiltX: 0.62,
        tiltZ: -0.1,
        grounded: 0,
        visible: 1,
      },
      { ...HIDDEN, x: 0.5, y: -0.25 },
      { ...HIDDEN, x: -0.5, y: -0.25 },
    ],
    glow: 1,
    veil: 0,
  },
  about: {
    actors: [
      {
        x: 0.56,
        y: -0.02,
        size: 0.6,
        // Rights itself from the lid view.
        tiltX: 0.08,
        tiltZ: 0.06,
        grounded: 0,
        visible: 1,
      },
      // Companions hover just off-stage so the join feels continuous.
      {
        x: 1.05,
        y: -0.06,
        size: CAN_SIZE,
        tiltX: 0.1,
        tiltZ: 0.05,
        grounded: 0,
        visible: 0.08,
      },
      {
        x: 1.18,
        y: -0.1,
        size: CAN_SIZE,
        tiltX: 0.08,
        tiltZ: -0.04,
        grounded: 0,
        visible: 0.05,
      },
    ],
    glow: 0.72,
    veil: 0,
  },
  drinks: {
    actors: [
      {
        x: 0.3,
        y: -0.01,
        size: CAN_SIZE,
        tiltX: 0.08,
        tiltZ: -0.04,
        grounded: 0,
        visible: 1,
      },
      {
        x: 0.54,
        y: 0.01,
        size: CAN_SIZE,
        tiltX: 0.09,
        tiltZ: 0.02,
        grounded: 0,
        visible: 1,
      },
      {
        x: 0.78,
        y: -0.01,
        size: CAN_SIZE,
        tiltX: 0.08,
        tiltZ: 0.06,
        grounded: 0,
        visible: 1,
      },
    ],
    glow: 0.9,
    veil: 0,
  },
  events: {
    // Playful lean on the right — same side as the drinks pack.
    actors: [
      {
        x: 0.58,
        y: -0.02,
        size: CAN_SIZE,
        tiltX: 0.14,
        tiltZ: -0.3,
        grounded: 0,
        visible: 1,
      },
      {
        x: 0.82,
        y: -0.06,
        size: CAN_SIZE,
        tiltX: 0.1,
        tiltZ: -0.08,
        grounded: 0,
        visible: 0.55,
      },
      { ...HIDDEN, x: 1.05 },
    ],
    glow: 0.7,
    veil: 0,
  },
  merch: {
    actors: [
      {
        x: 0.72,
        y: -0.1,
        size: 0.38,
        tiltX: 0.05,
        tiltZ: 0.05,
        grounded: 1,
        visible: 0.35,
      },
      {
        x: 0.92,
        y: -0.12,
        size: 0.34,
        tiltX: 0.04,
        tiltZ: 0.03,
        grounded: 1,
        visible: 0.18,
      },
      { ...HIDDEN, x: 0.5, visible: 0 },
    ],
    glow: 0.25,
    veil: 0,
  },
};

const MOBILE: Record<LandingChapter, ScenePose> = {
  hero: {
    actors: [
      {
        x: 0,
        y: -0.4,
        size: 0.64,
        tiltX: 0.52,
        tiltZ: -0.12,
        grounded: 0,
        visible: 1,
      },
      { ...HIDDEN },
      { ...HIDDEN },
    ],
    glow: 1,
    veil: 0,
  },
  about: {
    actors: [
      {
        x: 0,
        y: 0.44,
        size: 0.34,
        tiltX: 0.1,
        tiltZ: 0.06,
        grounded: 0,
        visible: 1,
      },
      { ...HIDDEN, x: 0.35 },
      { ...HIDDEN, x: -0.35 },
    ],
    glow: 0.65,
    veil: 1,
  },
  drinks: {
    actors: [
      {
        x: -0.36,
        y: 0.42,
        size: 0.3,
        tiltX: 0.08,
        tiltZ: -0.06,
        grounded: 0,
        visible: 1,
      },
      {
        x: 0,
        y: 0.46,
        size: 0.3,
        tiltX: 0.1,
        tiltZ: 0.02,
        grounded: 0,
        visible: 1,
      },
      {
        x: 0.36,
        y: 0.42,
        size: 0.3,
        tiltX: 0.08,
        tiltZ: 0.08,
        grounded: 0,
        visible: 1,
      },
    ],
    glow: 0.8,
    veil: 1,
  },
  events: {
    actors: [
      {
        x: -0.22,
        y: 0.44,
        size: 0.28,
        tiltX: 0.1,
        tiltZ: -0.18,
        grounded: 0,
        visible: 1,
      },
      {
        x: 0.22,
        y: 0.42,
        size: 0.28,
        tiltX: 0.08,
        tiltZ: -0.08,
        grounded: 0,
        visible: 0.8,
      },
      { ...HIDDEN },
    ],
    glow: 0.7,
    veil: 1,
  },
  merch: {
    actors: [
      {
        x: 0,
        y: 0.5,
        size: 0.22,
        tiltX: 0.05,
        tiltZ: 0.04,
        grounded: 1,
        visible: 0.32,
      },
      { ...HIDDEN },
      { ...HIDDEN },
    ],
    glow: 0.22,
    veil: 0,
  },
};

/**
 * Axis turns while a chapter is held. No labels — the spin is only for
 * catching studio light on the black aluminium.
 */
const FACING: Record<LandingChapter, { phase: number[]; drift: number[] }> = {
  hero: { phase: [0, 0, 0], drift: [0.06, 0, 0] },
  // Half-turn while the can rights itself between hero and about.
  about: { phase: [0.18, 0, 0], drift: [0.14, 0, 0] },
  drinks: { phase: [0.08, 0.2, 0.34], drift: [0.1, 0.1, 0.1] },
  events: { phase: [0.28, 0.4, 0], drift: [0.1, 0.08, 0] },
  merch: { phase: [0.1, 0.16, 0], drift: [0.04, 0.03, 0] },
};

const ACTOR_KEYS: (keyof ActorPose)[] = [
  "x",
  "y",
  "size",
  "tiltX",
  "tiltZ",
  "grounded",
  "visible",
];

interface Track {
  frames: number[];
  values: number[];
}

export interface Timeline {
  actors: Record<keyof ActorPose, Track>[];
  turns: Track[];
  glow: Track;
  veil: Track;
}

function push(track: Track, frame: number, value: number) {
  const last = track.frames[track.frames.length - 1];
  track.frames.push(last !== undefined && frame <= last ? last + 1 : frame);
  track.values.push(value);
}

function nextWithPhase(minimum: number, phase: number): number {
  const base = Math.floor(minimum) + phase;
  return base >= minimum - 1e-6 ? base : base + 1;
}

const VEIL_FRAMES = 40;
const MIN_TURN = 0.1;

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

export function buildTimeline(
  marks: ChapterMark[],
  layout: StageLayout,
): Timeline {
  const book = layout === "desktop" ? DESKTOP : MOBILE;
  const actors = [0, 1, 2].map(() =>
    Object.fromEntries(
      ACTOR_KEYS.map((key) => [key, { frames: [], values: [] }]),
    ),
  ) as unknown as Timeline["actors"];
  const turns: Track[] = [
    { frames: [], values: [] },
    { frames: [], values: [] },
    { frames: [], values: [] },
  ];
  const glow: Track = { frames: [], values: [] };
  const veils: number[] = [];
  const turned = [0, 0, 0];

  marks.forEach((mark, index) => {
    const target = book[mark.id];
    veils.push(target.veil);
    push(glow, mark.start, target.glow);
    if (mark.end > mark.start) push(glow, mark.end, target.glow);

    target.actors.forEach((actor, actorIndex) => {
      for (const key of ACTOR_KEYS) {
        push(actors[actorIndex][key], mark.start, actor[key]);
        if (mark.end > mark.start) {
          push(actors[actorIndex][key], mark.end, actor[key]);
        }
      }

      const phase = FACING[mark.id].phase[actorIndex];
      const drift = FACING[mark.id].drift[actorIndex];
      const enter =
        index === 0
          ? phase
          : nextWithPhase(turned[actorIndex] + MIN_TURN, phase);
      const leave = enter + drift;
      if (mark.end > mark.start) {
        push(turns[actorIndex], mark.start, enter);
        push(turns[actorIndex], mark.end, leave);
      } else {
        push(turns[actorIndex], mark.start, enter + drift / 2);
      }
      turned[actorIndex] = leave;
    });
  });

  return {
    actors,
    turns,
    glow,
    veil: buildVeil(marks, veils),
  };
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

export function getScenePose(timeline: Timeline, frame: number): ScenePose {
  return {
    actors: [0, 1, 2].map((index) =>
      Object.fromEntries(
        ACTOR_KEYS.map((key) => [
          key,
          sample(timeline.actors[index][key], frame, key !== "visible"),
        ]),
      ),
    ) as unknown as ScenePose["actors"],
    glow: sample(timeline.glow, frame, true),
    veil: sample(timeline.veil, frame, false),
  };
}

export function getTurns(
  timeline: Timeline,
  frame: number,
): [number, number, number] {
  return [
    sample(timeline.turns[0], frame, false),
    sample(timeline.turns[1], frame, false),
    sample(timeline.turns[2], frame, false),
  ];
}
