import { useEffect, useState } from 'react';

// A thin band at the middle of the viewport: the section crossing it is the one being read.
const READING_BAND = '-45% 0px -50% 0px';

export function useActiveSection(ids: readonly string[]): string {
  const [activeId, setActiveId] = useState(ids[0]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const crossing = new Set<string>();
    const observed = new Set<string>();

    const intersections = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          if (isIntersecting) crossing.add(target.id);
          else crossing.delete(target.id);
        }
        const current = ids.filter((id) => crossing.has(id)).pop();
        if (current) setActiveId(current);
      },
      { rootMargin: READING_BAND },
    );

    // Lazy sections mount after the navbar, so keep looking until every id is in the DOM.
    const observeNewSections = (): boolean => {
      for (const id of ids) {
        const section = observed.has(id) ? null : document.getElementById(id);
        if (!section) continue;
        intersections.observe(section);
        observed.add(id);
      }
      return observed.size === ids.length;
    };

    const mutations = new MutationObserver(() => {
      if (observeNewSections()) mutations.disconnect();
    });
    if (!observeNewSections()) {
      mutations.observe(document.getElementById('main') ?? document.body, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      intersections.disconnect();
      mutations.disconnect();
    };
  }, [ids]);

  return activeId;
}
