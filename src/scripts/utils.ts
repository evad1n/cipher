import { Angle } from './Angle';
import { Point } from './Point';

/** Get angle in radians from an alphabet letter */
export const getAngle = (char: number) => {
  return Angle.DegreesToRadians((char * 360) / 26);
};

/** Normalize a char code to 1-26 */
export const getCharNumber = (char: string) =>
  char.toLowerCase().charCodeAt(0) - 96;

export const convertCharToAngle = ({
  char,
  degrees = false,
}: {
  char: string;
  degrees?: boolean;
}) => {
  const number = getCharNumber(char);
  return degrees
    ? (number * 360) / 26
    : Angle.DegreesToRadians((number * 360) / 26);
};

/** Converts a word to an array of angles of a circle  */
export const convertWordToAngles = (word: string) => {
  return [...word.toLowerCase()].map(c => convertCharToAngle({ char: c }));
};

export const getElapsedMilliseconds = (startTime: Date) => {
  const time = new Date();
  return time.getTime() - startTime.getTime();
};

/** Linear interpolation */
export const lerp = (start: number, end: number, t: number) =>
  start + t * (end - start);

export const quadin = (start: number, end: number, t: number) =>
  lerp(start, end, t * t);

/** Smooth linear interpolation using ease-out-in (fast at start and end, slow in middle) */
export const slerp = (start: number, end: number, t: number) => {
  const midpoint = (end + start) / 2;
  if (t <= 0.5) {
    return quadin(start, midpoint, 2 * t);
  }
  return end + midpoint - quadin(midpoint, end, 2 * (1 - t));
};

/** Calculate a point on the circle given an angle */
export const getPoint = (
  midX: number,
  midY: number,
  angle: number,
  radius: number
): Point => {
  const offsetAngle = angle + Angle.DegreesToRadians(90);
  const x = Math.sin(offsetAngle) * radius;
  const y = Math.cos(offsetAngle) * radius;

  return new Point(midX + x, midY - y);
};

/**
 *
 * @param radius
 * @param angle In radians
 */
export const getArcLength = (radius: number, angle: number) => {
  const circumference = 2 * radius * Math.PI;
  return (angle / (2 * Math.PI)) * circumference;
};
