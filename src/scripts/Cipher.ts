import { Angle } from './Angle';
import { AnimationGroup, AnimationPart } from './AnimationGroup';
import { Point } from './Point';
import {
  convertCharToAngle,
  convertWordToAngles,
  getArcLength,
  getCharNumber,
  getElapsedMilliseconds,
  getPoint,
  lerp,
} from './utils';

const ANIMATION_DURATION = 1000;

type ContextProps = { ctx: CanvasRenderingContext2D };

type ConnectArcProps = ContextProps & {
  angle: number;
  startRadius: number;
  endRadius: number;
  reverse?: boolean;
};

type DrawArcProps = ContextProps & {
  radius: number;
  startAngle: number;
  endAngle: number;
  reverse?: boolean;
};

export type CipherOptions = {
  /** @default true */
  animationsEnabled: boolean;
  /**
   * The initial size of the first ring
   * @default 50
   * */
  radius: number;
  /**
   * The gap between each ring
   * @default 20
   * */
  gap: number;
};

export type CipherProps = {
  word: string;
  canvas: HTMLCanvasElement;
  options?: Partial<CipherOptions>;
};

export class Cipher {
  word: string;
  canvas: HTMLCanvasElement;

  private prevWord: string;
  private startUpdateTime: Date | null;
  private currentAnimationId: number | null;
  private currentAnimationGroup: AnimationGroup | null;

  private options: CipherOptions;

  constructor({ canvas, options }: CipherProps) {
    this.canvas = canvas;
    this.word = '';

    this.prevWord = '';
    this.startUpdateTime = null;
    this.currentAnimationId = null;
    this.currentAnimationGroup = null;

    this.options = {
      animationsEnabled: true,
      radius: 50,
      gap: 20,
      ...options,
    };
  }

  get context() {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return null;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    return ctx;
  }

  private get midpoint(): Point {
    return new Point(this.canvas.width / 2, this.canvas.height / 2);
  }

