import { Bounds, Point } from "./types";

/**
 * Determines if two points are equal.
 * @param p1 - The first point to compare.
 * @param p2 - The second point to compare.
 * @returns True if the points are equal, false otherwise.
 */
export function equals(p1: Point, p2: Point): boolean {
  return p1[0] === p2[0] && p1[1] === p2[1];
}

/**
 * Linearly interpolates between two values.
 * @param a - The start value.
 * @param b - The end value.
 * @param t - The interpolation value between 0 and 1.
 * @returns The interpolated value.
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Returns the linear interpolation factor between two values.
 * @param a The start value.
 * @param b The end value.
 * @param v The value to interpolate.
 * @returns The interpolation factor between 0 and 1.
 */
export function invLerp(a: number, b: number, v: number): number {
  return (v - a) / (b - a);
}

/**
 * Remaps a value from one range to another.
 * @param oldA The start of the old range.
 * @param oldB The end of the old range.
 * @param newA The start of the new range.
 * @param newB The end of the new range.
 * @param v The value to remap.
 * @returns The remapped value.
 */
export function remap(oldA: number, oldB: number, newA: number, newB: number, v: number): number {
  return lerp(newA, newB, invLerp(oldA, oldB, v));
}

/**
 * Remaps a point from one coordinate system to another.
 * @param oldBounds The bounds of the original coordinate system.
 * @param newBounds The bounds of the new coordinate system.
 * @param point The point to remap.
 * @returns The remapped point.
 */
export function remapPoint(oldBounds: Bounds, newBounds: Bounds, point: Point): Point {
  return [
    remap(oldBounds.left, oldBounds.right, newBounds.left, newBounds.right, point[0]),
    remap(oldBounds.top, oldBounds.bottom, newBounds.top, newBounds.bottom, point[1]),
  ];
}

/**
 * Adds two points together and returns the result as a new point.
 * @param p1 - The first point to add.
 * @param p2 - The second point to add.
 * @returns The resulting point of the addition.
 */
export function add(p1: Point, p2: Point): Point {
  return [p1[0] + p2[0], p1[1] + p2[1]];
}

/**
 * Subtracts two points and returns the resulting point.
 * @param p1 The first point to subtract from.
 * @param p2 The second point to subtract.
 * @returns The resulting point after subtracting p2 from p1.
 */
export function subtract(p1: Point, p2: Point): Point {
  return [p1[0] - p2[0], p1[1] - p2[1]];
}

/**
 * Scales a point by a given factor.
 * @param p - The point to scale.
 * @param s - The scaling factor.
 * @returns The scaled point.
 */
export function scale(p: Point, s: number): Point {
  return [p[0] * s, p[1] * s];
}

/**
 * Calculates the distance between two points in a 2D plane.
 * @param p1 The first point.
 * @param p2 The second point.
 * @returns The distance between the two points.
 */
export function distance(p1: Point, p2: Point): number {
  return Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2);
}

/**
 * Formats a number to a string with a specified number of decimal places.
 * @param n The number to format.
 * @param decimals The number of decimal places to include in the formatted string. Defaults to 0.
 * @returns A string representation of the formatted number.
 */
export function formatNumber(n: number, decimals: number = 0): string {
  return n.toFixed(decimals);
}

/**
 * Returns the index of the point in the array that is nearest to the given location.
 * @param location - The location to compare against.
 * @param points - The array of points to search through.
 * @returns The index of the nearest point in the array.
 */
export function getNearest(location: Point, points: Point[]): number {
  let minDistance = Number.MAX_SAFE_INTEGER;
  let nearestIndex = -1;

  for (let i = 0; i < points.length; i++) {
    const dist = distance(location, points[i]);

    if (dist < minDistance) {
      minDistance = dist;
      nearestIndex = i;
    }
  }

  return nearestIndex;
}
