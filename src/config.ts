/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import * as path from "path";

import { purgeModuleAndDepsFromCache } from "./utils";

/**
 * Paths used during configuration.
 */
export interface ConfigPaths {
    rootDir: string;
    outDir: string;
    pagesDir: string;
    staticAssetsDir: string;
}

/**
 * Hooks that allow user code to customize site rendering.
 */
export interface Hooks {
    /**
     * Hook that fires at the end of site rendering one all pages and assets are
     * fully rendered.
     */
    afterSiteRender(context: ConfigPaths): Promise<void> | void;
}

/**
 * User-provided configuration options.
 */
export type UserConfig = {
    /** Hook implementations that allow customizing the rendering process. */
    hooks?: Partial<Hooks>;
    /** Additional folders and files to watch by the development server. */
    watch?: string[];
};

/**
 * Fully-realized configuration for a websnacks site.
 */
export interface Config {
    paths: ConfigPaths;
    hooks: Hooks;
    watch: string[];
}

const noop = () => {};

/**
 * Load configuration from a websnacks.ts/js file.
 *
 * @param rootDir Path to the directory where the websnacks.ts/js config file.
 *
 * @return Fully-realized configuration.
 */
export const loadConfig = async (rootDir: string): Promise<Config> => {
    const configPath = require.resolve(path.resolve(rootDir, "websnacks"));
    purgeModuleAndDepsFromCache(configPath);
    // TODO: validate user config.
    const userConfig = await import(configPath);
    const outDir = path.join(rootDir, "public");
    const pagesDir = path.join(rootDir, "pages");
    const staticAssetsDir = path.join(rootDir, "static");
    return {
        paths: {
            rootDir,
            outDir,
            pagesDir,
            staticAssetsDir,
        },
        hooks: {
            afterSiteRender: noop,
            ...userConfig.hooks,
        },
        watch: [
            ...userConfig.watch.map((p: string) => path.relative(rootDir, p)),
            path.relative(rootDir, configPath),
            pagesDir,
            staticAssetsDir,
        ],
    };
};
