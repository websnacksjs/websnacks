/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import * as fs from "fs";
import * as path from "path";

const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const TEST_DIR = path.join(ROOT_DIR, ".test-dist");

const rmdirRecursive = (dirPath: string): void => {
    if (!fs.existsSync(dirPath)) {
        return;
    }
    const entryNames = fs.readdirSync(dirPath);
    for (const entryName of entryNames) {
        const entryPath = path.join(dirPath, entryName);
        const dirent = fs.lstatSync(entryPath);
        if (dirent.isDirectory()) {
            rmdirRecursive(entryPath);
        } else {
            fs.unlinkSync(entryPath);
        }
    }
    fs.rmdirSync(dirPath);
};

rmdirRecursive(DIST_DIR);
rmdirRecursive(TEST_DIR);
