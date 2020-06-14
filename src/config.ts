/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import * as path from "path";

import { decacheModule } from "./utils";

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

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

/**
 * Load configuration from a websnacks.ts/js file.
 *
 * @param rootDir Path to the directory where the websnacks.ts/js config file.
 *
 * @return Fully-realized configuration.
 */
export const loadConfig = async (rootDir: string): Promise<Config> => {
    let configPath;
    let userConfig: UserConfig = {};
    // Attempt to load a websnacks.ts/js file in rootDir.
    try {
        configPath = require.resolve(path.resolve(rootDir, "websnacks"));
        decacheModule(configPath);
        // TODO: validate user config.
        userConfig = await import(configPath);
    } catch (error) {
        // Use default config;
    }
    const outDir = path.join(rootDir, "public");
    const pagesDir = path.join(rootDir, "pages");
    const staticAssetsDir = path.join(rootDir, "static");

    const watch = [pagesDir, staticAssetsDir];
    if (configPath != null) {
        watch.push(path.relative(rootDir, configPath));
    }
    if (userConfig.watch != null) {
        for (const userWatch of userConfig.watch) {
            watch.push(path.relative(rootDir, userWatch));
        }
    }

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
        watch,
    };
};
