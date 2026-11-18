import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { NeutralToneMapping } from "three";
import { getCanProportions } from "../../beer/stage/canGeometry";
import {
  buildTimeline,
  type ChapterMark,
  getScenePose,
  getTurns,
  type StageLayout,
} from "./choreography";
import LandingScene, {
  CAMERA_DISTANCE,
  CAMERA_FOV,
  type FeaturedCan,
} from "./LandingScene";

export type LandingCompositionProps = {
  marks: ChapterMark[];
  layout: StageLayout;
  featured: [FeaturedCan, FeaturedCan, FeaturedCan];
  bg: string;
  glow: string;
  reducedMotion: boolean;
  active: boolean;
  calm: boolean;
  onReady: () => void;
};

const MAX_STAGE_WIDTH = 1600;
const MAX_STAGE_HEIGHT = 1000;

/**
 * The landing can film. Scroll seeks through this composition so the
 * choreography stays a plain Remotion timeline.
 */
export default function LandingComposition({
  marks,
  layout,
  featured,
  bg,
  glow,
  reducedMotion,
  active,
  calm,
  onReady,
}: LandingCompositionProps) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const timeline = useMemo(() => buildTimeline(marks, layout), [marks, layout]);
  const scripted = getScenePose(timeline, frame);
  const turns = getTurns(timeline, frame);

  const fitX = layout === "desktop" ? Math.min(1, MAX_STAGE_WIDTH / width) : 1;
  const fitY =
    layout === "desktop" ? Math.min(1, MAX_STAGE_HEIGHT / height) : 1;

  const actors = scripted.actors.map((actor) => ({
    ...actor,
    x: actor.x * fitX,
    y: actor.y * fitY,
    size: actor.size * fitY,
  })) as typeof scripted.actors;

  // Glow / shadow follow the most visible actor.
  let lead = actors[0];
  let leadIndex = 0;
  actors.forEach((actor, index) => {
    if (actor.visible > lead.visible) {
      lead = actor;
      leadIndex = index;
    }
  });
  const proportions = getCanProportions(featured[leadIndex].canSize);
  const centerX = width / 2 + (lead.x * width) / 2;
  const centerY = height / 2 - (lead.y * height) / 2;
  const canHeight = lead.size * height * proportions.height;
  const canWidth = lead.size * height * proportions.width;
  const glowRadius = canHeight * 1.05;
  const shadowWidth =
    canWidth * interpolate(lead.grounded, [0, 1], [1.05, 1.45]);
  const shadowHeight =
    shadowWidth * interpolate(lead.grounded, [0, 1], [0.1, 0.14]);
  const shadowTop =
    centerY + canHeight * interpolate(lead.grounded, [0, 1], [0.66, 0.485]);
  const shadowOpacity =
    interpolate(lead.grounded, [0, 1], [0.18, 0.42]) * lead.visible;

  return (
    <AbsoluteFill>
      {layout === "mobile" ? (
        <AbsoluteFill
          style={{
            opacity: scripted.veil,
            background: `linear-gradient(to bottom, ${bg} 0%, ${bg} 38%, color-mix(in srgb, ${bg} 0%, transparent) 52%)`,
          }}
        />
      ) : null}
      <AbsoluteFill
        style={{
          opacity: scripted.glow * 0.55 * lead.visible,
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
            "radial-gradient(closest-side, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0) 100%)",
        }}
      />
      <ThreeCanvas
        width={width}
        height={height}
        dpr={[1, 1.75]}
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
        <LandingScene
          actors={actors}
          turns={turns}
          width={width}
          height={height}
          featured={featured}
          tint={bg}
          reducedMotion={reducedMotion}
          calm={calm}
          onReady={onReady}
        />
      </ThreeCanvas>
    </AbsoluteFill>
  );
}
