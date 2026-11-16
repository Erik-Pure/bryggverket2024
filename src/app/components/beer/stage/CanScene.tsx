import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  type Group,
  LinearMipmapLinearFilter,
  MathUtils,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
} from "three";
import type { CanColor, CanSize } from "../../../lib/beer";
import { buildCanGeometry, getFitHeight } from "./canGeometry";
import type { Pose } from "./choreography";
import { createStudioEnvironment } from "./studioEnvironment";

export const CAMERA_FOV = 22;
export const CAMERA_DISTANCE = 10;

const INTRO_SECONDS = 1.7;

interface CanSceneProps {
  pose: Pose;
  /** Rotation around the can's axis, in turns. */
  turns: number;
  width: number;
  height: number;
  canSize: CanSize;
  canColor: CanColor;
  labelUrl: string | null;
  labelAspect: number | null;
  /** Horizontal position (0-1) of the label's front in the artwork. */
  labelFront: number;
  tint: string;
  reducedMotion: boolean;
  /** The reader is idle: let the hover settle. */
  calm: boolean;
  onReady: () => void;
}

function useLabelTexture(url: string | null, onSettled: () => void) {
  const gl = useThree((state) => state.gl);
  const [texture, setTexture] = useState<Texture | null>(null);
  const settled = useRef(onSettled);
  settled.current = onSettled;

  useEffect(() => {
    if (!url) {
      settled.current();
      return;
    }
    let cancelled = false;
    let loaded: Texture | null = null;
    const loader = new TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      url,
      (result) => {
        if (cancelled) {
          result.dispose();
          return;
        }
        result.colorSpace = SRGBColorSpace;
        result.anisotropy = gl.capabilities.getMaxAnisotropy();
        result.minFilter = LinearMipmapLinearFilter;
        result.generateMipmaps = true;
        loaded = result;
        setTexture(result);
        settled.current();
      },
      undefined,
      () => {
        // A blank vessel is better than no vessel at all.
        if (!cancelled) settled.current();
      },
    );
    return () => {
      cancelled = true;
      loaded?.dispose();
      setTexture(null);
    };
  }, [url, gl]);

  return texture;
}

function useStudioEnvironment(tint: string) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const environment = createStudioEnvironment(gl, tint);
    scene.environment = environment;
    return () => {
      scene.environment = null;
      environment.dispose();
    };
  }, [gl, scene, tint]);
}

function usePointer(enabled: boolean) {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    if (!enabled || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled]);
  return pointer;
}

const easeOutQuart = (t: number) => 1 - (1 - t) ** 4;

function CanMeshes({
  geometry,
  texture,
  blackCan,
}: {
  geometry: ReturnType<typeof buildCanGeometry>;
  texture: Texture | null;
  blackCan: boolean;
}) {
  if (!geometry.base || !geometry.body || !geometry.end || !geometry.tab) {
    return null;
  }

  return (
    <>
      <mesh geometry={geometry.base}>
        <meshStandardMaterial color="#d9dbde" metalness={1} roughness={0.3} />
      </mesh>
      <mesh geometry={geometry.body}>
        {blackCan ? (
          <meshPhysicalMaterial
            color="#0a0a0b"
            metalness={0.2}
            roughness={0.36}
            clearcoat={1}
            clearcoatRoughness={0.16}
          />
        ) : (
          <meshPhysicalMaterial
            color="#f3f1ec"
            metalness={0}
            roughness={0.46}
            clearcoat={0.5}
            clearcoatRoughness={0.3}
          />
        )}
      </mesh>
      {[geometry.end, geometry.tab, geometry.rivet].map((part) =>
        part ? (
          <mesh key={part.uuid} geometry={part}>
            {blackCan ? (
              <meshPhysicalMaterial
                color="#1b1b1e"
                metalness={0.85}
                roughness={0.3}
                clearcoat={1}
                clearcoatRoughness={0.12}
              />
            ) : (
              <meshStandardMaterial
                color="#dcdee1"
                metalness={1}
                roughness={0.26}
              />
            )}
          </mesh>
        ) : null,
      )}
      {geometry.score ? (
        <mesh geometry={geometry.score}>
          <meshStandardMaterial
            color={blackCan ? "#060607" : "#9c9ea3"}
            metalness={1}
            roughness={0.45}
          />
        </mesh>
      ) : null}
      {geometry.label && texture ? (
        <mesh geometry={geometry.label}>
          <meshPhysicalMaterial
            map={texture}
            metalness={0}
            roughness={0.56}
            specularIntensity={0.7}
            clearcoat={0.18}
            clearcoatRoughness={0.3}
          />
        </mesh>
      ) : null}
    </>
  );
}

