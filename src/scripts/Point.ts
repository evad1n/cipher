export class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  get tuple(): [number, number] {
    return [this.x, this.y];
  }

  distanceTo(other: Point) {
    return Math.sqrt((other.x - this.x) ** 2 + (other.y - this.y) ** 2);
  }
}
