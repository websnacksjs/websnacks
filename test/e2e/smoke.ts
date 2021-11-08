/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
    npmCmd, runCommand, useFixture, wait, WEBSNACKS_BIN_PATH
} from "../helpers/e2e";
import { testSuite } from "../lib";

testSuite("smoke tests", ({ test, expect }) => {
    test("build command runs without error", async () => {
        const fixturePath = await useFixture('simple');
        await runCommand(npmCmd, ["install", "--silent"], {
            cwd: fixturePath,
        }).complete;
        const cmd = runCommand(
            "node",
            [WEBSNACKS_BIN_PATH, "-r", "ts-node/register", "build"],
            {
                cwd: fixturePath,
            }
        );
        await cmd.complete;
    });

    test("dev command starts without error", async () => {
        const fixturePath = await useFixture('simple');
        const cmd = runCommand(
            "node",
            [WEBSNACKS_BIN_PATH, "-r", "ts-node/register", "dev"],
            {
                cwd: fixturePath,
            }
        );
        // FIXME: This test is a bit brittle due to relying on timeouts.
        await wait(10_000);
        cmd.process.kill();
        const stdout = await cmd.complete;
        expect(stdout).toStartWith("Listening at");
    });
});
