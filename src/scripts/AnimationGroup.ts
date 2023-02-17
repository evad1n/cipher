import { lerp, slerp } from './utils';

/** A number between 0 and 1 */
export type Progress = number;

export type AnimationPart = {
  /** Anything that takes a local progress */
  update(progress: Progress): void;
  /** Absolute weight */
  weight: number;
};

type FullAnimation = AnimationPart & {
  start: Progress;
  end: Progress;
};

export const ANIMATION_TYPES = {
  lerp: lerp,
  slerp: slerp,
} as const;

export type AnimationType = keyof typeof ANIMATION_TYPES;

/**
 * Composes discrete animations seamlessly.
 *
 * Uses relative weights to determine what portion is animating currently.
 */
export class AnimationGroup {
  private parts: FullAnimation[];

  constructor(parts: AnimationPart[], animationType: AnimationType) {
    const totalWeight = parts.reduce((a, p) => a + p.weight, 0);

    const animateFn = ANIMATION_TYPES[animationType];

    let currentWeight = 0;
    this.parts = parts.map(p => {
      const start = animateFn(0, 1, currentWeight / totalWeight);
      const end = animateFn(0, 1, (currentWeight + p.weight) / totalWeight);

      currentWeight += p.weight;

      return {
        ...p,
        start,
        end,
      };
    });
  }

  update(progress: Progress) {
    if (this.parts.length === 0) {
      return;
    }

    const index = binarySearch(this.parts, el => {
      if (el.start <= progress && el.end >= progress) {
        return 0;
      }

      return progress - el.start;
    });

    for (let i = 0; i < index; i++) {
      this.parts[i].update(1);
    }

    const part = this.parts[index];
    const normalizedProgress = normalizeProgress(
      progress,
      part.start,
      part.end
    );
    part.update(normalizedProgress);

    for (let i = index + 1; i < this.parts.length; i++) {
      this.parts[i].update(0);
    }
  }
}

function normalizeProgress(progress: Progress, start: Progress, end: Progress) {
  return (progress - start) / (end - start);
}

/**
 *
 * @param list
 * @param predicate Return > 0 if it is greater.
 * @returns Index of element
 */
function binarySearch<T = unknown>(list: T[], predicate: (el: T) => number) {
  let start = 0;
  let end = list.length - 1;
  while (start <= end) {
    const current = (start + end) >> 1;
    const value = predicate(list[current]);
    if (value > 0) {
      start = current + 1;
    } else if (value < 0) {
      end = current - 1;
    } else {
      return current;
    }
  }

  return -1;
}
