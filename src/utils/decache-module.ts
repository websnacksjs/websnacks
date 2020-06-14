/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const resolveModulePath = (importPath: string): string | undefined => {
    try {
        return require.resolve(importPath);
    } catch (error) {
        if (error.code === "MODULE_NOT_FOUND") {
            return;
        }
        throw error;
    }
};

const removeParentModuleRef = (mod: NodeModule): void => {
    const parent = mod.parent;
    if (parent == null) {
        return;
    }

    const siblings = parent.children;
    const nSiblings = siblings.length;
    for (let i = nSiblings - 1; i >= 0; i--) {
        const sibling = siblings[i];
        if (sibling.id === mod.id) {
            siblings.splice(i, 1);
            return;
        }
    }
};

/**
 * Clear a module and its dependencies from node's module cache, ensuring that
 * requiring the module again will reload the code from disk.
 *
 * @param importPath Path or name of the module to resolve (same as
 *        {@see require}).
 *
 * @throws Error if the module could not be resolved due to filesystem error.
 */
export const decacheModule = (importPath: string): void => {
    const modulePath = resolveModulePath(importPath);
    if (modulePath == null) {
        return;
    }

    // DFS the module dependency tree, using iteration to avoid stack size
    // exceeded exceptions.
    const modsToCheck: NodeModule[] = [];
    const visited: Set<string> = new Set();
    let currentMod: NodeModule | undefined = require.cache[modulePath];
    while (currentMod != null) {
        if (visited.has(currentMod.id)) {
            currentMod = modsToCheck.pop();
            continue;
        }

        removeParentModuleRef(currentMod);
        delete require.cache[currentMod.id];
        for (const childMod of currentMod.children) {
            modsToCheck.push(childMod);
        }

        visited.add(currentMod.id);
        currentMod = modsToCheck.pop();
    }
};
