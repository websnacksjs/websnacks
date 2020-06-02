/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { fork } from "child_process";
import * as fs from "fs";
import * as path from "path";

import { shuffle } from "./lib/utils";

const TEST_SUITES_DIR = path.join(__dirname, "test-suites");

const files = fs.readdirSync(TEST_SUITES_DIR);
// Shuffle test suites to detect ordering dependencies between them.
shuffle(files);
for (const file of files) {
    const fullPath = path.join(TEST_SUITES_DIR, file);
    fork(path.relative(process.cwd(), fullPath)).on("exit", (code) => {
        if (code !== 0) {
            process.exitCode = 1;
        }
    });
}
