/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ChildProcess, spawn } from "child_process";
import { promises as fs } from "fs";
import * as os from "os";
import * as path from "path";

/**
 * Set a timeout and wait for at least the specified number of milliseconds,
 * resolving the promise once the event loop meets or exceeds timeMs.
 *
 * @param timeMs Time in milliseconds to wait.
 */
export const wait = async (timeMs: number): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), timeMs);
    });
};

const TEMP_PATH = path.resolve(__dirname, "..", "..", ".temp");

/**
 * Perform an operation within a unique temporary directory created within a
 * special .test-dist folder within this websnacks repository.
 *
 * @note Currently the temporary folder is **not** cleaned up once the operation
 *       has finished. I've had issues with losing work due to buggy removal
 *       code and haven't been willing to risk it again. To cleanup these
 *       temporary folders it should be as easy as removing the whole
 *       ".test-dist" folder from your checkout.
 *
 * @param op Operation to perform which receives the fully resolved temp
 *           directory path as its only argument.
 */
export const withTempDir = async (
    op: (tempDirPath: string) => Promise<void> | void
): Promise<void> => {
    await fs.mkdir(TEMP_PATH, { recursive: true });
    const tempDirPath = await fs.mkdtemp(`${TEMP_PATH}/`);
    try {
        await op(tempDirPath);
    } catch (error) {
        throw new Error(`(${tempDirPath}): ${error}`);
    }
};

/**
 * Fully resolved path to the root of this websnacks repository.
 */
export const WEBSNACKS_REPO_ROOT = path.resolve(__dirname, "..", "..");
/**
 * Fully resolved path to the websnacks CLI script in this repository.
 */
export const WEBSNACKS_BIN_PATH = path.join(
    WEBSNACKS_REPO_ROOT,
    "bin",
    "websnacks.js"
);

/**
 * A handle to an asynchronous shell command run in a subprocess.
 */
export interface AsyncCommand {
    /**
     * Promise that resolves with the stdout of the subprocess once the
     * subprocess exits with a zero-code.
     *
     * The promise rejects if the subprocess exits with a non-zero code, the
     * subprocess writes to its stderr, or the command failed to spawn.
     */
    complete: Promise<string>;
    /**
     * Handle to to child process for event-based process manipulation.
     */
    process: ChildProcess;
}

/**
 * Options used to configure {@link runCommand}.
 */
export interface CliOptions {
    /**
     * Working directory where the command should be run. Defaults to the
     * current working directory.
     */
    cwd?: string;
    /**
     * Timeout in milliseconds after which a command that hasn't exited will
     * reject the promise and kill the subprocess.
     */
    timeoutMs?: number;
}

const DEFAULT_CLI_OPTIONS = {
    timeoutMs: 15_000,
};

/**
 * Execute a shell command in a subprocess.
 *
 * This provides a more user-friendly promise-based interface to
 * {@link child_process.spawn}. The obj
 *
 * @param command Name of the shell command to run.
 * @param args Array of arguments to pass to the command.
 * @param options Parameters to change how the command is run and resolved.
 *
 * @returns Command object for handling in client code.
 */
export const runCommand = (
    command: string,
    args: string[] = [],
    options?: CliOptions
): AsyncCommand => {
    const optionsWithDefaults = { ...DEFAULT_CLI_OPTIONS, ...options };
    const process = spawn(command, args, {
        ...optionsWithDefaults,
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
            reject(
                new Error(
                    `max timeout of ${optionsWithDefaults.timeoutMs}ms reached`
                )
            );
        }, optionsWithDefaults.timeoutMs);
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

export const npmCmd = os.platform() === "win32" ? "npm.cmd" : "npm";
