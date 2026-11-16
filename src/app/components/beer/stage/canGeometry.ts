import {
  type BufferGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  ExtrudeGeometry,
  LatheGeometry,
  Path,
  Shape,
  TubeGeometry,
  Vector3,
} from "three";
import type { CanSize } from "../../../lib/beer";

/** Real-world can dimensions in millimetres. */
interface CanDimensions {
  radius: number;
  height: number;
  /** Outer radius of the double seam that holds the lid. */
  seamRadius: number;
  /** Height of the tapered shoulder below the seam. */
  shoulder: number;
  /** Height of the bottom chamfer. */
  chamfer: number;
  /** Radius of the ring the can stands on. */
  standRadius: number;
}

type CanOnlySize = Exclude<CanSize, "bottle">;

const DIMENSIONS: Record<CanOnlySize, CanDimensions> = {
  "33": {
    radius: 33.1,
    height: 115.2,
    seamRadius: 27.2,
    shoulder: 11.8,
    chamfer: 10.5,
    standRadius: 24.6,
  },
  "44": {
    radius: 33.1,
    height: 149,
    seamRadius: 27.2,
    shoulder: 11.8,
    chamfer: 10.5,
    standRadius: 24.6,
  },
  // The 25 cl "sleek" format: narrower than a standard can but the same
  // height. (The taller 53 mm "slim" can is a different format.)
  "25": {
    radius: 28.7,
    height: 115.2,
    seamRadius: 26.2,
    shoulder: 7.2,
    chamfer: 8.2,
    standRadius: 22.2,
  },
};

/**
 * 50 cl cylindrical spirit bottle (Bäverhojt form), millimetres.
 * Stockier than a typical wine bottle: shorter neck and body, heavy heel,
 * T-top cork. The cork sits on top of `height`.
 */
const BOTTLE = {
  // Bäverhojt: shorter neck and body, rounded shoulder,
  // larger front-panel label (still not a full wrap).
  radius: 44,
  height: 168,
  neckRadius: 13.6,
  neckHeight: 38,
  shoulder: 32,
  heel: 15,
  lip: 3,
  corkRadius: 14.4,
  corkHeight: 7,
  corkPlugRadius: 11.6,
  corkPlugDepth: 10,
  /** Larger front panel — still leaves clear glass at the back. */
  labelArc: Math.PI * 0.72,
};

const RADIAL_SEGMENTS = 96;
const LABEL_OFFSET = 0.14;

/**
 * Height every can is normalised against. Blending towards a common value
 * keeps the 44 cl visibly bigger than the 33 cl without breaking layouts.
 */
export function getFitHeight(size: CanSize): number {
  if (size === "bottle") {
    // Include the cork so the bottle's full silhouette fits the stage.
    return (BOTTLE.height + BOTTLE.corkHeight + 125) / 2;
  }
  return (DIMENSIONS[size].height + 125) / 2;
}

/** Real proportions relative to the normalised height, for 2D layout. */
export function getCanProportions(size: CanSize) {
  if (size === "bottle") {
    const height = BOTTLE.height + BOTTLE.corkHeight;
    const fit = getFitHeight(size);
    return { height: height / fit, width: (BOTTLE.radius * 2) / fit };
  }
  const { height, radius } = DIMENSIONS[size];
  const fit = getFitHeight(size);
  return { height: height / fit, width: (radius * 2) / fit };
}

export type VesselKind = "can" | "bottle";

export interface CanGeometry {
  kind: VesselKind;
  height: number;
  radius: number;
  base: BufferGeometry | null;
  body: BufferGeometry | null;
  end: BufferGeometry | null;
  tab: BufferGeometry | null;
  rivet: BufferGeometry | null;
  score: BufferGeometry | null;
  /** Clear glass shell for the spirit bottle. */
  glass: BufferGeometry | null;
  cork: BufferGeometry | null;
  corkTop: BufferGeometry | null;
  liquid: BufferGeometry | null;
  label: BufferGeometry | null;
  dispose: () => void;
}

