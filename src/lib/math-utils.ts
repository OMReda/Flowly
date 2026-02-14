/**
 * Institutional-grade mathematical utilities for financial processing.
 * Focuses on division safety, range clamping, and statistical robustness.
 */

/**
 * Ensures division never results in Infinity or NaN.
 */
export function safeDivide(a: number, b: number, fallback = 0): number {
    if (!b || Math.abs(b) < 1e-6) return fallback;
    return a / b;
}

/**
 * Clamps a value between a minimum and maximum boundary.
 */
export function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
}

/**
 * Linearly maps a value from one range to another.
 */
export function normalize(val: number, min: number, max: number, targetMin: number, targetMax: number): number {
    const clampedVal = clamp(val, min, max);
    const ratio = safeDivide(clampedVal - min, max - min, 0.5); // Default to middle if range is 0
    return targetMin + ratio * (targetMax - targetMin);
}

/**
 * Calculates the arithmetic mean of an array.
 */
export function average(arr: number[]): number {
    if (!arr.length) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Calculates the population standard deviation.
 */
export function standardDeviation(arr: number[]): number {
    if (arr.length < 2) return 0;
    const avg = average(arr);
    const variance = arr.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / arr.length;
    return Math.sqrt(variance);
}

/**
 * Calculates the Coefficient of Variation (CV).
 * Higher CV indicates higher relative volatility.
 */
export function coefficientOfVariation(arr: number[]): number {
    const mean = average(arr);
    const std = standardDeviation(arr);
    return safeDivide(std, mean, 0);
}
