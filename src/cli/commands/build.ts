/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { renderSite } from "../../build";
import { loadConfig } from "../../config";
import { Command, UsageError } from "../types";

const helpText = `\
Usage: websnacks build [ROOT_DIR]

Compile a site using websnacks JSX templates into a fully-functional,
production-ready static site.

Args:
    ROOT_DIR                    Path to the websnacks project root directory.
`;

interface BuildArgs {
    rootDir: string;
}

const parseArgs = (args: string[]): BuildArgs => {
    if (args.length > 1) {
        throw new UsageError("too many arguments provided", helpText);
    }
    return {
        rootDir: args[0] || process.cwd(),
    };
};

/**
 * Build command used to build a websnacks site into a production-ready set of
 * static files.
 */
const buildCommand: Command = {
    execute: async (args: string[]): Promise<void> => {
        const { rootDir } = parseArgs(args);
        const config = await loadConfig(rootDir);
        await renderSite(config);
    },
    helpText,
};
export = buildCommand;