function lathe(path: Path, divisions = 10): LatheGeometry {
  return new LatheGeometry(path.getPoints(divisions), RADIAL_SEGMENTS);
}

function buildTab(): BufferGeometry {
  const shape = new Shape();
  const halfWidth = 7.6;
  const front = 6.5;
  const back = -17.5;
  shape.moveTo(-halfWidth * 0.62, front);
  shape.quadraticCurveTo(-halfWidth, front, -halfWidth, front - 4);
  shape.lineTo(-halfWidth, back + 7);
  shape.bezierCurveTo(-halfWidth, back + 1.5, -halfWidth * 0.55, back, 0, back);
  shape.bezierCurveTo(
    halfWidth * 0.55,
    back,
    halfWidth,
    back + 1.5,
    halfWidth,
    back + 7,
  );
  shape.lineTo(halfWidth, front - 4);
  shape.quadraticCurveTo(halfWidth, front, halfWidth * 0.62, front);
  shape.closePath();

  const hole = new Path();
  hole.absellipse(0, back + 8.4, 4.4, 4.9, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const geometry = new ExtrudeGeometry(shape, {
    depth: 0.5,
    bevelEnabled: true,
    bevelThickness: 0.28,
    bevelSize: 0.3,
    bevelSegments: 3,
    curveSegments: 20,
  });
  // The shape is drawn in XY; lay it flat on the lid with its length along Z.
  geometry.rotateX(Math.PI / 2);
  geometry.translate(0, 1.0, 0);
  return geometry;
}

function buildScore(): BufferGeometry {
  const points: Vector3[] = [];
  const steps = 40;
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    // Egg-shaped opening that widens towards the rim.
    const widen = 1 + 0.16 * Math.cos(angle);
    points.push(
      new Vector3(
        Math.sin(angle) * 6.6 * widen,
        0,
        10.6 + Math.cos(angle) * 7.5,
      ),
    );
  }
  return new TubeGeometry(
    new CatmullRomCurve3(points, true),
    96,
    0.34,
    8,
    true,
  );
}

