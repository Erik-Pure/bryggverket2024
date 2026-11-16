"use client";

/**
 * Temporary studio page used to capture the blank spirit bottle as a flat
 * asset for the catalog. Not linked from the site; remove after export.
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
  size: 0.7,
  tiltX: 0.06,
  tiltZ: -0.1,
  grounded: 0.2,
  glow: 0.35,
  veil: 0,
};

export default function DevBottlePage() {
  return (
    <>
      <style>{`header, footer { display: none !important; } body { background: #000; }`}</style>
      <main
        data-bottle-studio
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#111",
          display: "grid",
          placeItems: "center",
        }}
      >
        <div data-bottle-frame style={{ width: 360, height: 780 }}>
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
              turns={0.06}
              width={360}
              height={780}
              canSize="bottle"
              canColor="clear"
              labelUrl={null}
              labelAspect={null}
              labelFront={0.6}
              tint="#cfc8bb"
              reducedMotion
              calm={false}
              onReady={() => {}}
            />
          </Canvas>
        </div>
      </main>
    </>
  );
}
