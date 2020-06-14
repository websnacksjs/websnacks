/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { promises as fs } from "fs";
import * as path from "path";

export { decacheModule } from "./decache-module";

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

export type Flattenable<T> = Array<T | Flattenable<T>>;

/**
 * Flatten an arbitrarily-deeply nested array into a flat array.
 *
 * @param arr Array to flatten.
 *
 * @return Flattened array.
 */
export const flatDeep = <T>(arr: Flattenable<T>): T[] => {
    const flattenedArr: T[] = [];
    for (const val of arr) {
        if (Array.isArray(val)) {
            flattenedArr.push(...flatDeep(val));
        } else {
            flattenedArr.push(val);
        }
    }
    return flattenedArr;
};