function buildBottleGeometry(labelAspect: number | null): CanGeometry {
  const {
    radius,
    height,
    neckRadius,
    neckHeight,
    shoulder,
    heel,
    lip,
    corkRadius,
    corkHeight,
    corkPlugRadius,
    corkPlugDepth,
  } = BOTTLE;

  const shoulderStart = height - neckHeight - shoulder;
  const neckStart = height - neckHeight;
  const lipY = height;

  // Outer glass silhouette: push-up bottom, heavy heel, cylinder, shoulder,
  // long neck and a small finishing lip.
  const glassPath = new Path();
  glassPath.moveTo(0.001, heel * 0.28);
  glassPath.quadraticCurveTo(radius * 0.28, heel * 0.32, radius * 0.55, 2.4);
  glassPath.quadraticCurveTo(radius * 0.78, 0.7, radius * 0.9, 0.25);
  glassPath.quadraticCurveTo(radius * 0.96, 0.05, radius, 0);
  glassPath.lineTo(radius, shoulderStart);
  // Near-quarter circular arc: dome the top of the body almost all the way
  // to the neck radius so there is no conical frustum left.
  const arcR = Math.min(shoulder * 0.92, radius - neckRadius - 1.2);
  const arcSteps = 20;
  const arcMax = Math.PI * 0.455; // ~82°
  for (let i = 1; i <= arcSteps; i++) {
    const t = (i / arcSteps) * arcMax;
    glassPath.lineTo(
      radius - arcR + arcR * Math.cos(t),
      shoulderStart + arcR * Math.sin(t),
    );
  }
  const arcEndX = radius - arcR + arcR * Math.cos(arcMax);
  const arcEndY = shoulderStart + arcR * Math.sin(arcMax);
  // Tiny soft blend onto the vertical neck.
  glassPath.quadraticCurveTo(
    neckRadius + (arcEndX - neckRadius) * 0.35,
    arcEndY + (neckStart - arcEndY) * 0.55,
    neckRadius,
    neckStart + 2.5,
  );
  glassPath.lineTo(neckRadius, lipY - lip);
  glassPath.quadraticCurveTo(
    neckRadius + 1.15,
    lipY - lip * 0.4,
    neckRadius + 1.65,
    lipY - 0.45,
  );
  glassPath.quadraticCurveTo(neckRadius + 1.2, lipY, neckRadius - 0.35, lipY);
  glassPath.lineTo(Math.max(0.001, neckRadius - 2.2), lipY);
  const glass = lathe(glassPath, 64);

  // Cork: plug down the neck, flat wooden T-top on the lip.
  const cork = new CylinderGeometry(
    corkPlugRadius,
    corkPlugRadius * 0.98,
    corkPlugDepth,
    48,
  );
  cork.translate(0, lipY - corkPlugDepth / 2 + 1.5, 0);

  const corkTop = new CylinderGeometry(
    corkRadius,
    corkRadius * 0.98,
    corkHeight,
    48,
  );
  corkTop.translate(0, lipY + corkHeight / 2, 0);

  // Liquid sits inside the body, just below the shoulder.
  const liquidRadius = radius - 2.4;
  const liquidHeight = Math.max(
    8,
    shoulderStart - heel * 0.7 - shoulder * 0.35,
  );
  const liquid = new CylinderGeometry(
    liquidRadius,
    liquidRadius,
    liquidHeight,
    64,
  );
  liquid.translate(0, heel * 0.7 + 1 + liquidHeight / 2, 0);

  let label: BufferGeometry | null = null;
  if (labelAspect && labelAspect > 0) {
    const labelRadius = radius + LABEL_OFFSET;
    const straight = shoulderStart - heel * 0.35;
    const arc = BOTTLE.labelArc;
    // Partial wrap: prefer a tall panel on the straight wall. Cap so it stays
    // on the body and does not climb the shoulder.
    const fromAspect = (labelRadius * arc) / labelAspect;
    const labelHeight = Math.min(
      Math.max(fromAspect, straight * 0.88),
      straight * 0.98,
    );
    // Centre the panel on +Z (toward the camera), not a full 360° sleeve.
    const thetaStart = Math.PI / 2 - arc / 2;
    const geometry = new CylinderGeometry(
      labelRadius,
      labelRadius,
      labelHeight,
      Math.max(24, Math.round(RADIAL_SEGMENTS * (arc / (Math.PI * 2)))),
      1,
      true,
      thetaStart,
      arc,
    );
    geometry.translate(0, heel * 0.35 + straight * 0.52, 0);
    label = geometry;
  }

  const totalHeight = height + corkHeight;
  const all = [glass, cork, corkTop, liquid, label];
  for (const geometry of all) {
    geometry?.translate(0, -totalHeight / 2, 0);
  }

  return {
    kind: "bottle",
    height: totalHeight,
    radius,
    base: null,
    body: null,
    end: null,
    tab: null,
    rivet: null,
    score: null,
    glass,
    cork,
    corkTop,
    liquid,
    label,
    dispose: () => {
      for (const geometry of all) {
        geometry?.dispose();
      }
    },
  };
}

