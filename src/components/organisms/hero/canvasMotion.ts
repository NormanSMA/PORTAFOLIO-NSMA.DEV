import { ALIGNED_MIX, controlPoints, sampleCurve } from './canvasGeometry';
import { buildCycle } from './canvasCycle';
import { collectElements, resetIntro, resetScene, restoreStill } from './canvasElements';
import { buildIntro } from './canvasIntro';
import { createCanvasRenderer, initialState } from './canvasRenderer';
import { CYCLE_JOIN } from './canvasSchedule';

// Frames run only while the scene is on screen and the tab is in front.
function observeVisibility(root: HTMLElement, onChange: (visible: boolean) => void): () => void {
  let intersecting = typeof IntersectionObserver === 'undefined';
  const report = () => onChange(intersecting && !document.hidden);
  const observer =
    typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver((entries) => {
          intersecting = entries[entries.length - 1].isIntersecting;
          report();
        });
  observer?.observe(root);
  document.addEventListener('visibilitychange', report);
  report();
  return () => {
    observer?.disconnect();
    document.removeEventListener('visibilitychange', report);
  };
}

// Starts the intro on a scene React already rendered in its finished state, hands over to the loop when the intro ends,
// and returns the cleanup. Whichever timeline is current pauses off screen and resumes where it stopped.
export function startCanvasMotion(root: HTMLElement): () => void {
  const elements = collectElements(root);
  if (!elements) return () => {};

  const state = initialState();
  const aligned = sampleCurve(controlPoints(ALIGNED_MIX));
  const renderer = createCanvasRenderer(elements.parts, aligned);
  resetScene(elements, state, renderer);
  const cycle = buildCycle(elements, state, renderer);
  resetIntro(elements);
  const intro = buildIntro(elements);

  let visible = false;
  let introDone = false;
  const apply = () => {
    intro.paused(introDone || !visible);
    cycle.paused(!introDone || !visible);
    root.dataset.running = String(visible);
  };

  // The loop joins right after its own fade-in, which the intro has already done by hand.
  intro.eventCallback('onComplete', () => {
    introDone = true;
    cycle.time(CYCLE_JOIN, true);
    apply();
  });

  const stopObserving = observeVisibility(root, (next) => {
    visible = next;
    apply();
  });

  return () => {
    stopObserving();
    intro.kill();
    cycle.kill();
    restoreStill(elements, renderer);
    delete root.dataset.running;
  };
}
