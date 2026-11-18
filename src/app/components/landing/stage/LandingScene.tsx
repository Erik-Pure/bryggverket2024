import { useFrame, useThree } from "@react-three/fiber";
import {
  type MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type Group,
  LinearMipmapLinearFilter,
  MathUtils,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
} from "three";
import type { CanColor, CanSize } from "../../../lib/beer";
import { buildCanGeometry, getFitHeight } from "../../beer/stage/canGeometry";
import { createStudioEnvironment } from "../../beer/stage/studioEnvironment";
import { BottleMeshes, CanMeshes } from "../../beer/stage/VesselMeshes";
import type { ActorPose } from "./choreography";

export const CAMERA_FOV = 22;
export const CAMERA_DISTANCE = 10;

const INTRO_SECONDS = 1.6;

export interface FeaturedCan {
  canSize: CanSize;
  canColor: CanColor;
  labelUrl: string | null;
  labelAspect: number | null;
  labelFront: number;
}

interface LandingSceneProps {
  actors: [ActorPose, ActorPose, ActorPose];
  turns: [number, number, number];
  width: number;
  height: number;
  featured: [FeaturedCan, FeaturedCan, FeaturedCan];
  tint: string;
  reducedMotion: boolean;
  calm: boolean;
  onReady: () => void;
}

function useLabelTexture(url: string | null) {
  const gl = useThree((state) => state.gl);
  const [texture, setTexture] = useState<Texture | null>(null);

  useEffect(() => {
    if (!url) return;
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
      },
      undefined,
      () => {},
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

function CanActor({
  pose,
  turns,
  featured,
  visibleHeight,
  visibleWidth,
  pointer,
  reducedMotion,
  calm,
  ready,
  intro,
}: {
  pose: ActorPose;
  turns: number;
  featured: FeaturedCan;
  visibleHeight: number;
  visibleWidth: number;
  pointer: MutableRefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
  calm: boolean;
  ready: boolean;
  intro: MutableRefObject<number>;
}) {
  const texture = useLabelTexture(featured.labelUrl);
  const geometry = useMemo(
    () =>
      buildCanGeometry(
        featured.canSize,
        featured.labelUrl ? featured.labelAspect : null,
      ),
    [featured.canSize, featured.labelUrl, featured.labelAspect],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  const live = useRef<Group>(null);
  const liveSpin = useRef<Group>(null);
  const eased = useRef({ x: 0, y: 0 });
  const energy = useRef(1);
  const poseRef = useRef(pose);
  poseRef.current = pose;

  const scale = (pose.size * visibleHeight) / getFitHeight(featured.canSize);
  const blackCan = featured.canColor === "black";
  const isBottle = geometry.kind === "bottle";
  const show = ready && pose.visible > 0.02;

  useFrame((state, elapsed) => {
    const group = live.current;
    const spin = liveSpin.current;
    if (!group || !spin) return;
    const current = poseRef.current;
    const delta = Math.min(elapsed, 0.1);
    const arrival = easeOutQuart(intro.current);
    const time = state.clock.elapsedTime;
    const motion = reducedMotion ? 0 : 1;

    const follow = 1 - Math.exp(-delta * 4);
    eased.current.x += (pointer.current.x - eased.current.x) * follow;
    eased.current.y += (pointer.current.y - eased.current.y) * follow;

    energy.current +=
      ((calm ? 0 : 1) - energy.current) * (1 - Math.exp(-delta * 2.5));
    const drift =
      (1 - current.grounded) * motion * energy.current * current.visible;

    const hover = Math.sin(time * 0.9 + current.x) * 0.014 * drift;
    group.position.y = (hover - (1 - arrival) * 0.45) * visibleHeight * 0.5;
    group.rotation.x =
      Math.sin(time * 0.7 + 1.3 + current.x) * 0.02 * drift +
      eased.current.y * 0.04 * motion * current.visible;
    group.rotation.z =
      Math.cos(time * 0.55 + current.x) * 0.016 * drift + (1 - arrival) * -0.28;
    group.scale.setScalar(
      (0.72 + 0.28 * arrival) * Math.max(0.001, current.visible),
    );
    spin.rotation.y =
      (1 - arrival) * -Math.PI * 0.9 +
      eased.current.x * 0.12 * motion * current.visible;
  });

  return (
    <group
      position={[
        (pose.x * visibleWidth) / 2,
        (pose.y * visibleHeight) / 2,
        pose.x * -0.35,
      ]}
      visible={show}
    >
      <group ref={live}>
        <group rotation={[pose.tiltX, 0, pose.tiltZ]} scale={scale}>
          <group ref={liveSpin}>
            <group rotation-y={-(turns + featured.labelFront) * Math.PI * 2}>
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
  );
}

export default function LandingScene({
  actors,
  turns,
  width,
  height,
  featured,
  tint,
  reducedMotion,
  calm,
  onReady,
}: LandingSceneProps) {
  const [ready, setReady] = useState(false);
  const ready$ = useRef(false);
  const intro = useRef(reducedMotion ? 1 : 0);
  useStudioEnvironment(tint);
  const pointer = usePointer(!reducedMotion);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      ready$.current = true;
      setReady(true);
      onReady();
    }, 120);
    return () => window.clearTimeout(timer);
  }, [onReady]);

  useFrame((_state, elapsed) => {
    if (!ready$.current || intro.current >= 1) return;
    intro.current = Math.min(
      1,
      intro.current + Math.min(elapsed, 0.1) / INTRO_SECONDS,
    );
  });

  const visibleHeight =
    2 * CAMERA_DISTANCE * Math.tan(MathUtils.degToRad(CAMERA_FOV / 2));
  const visibleWidth = visibleHeight * (width / height);

  return (
    <>
      {/* Stronger key/rim so bare black aluminium still reads as metal. */}
      <directionalLight position={[-5, 6, 9]} intensity={1.55} />
      <directionalLight position={[6, 2, 6]} intensity={0.65} />
      <directionalLight position={[0, 8, -4]} intensity={0.45} />
      <directionalLight position={[0, -3, 6]} intensity={0.28} />
      <ambientLight intensity={0.4} />
      {actors.map((pose, index) => (
        <CanActor
          key={`actor-${index}-${featured[index].canSize}`}
          pose={pose}
          turns={turns[index]}
          featured={featured[index]}
          visibleHeight={visibleHeight}
          visibleWidth={visibleWidth}
          pointer={pointer}
          reducedMotion={reducedMotion}
          calm={calm}
          ready={ready}
          intro={intro}
        />
      ))}
    </>
  );
}