export function buildCanGeometry(
  size: CanSize,
  labelAspect: number | null,
): CanGeometry {
  if (size === "bottle") return buildBottleGeometry(labelAspect);

  const { radius, height, seamRadius, shoulder, chamfer, standRadius } =
    DIMENSIONS[size];
  const domeHeight = radius * 0.3;

  // Bare aluminium: concave dome, stand ring and the chamfer above it.
  const basePath = new Path();
  basePath.moveTo(0.001, domeHeight);
  basePath.quadraticCurveTo(
    standRadius * 0.62,
    domeHeight + 0.4,
    standRadius - 2.2,
    2.4,
  );
  basePath.quadraticCurveTo(standRadius - 1.4, 0.2, standRadius, 0);
  basePath.quadraticCurveTo(standRadius + 1.5, 0.05, standRadius + 2.2, 1.3);
  basePath.bezierCurveTo(
    standRadius + 4.2,
    chamfer * 0.42,
    radius,
    chamfer * 0.5,
    radius,
    chamfer,
  );

  // Painted wall: straight body, then a conical shoulder into the neck.
  const neckRadius = seamRadius - 0.9;
  const neckY = height - 3.6;
  const shoulderStart = neckY - shoulder;
  const bodyPath = new Path();
  bodyPath.moveTo(radius, chamfer);
  bodyPath.lineTo(radius, shoulderStart);
  bodyPath.bezierCurveTo(
    radius,
    shoulderStart + shoulder * 0.34,
    neckRadius + (radius - neckRadius) * 0.16,
    neckY - shoulder * 0.36,
    neckRadius,
    neckY - 0.3,
  );
  bodyPath.lineTo(neckRadius, neckY);

  // Can end: double seam, countersink groove and the recessed panel.
  const panelRadius = seamRadius - 4.8;
  const panelY = height - 4.4;
  const endPath = new Path();
  endPath.moveTo(neckRadius, neckY);
  endPath.quadraticCurveTo(seamRadius, neckY + 0.1, seamRadius, neckY + 1);
  endPath.lineTo(seamRadius, height - 0.8);
  endPath.quadraticCurveTo(seamRadius, height, seamRadius - 0.9, height);
  endPath.quadraticCurveTo(
    seamRadius - 1.9,
    height,
    seamRadius - 2.0,
    height - 1.1,
  );
  endPath.lineTo(seamRadius - 2.7, height - 5.6);
  endPath.quadraticCurveTo(
    seamRadius - 2.9,
    height - 6.6,
    seamRadius - 3.6,
    height - 6.6,
  );
  endPath.quadraticCurveTo(
    seamRadius - 4.3,
    height - 6.5,
    seamRadius - 4.5,
    height - 5.4,
  );
  endPath.quadraticCurveTo(seamRadius - 4.6, panelY, panelRadius - 1, panelY);
  endPath.lineTo(0.001, panelY);

  const base = lathe(basePath);
  const body = lathe(bodyPath, 16);
  const end = lathe(endPath, 8);

  // Lid details are modelled for a standard end and scaled to fit the panel.
  const detailScale = panelRadius / 21.6;
  const tab = buildTab();
  const score = buildScore();
  const rivet = new CylinderGeometry(2.1, 2.5, 1.1, 24);
  rivet.translate(0, 0.55, 0);
  for (const detail of [tab, score, rivet]) {
    detail.scale(detailScale, detailScale, detailScale);
    detail.translate(0, panelY, 0);
  }

  let label: BufferGeometry | null = null;
  if (labelAspect && labelAspect > 0) {
    const labelRadius = radius + LABEL_OFFSET;
    const straight = shoulderStart - chamfer;
    // The artwork wraps the full circumference; its height follows from the
    // image's aspect ratio so labels are never stretched.
    const ideal = (2 * Math.PI * labelRadius) / labelAspect;
    const labelHeight = Math.min(ideal, straight - 0.4);
    const geometry = new CylinderGeometry(
      labelRadius,
      labelRadius,
      labelHeight,
      RADIAL_SEGMENTS,
      1,
      true,
    );
    geometry.translate(0, chamfer + straight / 2, 0);
    label = geometry;
  }

  const all = [base, body, end, tab, rivet, score, label];
  // Pivot around the middle of the can so tilts feel balanced.
  for (const geometry of all) {
    geometry?.translate(0, -height / 2, 0);
  }

  return {
    kind: "can",
    height,
    radius,
    base,
    body,
    end,
    tab,
    rivet,
    score,
    glass: null,
    cork: null,
    corkTop: null,
    liquid: null,
    label,
    dispose: () => {
      for (const geometry of all) {
        geometry?.dispose();
      }
    },
  };
}
