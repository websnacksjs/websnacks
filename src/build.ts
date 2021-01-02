/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { promises as fs } from "fs";
import * as path from "path";

import { Config, ConfigPaths } from "./config";
import { renderPage } from "./render";
import { decacheModule, walkDir } from "./utils";

const renderPagesToHtml = async ({
    pagesDir,
    outDir,
}: ConfigPaths): Promise<void> => {
    const deferred = [];
    for await (const srcPath of walkDir(pagesDir)) {
        const ext = path.extname(srcPath);
        if (ext !== ".tsx") {
            continue;
        }

        // Ensure that we don't cache page modules when running in dev server.
        decacheModule(srcPath);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pageSrc = require(srcPath);
        if (!("page" in pageSrc)) {
            throw new Error(
                `page source at ${srcPath} does not export a "page" variable`,
            );
        }
        let compiledHtml;
        try {
            compiledHtml = renderPage(pageSrc.page());
        } catch (error) {
            throw new Error(
                `failed to compile ${srcPath}: ${error.stack ?? error}`,
            );
        }
        const relPath = path.relative(pagesDir, path.dirname(srcPath));
        let baseName = path.basename(srcPath, ".tsx");
        if (baseName === "index") {
            baseName = "";
        }
        const destPath = path.join(outDir, relPath, baseName, "index.html");
        deferred.push(
            (async () => {
                await fs.mkdir(path.dirname(destPath), { recursive: true });
                await fs.writeFile(destPath, compiledHtml);
            })(),
        );
    }
    await Promise.all(deferred);
};

const copyStaticAssets = async ({
    staticAssetsDir,
    outDir,
}: ConfigPaths): Promise<void> => {
    try {
        await fs.access(staticAssetsDir);
    } catch (error) {
        // Static assets folder doesn't exist, so no-op.
        return;
    }

    const deferred = [];
    for await (const assetPath of walkDir(staticAssetsDir)) {
        const relPath = path.relative(staticAssetsDir, assetPath);
        const destPath = path.join(outDir, relPath);
        deferred.push(
            (async () => {
                await fs.mkdir(path.dirname(destPath), { recursive: true });
                await fs.copyFile(assetPath, destPath);
            })(),
        );
    }
    await Promise.all(deferred);
};

/**
 * Fully render a websnacks site into a directory ready for serving by a static
 * host.
 *
 * @param config Configuration for the site.
 */
export const renderSite = async ({ paths, hooks }: Config): Promise<void> => {
    await Promise.all([renderPagesToHtml(paths), copyStaticAssets(paths)]);
    await hooks.afterSiteRender(paths);
};
