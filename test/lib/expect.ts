/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { areEqual, displayValue, matches } from "./utils";

class ExpectError extends Error {
    public constructor(reason: string, expected: unknown, actual: unknown) {
        super(
            `${reason}\n` +
                `\texpected: ${displayValue(expected)}\n` +
                `\tactual  : ${displayValue(actual)}`
        );
    }
}

/**
 * A generic expectation builder which knows nothing about the type of value it
 * is operating upon.
 *
 * This is the base class expectation that allows only type-agnostic assertions
 * upon its contained value, and all other expectation classes inherit from
 * Expect.
 */
export class Expect<T> {
    protected readonly value: T;

    /**
     * Create a new expectation around a value.
     *
     * @param value Value to place assertions upon.
     */
    public constructor(value: T) {
        this.value = value;
    }

    /**
     * Expect the value to equal an expected value.
     *
     * Note that strict equality checking is used for primitives and structural
     * equality is used for objects.
     *
     * @param expected Expected value.
     *
     * @throws ExpectError If the actual value does not equal the expected value.
     */
    public toEqual(expected: T): void {
        if (!areEqual(this.value, expected)) {
            throw new ExpectError(
                `value does not equal expected`,
                expected,
                this.value
            );
        }
    }
}

/**
 * String-specific Expect assertions.
 */
export class StringExpect extends Expect<string> {
    /**
     * Expect the string value to match a RegExp pattern.
     *
     * @param pattern Regular expression to match against.
     *
     * @throws ExpectError If the actual value does not match the expected
     *         RegExp pattern.
     */
    public toMatch(pattern: RegExp): void {
        if (!this.value.match(pattern)) {
            throw new ExpectError(
                `value does not match expected pattern`,
                pattern,
                this.value
            );
        }
    }

    /**
     * Expect the string value to start with a particular prefix.
     *
     * @param prefix Prefix that the string is expected to start with.
     *
     * @throws ExpectError If the actual value does not start with the expected
     *         prefix.
     */
    public toStartWith(prefix: string): void {
        if (!this.value.startsWith(prefix)) {
            throw new ExpectError(
                `value does not start with expected prefix`,
                prefix,
                this.value
            );
        }
    }

    /**
     * Expect the string value to end with a particular suffix.
     *
     * @param suffix Suffix that the string is expected to end with.
     *
     * @throws ExpectError If the actual value does not end with the expected
     *         suffix.
     */
    public toEndWith(suffix: string): void {
        if (!this.value.endsWith(suffix)) {
            throw new ExpectError(
                `value does not end with expected suffix`,
                suffix,
                this.value
            );
        }
    }
}

/**
 * Function-specific Expect assertions.
 */
export class FunctionExpect<T> extends Expect<() => T> {
    /**
     * Expect the function to throw an Error with error message matching a
     * string or pattern.
     *
     * @param pattern String that exactly matches the error message or RegExp
     *        that should match the error message.
     *
     * @throws ExpectError If the function does not throw an error, throws a
     *         non-Error value, or throws an Error whose message does not match
     *         the expected pattern.
     */
    public toThrowErrorMatching(pattern: string | RegExp): void {
        try {
            this.value();
        } catch (error) {
            if (!(error instanceof Error)) {
                throw new ExpectError(
                    `function threw non-Error value`,
                    pattern,
                    error
                );
            }
            if (!matches(error.message, pattern)) {
                throw new ExpectError(
                    `thrown Error's message does not match pattern`,
                    pattern,
                    error.message
                );
            }
            return;
        }
        throw new ExpectError(
            `function did not throw expected error`,
            pattern,
            null
        );
    }
}

/**
 * Create an Expect assertion builder on a string value.
 *
 * @param str String value to place expectations upon.
 */
export function expect(str: string): StringExpect;
/**
 * Create an Expect assertion builder on a function value.
 *
 * Useful primarily for asserting that a function throws an expected Error,
 * e.g.:
 *
 * ```ts
 * // Passes assertion.
 * expect(() => throw new Error('oh noes!')).toThrowErrorMatching('oh noes!');
 *
 * // Fails assertion since non-error value was thrown in func.
 * expect(() => throw "oh noes!").toThrow('oh noes!');
 *
 * // Fails assertion since func doesn't throw.
 * expect(() => 1 / 2).toThrowErrorMatching('oh noes!');
 * ```
 *
 * @param fn Function to place expectations upon.
 */
export function expect<T>(fn: () => T): FunctionExpect<T>;
/**
 * Create an Expect assertion upon some value.
 *
 * Expectations are declarative assertions on values that immediately throw an
 * Error when the assertion is violated. This abstraction allows for readable
 * test assertions like the following:
 *
 * ```ts
 * // Doesn't throw since strings are equal.
 * expect("hai").toEqual("hai");
 *
 * // Throws an Error since 3 !== 2.
 * expect(3).toEqual(2);
 * ```
 *
 * @param value Value to place expectations upon.
 */
export function expect(value: unknown): Expect<unknown> {
    if (typeof value === "string") {
        return new StringExpect(value);
    }
    if (typeof value === "function") {
        return new FunctionExpect(value as () => unknown);
    }
    return new Expect(value);
}
