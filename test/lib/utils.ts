/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Randomly rearrange the items of an array in-place.
 *
 * @param arr Array to shuffle.
 */
export const shuffle = <T>(arr: T[]): void => {
    let j: number;
    let x: T;
    for (let i = arr.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = arr[i];
        arr[i] = arr[j];
        arr[j] = x;
    }
};

const areArraysEqual = <T>(a: T[], b: T[]): boolean => {
    if (a.length != b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (!areEqual(a[i], b[i])) {
            return false;
        }
    }
    return true;
};

const areObjectsEqual = <T extends Record<string, unknown>>(
    a: T,
    b: T,
): boolean => {
    const aKeys = Object.keys(a) as Array<keyof T>;
    const bKeys = Object.keys(b) as Array<keyof T>;
    if (aKeys.length !== bKeys.length) {
        return false;
    }
    for (const key of aKeys) {
        if (!areEqual(a[key], b[key])) {
            return false;
        }
    }
    return true;
};

/**
 * Return whether two values are structurally equal, with support for
 * primitive values, arrays, deeply nested objects, and RegExp.
 *
 * @param a First value to test equality with.
 * @param b Second value to test equality with.
 *
 * @return Whether the two values are structurally equal.
 */
export const areEqual = <T>(a: T, b: T): boolean => {
    if (Array.isArray(a) && Array.isArray(b)) {
        return areArraysEqual(a, b);
    }
    if (a instanceof RegExp && b instanceof RegExp) {
        return a.source === b.source;
    }
    if (typeof a === "object" && typeof b === "object") {
        return areObjectsEqual(
            a as Record<string, unknown>,
            b as Record<string, unknown>,
        );
    }
    return a === b;
};

/**
 * Return whether a string exactly matches an expected string OR matches a
 * RegExp pattern.
 *
 * If the passed pattern is a string this uses strict equality checking, and
 * if the passed pattern is a RegExp object it tests the value against it.
 *
 * @param value String value to test.
 * @param pattern String or RegExp pattern to match value against.
 */
export const matches = (value: string, pattern: string | RegExp): boolean => {
    if (typeof pattern === "string") {
        return value === pattern;
    }
    return pattern.test(value);
};

/**
 * Render a JavaScript value for debugging and error messages.
 *
 * This is essentially JSON.stringify, but with special cases for undefined (
 * which normally isn't rendered with JSON.stringify) and RegExp (to display
 * source for the regexp).
 *
 * @param value Value to render.
 *
 * @return Rendered value to display.
 */
export const displayValue = (value: unknown): string => {
    if (value === undefined) {
        return "undefined";
    }
    if (value instanceof RegExp) {
        return value.toString();
    }
    return JSON.stringify(value);
};
