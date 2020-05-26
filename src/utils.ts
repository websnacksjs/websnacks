/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { promises as fs } from "fs";
import * as path from "path";

/**
 * Recursively walk a directory, returning the files it finds.
 *
 * @param dirPath Path to the directory to walk.
 *
 * @return Generator that yields the files found while walking the directory.
 */
export const walkDir = async function* (
    dirPath: string
): AsyncGenerator<string> {
    const dirEnts = await fs.readdir(dirPath, { withFileTypes: true });
    for (const dirEnt of dirEnts) {
        if (dirEnt.isDirectory()) {
            yield* walkDir(path.join(dirPath, dirEnt.name));
        }
        if (dirEnt.isFile()) {
            yield path.join(dirPath, dirEnt.name);
        }
    }
};

/**
 * Purge cached versions of a node module and all of its dependencies from the
 * global require cache, ensuring that future imports reload the module from
 * disk.
 *
 * @param modName Name of the module to purge from the require cache.
 */
export const purgeModuleAndDepsFromCache = (modName: string): void => {
    var modPath = require.resolve(modName);
    if (modPath == null) {
        return;
    }
    const mod = require.cache[modPath];
    if (mod == null) {
        return;
    }
    for (const child of mod.children) {
        purgeModuleAndDepsFromCache(child.id);
    }
    delete require.cache[modPath];
};
