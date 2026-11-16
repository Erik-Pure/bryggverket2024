import {
  BackSide,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SphereGeometry,
  type Texture,
  type WebGLRenderer,
} from "three";

interface Softbox {
  position: [number, number, number];
  size: [number, number];
  intensity: number;
  color?: string;
}

/**
 * A photo studio built from glowing panels. Reflected in the can, the tall
 * strips become the long highlights that make a cylinder read as metal.
 */
const SOFTBOXES: Softbox[] = [
  // Key: big and soft, front left.
  { position: [-7.5, 3, 7], size: [5, 12], intensity: 5.2 },
  // Fill: front right, weaker and a touch warm.
  { position: [8.5, 1, 5], size: [4, 10], intensity: 2.1, color: "#fff4e6" },
  // Rim strips behind the can trace both edges.
  { position: [-8, 1, -5], size: [1.6, 14], intensity: 9 },
  { position: [8, 2, -6], size: [1.6, 14], intensity: 7.5 },
  // Overhead for the lid.
  { position: [0, 11, 1], size: [10, 10], intensity: 3.4 },
  // Soft frontal card keeps the label evenly lit.
  { position: [0, 0, 12], size: [9, 9], intensity: 1.15 },
];

/**
 * Renders the studio into a prefiltered environment map. `tint` is the page
 * colour, used as bounce light so the can sits in its surroundings.
 */
export function createStudioEnvironment(
  renderer: WebGLRenderer,
  tint: string,
): Texture {
  const scene = new Scene();
  const disposables: { dispose: () => void }[] = [];

  const ambient = new Color(tint).lerp(new Color("#8a8a8a"), 0.88);
  const dome = new Mesh(
    new SphereGeometry(40, 32, 16),
    new MeshBasicMaterial({
      color: ambient.multiplyScalar(0.36),
      side: BackSide,
    }),
  );
  scene.add(dome);
  disposables.push(dome.geometry, dome.material);

  const floor = new Mesh(
    new PlaneGeometry(60, 60),
    new MeshBasicMaterial({
      color: new Color(tint).multiplyScalar(0.4),
      side: DoubleSide,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -9;
  scene.add(floor);
  disposables.push(floor.geometry, floor.material);

  for (const box of SOFTBOXES) {
    const material = new MeshBasicMaterial({
      color: new Color(box.color ?? "#ffffff").multiplyScalar(box.intensity),
      side: DoubleSide,
    });
    const panel = new Mesh(new PlaneGeometry(...box.size), material);
    panel.position.set(...box.position);
    panel.lookAt(0, 0, 0);
    scene.add(panel);
    disposables.push(panel.geometry, material);
  }

  const generator = new PMREMGenerator(renderer);
  const texture = generator.fromScene(scene, 0.03).texture;
  generator.dispose();
  for (const item of disposables) {
    item.dispose();
  }
  return texture;
}
