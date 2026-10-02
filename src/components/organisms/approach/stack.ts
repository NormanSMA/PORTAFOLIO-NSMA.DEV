// Distances are rem so the pile follows the fixed navbar (h-20 = 5rem) and the user's font size.
export const stack = {
  top: 5,
  step: 0.75,
  scale: 0.94,
  // A card is dimmed by a dark layer on top of it, never by its own opacity: a translucent
  // card would show the text of the one it covers.
  dim: 0.3,
} as const;

export interface StackMetrics {
  heights: number[];
  tops: number[];
  gap: number;
}

export interface StackRange {
  start: string;
  end: string;
}

export function stackTop(index: number): string {
  return `calc(${stack.top}rem + ${index} * ${stack.step}rem)`;
}

// Card i is covered while card i + 1 travels from the bottom edge of card i to its own sticky top.
// Both ends are expressed from the list top, because the list never sticks and its position is
// the same at any scroll offset, while a sticky card is measured wherever it happens to be stuck.
export function stackRanges({ heights, tops, gap }: StackMetrics): StackRange[] {
  const ranges: StackRange[] = [];
  let offset = 0;

  for (let index = 0; index < heights.length - 1; index += 1) {
    offset += heights[index] + gap;
    ranges.push({
      start: `top+=${offset} ${tops[index] + heights[index]}px`,
      end: `top+=${offset} ${tops[index + 1]}px`,
    });
  }

  return ranges;
}
