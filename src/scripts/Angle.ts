export type AngleMode = 'DEGREES' | 'RADIANS';

export class Angle {
  /** In degrees internally */
  private value: number;

  constructor(value: number, mode: AngleMode = 'DEGREES') {
    if (mode === 'DEGREES') {
      this.value = value;
    } else {
      this.value = Angle.RadiansToDegrees(value);
    }
  }

  get degrees() {
    return this.value;
  }

  get radians() {
    return Angle.DegreesToRadians(this.value);
  }

  static RadiansToDegrees(angle: number) {
    return (angle * 180) / Math.PI;
  }

  static DegreesToRadians(angle: number) {
    return angle * (Math.PI / 180);
  }
}
