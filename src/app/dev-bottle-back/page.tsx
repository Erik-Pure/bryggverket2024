"use client";

/**
 * Temporary QA page: spirit bottle at half-turn so the label reverse is visible.
 * Remove after review.
 */
import { Canvas } from "@react-three/fiber";
import { NeutralToneMapping } from "three";
import CanScene, {
  CAMERA_DISTANCE,
  CAMERA_FOV,
} from "../components/beer/stage/CanScene";
import type { Pose } from "../components/beer/stage/choreography";

const POSE: Pose = {
  x: 0,
  y: 0,
  size: 0.72,
  tiltX: 0.04,
  tiltZ: -0.08,
  grounded: 0.2,
  glow: 0.35,
  veil: 0,
};

export default function DevBottleBackPage() {
  return (
    <>
      <style>{`header, footer { display: none !important; } body { background: #c9b89a; }`}</style>
      <main
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#c9b89a",
          display: "grid",
          placeItems: "center",
          gap: 24,
          padding: 24,
        }}
      >
        {[0.06, 0.5].map((turns) => (
          <div key={turns} style={{ width: 320, height: 640 }}>
            <Canvas
              dpr={[1, 2]}
              camera={{
                fov: CAMERA_FOV,
                position: [0, 0, CAMERA_DISTANCE],
                near: 0.1,
                far: 50,
              }}
              gl={{
                antialias: true,
                alpha: true,
                toneMapping: NeutralToneMapping,
                preserveDrawingBuffer: true,
              }}
              style={{ width: "100%", height: "100%" }}
            >
              <CanScene
                pose={POSE}
                turns={turns}
                width={320}
                height={640}
                canSize="bottle"
                canColor="clear"
                labelUrl="/images/dev-baverhojt-label.jpg"
                labelAspect={1.85}
                labelFront={0.45}
                tint="#cfc8bb"
                reducedMotion
                calm={false}
                onReady={() => {}}
              />
            </Canvas>
          </div>
        ))}
      </main>
    </>
  );
}
