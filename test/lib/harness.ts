/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { expect } from "./expect";
import { displayValue, shuffle } from "./utils";

interface Test {
    readonly name: string;

    runTest(): void | Promise<void>;
}

type TestResult = {
    testName: string;
} & (
    | {
          result: "pass";
      }
    | {
          result: "fail";
          error: Error;
      }
);

const runTest = async (test: Test): Promise<TestResult> => {
    let result: TestResult;
    try {
        await test.runTest();
        result = {
            testName: test.name,
            result: "pass",
        };
    } catch (error) {
        result = {
            testName: test.name,
            result: "fail",
            error:
                error instanceof Error
                    ? error
                    : new Error(
                          `threw non-error object: ${displayValue(error)}`
                      ),
        };
    }
    return result;
};

/**
 * Context object that is passed into a test suite definition.
 */
export interface TestSuiteContext {
    /**
     * Define a test in this test suite.
     *
     * Tests are functions that pass if they are executed and don't throw (or
     * that resolve for async tests), and that fail if they throw an error (or
     * reject for async tests).
     *
     * Note that tests are executed in a random order within a test suite in
     * order to prevent accidentally creating order dependencies between tests,
     * which can result in brittle tests and is a code smell that might indicate
     * that the code under test is also brittle.
     */
    test: (name: string, def: () => void | Promise<void>) => void;
    /**
     * Expectation builder function used to build human-readable assertions and
     * errors.
     */
    expect: typeof expect;
}

/**
 * Define a suite of tests to run as a single unit.
 *
 * A test suite executes immediately, running tests in a randomly determined
 * order.
 *
 * Note that currently there is no support for having multiple test suites per
 * test file; you CAN have multiple test suites in a file but if the first test
 * suite fails any subsequent test suites won't be executed.
 *
 * @param suiteName Name of the test suite for reporting.
 * @param def Function used to declare the tests
 */
export const testSuite = (
    suiteName: string,
    def: (ctx: TestSuiteContext) => void
): void => {
    const tests: Test[] = [];
    const test = (name: string, runTest: () => void | Promise<void>): void => {
        tests.push({ name, runTest });
    };
    def({ test, expect });

    // Randomly shuffle the tests so that we can catch accidental order
    // dependencies.
    shuffle(tests);
    (async () => {
        const results = await Promise.all(tests.map((test) => runTest(test)));
        let passed = 0;
        for (const testResult of results) {
            if (testResult.result === "fail") {
                console.error(
                    `[TEST FAILURE] "${suiteName}": "${testResult.testName}": ` +
                        `${testResult.error.message}\n`
                );
                continue;
            }
            passed += 1;
        }
        console.info(
            `[TEST] suite "${suiteName}": ${passed} of ${tests.length} succeeded\n\n`
        );
        if (passed < tests.length) {
            process.exit(1);
        }
    })();
};
