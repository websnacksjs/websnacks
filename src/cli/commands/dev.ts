/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { existsSync, promises as fs, watch } from "fs";
import * as http from "http";
import * as net from "net";
import * as path from "path";

import { renderSite } from "../../build";
import { Config, loadConfig } from "../../config";
import { Command, UsageError } from "../types";

const DEFAULT_SERVER_PORT = 8080;

const injectLiveReloadScript = (htmlContents: string, port: number): string =>
    htmlContents.replace(
        "</html>",
        `
        <script>
            const ws = new WebSocket("ws://127.0.0.1:${port}");
            ws.onmessage = function() {
                console.log('dev server requested reload, reloading...');
                location.reload();
            };
        </script>
        </html>
    `,
    );

const guessMimeType = (ext: string): string => {
    let mimeType;
    switch (ext) {
        case ".apng":
            mimeType = "image/apng";
            break;
        case ".bmp":
            mimeType = "image/bmp";
            break;
        case ".css":
            mimeType = "text/css";
            break;
        case ".eot":
            mimeType = "application/vnd.ms-fontobject";
            break;
        case ".gif":
            mimeType = "image/gif";
            break;
        case ".htm":
        case ".html":
            mimeType = "text/html";
            break;
        case ".ico":
            mimeType = "image/vnd.microsoft.icon";
            break;
        case ".jpg":
        case ".jpeg":
            mimeType = "image/jpeg";
            break;
        case ".js":
        case ".mjs":
            mimeType = "text/javascript";
            break;
        case ".mp3":
            mimeType = "audio/mpeg";
            break;
        case ".mpeg":
            mimeType = "video/mpeg";
            break;
        case ".oga":
            mimeType = "audio/ogg";
            break;
        case ".ogv":
            mimeType = "video/ogg";
            break;
        case ".otf":
            mimeType = "font/otf";
            break;
        case ".png":
            mimeType = "image/png";
            break;
        case ".svg":
            mimeType = "image/svg+xml";
            break;
        case ".txt":
            mimeType = "text/plain";
            break;
        case ".tif":
        case ".tiff":
            mimeType = "image/tiff";
            break;
        case ".ttf":
            mimeType = "font/ttf";
            break;
        case ".wav":
            mimeType = "audio/wav";
            break;
        case ".weba":
            mimeType = "audio/webm";
            break;
        case ".webm":
            mimeType = "video/webm";
            break;
        case ".webp":
            mimeType = "image/webp";
            break;
        case ".woff":
            mimeType = "font/woff";
            break;
        case ".woff2":
            mimeType = "font/woff2";
            break;
        default:
            // Default to binary mimetype which most browsers will be able to
            // correctly interpret in the right context.
            mimeType = "application/octet-stream";
    }
    return mimeType;
};

const portFromServer = (server: Pick<net.Server, "address">): number => {
    const addrInfo = server.address();
    if (addrInfo == null) {
        throw new Error(`server address is null (this should never happen!)`);
    }
    if (typeof addrInfo === "string") {
        throw new Error(
            `server address is a string (this should never happen!)`,
        );
    }
    return addrInfo.port;
};

const startHttpServer = async (publicDir: string): Promise<http.Server> => {
    const httpServer = http.createServer(async (req, res) => {
        if (req.url == null) {
            res.writeHead(404);
            res.end();
            return;
        }

        let reqExt = path.extname(req.url);
        let reqPath = req.url;
        if (!reqExt) {
            reqPath = path.join(reqPath, "index.html");
            reqExt = ".html";
        }

        let contents;
        try {
            contents = await fs.readFile(path.join(publicDir, reqPath));
        } catch (error) {
            console.error(`unable to load file ${reqPath}`);
            res.writeHead(404);
            res.end();
            return;
        }
        const mimeType = guessMimeType(reqExt);
        if (mimeType === "text/html") {
            const port = portFromServer(req.socket);
            contents = injectLiveReloadScript(contents.toString("utf8"), port);
        }
        res.writeHead(200, {
            "Content-Type": mimeType,
        });
        res.end(contents);
    });
    const listen = async (port?: number): Promise<string> =>
        new Promise((resolve, reject) => {
            httpServer
                .once("error", (error) => reject(error))
                .once("listening", () => resolve())
                .listen(port);
        });
    try {
        await listen(DEFAULT_SERVER_PORT);
    } catch (error) {
        if (error.code !== "EADDRINUSE") {
            throw error;
        }
        await listen();
    }
    const port = portFromServer(httpServer);
    console.log(`Listening at http://127.0.0.1:${port}`);
    return httpServer;
};

const startWebSocketServer = async (
    httpServer: http.Server,
): Promise<import("ws").Server | undefined> => {
    // Attempt to load the ws module, aborting if it isn't available.
    let ws;
    try {
        ws = await import("ws");
    } catch (error) {
        if (error.code !== "MODULE_NOT_FOUND") {
            throw error;
        }
        console.warn(`'ws' module not found, live-reloading will be disabled`);
        return;
    }
    const wsServer = new ws.Server({ server: httpServer });
    wsServer.on("connection", () => {
        console.log("connected to dev site");
    });
    return wsServer;
};

const watchFolders = async (
    folders: string[],
    listener: (eventType: "update" | "remove", fileName: string) => void,
): Promise<void> => {
    // Try to load node-watch, falling back to fs watch if node-watch isn't
    // available.
    try {
        const nodeWatch = await import("node-watch");
        nodeWatch.default(folders, { recursive: true }, listener);
        return;
    } catch (error) {
        if (error.code !== "MODULE_NOT_FOUND") {
            throw error;
        }
        console.warn(
            `'node-watch' module not found, falling back to fs.watch (may ` +
                `result in file watch issues on some OSes)`,
        );
    }
    // NOTE: fs.watch has significant cross-platform issues, including
    //       triggering duplicate file events on some systems.
    for (const folder of folders) {
        watch(folder, { recursive: true }, (_, fileName) => {
            listener("update", fileName);
        });
    }
};

const helpText = `\
Usage: websnacks dev [ROOT_DIR]

Start a live-reloading dev server for a websnacks project.

Args:
    ROOT_DIR                    Path to the websnacks project root directory.
`;

interface DevArgs {
    rootDir: string;
}

const parseArgs = (args: string[]): DevArgs | null => {
    if (args.length > 1) {
        throw new UsageError("too many arguments provided", helpText);
    }
    return {
        rootDir: args[0] || process.cwd(),
    };
};

/**
 * Command to start up a live-reloading development server to allow for fast
 * local development of a websnacks site. The dev server aims to mimic a
 * production static hosting environment as closely as possible.
 */
const devCommand: Command = {
    async execute(args: string[]): Promise<void> {
        const parsedArgs = parseArgs(args);
        if (!parsedArgs) {
            return;
        }
        const { rootDir } = parsedArgs;
        const rebuild = async (): Promise<Config> => {
            const config = await loadConfig(rootDir);
            await renderSite(config);
            return config;
        };
        const config = await rebuild();
        const { outDir } = config.paths;
        const httpServer = await startHttpServer(outDir);
        const wsServer = await startWebSocketServer(httpServer);
        const watchedFolders = config.watch.filter((filePath) =>
            existsSync(filePath),
        );
        await watchFolders(watchedFolders, async (event, filePath) => {
            console.log(`${filePath}:${event} triggering rebuild...`);
            await rebuild();
            if (wsServer != null) {
                console.log(`rebuild finished, reloading browsers...`);
                for (const ws of wsServer.clients) {
                    ws.send("reload");
                }
            }
        });
    },
    helpText,
};
export = devCommand;
