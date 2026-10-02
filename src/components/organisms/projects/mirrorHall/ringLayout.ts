// Sizes and projection of the card ring. The front card sits in the screen plane (z = 0, scale 1), so its
// image and text are rasterized 1:1; the rest of the ring recedes behind it.
import { clamp, RADIANS_PER_DEGREE, TILT_DEGREES } from './ringMath';

export interface RingLayout {
  cardWidth: number;
  cardHeight: number;
  imageHeight: number;
  footerHeight: number;
  cardLeft: number;
  radius: number;
  perspective: number;
  // translateZ of the tilt container: the front card lands exactly in the screen plane.
  frontZ: number;
  stageHeight: number;
  sceneOffset: number;
  floorCenter: number;
  floorRadiusX: number;
  floorRadiusY: number;
  degreesPerPixel: number;
}

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface Rig {
  radius: number;
  perspective: number;
}

// The original piece (330 px cards under a 1400 px perspective) is the reference shape; other sizes scale it.
const REFERENCE_CARD_WIDTH = 330;
const REFERENCE_PERSPECTIVE = 1400;
// The card shows the whole capture (16:10) with a strip under it for the title and the status.
const IMAGE_RATIO = 16 / 10;
const MAX_CARD_WIDTH = 440;
const MIN_CARD_WIDTH = 200;
// Card width grows linearly with the viewport from the phone anchor: 230 px at 375, 440 px from about 1050.
const PHONE_VIEWPORT = 375;
const PHONE_CARD_WIDTH = 230;
const CARD_WIDTH_SLOPE = 0.313;
const MIN_FOOTER_HEIGHT = 56;
const MAX_FOOTER_HEIGHT = 64;
const FOOTER_SHARE = 0.145;
const MIN_GEOMETRY_COUNT = 3;
// Chord between neighbor centers, in card widths. Phones get it tighter so a sliver of each neighbor shows.
const PHONE_NEIGHBOR_SPACING = 1.1;
const DESKTOP_NEIGHBOR_SPACING = 1.3;
// Radius over perspective: keeps the back of the ring from shrinking below about 0.58 of the front.
const MAX_RADIUS_SHARE = 0.36;
// Card width over polygon side: under 1 so neighbors never intersect.
const POLYGON_FILL = 0.92;
const REFLECTION_REACH = 0.3;
const STAGE_PADDING = 16;
const FLOOR_MARGIN = 0.9;
const DRAG_GAIN = 1.6;
const SAMPLE_STEP_DEGREES = 15;

const evenRound = (value: number) => 2 * Math.round(value / 2);

// Ring space to screen: the tilt, the shift that puts the front card at z = 0, and the perspective.
function projectRingPoint({ x, y, z }: Vec3, { radius, perspective }: Rig) {
  const tilt = TILT_DEGREES * RADIANS_PER_DEGREE;
  const tiltedY = y * Math.cos(tilt) - z * Math.sin(tilt);
  const tiltedZ = y * Math.sin(tilt) + z * Math.cos(tilt) - radius * Math.cos(tilt);
  const scale = perspective / (perspective - tiltedZ);
  return { x: x * scale, y: tiltedY * scale };
}

// A point on the vertical center line of a card: the counter-tilt that keeps it upright, then its slot on the ring.
function cardPoint(angleDegrees: number, offsetY: number, radius: number): Vec3 {
  const lean = -TILT_DEGREES * RADIANS_PER_DEGREE;
  const angle = angleDegrees * RADIANS_PER_DEGREE;
  const depth = offsetY * Math.sin(lean) + radius;
  return { x: depth * Math.sin(angle), y: offsetY * Math.cos(lean), z: depth * Math.cos(angle) };
}

const sampleAngles = Array.from({ length: 360 / SAMPLE_STEP_DEGREES }, (_, step) => step * SAMPLE_STEP_DEGREES);

function cardWidthFor(containerWidth: number): number {
  const width = PHONE_CARD_WIDTH + (containerWidth - PHONE_VIEWPORT) * CARD_WIDTH_SLOPE;
  return evenRound(clamp(width, MIN_CARD_WIDTH, MAX_CARD_WIDTH));
}

function neighborSpacingFor(baseWidth: number): number {
  const share = clamp((baseWidth - PHONE_CARD_WIDTH) / (MAX_CARD_WIDTH - PHONE_CARD_WIDTH), 0, 1);
  return PHONE_NEIGHBOR_SPACING + (DESKTOP_NEIGHBOR_SPACING - PHONE_NEIGHBOR_SPACING) * share;
}

export function computeLayout(containerWidth: number, count: number): RingLayout {
  const half = Math.PI / Math.max(count, MIN_GEOMETRY_COUNT);
  const baseWidth = cardWidthFor(containerWidth);
  const perspective = REFERENCE_PERSPECTIVE * (baseWidth / REFERENCE_CARD_WIDTH);
  const radius = Math.min(
    (neighborSpacingFor(baseWidth) * baseWidth) / (2 * Math.sin(half)),
    MAX_RADIUS_SHARE * perspective,
  );
  const cardWidth = evenRound(Math.min(baseWidth, POLYGON_FILL * 2 * radius * Math.tan(half)));
  const imageHeight = evenRound(cardWidth / IMAGE_RATIO);
  const footerHeight = evenRound(clamp(cardWidth * FOOTER_SHARE, MIN_FOOTER_HEIGHT, MAX_FOOTER_HEIGHT));
  const cardHeight = imageHeight + footerHeight;
  const rig = { radius, perspective };

  const tops = sampleAngles.map((angle) => projectRingPoint(cardPoint(angle, -cardHeight / 2, radius), rig).y);
  const reach = cardHeight / 2 + cardHeight * REFLECTION_REACH;
  const bottoms = sampleAngles.map((angle) => projectRingPoint(cardPoint(angle, reach, radius), rig).y);
  const top = Math.min(...tops);
  const bottom = Math.max(...bottoms);

  const floorRadius = radius + cardWidth * FLOOR_MARGIN;
  const floorY = cardPoint(0, cardHeight / 2, radius).y;
  const floor = sampleAngles.map((degrees) => {
    const angle = degrees * RADIANS_PER_DEGREE;
    return projectRingPoint({ x: floorRadius * Math.sin(angle), y: floorY, z: floorRadius * Math.cos(angle) }, rig);
  });
  const floorXs = floor.map((point) => point.x);
  const floorYs = floor.map((point) => point.y);

  return {
    cardWidth,
    cardHeight,
    imageHeight,
    footerHeight,
    cardLeft: Math.floor((containerWidth - cardWidth) / 2),
    radius,
    perspective,
    frontZ: -radius * Math.cos(TILT_DEGREES * RADIANS_PER_DEGREE),
    stageHeight: evenRound(Math.ceil(bottom - top + STAGE_PADDING * 2)),
    sceneOffset: Math.round(-(top + bottom) / 2),
    floorCenter: (Math.max(...floorYs) + Math.min(...floorYs)) / 2,
    floorRadiusX: (Math.max(...floorXs) - Math.min(...floorXs)) / 2,
    floorRadiusY: (Math.max(...floorYs) - Math.min(...floorYs)) / 2,
    degreesPerPixel: DRAG_GAIN / RADIANS_PER_DEGREE / radius,
  };
}