/** Clear glass spirit bottle with cork — no painted body, no lid tab. */
function BottleMeshes({
  geometry,
  texture,
}: {
  geometry: ReturnType<typeof buildCanGeometry>;
  texture: Texture | null;
}) {
  if (!geometry.glass || !geometry.cork || !geometry.corkTop) return null;

  return (
    <>
      {geometry.liquid ? (
        <mesh geometry={geometry.liquid}>
          <meshPhysicalMaterial
            color="#dfd09a"
            metalness={0}
            roughness={0.55}
            transparent
            opacity={0.28}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      <mesh geometry={geometry.glass}>
        <meshPhysicalMaterial
          color="#f7fbff"
          metalness={0}
          roughness={0.05}
          transmission={0.94}
          thickness={1.5}
          ior={1.47}
          envMapIntensity={1.7}
          transparent
          opacity={0.42}
          clearcoat={1}
          clearcoatRoughness={0.04}
        />
      </mesh>
      <mesh geometry={geometry.cork}>
        <meshStandardMaterial color="#c9a56b" roughness={0.92} metalness={0} />
      </mesh>
      <mesh geometry={geometry.corkTop}>
        <meshStandardMaterial color="#5a3720" roughness={0.78} metalness={0} />
      </mesh>
      {geometry.label && texture ? (
        <mesh geometry={geometry.label}>
          <meshPhysicalMaterial
            map={texture}
            metalness={0}
            roughness={0.62}
            clearcoat={0.08}
            clearcoatRoughness={0.45}
            polygonOffset
            polygonOffsetFactor={-1}
            depthWrite
          />
        </mesh>
      ) : null}
    </>
  );
}

export default function CanScene({
  pose,
  turns,
  width,
  height,
  canSize,
  canColor,
  labelUrl,
  labelAspect,
  labelFront,
  tint,
  reducedMotion,
  calm,
  onReady,
}: CanSceneProps) {
  const [ready, setReady] = useState(false);
  const ready$ = useRef(false);
  const texture = useLabelTexture(labelUrl, () => {
    ready$.current = true;
    setReady(true);
    onReady();
  });
  useStudioEnvironment(tint);
  const pointer = usePointer(!reducedMotion);

  const geometry = useMemo(
    () => buildCanGeometry(canSize, labelUrl ? labelAspect : null),
    [canSize, labelUrl, labelAspect],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  const live = useRef<Group>(null);
  const liveSpin = useRef<Group>(null);
  const intro = useRef(reducedMotion ? 1 : 0);
  const eased = useRef({ x: 0, y: 0 });
  const energy = useRef(1);

  const visibleHeight =
    2 * CAMERA_DISTANCE * Math.tan(MathUtils.degToRad(CAMERA_FOV / 2));
  const visibleWidth = visibleHeight * (width / height);
  const scale = (pose.size * visibleHeight) / getFitHeight(canSize);
  const floating = 1 - pose.grounded;

  useFrame((state, elapsed) => {
    const group = live.current;
    const spin = liveSpin.current;
    if (!group || !spin) return;
    const delta = Math.min(elapsed, 0.1);

    if (ready$.current && intro.current < 1) {
      intro.current = Math.min(1, intro.current + delta / INTRO_SECONDS);
    }
    const arrival = easeOutQuart(intro.current);
    const time = state.clock.elapsedTime;
    const motion = reducedMotion ? 0 : 1;

    const follow = 1 - Math.exp(-delta * 4);
    eased.current.x += (pointer.current.x - eased.current.x) * follow;
    eased.current.y += (pointer.current.y - eased.current.y) * follow;

    energy.current +=
      ((calm ? 0 : 1) - energy.current) * (1 - Math.exp(-delta * 2.5));
    const drift = floating * motion * energy.current;

    const hover = Math.sin(time * 0.9) * 0.014 * drift;
    group.position.y = (hover - (1 - arrival) * 0.5) * visibleHeight * 0.5;
    group.rotation.x =
      Math.sin(time * 0.7 + 1.3) * 0.02 * drift +
      eased.current.y * 0.05 * motion;
    group.rotation.z =
      Math.cos(time * 0.55) * 0.016 * drift + (1 - arrival) * -0.35;
    group.scale.setScalar(0.72 + 0.28 * arrival);
    spin.rotation.y =
      (1 - arrival) * -Math.PI * 1.15 + eased.current.x * 0.14 * motion;
  });

  const blackCan = canColor === "black";
  const isBottle = geometry.kind === "bottle";

  return (
    <>
      <directionalLight position={[-5, 6, 9]} intensity={0.85} />
      <directionalLight position={[6, 2, 6]} intensity={0.25} />
      <group
        position={[
          (pose.x * visibleWidth) / 2,
          (pose.y * visibleHeight) / 2,
          0,
        ]}
        visible={ready}
      >
        <group ref={live}>
          <group rotation={[pose.tiltX, 0, pose.tiltZ]} scale={scale}>
            <group ref={liveSpin}>
              <group rotation-y={-(turns + labelFront) * Math.PI * 2}>
                {isBottle ? (
                  <BottleMeshes geometry={geometry} texture={texture} />
                ) : (
                  <CanMeshes
                    geometry={geometry}
                    texture={texture}
                    blackCan={blackCan}
                  />
                )}
              </group>
            </group>
          </group>
        </group>
      </group>
    </>
  );
}
