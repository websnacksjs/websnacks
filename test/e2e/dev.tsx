/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { promises as fs } from "fs";
import * as path from "path";

import {
    npmCmd, runCommand, wait, WEBSNACKS_BIN_PATH, WEBSNACKS_REPO_ROOT, withTempDir
} from "../helpers/e2e";
import { testSuite } from "../lib";

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
                import { Config } from "websnacks";
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
                import { createElement } from "websnacks";
                export const page = () => <html />;
                `,
                {
                    encoding: "utf8",
                }
            );
            await fs.writeFile(
                path.join(tempDirPath, "package.json"),
                JSON.stringify({
                    devDependencies: {
                        websnacks: `file:${WEBSNACKS_REPO_ROOT}`,
                    },
                }),
                { encoding: "utf8" }
            );
            await runCommand(npmCmd, ["install", "--silent"], {
                cwd: tempDirPath,
            }).complete;
            const cmd = runCommand(
                "node",
                [WEBSNACKS_BIN_PATH, "-r", "ts-node/register", "dev"],
                {
                    cwd: tempDirPath,
                }
            );
            // FIXME: This test is a bit brittle due to relying on timeouts.
            await wait(10_000);
            cmd.process.kill();
            const stdout = await cmd.complete;
            expect(stdout).toStartWith("Listening at");
        });
    });

    test("works without config file", async () => {
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
            const pagesPath = path.join(tempDirPath, "pages");
            await fs.mkdir(pagesPath);
            await fs.writeFile(
                path.join(pagesPath, "index.tsx"),
                `
                import { createElement } from "websnacks";
                export const page = () => <html />;
                `,
                {
                    encoding: "utf8",
                }
            );
            await fs.writeFile(
                path.join(tempDirPath, "package.json"),
                JSON.stringify({
                    devDependencies: {
                        websnacks: `file:${WEBSNACKS_REPO_ROOT}`,
                    },
                }),
                { encoding: "utf8" }
            );
            await runCommand(npmCmd, ["install", "--silent"], {
                cwd: tempDirPath,
            }).complete;
            const cmd = runCommand(
                "node",
                [WEBSNACKS_BIN_PATH, "-r", "ts-node/register", "dev"],
                {
                    cwd: tempDirPath,
                }
            );
            // FIXME: This test is a bit brittle due to relying on timeouts.
            await wait(10_000);
            cmd.process.kill();
            const stdout = await cmd.complete;
            expect(stdout).toStartWith("Listening at");
        });
    });
});
