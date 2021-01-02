/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Command, UsageError } from "./types";

const globalHelpText = `\
Usage: websnacks [...globalOptions] <command>

Global Options:
  -r|--require <module>     Module to require before executing the command. May
                            be specified more than once to load multiple modules.

Commands:
  build                     Build a static site that uses websnacks templates.
  dev                       Start the live-reloading development server for a
                            site.
`;

interface Options {
    showHelp: boolean;
    require: string[];
}

const parseArgs = (
    args: string[],
): { options: Options; commandName?: string; commandArgs: string[] } => {
    const options: Options = {
        showHelp: false,
        require: [],
    };
    // Look ahead for the first argument that doesn't start with a "-" to
    // indicate the end of option parsing.
    while (args.length > 0 && args[0].indexOf("-") >= 0) {
        const opt = args.shift();
        switch (opt) {
            case "-h":
            case "--help": {
                options.showHelp = true;
                break;
            }
            case "-r":
            case "--require": {
                const moduleName = args.shift();
                if (moduleName == null) {
                    throw new UsageError(
                        `-r requires a valid module name`,
                        globalHelpText,
                    );
                }
                options.require.push(moduleName);
                break;
            }
            default:
                throw new UsageError(`unknown option ${opt}`, globalHelpText);
        }
    }
    const commandName = args.shift();
    return { options, commandName, commandArgs: args };
};

const _main = async (args: string[]): Promise<void> => {
    const { options, commandName, commandArgs } = parseArgs(args);
    if (options.showHelp) {
        console.log(`${globalHelpText}\n`);
        return;
    }
    if (commandName == null) {
        throw new UsageError(`must specify a valid command`, globalHelpText);
    }
    for (const moduleName of options.require) {
        await import(moduleName);
    }

    let command: Command;
    switch (commandName) {
        case "build":
            command = await import("./commands/build");
            break;
        case "dev":
            command = await import("./commands/dev");
            break;
        default:
            throw new UsageError(
                `unknown command ${commandName}`,
                globalHelpText,
            );
    }
    // NOTE: Should this just delegate to the command?
    for (const arg of commandArgs) {
        if (arg === "--help" || arg === "-h") {
            console.log(`${command.helpText}\n`);
            return;
        }
    }
    await command.execute(commandArgs);
};

/**
 * Entrypoint of the CLI app.
 */
export const main = (): void => {
    _main(process.argv.slice(2)).catch((error) => {
        if (error instanceof UsageError) {
            console.error(`Error: ${error.message}\n`);
            console.log(`${error.helpText}\n`);
        } else {
            const errorMsg =
                error instanceof Error ? error.stack : JSON.stringify(error);
            console.error(`Unexpected error: ${errorMsg}\n`);
        }
        process.exit(1);
    });
};
