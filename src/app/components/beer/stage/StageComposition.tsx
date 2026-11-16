import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { NeutralToneMapping } from "three";
import type { CanColor, CanSize } from "../../../lib/beer";
import CanScene, { CAMERA_DISTANCE, CAMERA_FOV } from "./CanScene";
import { getCanProportions } from "./canGeometry";
import {
  buildTimeline,
  type ChapterMark,
  getPose,
  getTurns,
  type PoseOverrides,
  type StageLayout,
} from "./choreography";

/** Free vertical space above the hero copy, in composition pixels. */
export interface HeroBox {
  top: number;
  bottom: number;
}

// A type alias (not an interface) so it satisfies the Player's props type.
export type StageProps = {
  marks: ChapterMark[];
  layout: StageLayout;
  /** On small screens the hero can is fitted into this box. */
  heroBox: HeroBox | null;
  canSize: CanSize;
  canColor: CanColor;
  labelUrl: string | null;
  labelAspect: number | null;
  labelFront: number;
  bg: string;
  glow: string;
  ink: string;
  isDark: boolean;
  fontFamily: string;
  reducedMotion: boolean;
  /** False while the stage is off screen or idle, to stop rendering. */
  active: boolean;
  /** True once the reader has been idle for a while: the hover settles. */
  calm: boolean;
  onReady: () => void;
};

/**
 * On large desktop screens the can is composed within this box, centred in
 * the viewport, so it keeps its proportions to the (capped) page column
 * instead of growing with the monitor. Mirrored by the hero title in CSS.
 */
const MAX_STAGE_WIDTH = 1760;
const MAX_STAGE_HEIGHT = 1100;

/** Frames the turntable read-out takes to fade in and out. */
const DIAL_FADE = 30;

/**
 * Read-out for the label chapter. It lives inside the pinned part of the
 * chapter only, so it never meets the caption scrolling in or out.
 */
function Dial({
  duration,
  ink,
  fontFamily,
  top,
  left,
}: {
  duration: number;
  ink: string;
  fontFamily: string;
  top: number;
  left: number;
}) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(
    frame,
    [0, DIAL_FADE, duration - DIAL_FADE, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const degrees = Math.round(progress * 360);
  const trackWidth = 168;

  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        transform: "translateX(-50%)",
        opacity,
        color: ink,
        fontFamily,
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.14em",
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ opacity: 0.6 }}>0°</span>
      <div
        style={{
          position: "relative",
          width: trackWidth,
          height: 2,
          borderRadius: 2,
          background: `color-mix(in srgb, ${ink} 24%, transparent)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${progress * 100}%`,
            borderRadius: 2,
            background: ink,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -30,
            left: `${progress * 100}%`,
            transform: "translateX(-50%)",
            fontSize: 18,
            letterSpacing: "0.04em",
          }}
        >
          {degrees}°
        </div>
        <div
          style={{
            position: "absolute",
            top: -4,
            left: `${progress * 100}%`,
            width: 10,
            height: 10,
            marginLeft: -5,
            borderRadius: 10,
            background: ink,
          }}
        />
      </div>
      <span style={{ opacity: 0.6 }}>360°</span>
    </div>
  );
}

/**
 * The can's film. Every frame is a scroll position: the page seeks through
 * this composition instead of playing it, so the choreography stays a plain
 * Remotion timeline.
 */
export default function StageComposition({
  marks,
  layout,
  heroBox,
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
  onReady,
}: StageProps) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const proportions = getCanProportions(canSize);
  const timeline = useMemo(() => {
    const overrides: PoseOverrides = {};
    const space = heroBox ? heroBox.bottom - heroBox.top : 0;
    if (layout === "mobile" && heroBox && space > 140) {
      // Fit the tilted can between the header and the title, whatever the
      // title length or screen size.
      const canHeight = Math.min(
        (space * 0.86) / (proportions.height + proportions.width * 0.17),
        (width * 0.62) / proportions.width,
      );
      overrides.hero = {
        y: 1 - (heroBox.top + heroBox.bottom) / height,
        size: canHeight / height,
      };
    }
    return buildTimeline(marks, layout, overrides);
  }, [
    marks,
    layout,
    heroBox,
    proportions.height,
    proportions.width,
    width,
    height,
  ]);
  const scripted = getPose(timeline, frame);
  const fitX = layout === "desktop" ? Math.min(1, MAX_STAGE_WIDTH / width) : 1;
  const fitY =
    layout === "desktop" ? Math.min(1, MAX_STAGE_HEIGHT / height) : 1;
  const pose = {
    ...scripted,
    x: scripted.x * fitX,
    y: scripted.y * fitY,
    size: scripted.size * fitY,
  };
  const turns = getTurns(timeline, frame);
  const centerX = width / 2 + (pose.x * width) / 2;
  const centerY = height / 2 - (pose.y * height) / 2;
  const canHeight = pose.size * height * proportions.height;
  const canWidth = pose.size * height * proportions.width;

  const glowRadius = canHeight * 0.92;
  const shadowWidth =
    canWidth * interpolate(pose.grounded, [0, 1], [1.05, 1.5]);
  const shadowHeight =
    shadowWidth * interpolate(pose.grounded, [0, 1], [0.1, 0.14]);
  const shadowTop =
    centerY + canHeight * interpolate(pose.grounded, [0, 1], [0.66, 0.485]);
  const shadowOpacity = interpolate(pose.grounded, [0, 1], [0.2, 0.46]);

  const labelMark = marks.find((mark) => mark.id === "label");
  const labelDuration = labelMark ? labelMark.end - labelMark.start : 0;

  return (
    <AbsoluteFill>
      {layout === "mobile" ? (
        <AbsoluteFill
          style={{
            opacity: pose.veil,
            background: `linear-gradient(to bottom, ${bg} 0%, ${bg} 41%, color-mix(in srgb, ${bg} 0%, transparent) 50%)`,
          }}
        />
      ) : null}
      <AbsoluteFill
        style={{
          opacity: pose.glow * (isDark ? 0.75 : 0.6),
          background: `radial-gradient(circle ${glowRadius}px at ${centerX}px ${centerY}px, ${glow} 0%, color-mix(in srgb, ${glow} 0%, transparent) 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: centerX - shadowWidth / 2,
          top: shadowTop - shadowHeight / 2,
          width: shadowWidth,
          height: shadowHeight,
          opacity: shadowOpacity,
          background:
            "radial-gradient(closest-side, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0) 100%)",
        }}
      />
      <ThreeCanvas
        width={width}
        height={height}
        dpr={[1, 2]}
        frameloop={active ? "always" : "never"}
        camera={{
          fov: CAMERA_FOV,
          position: [0, 0, CAMERA_DISTANCE],
          near: 0.1,
          far: 50,
        }}
        gl={{ antialias: true, alpha: true, toneMapping: NeutralToneMapping }}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <CanScene
          pose={pose}
          turns={turns}
          width={width}
          height={height}
          canSize={canSize}
          canColor={canColor}
          labelUrl={labelUrl}
          labelAspect={labelAspect}
          labelFront={labelFront}
          tint={bg}
          reducedMotion={reducedMotion}
          calm={calm}
          onReady={onReady}
        />
      </ThreeCanvas>
      {labelMark && labelDuration > DIAL_FADE * 2 ? (
        <Sequence
          from={labelMark.start}
          durationInFrames={labelDuration}
          layout="none"
        >
          <Dial
            duration={labelDuration}
            ink={ink}
            fontFamily={fontFamily}
            left={centerX}
            top={centerY + canHeight / 2 + Math.max(56, canHeight * 0.16)}
          />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
}
