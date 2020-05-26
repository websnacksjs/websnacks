import { normalize } from "csstips";
import { stylesheet } from "typestyle";
import { Component, createElement } from "websnacks";

import { stylesheetPath } from "../config";
import { Header } from "./header";
import { Navbar } from "./navbar";

normalize();

const styles = stylesheet({
    html: {
        height: "100%",
    },
    wrapper: {
        height: "100%",
        display: "flex",
        flexDirection: "row",
        margin: 0,
    },
    main: {
        flex: 1,
    },
    mainBody: {
        padding: "16px",
    },
    navbar: {
        display: "flex",
        flex: "0 0 auto",
        zIndex: 9,
    },
});

const SITE_TITLE = "Example Site";

export interface LayoutProps {
    headline?: string;
}

export const Layout: Component<LayoutProps> = ({ children, headline }) => (
    <html className={styles.html} lang="en-US">
        <head>
            <meta charSet="utf-8" />
            <title>
                {SITE_TITLE}
                {headline && ` | ${headline}`}
            </title>
            <meta name="description" content="" />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
            />
            <link rel="stylesheet" href={stylesheetPath} />
        </head>

        <body className={styles.wrapper}>
            <div className={styles.navbar}>
                <Navbar />
            </div>

            <main className={styles.main}>
                <Header headline={headline || SITE_TITLE} />

                <div className={styles.mainBody}>{children}</div>
            </main>
        </body>
    </html>
);
