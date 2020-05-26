import { promises as fs } from "fs";
import * as path from "path";
import { Config } from "websnacks";

import { stylesheetPath } from "./config";

const config: Config = {
    // Watch additional files and folders for changes when the dev server is
    // running.
    watch: ["components/", "config.ts"],
    // Hooks to execute after certain rendering events. Currently only
    // afterSiteRender is supported.
    hooks: {
        async afterSiteRender({ outDir }): Promise<void> {
            // NOTE: we dynamically import typestyle so that the global style
            //       registry is properly updated once all pages are reloaded in
            //       dev. We could also create a typestyle object in config.ts,
            //       or even multiple objects to split up our styles into e.g. a
            //       critical-path.css and noncrticial.css.
            const { getStyles } = await import("typestyle");
            const styles = getStyles();
            await fs.writeFile(path.join(outDir, stylesheetPath), styles);
        },
    },
};
export = config;
