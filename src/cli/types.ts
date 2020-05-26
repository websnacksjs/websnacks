/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * CLI command representing an action that the CLI program supports.
 */
export interface Command {
    /**
     * Execute the command with the specified arguments.
     *
     * @param args List of CLI arguments to pass to the command.
     */
    execute(args: string[]): Promise<void>;
    /**
     * Help text for this command.
     */
    helpText: string;
}

/**
 * Error that commands can issue to indicate incorrect usage along with help
 * text to guide the user to correct their mistake.
 */
export class UsageError extends Error {
    public readonly helpText: string;

    public constructor(message: string, helpText: string) {
        super(message);

        this.helpText = helpText;
    }
}