  clear() {
    this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  update(newWord: string) {
    if (this.word === newWord) return;

    if (Math.abs(this.word.length - newWord.length) >= 2) {
      // Completely redraw if we changed more than one letter at a time
      if (this.options.animationsEnabled) {
        if (this.currentAnimationId) {
          window.cancelAnimationFrame(this.currentAnimationId);
        }
        this.startUpdateTime = new Date();
        this.clear();
        this.prevWord = '';
        this.word = newWord;

        this.updateAnimation({
          baseWord: '',
          animatedPart: newWord,
        });
      } else {
        this.clear();
        this.prevWord = '';
        this.word = newWord;
        this.draw(newWord);
      }
      return;
    }

    // Change one letter at a time
    if (this.options.animationsEnabled) {
      if (this.currentAnimationId) {
        window.cancelAnimationFrame(this.currentAnimationId);
      }
      this.startUpdateTime = new Date();
      this.clear();

      // Gets statically drawn
      let baseWord: string;
      let rest: string;
      let reverse = false;
      if (newWord.length > this.word.length) {
        // Add a letter
        // Redraw base shape of new word
        baseWord = this.word;
        rest = newWord[newWord.length - 1];
      } else {
        // Remove a letter
        baseWord = newWord;
        rest = this.word[this.word.length - 1];
        reverse = true;
      }

      this.prevWord = this.word;
      this.word = newWord;

      // Begin animation
      this.updateAnimation({
        baseWord,
        animatedPart: rest,
        reverse,
      });
    } else {
      this.clear();
      this.prevWord = this.word;
      this.word = newWord;
      this.draw(newWord);
    }
  }

  private updateAnimation(props: {
    baseWord: string;
    animatedPart: string;
    reverse?: boolean;
  }) {
    if (!this.startUpdateTime) {
      return;
    }

    const { baseWord, animatedPart, reverse = false } = props;

    const progress =
      getElapsedMilliseconds(this.startUpdateTime) / ANIMATION_DURATION;

    if (progress >= 1) {
      this.startUpdateTime = null;
      this.clear();
      this.draw(baseWord, false);
      this.currentAnimationGroup?.update(1);
      this.currentAnimationGroup = null;
      return;
    }
    this.clear();
    const lastAngle = this.draw(baseWord, false);
    this.draw_ANIMATED(baseWord, lastAngle, animatedPart, reverse);

    const smoothProgress = lerp(0, 1, progress);

    this.currentAnimationGroup?.update(smoothProgress);

    this.currentAnimationId = window.requestAnimationFrame(() =>
      this.updateAnimation(props)
    );
  }

  private drawArc_ANIMATED({
    ctx,
    radius,
    startAngle,
    endAngle,
    reverse,
  }: DrawArcProps): AnimationPart {
    const [midX, midY] = this.midpoint.tuple;

    return {
      update: progress => {
        const directionalProgress = reverse ? 1 - progress : progress;

        const interpolatedEndAngle = lerp(
          startAngle,
          endAngle,
          directionalProgress
        );

        ctx.beginPath();
        ctx.arc(midX, midY, radius, startAngle, interpolatedEndAngle);
        ctx.stroke();
      },
      weight: getArcLength(radius, Math.abs(endAngle - startAngle)),
    };
  }

  /** Statically draws a line between 2 arcs */
  private connectArc({ ctx, angle, startRadius, endRadius }: ConnectArcProps) {
    const [midX, midY] = this.midpoint.tuple;

    const [x1, y1] = getPoint(midX, midY, angle, startRadius).tuple;
    const [x2, y2] = getPoint(midX, midY, angle, endRadius).tuple;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  /** Statically draws a line between 2 arcs */
  private connectArc_ANIMATED({
    ctx,
    angle,
    startRadius,
    endRadius,
    reverse = false,
  }: ConnectArcProps): AnimationPart {
    const [midX, midY] = this.midpoint.tuple;

    const start = getPoint(midX, midY, angle, startRadius);
    const end = getPoint(midX, midY, angle, endRadius);

    return {
      update: progress => {
        const directionalProgress = reverse ? 1 - progress : progress;

        const interpolatedEndX = lerp(start.x, end.x, directionalProgress);
        const interpolatedEndY = lerp(start.y, end.y, directionalProgress);

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(interpolatedEndX, interpolatedEndY);
        ctx.stroke();
      },
      weight: start.distanceTo(end),
    };
  }

  /**
   * Statically draws a word
   * @returns last start angle in radians
   */
  private draw(word = this.word, connectLastArc = true): number {
    const ctx = this.context;
    if (!ctx || word.length === 0) return Angle.DegreesToRadians(-90);

    const angles = convertWordToAngles(word);

    const [midX, midY] = this.midpoint.tuple;

    // If it starts with a Z, then it will just be a circle, so don't draw another inner circle
    const hasInnerCircle = getCharNumber(word[0]) !== 26;

    let startAngle = Angle.DegreesToRadians(-90);

    if (hasInnerCircle) {
      ctx.beginPath();
      ctx.arc(midX, midY, this.options.radius - this.options.gap, 0, 360);
      ctx.stroke();
      this.connectArc({
        ctx,
        angle: startAngle,
        startRadius: this.options.radius - this.options.gap,
        endRadius: this.options.radius,
      });
    }

    for (let i = 0; i < angles.length; i++) {
      const angle = angles[i];
      const endAngle = angle + startAngle;

      const radius = this.options.radius + this.options.gap * i;

      ctx.beginPath();
      ctx.arc(
        midX,
        midY,
        this.options.radius + this.options.gap * i,
        startAngle,
        endAngle
      );
      ctx.stroke();

      startAngle = endAngle;

      // Draw lines between arcs
      if (i < angles.length - 1) {
        this.connectArc({
          ctx,
          angle: startAngle,
          startRadius: radius,
          endRadius: radius + this.options.gap,
        });
      }
    }

    // Complete the shape by connecting end of last arc.
    if (connectLastArc) {
      this.connectArc({
        ctx,
        angle: startAngle,
        startRadius:
          this.options.radius + this.options.gap * (angles.length - 1),
        endRadius: this.getLastIntersectionRadius(word),
      });
    }

    return startAngle;
  }

  private draw_ANIMATED(
    offsetWord: string,
    offsetAngle: number,
    word: string,
    reverse = false
  ) {
    const ctx = this.context;
    if (!ctx || word.length === 0) return;

    const parts: AnimationPart[] = [];

    const angles = convertWordToAngles(word);

    const [midX, midY] = this.midpoint.tuple;

    // If it starts with a Z, then it will just be a circle, so don't draw another inner circle
    const hasInnerCircle =
      getCharNumber(word[0]) !== 26 && offsetWord.length === 0;

    let startAngle = offsetAngle;

    if (hasInnerCircle) {
      const radius = this.options.radius - this.options.gap;

      parts.push({
        update: progress => {
          const interpolatedEndAngle = lerp(
            0,
            Angle.DegreesToRadians(360),
            progress
          );

          ctx.beginPath();
          ctx.arc(midX, midY, radius, 0, interpolatedEndAngle);
          ctx.stroke();
        },
        weight: getArcLength(radius, Angle.DegreesToRadians(360)),
      });

      parts.push(
        this.connectArc_ANIMATED({
          ctx,
          angle: startAngle,
          startRadius: radius,
          endRadius: this.options.radius,
        })
      );
    }

    const lastRadius =
      this.options.radius + this.options.gap * (offsetWord.length - 1);

    if (offsetWord.length) {
      // Gotta erase the last connecting arc here in reverse
      const lastIntersectStartRadius =
        this.getLastIntersectionRadius(offsetWord);
      parts.push(
        this.connectArc_ANIMATED({
          ctx,
          angle: startAngle,
          startRadius: lastRadius,
          endRadius: lastIntersectStartRadius,
          reverse: true,
        })
      );
      // Draw the new connecting arc
      parts.push(
        this.connectArc_ANIMATED({
          ctx,
          angle: startAngle,
          startRadius: lastRadius,
          endRadius: lastRadius + this.options.gap,
        })
      );
    }

    for (let i = 0; i < angles.length; i++) {
      const angle = angles[i];
      const currentStartAngle = startAngle;
      const endAngle = currentStartAngle + angle;
      startAngle = endAngle;

      const offsetI = i + offsetWord.length;

      const radius = this.options.radius + this.options.gap * offsetI;

      parts.push(
        this.drawArc_ANIMATED({
          ctx,
          radius,
          startAngle: currentStartAngle,
          endAngle,
        })
      );

      // Draw lines between arcs
      if (i < angles.length - 1) {
        parts.push(
          this.connectArc_ANIMATED({
            ctx,
            angle: endAngle,
            startRadius: radius,
            endRadius: radius + this.options.gap,
          })
        );
      }
    }

    // Complete the shape by connecting end of last arc.
    const startRadius =
      this.options.radius +
      this.options.gap * (offsetWord.length + angles.length - 1);
    const endRadius = this.getLastIntersectionRadius(offsetWord + word);
    parts.push(
      this.connectArc_ANIMATED({
        ctx,
        angle: startAngle,
        startRadius,
        endRadius,
      })
    );

    this.currentAnimationGroup = new AnimationGroup(parts);
  }

  /** When we connect the last arc, we need to find the closest concentric circle and draw to there */
  private getLastIntersectionRadius(word: string) {
    // Reverse iterate from end of word until we come full circle (pun intended)
    let currentAngle = 0;
    for (let i = word.length - 1; i >= 0; i--) {
      const letter = word[i];
      currentAngle += convertCharToAngle({ char: letter, degrees: true });
      if (currentAngle >= 360) {
        return this.options.radius + this.options.gap * i;
      }
    }

    return this.options.radius - this.options.gap;
  }
}
