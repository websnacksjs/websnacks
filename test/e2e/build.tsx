/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { promises as fs } from "fs";
import * as path from "path";

import { runCommand, WEBSNACKS_BIN_PATH, WEBSNACKS_REPO_ROOT, withTempDir } from "../helpers/e2e";
import { testSuite } from "../lib";

testSuite("build command", ({ test }) => {
    test("runs without throwing error", async () => {
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
                [WEBSNACKS_BIN_PATH, "-r", "ts-node/register", "build"],
                {
                    cwd: tempDirPath,
                }
            );
            await cmd.complete;
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
                import { createElement } from "${WEBSNACKS_REPO_ROOT}";
                export const page = () => <html />;
                `,
                {
                    encoding: "utf8",
                }
            );
            const cmd = runCommand(
                "node",
                [WEBSNACKS_BIN_PATH, "-r", "ts-node/register", "build"],
                {
                    cwd: tempDirPath,
                }
            );
            await cmd.complete;
        });
    });
});
