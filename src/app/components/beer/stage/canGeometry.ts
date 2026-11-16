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

const DIMENSIONS: Record<CanSize, CanDimensions> = {
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
  "25": {
    radius: 26.6,
    height: 134,
    seamRadius: 25.4,
    shoulder: 7,
    chamfer: 8,
    standRadius: 20.4,
  },
};

const RADIAL_SEGMENTS = 96;
const LABEL_OFFSET = 0.14;

/**
 * Height every can is normalised against. Blending towards a common value
 * keeps the 44 cl visibly bigger than the 33 cl without breaking layouts.
 */
export function getFitHeight(size: CanSize): number {
  return (DIMENSIONS[size].height + 125) / 2;
}

/** Real proportions relative to the normalised height, for 2D layout. */
export function getCanProportions(size: CanSize) {
  const { height, radius } = DIMENSIONS[size];
  const fit = getFitHeight(size);
  return { height: height / fit, width: (radius * 2) / fit };
}

export interface CanGeometry {
  height: number;
  radius: number;
  base: BufferGeometry;
  body: BufferGeometry;
  end: BufferGeometry;
  tab: BufferGeometry;
  rivet: BufferGeometry;
  score: BufferGeometry;
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

export function buildCanGeometry(
  size: CanSize,
  labelAspect: number | null,
): CanGeometry {
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
    height,
    radius,
    base,
    body,
    end,
    tab,
    rivet,
    score,
    label,
    dispose: () => {
      for (const geometry of all) {
        geometry?.dispose();
      }
    },
  };
}
