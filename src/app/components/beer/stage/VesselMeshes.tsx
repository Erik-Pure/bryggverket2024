import { BackSide, type Texture } from "three";
import type { buildCanGeometry } from "./canGeometry";

type Geometry = ReturnType<typeof buildCanGeometry>;

/** Painted aluminium can with optional wraparound label. */
export function CanMeshes({
  geometry,
  texture,
  blackCan,
}: {
  geometry: Geometry;
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
export function BottleMeshes({
  geometry,
  texture,
}: {
  geometry: Geometry;
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
        <>
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
          <mesh geometry={geometry.label}>
            <meshStandardMaterial
              color="#3a3a3a"
              roughness={0.92}
              metalness={0}
              side={BackSide}
              polygonOffset
              polygonOffsetFactor={1}
            />
          </mesh>
        </>
      ) : null}
    </>
  );
}
