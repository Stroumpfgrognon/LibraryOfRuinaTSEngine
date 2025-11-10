/**
 * Generate a random integer in the inclusive range [a, b].
 * If a or b are not integers they will be adjusted: a -> ceil, b -> floor.
 *
 * @param a - lower bound (inclusive)
 * @param b - upper bound (inclusive)
 * @returns random integer between a and b inclusive
 */
export function randomInt(a: number, b: number): number {
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
        throw new TypeError('randomInt: a and b must be finite numbers');
    }

    const min = Math.ceil(Math.min(a, b));
    const max = Math.floor(Math.max(a, b));

    if (min > max) {
        throw new RangeError('randomInt: empty integer range');
    }

    return Math.floor(Math.random() * (max - min + 1)) + min;
}