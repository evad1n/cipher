import { Angle } from '@/scripts/Angle';
import { AnimationGroup, AnimationPart } from '@/scripts/AnimationGroup';
import { Point } from '@/scripts/Point';
import { getArcLength, getPoint, lerp } from '@/scripts/utils';
import { useEffect, useRef, useState } from 'react';

class Demo {
  private animationGroup: AnimationGroup | null;

  constructor() {
    this.animationGroup = null;
  }

  static parts(ctx: CanvasRenderingContext2D): AnimationPart[] {
    const start1 = new Point(40, 10);
    const end1 = new Point(40, 200);

    const start2 = new Point(80, 200);
    const end2 = new Point(80, 10);

    const semiAngle = 100;
    const arcStart = getPoint(400, 300, Angle.DegreesToRadians(semiAngle), 80);
    const arcEnd = getPoint(400, 300, 0, 80);

    return [
      {
        update(progress) {
          const interpolatedEndX = lerp(start1.x, end1.x, progress);
          const interpolatedEndY = lerp(start1.y, end1.y, progress);

          ctx.beginPath();
          ctx.moveTo(start1.x, start1.y);
          ctx.lineTo(interpolatedEndX, interpolatedEndY);
          ctx.stroke();
        },
        weight: start1.distanceTo(end1),
      },
      {
        update(progress) {
          const interpolatedEndX = lerp(start2.x, end2.x, progress);
          const interpolatedEndY = lerp(start2.y, end2.y, progress);

          ctx.beginPath();
          ctx.moveTo(start2.x, start2.y);
          ctx.lineTo(interpolatedEndX, interpolatedEndY);
          ctx.stroke();
        },
        weight: start2.distanceTo(end2),
      },
      {
        update(progress) {
          const interpolatedEndAngle = lerp(
            0,
            Angle.DegreesToRadians(360),
            progress
          );

          ctx.beginPath();
          ctx.arc(300, 200, 50, 0, interpolatedEndAngle);
          ctx.stroke();
        },
        weight: getArcLength(50, Angle.DegreesToRadians(360)),
      },
      {
        update(progress) {
          const interpolatedEndAngle = lerp(
            0,
            Angle.DegreesToRadians(semiAngle),
            progress
          );

          ctx.beginPath();
          ctx.arc(400, 300, 80, 0, interpolatedEndAngle);
          ctx.stroke();
        },
        weight: getArcLength(80, Angle.DegreesToRadians(semiAngle)),
      },
      {
        update(progress) {
          const interpolatedEndX = lerp(arcStart.x, arcEnd.x, progress);
          const interpolatedEndY = lerp(arcStart.y, arcEnd.y, progress);

          ctx.beginPath();
          ctx.moveTo(arcStart.x, arcStart.y);
          ctx.lineTo(interpolatedEndX, interpolatedEndY);
          ctx.stroke();
        },
        weight: arcStart.distanceTo(arcEnd),
      },
      {
        update(progress) {
          const interpolatedEndAngle1 = lerp(
            0,
            -Angle.DegreesToRadians(360),
            progress
          );
          const interpolatedEndAngle2 = lerp(
            0,
            Angle.DegreesToRadians(360),
            progress
          );

          ctx.beginPath();
          ctx.arc(600, 100, 100, 0, interpolatedEndAngle1, true);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(600, 100, 60, 0, interpolatedEndAngle2);
          ctx.stroke();
        },
        weight: getArcLength(100, Angle.DegreesToRadians(360)),
      },
    ];
  }

  update(ctx: CanvasRenderingContext2D | null, progress: number) {
    if (ctx) {
      if (!this.animationGroup) {
        this.animationGroup = new AnimationGroup(Demo.parts(ctx), 'lerp');
      }
      ctx.clearRect(0, 0, 800, 400);
      this.animationGroup.update(progress);
    }
  }
}

export const AnimationGroupDemo = () => {
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const d = useRef(new Demo());

  useEffect(() => {
    if (canvasRef.current) {
      d.current.update(canvasRef.current.getContext('2d'), progress);
    }
  }, [progress]);

  return (
    <div>
      <label>
        <input
          type="range"
          name="animation-group-progress"
          id="animation-group-progress"
          value={progress}
          onChange={e => setProgress(parseFloat(e.target.value))}
          min={0}
          max={1}
          step={0.005}
        />
        Progress
      </label>
      <div id="animation-group-canvas">
        <canvas ref={canvasRef} width={800} height={400}></canvas>
      </div>
    </div>
  );
};
