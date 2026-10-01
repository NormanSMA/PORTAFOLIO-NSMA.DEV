import { cardDepth, depthBlur, depthLevel, depthOpacity } from './ringMath';

interface WrittenStyle {
  opacity: number;
  blur: number;
  depth: number;
}

// Last values written per card: a style is touched only when its quantized value changes.
const written = new WeakMap<Element, WrittenStyle>();

function writeCard(card: HTMLElement, depth: number) {
  const body = card.firstElementChild as HTMLElement | null;
  if (!body) return;
  const next: WrittenStyle = {
    opacity: depthOpacity(depth),
    blur: depthBlur(depth),
    depth: depthLevel(depth),
  };
  const previous = written.get(card);
  if (previous?.opacity !== next.opacity) body.style.opacity = String(next.opacity);
  if (previous?.blur !== next.blur) body.style.filter = next.blur === 0 ? '' : `blur(${next.blur}px)`;
  if (previous?.depth !== next.depth) card.style.setProperty('--mh-depth', String(next.depth));
  written.set(card, next);
}

// Imperative on purpose: the ring moves every frame and React must not re-render for it.
export function writeRingFrame(ring: HTMLElement, angle: number) {
  ring.style.transform = `rotateY(${angle}deg)`;
  const { children } = ring;
  for (let index = 0; index < children.length; index += 1) {
    writeCard(children[index] as HTMLElement, cardDepth(angle, index, children.length));
  }
}
