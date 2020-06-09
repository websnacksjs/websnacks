/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ChildProcess, spawn } from "child_process";
import { promises as fs } from "fs";
import * as path from "path";

import { testSuite } from "../lib";

const TEST_DIST_PATH = path.resolve(__dirname, "..", "..", ".test-dist");

const wait = async (timeMs: number): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), timeMs);
    });
};

const withTempDir = async (
    op: (tempDirPath: string) => Promise<void> | void
): Promise<void> => {
    await fs.mkdir(TEST_DIST_PATH, { recursive: true });
    const tempDirPath = await fs.mkdtemp(`${TEST_DIST_PATH}/`);
    try {
        await op(tempDirPath);
    } catch (error) {
        throw new Error(`(${tempDirPath}): ${error}`);
    }
};

const WEBSNACKS_REPO_ROOT = path.resolve(__dirname, "..", "..");
const WEBSNACKS_BIN_PATH = path.join(
    WEBSNACKS_REPO_ROOT,
    "bin",
    "websnacks.js"
);

interface AsyncCommand {
    complete: Promise<string>;
    process: ChildProcess;
}

interface CliOptions {
    cwd?: string;
    timeoutMs?: number;
}

const DEFAULT_CLI_OPTIONS = {
    timeoutMs: 5_000,
};

const runCommand = (
    command: string,
    args: string[] = [],
    _options?: CliOptions
): AsyncCommand => {
    const options = { ...DEFAULT_CLI_OPTIONS, ..._options };
    const process = spawn(command, args, {
        ...options,
        stdio: "pipe",
    });
    const complete = new Promise<string>((resolve, reject) => {
        let threwError = false;

        let stdout = "";
        process.stdout.on("data", (data) => {
            stdout += data.toString();
        });
        process.stderr.on("data", (data) => {
            threwError = true;
            process.kill();
            reject(new Error(`command output to stderr: ${data.toString()}`));
        });

        const timer = setTimeout(() => {
            threwError = true;
            process.kill();
            reject(new Error(`max timeout of ${options.timeoutMs}ms reached`));
        }, options.timeoutMs);
        process.on("exit", (code) => {
            if (threwError) {
                return;
            }
            clearTimeout(timer);
            if (code !== null && code !== 0) {
                reject(new Error(`command exited with non-zero code: ${code}`));
                return;
            }
            resolve(stdout);
        });
        process.on("error", (error) => {
            clearTimeout(timer);
            if (!threwError) {
                reject(new Error(`command errored: ${error}`));
                threwError = true;
            }
        });
    });
    return {
        complete,
        process,
    };
};

testSuite("dev command", ({ test, expect }) => {
    test("starts without throwing error", async () => {
        await withTempDir(async (tempDirPath) => {
            await fs.writeFile(
                path.join(tempDirPath, "tsconfig.json"),
                JSON.stringify({
                    compilerOptions: {
                        esModuleInterop: true,
                        module: "CommonJS",
                        moduleResolution: "node",
                        jsx: "react",
                        jsxFactory: "createElement",
                        target: "ES2018",
                        lib: ["ES2018"],
                        strict: true,
                        noUnusedLocals: true,
                        noUnusedParameters: true,
                        noImplicitReturns: true,
                        noFallthroughCasesInSwitch: true,
                    },
                    include: ["components/**/*", "pages/**/*"],
                }),
                {
                    encoding: "utf8",
                }
            );
            await fs.writeFile(
                path.join(tempDirPath, "websnacks.ts"),
                `
                import { Config } from "${WEBSNACKS_REPO_ROOT}";
                const config: Config = {
                    watch: [],
                };
                export = config;
                `,
                {
                    encoding: "utf8",
                }
            );
            const pagesPath = path.join(tempDirPath, "pages");
            await fs.mkdir(pagesPath);
            await fs.writeFile(
                path.join(pagesPath, "index.tsx"),
                `
                import { createElement } from "${WEBSNACKS_REPO_ROOT}";
                export const page = () => <html />;
                `,
                {
                    encoding: "utf8",
                }
            );
            const cmd = runCommand(
                "node",
                [WEBSNACKS_BIN_PATH, "-r", "ts-node/register", "dev"],
                {
                    cwd: tempDirPath,
                }
            );
            // FIXME: This test is a bit brittle due to relying on timeouts.
            await wait(2_000);
            cmd.process.kill();
            const stdout = await cmd.complete;
            expect(stdout).toStartWith("Listening at");
        });
    });
});
